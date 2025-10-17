import {
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { DateRangeType } from "../Dashboard";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";

/**
 * Props for the MonthlyRevenueChart component.
 * - dateRange: Object containing 'from' and 'to' dates for filtering data.
 * - loading: Controls global loading state (typically parent-controlled).
 */
interface IMonthlyRevenueChartProps {
  dateRange: DateRangeType;
  loading: boolean;
}

/**
 * Structure of revenue data used for the chart.
 * - xLabels: The labels for the x-axis (dates, weeks, months, or years).
 * - yData: Corresponding revenue number for each label.
 */
interface IRevenueData {
  xLabels: string[];
  yData: number[];
}

// Mapping chart type to human-readable label for UI.
const labelMap: Record<"day" | "week" | "month" | "year", string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

/**
 * Displays a revenue line chart with toggleable granularity (day/week/month/year)
 * and fetches data when date range or granularity changes.
 */
export default function MonthlyRevenueChart({
  dateRange,
  loading,
}: IMonthlyRevenueChartProps) {
  // Current selected chart granularity type.
  const [chartType, setChartType] = useState<"day" | "week" | "month" | "year">("day");

  // State for chart data, initialized as empty.
  const [data, setData] = useState<IRevenueData>({ xLabels: [], yData: [] });

  // Local loading state for internal fetches.
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);

  /**
   * Fetch the revenue data for the selected date range and chart type.
   * This is debounced by useCallback so it only changes when its deps change.
   */
  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    setFetchLoading(true);
    try {
      const response = await api.get(endpoints.revenues, {
        params: {
            startDate: `${dateRange.from}T00:00:00Z`,  // Inclusive beginning of range
            endDate: `${dateRange.to}T23:59:59Z`, 
          type: chartType,
        },
      });
      if (response.data && response.data.success) {
        // Map API response to chart data.
        const xLabels =
          response.data.data?.map((d: any) => d.label) || [];
        const yData =
          response.data.data?.map((d: any) =>
            typeof d.revenue === "number" ? d.revenue : 0
          ) || [];
        setData({ xLabels, yData });
      } else {
        setData({ xLabels: [], yData: [] });
      }
    } catch (error) {
      // Optionally: show notification/toast for failed fetch.
      setData({ xLabels: [], yData: [] });
    } finally {
      setFetchLoading(false);
    }
  }, [dateRange, chartType]);

  /**
   * Refetch revenue data whenever the date range or chart granularity changes.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handler for changing the chart's granularity.
   * Ignores unset (null) or redundant selection.
   */
  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: "day" | "week" | "month" | "year" | null
  ) => {
    if (newType && newType !== chartType) setChartType(newType);
  };

  // Show loader if parent loading or our fetch is in progress.
  const isDisplayingLoader = loading || fetchLoading;

  /**
   * The chart component (or placeholder), memoized for render efficiency.
   */ 
  const lineChart = useMemo(() => {
    // Only render chart if data exists, else render "no data" placeholder.
    if (data.xLabels.length && data.yData.length) {
      return (
        <LineChart
          xAxis={[
            {
              scaleType: "point",
              data: data.xLabels,
              label: labelMap[chartType],
              tickLabelStyle: { fontSize: 12 },
            },
          ]}
          series={[
            {
              data: data.yData,
              color: "#1976d2",
              label: "Revenue",
              area: false,
            },
          ]}
          yAxis={[
            {
              label: "Revenue (₹)",
              min: 0,
              tickLabelStyle: { fontSize: 12 },
              valueFormatter: (value: number) => `₹${value.toLocaleString()}`,
            },
          ]}
          height={280}
          margin={{ top: 16, left: 44, right: 18, bottom: 42 }}
          sx={{ ".MuiLineElement-root": { strokeWidth: 2 } }}
        />
      );
    } else {
      return (
        <Box
          sx={{
            display: "flex",
            height: "100%",
            minHeight: { xs: 250, sm: 280, md: 300 },
            alignItems: "center",
            justifyContent: "center",
            color: "#a0a0a0",
          }}
        >
          <Typography variant="body2">
            No revenue data found for the selected range.
          </Typography>
        </Box>
      );
    }
  }, [data, chartType]);

  // Render the revenue chart card with all UI controls and chart/loader.
  return (
    <Card>
      <CardContent>
        {/* Header: title & chart granularity toggle */}
        <Box
          sx={{
            mb: 5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            gutterBottom
            variant="body1"
            sx={{ fontSize: 18 }}
            component="div"
          >
            Revenue ({labelMap[chartType]})
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            sx={{ ml: 2 }}
            disabled={isDisplayingLoader}
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Chart container: shows loader or the chart (or no-data placeholder) */}
        <Box
          sx={{
            minHeight: { xs: 250, sm: 280, md: 300 },
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
                minHeight: { xs: 250, sm: 280, md: 300 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            lineChart
          )}
        </Box>
      </CardContent>
    </Card>
  );
}