import {
    Box,
    Card,
    CardContent,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Skeleton,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useCallback, useEffect, useState } from "react";
import type { DateRangeType } from "../Dashboard";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";

// Map chart type ("day", "week", ...) to display label
const labelMap: Record<string, string> = {
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
};

// Props interface
interface IClaimStatusChart {
    dateRange: DateRangeType;
    loading: boolean;
}

// Data shape for each period/data point
type TData = {
    label: string;
    Approved: number;
    Rejected: number;
    Pending: number;
};

// MAIN CHART COMPONENT
export default function ClaimStatusChart({ dateRange, loading }: IClaimStatusChart) {
    // User's view type selection for x-axis: day, week, month, year
    const [viewType, setViewType] = useState<"day" | "week" | "month" | "year">("day");
    // API fetch loading spinner state
    const [fetchLoading, setFetchLoading] = useState<boolean>(false);
    // Fetched data for the chart
    const [data, setData] = useState<TData[]>([]);

    /**
     * Handles toggle between view types ("day"/"week"/"month"/"year").
     */
    const handleViewTypeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newType: "day" | "week" | "month" | "year" | null
    ) => {
        // Only update if there's an actual change
        if (newType && newType !== viewType) {
            setViewType(newType);
        }
    };

    /**
     * Fetches claim status chart data from API based on the selected date range and period type.
     * Fills missing status data with 0 as needed.
     */
    const fetchClaimStatusPolicy = useCallback(async () => {
        setFetchLoading(true);
        try {
            const response = await api.get(endpoints.claimPolicychart, {
                params: {
                    startDate: `${dateRange.from}T00:00:00Z`,  // Inclusive beginning of range
                    endDate: `${dateRange.to}T23:59:59Z`,      // Inclusive end of range
                    type: viewType,                            // "day" | "week" | "month" | "year"
                },
            });

            // Only set data if API returns valid format and success
            if (
                response.data &&
                response.data.success &&
                Array.isArray(response.data.chartData)
            ) {
                // API returns status counts per period, fill in 0 for missing statuses
                const formatDate: TData[] = response.data.chartData.map((el: any) => ({
                    label: el.label, // Expect backend uses "label" for period (e.g. "2024-06-13" or "2024-W24" etc)
                    Approved: Number(el.Approved) ?? 0,
                    Rejected: Number(el.Rejected) ?? 0,
                    Pending: Number(el.Pending) ?? 0,
                }));
                setData(formatDate);
            } else {
                // Default to empty if missing/wrong format
                setData([]);
            }
        } catch (err) {
            setData([]); // Show no data if error occurs
        } finally {
            setFetchLoading(false);
        }
    }, [dateRange.from, dateRange.to, viewType]);

    // Re-fetch when date range OR viewType changes
    useEffect(() => {
        fetchClaimStatusPolicy();
    }, [fetchClaimStatusPolicy]);

    // Show skeleton while global loading or fetching from API
    const isDataLoading = loading || fetchLoading;

    return (
        <Card>
            <CardContent>
                {/* Chart title and period type toggle */}
                <Box
                    sx={{
                        mb: 5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Title shows active period granularity */}
                    <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
                        Claim Status ({labelMap[viewType]})
                    </Typography>
                    {/* User can switch granularity with toggles */}
                    <ToggleButtonGroup
                        size="small"
                        value={viewType}
                        exclusive
                        onChange={handleViewTypeChange}
                        sx={{ ml: 2 }}
                    >
                        <ToggleButton value="day">Day</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                        <ToggleButton value="year">Year</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/* Chart or loading skeleton */}
                <Box
                    sx={{
                        minHeight: { xs: 220, sm: 260 },
                        minWidth: { xs: 260, sm: 320, md: 400 },
                        width: "100%",
                        overflowX: "auto",
                        py: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {isDataLoading ? (
                        // Show skeleton as a visual placeholder while loading
                        <Skeleton
                            variant="rectangular"
                            sx={{
                                borderRadius: 2,
                                minHeight: { xs: 180, sm: 220 },
                                minWidth: { xs: 220, sm: 260, md: 400 },
                            }}
                        />
                    ) : (
                        // Actual bar chart. Each series is a claim status ("Pending", etc.)
                        <BarChart
                            // Data: array of { label, Approved, Rejected, Pending }
                            dataset={data}
                            // X-axis setup
                            xAxis={[
                                {
                                    dataKey: "label",
                                    label: labelMap[viewType],
                                    scaleType: "band",
                                    tickLabelStyle: { fontSize: 12 },
                                },
                            ]}
                            // Show each claim status as a colored stacked bar
                            series={[
                                {
                                    dataKey: "Approved",
                                    label: "Approved",
                                    color: "#388e3c", // green
                                    stack: "a",
                                },
                                {
                                    dataKey: "Rejected",
                                    label: "Rejected",
                                    color: "#d32f2f", // red
                                    stack: "a",
                                },
                                {
                                    dataKey: "Pending",
                                    label: "Pending",
                                    color: "#fbc02d", // yellow
                                    stack: "a",
                                },
                            ]}
                            // Y-axis: count of claims
                            yAxis={[
                                {
                                    label: "Number of Claims",
                                    min: 0,
                                    tickLabelStyle: { fontSize: 12 },
                                },
                            ]}
                            // Layout/appearance
                            height={280}
                            margin={{ top: 16, left: 44, right: 20, bottom: 44 }}
                            sx={{
                                ".MuiBarElement-root": { strokeWidth: 1.2 },
                            }}
                            // Legend/tooltip can be customized if needed.
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}