import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import type { DateRangeType } from "../Dashboard";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";

// Props for Customer Acquisition Chart component
interface ICustomerAcquisitionChart {
  dateRange: DateRangeType;
  loading: boolean;
}

// Data interface for acquisition chart
type IDataEntry = Record<string, string | number>; // For compatibility with BarChart DatasetElementType

interface IAcquisitionData {
  xLabels: string[];
  registered: number[];
  policyBuyers: number[];
  dataset: IDataEntry[];
}

// Map for view labels
const labelMap: Record<"day" | "week" | "month" | "year", string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

// Main Customer Acquisition Chart Component
const CustomerAcquisitionChart: React.FC<ICustomerAcquisitionChart> = ({
  dateRange,
  loading,
}) => {
  // State for duration selector (day, week, etc)
  const [viewType, setViewType] = useState<"day" | "week" | "month" | "year">("day");
  // Loading state for fetching chart data
  const [fetchLoading, setFetchLoading] = useState(false);
  // State for chart data
  const [data, setData] = useState<IAcquisitionData>({
    xLabels: [],
    registered: [],
    policyBuyers: [],
    dataset: [],
  });

  /**
   * Handles view grain change (Day/Week/Month/Year)
   */
  const handleViewTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: "day" | "week" | "month" | "year" | null
  ) => {
    if (newType && newType !== viewType) {
      setViewType(newType);
    }
  };

  /**
   * Fetches chart data from API, maps to chart-friendly arrays
   */
  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setFetchLoading(true);

    try {
      const response = await api.get(endpoints.customerAcquisition, {
        params: {
            startDate: `${dateRange.from}T00:00:00Z`,  // Inclusive beginning of range
            endDate: `${dateRange.to}T23:59:59Z`, 
          type: viewType,
        },
      });

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.chartData)
      ) {
        // Create compatible `IDataEntry` for use with BarChart
        const arr: IDataEntry[] = response.data.chartData.map((item: any): IDataEntry => ({
          label: item.period,
          registered: typeof item.registered === "number" ? item.registered : 0,
          policyBuyers: typeof item.policyBuyers === "number" ? item.policyBuyers : 0,
        }));

        setData({
          xLabels: arr.map((d) => d.label as string),
          registered: arr.map((d) => d.registered as number),
          policyBuyers: arr.map((d) => d.policyBuyers as number),
          dataset: arr,
        });
      } else {
        setData({ xLabels: [], registered: [], policyBuyers: [], dataset: [] });
      }
    } catch (e) {
      setData({ xLabels: [], registered: [], policyBuyers: [], dataset: [] });
    } finally {
      setFetchLoading(false);
    }
  }, [dateRange, viewType]);

  // Re-fetch when date range or view grain changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show loader when primary loading or fetch loading are true
  const isDisplayingLoader = loading || fetchLoading;

  /**
   * Memoized rendering of bar chart for performance
   * Shows "no data" if all values are empty
   */
  const barChart = useMemo(() => {
    const hasRegistered =
      data.registered && data.registered.some((val) => val > 0);
    const hasPolicyBuyers =
      data.policyBuyers && data.policyBuyers.some((val) => val > 0);

    if (data.xLabels.length && (hasRegistered || hasPolicyBuyers)) {
      return (
        <BarChart
          dataset={data.dataset as any} // Type assertion to satisfy BarChart typing
          xAxis={[
            {
              dataKey: "label",
              label: labelMap[viewType],
              scaleType: "band",
              tickLabelStyle: { fontSize: 12 },
            },
          ]}
          series={[
            {
              dataKey: "registered",
              label: "Registered Customers",
              color: "#64b5f6",
            },
            {
              dataKey: "policyBuyers",
              label: "Bought Policy",
              color: "#1976d2",
            },
          ]}
          yAxis={[
            {
              label: "Customers",
              min: 0,
              tickLabelStyle: { fontSize: 12 },
            },
          ]}
          height={280}
          margin={{ top: 16, left: 44, right: 20, bottom: 42 }}
          sx={{
            ".MuiBarElement-root": { strokeWidth: 1.2 },
          }}
        />
      );
    }
    // If no data
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          minHeight: { xs: 220, sm: 260 },
          alignItems: "center",
          justifyContent: "center",
          color: "#a0a0a0",
        }}
      >
        <Typography variant="body2">
          No customer acquisition data found for the selected range.
        </Typography>
      </Box>
    );
  }, [data, viewType]);

  return (
    <Card>
      <CardContent>
        {/* Card header: Title and granularity toggle */}
        <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
            Customer Acquisition ({labelMap[viewType]})
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <ToggleButtonGroup
              size="small"
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              sx={{ ml: 2 }}
              disabled={isDisplayingLoader}
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        {/* Chart or loader */}
        <Box
          sx={{
            minHeight: { xs: 220, sm: 260 },
            minWidth: { xs: 260, sm: 320, md: 400 },
            width: "100%",
            overflowX: "auto",
            py: 1,
            position: "relative",
          }}
        >
          {isDisplayingLoader ? (
            <Box
              sx={{
                minHeight: 220,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : (
            barChart
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerAcquisitionChart;