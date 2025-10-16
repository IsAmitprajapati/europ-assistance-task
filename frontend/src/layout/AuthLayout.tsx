import { Outlet, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useProvider } from "../context/Provider";
import { useEffect } from "react";

export default function AuthLayout() {
    const navigate = useNavigate()
    const { user, globalLoading } = useProvider()

    useEffect(() => {
        if (!globalLoading && user) {
            navigate("/dashboard")
        }
    }, [user, globalLoading]);

    return (
        <>
            <Box
                minHeight="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="#f4f6fa"
            >
                <Paper elevation={3} sx={{ p: 4, minWidth: 340, width: "100%", maxWidth: 400 }}>
                    <Typography variant="h5" component="h1" gutterBottom align="center">
                        Welcome to Europ
                    </Typography>
                    <Outlet />
                </Paper>
            </Box>
        </>
    );
}