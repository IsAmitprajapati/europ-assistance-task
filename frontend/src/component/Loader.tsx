import { CircularProgress, Box } from '@mui/material';

export default function Loader() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40vh',
                width: '100%',
            }}
        >
            <CircularProgress size={48} color="primary" />
        </Box>
    );
}