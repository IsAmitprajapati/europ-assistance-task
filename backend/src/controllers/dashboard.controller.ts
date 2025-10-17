import { Request, Response } from "express";
import CustomerModel from "../models/customer.model";
import CustomerPolicy from "../models/customerPolicy.model";
import PolicyModel from "../models/policy.model";
import ClaimPolicyModel from "../models/claimPolicy.model";


export const dashboardController = async (req: Request, res: Response) => {
    try {
        // Getting start and end date from query parameters
        const { startDate, endDate } = req.query;

        // Build date filter if provided
        let dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        } else if (startDate) {
            dateFilter = { $gte: new Date(startDate as string) };
        } else if (endDate) {
            dateFilter = { $lte: new Date(endDate as string) };
        }

        // Customers count
        let customerQuery: any = {};
        if (Object.keys(dateFilter).length) {
            customerQuery.createdAt = dateFilter;
        }
        const totalCustomers = await CustomerModel.countDocuments(customerQuery);

        // Active Policies count (CustomerPolicy which status is "active" and lies in the date range)
        let activePolicyQuery: any = { status: "Active" };
        if (Object.keys(dateFilter).length) {
            activePolicyQuery.createdAt = dateFilter;
        }
        const totalActivePolicies = await CustomerPolicy.countDocuments(activePolicyQuery);

        // Total Revenue (sum of premium for all purchased/active CustomerPolicies in the date range)
        let revenuePolicyQuery: any = {};
        if (Object.keys(dateFilter).length) {
            revenuePolicyQuery.createdAt = dateFilter;
        }
        // Assuming revenue is the sum of 'premium' from policies purchased in CustomerPolicy
        const revenueAggregate = await CustomerPolicy.aggregate([
            { $match: revenuePolicyQuery },
            {
                $lookup: {
                    from: "policies",
                    localField: "policy_id",
                    foreignField: "_id",
                    as: "policyDetails"
                }
            },
            { $unwind: "$policyDetails" },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$policyDetails.premium" }
                }
            }
        ]);
        const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

        // Claim Count (claims created in the date range)
        let claimQuery: any = {};
        if (Object.keys(dateFilter).length) {
            claimQuery.createdAt = dateFilter;
        }
        
        const totalClaims = await ClaimPolicyModel.countDocuments(claimQuery);
        

        return res.json({
            success: true,
            data: {
                totalCustomers,
                totalActivePolicies,
                totalRevenue,
                totalClaims
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: err instanceof Error ? err.message : err
        });
    }
};

export const policyDistributionChart = async (req: Request, res: Response) => {
    try {
        // Step 1: Get all unique policy types ("domains")
        const allPolicyTypesDocs = await (await import('../models/policy.model')).default.distinct("type");
        const allPolicyTypes = Array.isArray(allPolicyTypesDocs) ? allPolicyTypesDocs : [];

        // Step 2: Build date filter if startDate/endDate are given in req.query
        let dateFilter: any = {};
        const { startDate, endDate } = req.query;
        if (typeof startDate === "string" && typeof endDate === "string") {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (typeof startDate === "string") {
            dateFilter = { $gte: new Date(startDate) };
        } else if (typeof endDate === "string") {
            dateFilter = { $lte: new Date(endDate) };
        }

        // Step 3: Aggregate customer count for each policy type (optionally filter by createdAt)
        const aggregatePipeline: any[] = [
            // Filter CustomerPolicies by createdAt if requested
        ];
        if (Object.keys(dateFilter).length > 0) {
            aggregatePipeline.push({ $match: { createdAt: dateFilter } });
        }
        aggregatePipeline.push(
            {
                $lookup: {
                    from: "policies",
                    localField: "policy_id",
                    foreignField: "_id",
                    as: "policyDetails"
                }
            },
            { $unwind: "$policyDetails" },
            {
                $group: {
                    _id: "$policyDetails.type",
                    customerCount: { $sum: 1 }
                }
            }
        );

        const policyTypeCounts = await CustomerPolicy.aggregate(aggregatePipeline);

        // Step 4: Convert to map for easy lookup
        const countMap = new Map<string, number>();
        for (const row of policyTypeCounts) {
            countMap.set(row._id, row.customerCount);
        }

        // Step 5: Build full domain/customerCount list, zero-fill as needed
        const result = allPolicyTypes.map((policyType) => ({
            policyType,
            customerCount: countMap.get(policyType) || 0
        }));

        return res.json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch policy distribution",
            error: err instanceof Error ? err.message : err
        });
    }
};

/**
 * Revenue chart endpoint
 * Returns total revenue per day for the range [startDate, endDate]
 * Expects: req.query.startDate (ISO string), req.query.endDate (ISO string)
 * Returns: [{ label: "YYYY-MM-DD", revenue: number }] - one per day in the range
 */
