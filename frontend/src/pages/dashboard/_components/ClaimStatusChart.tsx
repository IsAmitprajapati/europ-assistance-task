import { Box, Card, CardContent, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";

// Example claim status data for day, week, month, year (stacked groups)
const claimStatusData = {
  day: [
    { label: "01", Approved: 10, Rejected: 2, Pending: 6 },
    { label: "02", Approved: 14, Rejected: 3, Pending: 5 },
    { label: "03", Approved: 12, Rejected: 1, Pending: 7 },
    { label: "04", Approved: 8, Rejected: 4, Pending: 6 },
    { label: "05", Approved: 15, Rejected: 0, Pending: 3 },
    { label: "06", Approved: 11, Rejected: 2, Pending: 5 },
    { label: "07", Approved: 13, Rejected: 2, Pending: 4 },
  ],
  week: [
    { label: "W1", Approved: 65, Rejected: 8, Pending: 20 },
    { label: "W2", Approved: 70, Rejected: 10, Pending: 18 },
    { label: "W3", Approved: 74, Rejected: 11, Pending: 20 },
    { label: "W4", Approved: 80, Rejected: 8, Pending: 18 },
    { label: "W5", Approved: 78, Rejected: 12, Pending: 15 },
  ],
  month: [
    { label: "Jan", Approved: 330, Rejected: 30, Pending: 40 },
    { label: "Feb", Approved: 310, Rejected: 33, Pending: 29 },
    { label: "Mar", Approved: 380, Rejected: 20, Pending: 35 },
    { label: "Apr", Approved: 370, Rejected: 28, Pending: 27 },
    { label: "May", Approved: 400, Rejected: 23, Pending: 35 },
    { label: "Jun", Approved: 376, Rejected: 24, Pending: 29 },
    { label: "Jul", Approved: 420, Rejected: 18, Pending: 21 },
    { label: "Aug", Approved: 396, Rejected: 21, Pending: 29 },
    { label: "Sep", Approved: 460, Rejected: 14, Pending: 22 },
    { label: "Oct", Approved: 445, Rejected: 18, Pending: 36 },
    { label: "Nov", Approved: 450, Rejected: 16, Pending: 34 },
    { label: "Dec", Approved: 460, Rejected: 12, Pending: 28 },
  ],
  year: [
    { label: "2020", Approved: 4100, Rejected: 120, Pending: 260 },
    { label: "2021", Approved: 4380, Rejected: 135, Pending: 210 },
    { label: "2022", Approved: 4590, Rejected: 150, Pending: 180 },
    { label: "2023", Approved: 4800, Rejected: 118, Pending: 160 },
    { label: "2024", Approved: 4980, Rejected: 90, Pending: 130 },
  ],
};

const labelMap = { day: "Day", week: "Week", month: "Month", year: "Year" };

export default function ClaimStatusChart() {
  const [viewType, setViewType] = React.useState<"day" | "week" | "month" | "year">("month");
  const dataset = React.useMemo(() => claimStatusData[viewType], [viewType]);

  const handleViewTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: "day" | "week" | "month" | "year" | null
  ) => {
    if (newType) setViewType(newType);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
            Claim Status ({labelMap[viewType]})
          </Typography>
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
        <Box
          sx={{
            minHeight: { xs: 220, sm: 260 },
            minWidth: { xs: 260, sm: 320, md: 400 },
            width: "100%",
            overflowX: "auto",
            py: 1,
          }}
        >
          <BarChart
            dataset={dataset}
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
                dataKey: "Approved",
                label: "Approved",
                color: "#388e3c",
                stack: "a",
              },
              {
                dataKey: "Rejected",
                label: "Rejected",
                color: "#d32f2f",
                stack: "a",
              },
              {
                dataKey: "Pending",
                label: "Pending",
                color: "#fbc02d",
                stack: "a",
              },
            ]}
            yAxis={[
              {
                label: "Number of Claims",
                min: 0,
                tickLabelStyle: { fontSize: 12 },
              },
            ]}
            height={280}
            margin={{ top: 16, left: 44, right: 20, bottom: 44 }}
            sx={{
              ".MuiBarElement-root": { strokeWidth: 1.2 },
            }}
            // Optional: Add legend customization here if needed
          />
        </Box>
      </CardContent>
    </Card>
  );
}