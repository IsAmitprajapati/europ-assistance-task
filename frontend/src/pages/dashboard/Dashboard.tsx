import { Box, Card, Typography, TextField, CardContent } from "@mui/material";
import { useState, useMemo } from "react";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { PolicyDistribution } from "./_components/PolicyDistribution";
import MonthlyRevenueChat from "./_components/MonthlyRevenue";
import CustomerAcquisitionChart from "./_components/CustomerAcquisition";
import ClaimStatusChart from "./_components/ClaimStatusChart";

// You could fetch real dashboard data here & lift out stats
const DASHBOARD_CARDS = [
    { title: "Total Customers", value: 200 },
    { title: "Active Policy", value: 500 },
    { title: "Total Revenues", value: 100000 },
    { title: "Recent Claims", value: 199 },
];

export default function DashboardPage() {
    // State to store date range, with default to today
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29); // Last 30 days includes today and past 29 days

    const [dateRange, setDateRange] = useState({
        from: thirtyDaysAgo.toISOString().slice(0, 10),
        to: today.toISOString().slice(0, 10),
    });

    // Validate date input (cannot set "to" before "from" and vice versa)
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange((prev) => {
            let updated = { ...prev, [name]: value };

            // Ensure 'from' is not after 'to'
            if (name === "from" && value > updated.to) {
                updated.to = value;
            }
            // Ensure 'to' is not before 'from'
            if (name === "to" && value < updated.from) {
                updated.from = value;
            }
            return updated;
        });
    };

    // In real use, this would filter your data by dateRange
    const cardData = useMemo(() => DASHBOARD_CARDS, [dateRange]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Date Range Filter */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', md: 'row' }
                }}
            >
                <Typography variant="h5">
                    Dashboard
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        ml: 'auto',
                        //   flexWrap: "wrap",
                        fontSize: 14,
                    }}
                >

                    {/* <LocalizationProvider dateAdapter={AdapterMoment}  >
                        <div className="w-full" >
                            <DateTimePicker
                                slotProps={{ textField: { size: 'small' } }}
                                label="Date and Time"
                                className="w-full"
                                sx={{ width: "100%" }}
                                // variant="outlined"
                                // viewRenderers={{
                                //     hours: renderTimeViewClock,
                                //     minutes: renderTimeViewClock,
                                //     seconds: renderTimeViewClock,
                                // }}
                                onChange={(e) => {
                                    // setData((preve) => {
                                    //     return {
                                    //         ...preve,
                                    //         dateTimePicker: e,
                                    //     };
                                    // });
                                }}

                            />
                        </div>
                    </LocalizationProvider> */}
                    <TextField
                        label="From"
                        type="date"
                        name="from"
                        value={dateRange.from}
                        onChange={handleDateChange}
                        size="small"
                        InputLabelProps={{ shrink: true, sx: { fontSize: 14 } }}
                        inputProps={{ max: dateRange.to, style: { fontSize: 14 } }}
                        sx={{ fontSize: 14 }}
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
                        inputProps={{ min: dateRange.from, style: { fontSize: 14 } }}
                        sx={{ fontSize: 14 }}
                    />
                </Box>
            </Box>


            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                        lg: "1fr 1fr 1fr 1fr",
                    },
                    gap: 3,
                    minHeight: 110,
                    minWidth: 110,
                }}
            >
                {cardData.map((card, i) => (
                    <Card key={card.title} variant="elevation" sx={{ p: 2 }}>
                        <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
                            {card.title}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="p"
                            sx={{ color: "text.secondary" }}
                        >
                            {card.value}
                        </Typography>
                    </Card>
                ))}
            </Box>

            {/**Policy Distribution on the base of Domain */}
            <Box
                sx={{
                    display : 'grid',
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "1fr 1fr",
                        // lg: "1fr 1fr 1fr 1fr",
                    },
                    gap: 3,
                    minHeight : 300,
                }}    
            >
                
                {/**PolicyDistribution */}
                <PolicyDistribution/>


                {/**Monthly Revenue */}
                <MonthlyRevenueChat/>


                {/**Customer acquisition */}
                <CustomerAcquisitionChart/>

                {/**Claim Status  */}
                <ClaimStatusChart/>



            </Box>
        </Box>
    );
}