/**
 * Revenue chart endpoint
 * Returns total revenue per unit (day, week, month, or year) for the range [startDate, endDate]
 * Expects: req.query.startDate (ISO string), req.query.endDate (ISO string), req.query.type ("day" | "week" | "month" | "year"?)
 * Default type: "day"
 * Returns: [{ label: string, revenue: number }] - one per period in the range
 */

export const RevenueChart = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, type } = req.query as { startDate?: string, endDate?: string, type?: string };

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "startDate and endDate are required"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.valueOf()) || isNaN(end.valueOf())) {
            return res.status(400).json({
                success: false,
                message: "Invalid startDate or endDate"
            });
        }

        // Set end to end of that day
        end.setHours(23, 59, 59, 999);

        // Default to "day" if not specified or invalid
        const chartType = (["day", "week", "month", "year"].includes(type || "")) ? type : "day";

        // Chart label and _id grouping key by type
        let groupId: any;
        let buildLabel: (grp: any) => string;
        let iterateFn: (start: Date, end: Date) => { label: string, next: (d: Date) => void, current: Date }[];

        if (chartType === "year") {
            groupId = { year: { $year: "$createdAt" } };
            buildLabel = (grp) => `${grp._id.year}`;
            iterateFn = (startDate, endDate) => {
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();
                let arr = [];
                for (let y = startYear; y <= endYear; y++) {
                    arr.push({
                        label: `${y}`,
                        next: (d: Date) => d.setFullYear(d.getFullYear() + 1),
                        current: new Date(y, 0, 1)
                    });
                }
                return arr;
            };
        } else if (chartType === "month") {
            groupId = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            };
            buildLabel = (grp) => `${grp._id.year}-${String(grp._id.month).padStart(2, "0")}`;
            iterateFn = (startDate, endDate) => {
                let arr = [];
                let d = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                while (d <= last) {
                    arr.push({
                        label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                        next: (date: Date) => date.setMonth(date.getMonth() + 1),
                        current: new Date(d)
                    });
                    d.setMonth(d.getMonth() + 1);
                }
                return arr;
            };
        } else if (chartType === "week") {
            // Week grouping: ISO week number and year
            groupId = {
                year: { $isoWeekYear: "$createdAt" },
                week: { $isoWeek: "$createdAt" }
            };
            buildLabel = (grp) => `${grp._id.year}-W${String(grp._id.week).padStart(2, "0")}`;

            // Utility to get ISO week number
            function getISOWeek(date: Date) {
                const dt = new Date(date.getTime());
                dt.setHours(0,0,0,0);
                dt.setDate(dt.getDate() + 4 - (dt.getDay()||7));
                const yearStart = new Date(dt.getFullYear(),0,1);
                const weekNo = Math.ceil((((dt.getTime() - yearStart.getTime())/86400000)+1)/7);
                return weekNo;
            }
            iterateFn = (startDate, endDate) => {
                let arr = [];
                let d = new Date(startDate);
                d.setHours(0, 0, 0, 0);
                // Move d to the previous Monday (ISO week starts Monday)
                d.setDate(d.getDate() - ((d.getDay()+6)%7));
                const last = new Date(endDate);
                last.setHours(0,0,0,0);
                let stop = false;
                while (!stop) {
                    const weekYear = d.getFullYear();
                    const isoWeekNo = getISOWeek(d);
                    arr.push({
                        label: `${weekYear}-W${String(isoWeekNo).padStart(2,"0")}`,
                        next: (date: Date) => date.setDate(date.getDate() + 7),
                        current: new Date(d)
                    });
                    d.setDate(d.getDate() + 7);
                    if (d > last) stop = true;
                }
                return arr;
            };
        } else { // day
            groupId = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
            buildLabel = (grp) =>
                `${grp._id.year}-${String(grp._id.month).padStart(2, "0")}-${String(grp._id.day).padStart(2, "0")}`;
            iterateFn = (startDate, endDate) => {
                let arr = [];
                let d = new Date(startDate);
                while (d <= endDate) {
                    arr.push({
                        label: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
                        next: (date: Date) => date.setDate(date.getDate() + 1),
                        current: new Date(d)
                    });
                    d.setDate(d.getDate() + 1);
                }
                return arr;
            };
        }

        // Aggregate
        const aggregatePipeline: any[] = [
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $lookup: {
                    from: "policies",
                    localField: "policy_id",
                    foreignField: "_id",
                    as: "policy"
                }
            },
            { $unwind: "$policy" },
            {
                $group: {
                    _id: groupId,
                    totalRevenue: { $sum: "$policy.premium" }
                }
            }
        ];

        const aggregate = await CustomerPolicy.aggregate(aggregatePipeline);

        // Map results to period-labels
        const revenueByLabel: Record<string, number> = {};
        for (const grp of aggregate) {
            const label = buildLabel(grp);
            revenueByLabel[label] = grp.totalRevenue;
        }

        // Fill missing periods with 0 revenue
        const results: { label: string, revenue: number }[] = [];
        const periodArr = iterateFn(start, end);
        for (const p of periodArr) {
            results.push({ label: p.label, revenue: revenueByLabel[p.label] || 0 });
        }

        return res.json({
            success: true,
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue chart",
            error: error instanceof Error ? error.message : error
        });
    }
};


