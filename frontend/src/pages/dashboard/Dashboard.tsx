import { Box, Card, Typography, TextField, CircularProgress, Skeleton } from "@mui/material";
import { useState, useEffect, useMemo, useCallback } from "react";
import { PolicyDistribution } from "./_components/PolicyDistribution";
import MonthlyRevenueChat from "./_components/MonthlyRevenue";
import CustomerAcquisitionChart from "./_components/CustomerAcquisition";
import ClaimStatusChart from "./_components/ClaimStatusChart";
import { endpoints } from "../../utils/endpoint";
import api from "../../utils/Axios";

//#region Types and Helpers

export type DateRangeType = {
  from: string;
  to: string;
};

type TDashboard = {
  totalCustomers: number;
  totalActivePolicies: number;
  totalRevenue: number;
  totalClaims: number;
};

// Formats Date object as yyyy-mm-dd for use in <input type="date">
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get today's date as yyyy-mm-dd (local)
const getToday = () => formatDate(new Date());

// Get 29 days ago as yyyy-mm-dd (local, for last 30 days selection)
const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - 29);
  return formatDate(date);
};

// Convert yyyy-mm-dd to ISO string for 00:00:00Z start (for start date)
const toStartOfDayISOString = (dateString: string) => {
  // Always treat as UTC date at midnight
  const d = new Date(`${dateString}T00:00:00Z`);
  return d.toISOString();
};

// Convert yyyy-mm-dd to ISO string for 23:59:59Z end (for end date, inclusive)
const toEndOfDayISOString = (dateString: string) => {
  // Always treat as UTC date at end of the day
  // Set time to 23:59:59.999, UTC
  const d = new Date(`${dateString}T23:59:59.999Z`);
  return d.toISOString();
};
//#endregion

const DASHBOARD_CARDS = [
  { key: "totalCustomers", title: "Total Customers", skeletonWidth: 40 },
  { key: "totalActivePolicies", title: "Active Policy", skeletonWidth: 40 },
  { key: "totalRevenue", title: "Total Revenues", skeletonWidth: 60 },
  { key: "totalClaims", title: "Recent Claims", skeletonWidth: 40 },
];

export default function DashboardPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: getThirtyDaysAgo(),
    to: getToday(),
  });
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TDashboard>();
  const [error, setError] = useState<string | null>(null);

  // Ensure end date is inclusive ("to" date includes today if today is selected)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name !== "from" && name !== "to") return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;

    setDateRange(prev => {
      let newFrom = prev.from;
      let newTo = prev.to;

      if (name === "from") {
        newFrom = value;
        // If start date is after end date, set end date to start date
        if (newFrom > newTo) newTo = newFrom;
      } else if (name === "to") {
        newTo = value;
        // If end date is before start date, set start date to end date
        if (newTo < newFrom) newFrom = newTo;
      }

      // Do not allow selection beyond today for "to" date, nor for "from" date
      // If either is set beyond today, clamp back to today
      const today = getToday();
      if (newFrom > today) newFrom = today;
      if (newTo > today) newTo = today;

      return { from: newFrom, to: newTo };
    });
  };

  // Fetch Dashboard summary data
  // Always send the date range as ISO 8601 strings:
  // startDate: yyyy-mm-ddT00:00:00Z
  // endDate:   yyyy-mm-ddT23:59:59Z
  // This ensures BE time window is truly inclusive per day.
  const fetchDashboard = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const startDateISO = toStartOfDayISOString(from);
      const endDateISO = toEndOfDayISOString(to);

      const response = await api.get(endpoints.dashboard, {
        params : {
          startDate : startDateISO,
          endDate : endDateISO,
        }
      });

      if (response.data?.success && response.data.data) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.message || "Unknown error");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dashboard");
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(dateRange.from, dateRange.to);
  }, [dateRange.from, dateRange.to, fetchDashboard]);

  // Memoize summary card content for speed and no double renders
  const cardData = useMemo(() => DASHBOARD_CARDS.map(card => {
    if (loading) {
      return {
        ...card,
        value: <Skeleton width={card.skeletonWidth}/>,
      };
    }
    return {
      ...card,
      value: (data && typeof data[card.key as keyof TDashboard] === "number")
        ? data[card.key as keyof TDashboard]
        : 0,
    };
  }), [loading, data]);

  // Render
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Date Range Filter */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" }
        }}
      >
        <Typography variant="h5">Dashboard</Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            ml: { xs: 0, md: "auto" },
            fontSize: 14,
            mt: { xs: 2, md: 0 },
          }}
        >
          <TextField
            label="From"
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
            size="small"
            InputLabelProps={{ shrink: true, sx: { fontSize: 14 } }}
            inputProps={{
              max: dateRange.to,
              style: { fontSize: 14 },
              pattern: "\\d{4}-\\d{2}-\\d{2}",
              // No future dates for "From"
              maxLength: 10,
            }}
            sx={{ fontSize: 14, minWidth: 120 }}
            disabled={loading}
          />
          <Typography variant="body1" sx={{ fontSize: 14 }}>to</Typography>
          <TextField
            label="To"
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
            size="small"
            InputLabelProps={{ shrink: true, sx: { fontSize: 14 } }}
            inputProps={{
              min: dateRange.from,
              max: getToday(), // can't select future day
              style: { fontSize: 14 },
              pattern: "\\d{4}-\\d{2}-\\d{2}",
              maxLength: 10,
            }}
            sx={{ fontSize: 14, minWidth: 120 }}
            disabled={loading}
          />
        </Box>
      </Box>

      {/* Show error if present */}
      {error && (
        <Box sx={{ color: "error.main", display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {/* Cards summary row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr"
          },
          gap: 3,
          minHeight: 110,
          minWidth: 110,
          alignItems: "stretch",
        }}
      >
        {cardData.map(card => (
          <Card
            key={card.title}
            variant="elevation"
            sx={{
              p: 2,
              minWidth: 120,
              minHeight: 90,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
              {card.title}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{ color: "text.secondary", minHeight: 32, display: "flex", alignItems: "center" }}
            >
              {card.value}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Analytics & Distribution Charts area */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
          minHeight: 300,
          position: "relative"
        }}
      >
        {loading && (
          <Box sx={{
            position: "absolute",
            left: 0, right: 0, top: 0, bottom: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            opacity: 0.7
          }}>
            <CircularProgress />
          </Box>
        )}

        <PolicyDistribution dateRange={dateRange} loading={loading} />
        <MonthlyRevenueChat dateRange={dateRange} loading={loading} />
        <CustomerAcquisitionChart dateRange={dateRange} loading={loading} />
        <ClaimStatusChart dateRange={dateRange} loading={loading} />
      </Box>
    </Box>
  );
}