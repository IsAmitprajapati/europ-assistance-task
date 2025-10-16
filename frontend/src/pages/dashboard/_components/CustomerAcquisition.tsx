import { Box, Card, CardContent, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import React from "react";

// Mock/Static datasets for day, week, month, year
const acquisitionData = {
  day: [
    { label: "01", customers: 12 },
    { label: "02", customers: 16 },
    { label: "03", customers: 19 },
    { label: "04", customers: 10 },
    { label: "05", customers: 12 },
    { label: "06", customers: 15 },
    { label: "07", customers: 14 },
  ],
  week: [
    { label: "W1", customers: 73 },
    { label: "W2", customers: 98 },
    { label: "W3", customers: 105 },
    { label: "W4", customers: 145 },
    { label: "W5", customers: 120 },
  ],
  month: [
    { label: "Jan", customers: 80 },
    { label: "Feb", customers: 100 },
    { label: "Mar", customers: 95 },
    { label: "Apr", customers: 120 },
    { label: "May", customers: 130 },
    { label: "Jun", customers: 110 },
    { label: "Jul", customers: 140 },
    { label: "Aug", customers: 135 },
    { label: "Sep", customers: 125 },
    { label: "Oct", customers: 145 },
    { label: "Nov", customers: 150 },
    { label: "Dec", customers: 160 },
  ],
  year: [
    { label: "2020", customers: 740 },
    { label: "2021", customers: 920 },
    { label: "2022", customers: 1150 },
    { label: "2023", customers: 1295 },
    { label: "2024", customers: 1350 },
  ],
};

function useAcquisitionChartData(type: "day" | "week" | "month" | "year") {
  return React.useMemo(() => {
    let data;
    if (type !== "year") {
      data = acquisitionData[type];
    } else {
      // Show all years if viewType is "year"
      data = acquisitionData.year;
    }
    return {
      chartLabels: data.map((d) => d.label),
      yData: data.map((d) => d.customers),
      dataset: data,
    };
  }, [type]);
}

export default function CustomerAcquisitionChart() {
  const [viewType, setViewType] = React.useState<"day" | "week" | "month" | "year">("month");
  const { dataset } = useAcquisitionChartData(viewType);

  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: "day" | "week" | "month" | "year" | null
  ) => {
    if (newType) {
      setViewType(newType);
    }
  };

  const labelMap = { day: "Day", week: "Week", month: "Month", year: "Year" };

  return (
    <Card>
      <CardContent>
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
            >
              <ToggleButton value="day">Day</ToggleButton>
              <ToggleButton value="week">Week</ToggleButton>
              <ToggleButton value="month">Month</ToggleButton>
              <ToggleButton value="year">Year</ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
                dataKey: "customers",
                label: "New Customers",
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
        </Box>
      </CardContent>
    </Card>
  );
}