export const CustomerAcquisition = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type = "day" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required in UTC format.",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range.",
      });
    }

    // Group formats
    const groupFormats: Record<string, string> = {
      day: "%Y-%m-%d",
      week: "%Y-W%V",
      month: "%Y-%m",
      year: "%Y",
    };
    const dateFormat = groupFormats[type as string] || groupFormats.day;

    // Registered customers
    const customerAgg = await CustomerModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $project: { dateGroup: { $dateToString: { format: dateFormat, date: "$createdAt" } } } },
      { $group: { _id: "$dateGroup", registered: { $sum: 1 } } },
    ]);

    // Policy buyers
    const policyAgg = await CustomerPolicy.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $project: { dateGroup: { $dateToString: { format: dateFormat, date: "$createdAt" } } } },
      { $group: { _id: "$dateGroup", policyBuyers: { $sum: 1 } } },
    ]);

    // Merge
    const dataMap = new Map<string, { registered: number; policyBuyers: number }>();
    customerAgg.forEach(c => dataMap.set(c._id, { registered: c.registered, policyBuyers: 0 }));
    policyAgg.forEach(p => {
      if (dataMap.has(p._id)) dataMap.get(p._id)!.policyBuyers = p.policyBuyers;
      else dataMap.set(p._id, { registered: 0, policyBuyers: p.policyBuyers });
    });

    const chartData = Array.from(dataMap.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([period, value]) => ({
        period,
        registered: value.registered,
        policyBuyers: value.policyBuyers,
      }));

    return res.status(200).json({
      success: true,
      chartData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


interface ClaimAggResult {
  _id: { dateGroup: string; status: string };
  count: number;
}

export const claimPolicyStatusController = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type = "day" } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required in UTC format.",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({
        success: false,
        message: "Invalid date range.",
      });
    }

    const allStatuses = ["Pending", "Approved", "Rejected"];

    // Map 'type' to date format
    const typeFormatMap: Record<string, string> = {
      day: "%Y-%m-%d",
      week: "%G-%V",
      month: "%Y-%m",
      year: "%Y",
    };
    const dateFormat = typeFormatMap[type as string] || typeFormatMap.day;

    // Aggregate claims by group and status depending on type
    const claimAgg: ClaimAggResult[] = await ClaimPolicyModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $project: {
          dateGroup: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          status: 1,
        },
      },
      {
        $group: {
          _id: { dateGroup: "$dateGroup", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map periods to status counts, e.g., "2024-05-12" -> { Pending: 1, Approved: 2, ... }
    const periodStatusMap = new Map<string, Record<string, number>>();
    for (const row of claimAgg) {
      const period = row._id.dateGroup;
      const status = row._id.status;
      if (!periodStatusMap.has(period)) periodStatusMap.set(period, {});
      periodStatusMap.get(period)![status] = row.count;
    }

    // Generate all periods between start and end according to type (day, week, month, year)
    const periods: string[] = [];
    let current = new Date(start);

    // Utility to format date for period
    function getPeriodString(date: Date, type: string): string {
      // Helper to pad numbers
      const pad = (val: number, n = 2) => val.toString().padStart(n, "0");
      if (type === "day") {
        return date.toISOString().slice(0, 10);
      } else if (type === "week") {
        // Get ISO week
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        // Thursday in current week decides the year.
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        // Calculate ISO week number
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        return `${d.getUTCFullYear()}-${pad(weekNo)}`;
      } else if (type === "month") {
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
      } else if (type === "year") {
        return `${date.getUTCFullYear()}`;
      }
      return date.toISOString().slice(0, 10);
    }

    // Step through periods according to type
    while (current <= end) {
      periods.push(getPeriodString(current, type as string));
      if (type === "day") {
        current.setUTCDate(current.getUTCDate() + 1);
      } else if (type === "week") {
        current.setUTCDate(current.getUTCDate() + 7);
      } else if (type === "month") {
        current.setUTCMonth(current.getUTCMonth() + 1);
        current.setUTCDate(1); // Set to first of month for safety
      } else if (type === "year") {
        current.setUTCFullYear(current.getUTCFullYear() + 1);
        current.setUTCMonth(0, 1);
      } else {
        current.setUTCDate(current.getUTCDate() + 1);
      }
    }

    // Build chartData with all periods and all statuses as keys, outputting 'label' property for frontend (period)
    const chartData = periods.map((period) => {
      const data: Record<string, number | string> = { label: period };
      for (const status of allStatuses) {
        data[status] = periodStatusMap.get(period)?.[status] || 0;
      }
      return data;
    });

    return res.status(200).json({
      success: true,
      type,
      chartData,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || String(error),
    });
  }
};
  
  








