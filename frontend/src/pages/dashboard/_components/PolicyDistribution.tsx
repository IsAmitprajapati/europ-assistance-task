import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { PieChart } from '@mui/x-charts/PieChart';
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRangeType } from "../Dashboard";
import { endpoints } from "../../../utils/endpoint";
import api from "../../../utils/Axios";

const COLORS = [
    "#1976d2", // blue
    "#388e3c", // green
    "#fbc02d", // yellow
    "#d32f2f", // red
    "#8e24aa", // purple
    "#39b7cd", // cyan
    "#bc5100", // orange
    "#5a5a5a"  // gray
];

export const valueFormatter = (item: { value: number }) => `${item.value}`;

interface PolicyDistributionItem {
    policyType: string;
    customerCount: number;
}

interface TPolicyDistribution {
    dateRange: DateRangeType,
    loading: boolean
}

// Fix: align arcLabel typing with what @mui/x-charts/PieChart expects
export function PolicyDistribution({ dateRange, loading }: TPolicyDistribution) {
    const [data, setData] = useState<PolicyDistributionItem[]>([]);
    const [fetching, setFetching] = useState<boolean>(false);

    // API fetch
    const fetchPolicyDistribution = useCallback(async () => {
        setFetching(true);
        try {
            const response = await api.get(endpoints.policyDistribution, {
                params: {
                    startDate: `${dateRange.from}T00:00:00Z`,  // Inclusive beginning of range
                    endDate: `${dateRange.to}T23:59:59Z`,
                }
            });
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                setData(response.data.data as PolicyDistributionItem[]);
            } else {
                setData([]);
            }
        } catch (err) {
            setData([]);
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicyDistribution();
    }, [fetchPolicyDistribution,dateRange,loading]);

    // Prepare data for PieChart
    const pieData = useMemo(() => {
        return data.map((item, idx) => ({
            id: idx,
            value: item.customerCount,
            label: item.policyType,
            color: COLORS[idx % COLORS.length]
        }));
    }, [data]);

    // Show skeleton while loading or fetching API
    const isDataLoading = loading || fetching;

    // Updated typing for arcLabel per expected signature of PieChart
    const arcLabel = (item: { value: number; label?: string }) => {
        // If the value is zero, don't show label inside the pie slice
        return item.value === 0 ? '' : (item.label ?? '');
    };

    return (
        <Card>
            <CardContent>
                <Box>
                    <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
                        Policy Distribution
                    </Typography>
                </Box>
                <Box
                    sx={{
                        minHeight: { xs: 300, sm: 350, md: 400 },
                        minWidth: { xs: 300, sm: 350, md: 400 },
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {isDataLoading ? (
                        <Skeleton
                            variant="rectangular"
                            sx={{
                                borderRadius: 2,
                                minHeight: { xs: 220, sm: 260, md: 320 },
                                minWidth: { xs: 220, sm: 260, md: 320 }
                            }}
                        />
                    ) : (
                        <PieChart
                            series={[
                                {
                                    data: pieData,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                    arcLabel: arcLabel,
                                    valueFormatter,
                                },
                            ]}
                        //   legend={{ hidden: false }} // Ensure legend is always shown
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}