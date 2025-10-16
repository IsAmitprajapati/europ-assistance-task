import { Box, Typography, Card, CardContent, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import React from "react";

// Example data for day, week, month, and year
const revenueData = {
  day: [
    { label: "01", revenue: 750 },
    { label: "02", revenue: 1035 },
    { label: "03", revenue: 1200 },
    { label: "04", revenue: 980 },
    { label: "05", revenue: 1310 },
    { label: "06", revenue: 900 },
    { label: "07", revenue: 1090 },
  ],
  week: [
    { label: "W1", revenue: 5600 },
    { label: "W2", revenue: 6700 },
    { label: "W3", revenue: 7150 },
    { label: "W4", revenue: 7900 },
    { label: "W5", revenue: 7800 },
  ],
  month: [
    { label: "Jan", revenue: 12000 },
    { label: "Feb", revenue: 14500 },
    { label: "Mar", revenue: 13800 },
    { label: "Apr", revenue: 16200 },
    { label: "May", revenue: 17500 },
    { label: "Jun", revenue: 18900 },
    { label: "Jul", revenue: 17500 },
    { label: "Aug", revenue: 17900 },
    { label: "Sep", revenue: 19500 },
    { label: "Oct", revenue: 21200 },
    { label: "Nov", revenue: 20500 },
    { label: "Dec", revenue: 22000 },
  ],
  year: [
    { label: "2020", revenue: 145600 },
    { label: "2021", revenue: 162400 },
    { label: "2022", revenue: 174200 },
    { label: "2023", revenue: 185000 },
    { label: "2024", revenue: 199200 },
  ],
};

function useRevenueChartData(type: "day" | "week" | "month" | "year") {
  return React.useMemo(() => {
    const data = revenueData[type];
    return {
      xLabels: data.map((d) => d.label),
      yData: data.map((d) => d.revenue),
    };
  }, [type]);
}

export default function MonthlyRevenueChat() {
  const [chartType, setChartType] = React.useState<"day" | "week" | "month" | "year">("month");
  const { xLabels, yData } = useRevenueChartData(chartType);

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: "day" | "week" | "month" | "year" | null
  ) => {
    if (newType) setChartType(newType);
  };

  const labelMap = { day: "Day", week: "Week", month: "Month", year: "Year" };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box
          sx={{
            minHeight: { xs: 250, sm: 280, md: 300 },
            minWidth: { xs: 260, sm: 320, md: 400 },
            width: "100%",
            overflowX: "auto",
            py: 1,
          }}
        >
          <LineChart
            xAxis={[
              {
                scaleType: "point",
                data: xLabels,
                label: labelMap[chartType],
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            series={[
              {
                data: yData,
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
                valueFormatter: (value: number) =>
                  `₹${value.toLocaleString()}`,
              },
            ]}
            height={280}
            margin={{ top: 16, left: 44, right: 18, bottom: 42 }}
            sx={{ ".MuiLineElement-root": { strokeWidth: 2 } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}