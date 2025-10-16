import { Box, Card, CardContent, Typography } from "@mui/material";
import { PieChart } from '@mui/x-charts/PieChart';

// Example data for policy distribution by domain/type
const policyDistributionData = [
  { id: 0, value: 40, label: 'Health', color: '#1976d2' },
  { id: 1, value: 25, label: 'Auto', color: '#388e3c' },
  { id: 2, value: 20, label: 'Home', color: '#fbc02d' },
  { id: 3, value: 15, label: 'Travel', color: '#d32f2f' },
];

export const valueFormatter = (item: { value: number }) => `${item.value}%`;

export function PolicyDistribution() {
  return (
    <Card>
      <CardContent>
        <Box>
          <Typography gutterBottom variant="body1" sx={{ fontSize: 18 }} component="div">
            Policy Distribution
          </Typography>
        </Box>
        <Box sx={{
            minHeight: { xs: 300, sm: 350, md: 400 },
            minWidth: { xs: 300, sm: 350, md: 400 },
        }} display="flex" flexDirection="column" alignItems="center">
          <PieChart
            series={[
              {
                data: policyDistributionData,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                arcLabel: (item) => `${item.label}`,
                // innerRadius: 50,
                // outerRadius: 90,
                // paddingAngle: 2,
                valueFormatter,
              },
            ]}
            // slotProps={{
            //     legend: {
            //       direction: 'horizontal',
            //       position: { 
            //         vertical: 'bottom',
            //         horizontal: 'end'
            //       }
            //     }
            //   }}
            // height={260}
            // width={260}
            // legend={{ hidden: false, position: { vertical: 'bottom', horizontal: 'middle' } }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}