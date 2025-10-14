import { Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Header from './Header';
import Sidebar from './Sidebar';
import { drawerWidth } from '../constant';
import { useProvider } from '../context/Provider';
import { useEffect } from 'react';
import ProtectedRoutes from '../component/ProtectedRoutes';

// Main layout component with optimisation and fixes
export default function DashboardLayout() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));


  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          zIndex: theme.zIndex.drawer
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 64, }}>
          <Header />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          borderTopLeftRadius: 20,
          p: 3,
          mt: 8, // To offset AppBar height (64px = 8*8px)
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
    {/* <ProtectedRoutes/> */}
    </>
  );
}
