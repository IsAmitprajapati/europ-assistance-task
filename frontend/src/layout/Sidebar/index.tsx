import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useTheme } from '@mui/material/styles';

import LogoSection from '../Logo';
import { drawerWidth } from '../../constant';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { IconPaperBag, IconUserBolt, IconUsers } from '@tabler/icons-react';


const sidebarItems = [
    {
        label: 'Dashboard',
        icon: <DashboardIcon />,
        to: '/dashboard',
    },
    {
        label: 'Customer Mgmt',
        icon: <IconUsers />,
        to: '/dashboard/customer',
    },
    {
        label: 'Segment',
        icon: <IconUserBolt />,
        to: '/dashboard/segment',
    },
    {
        label: 'Policy Mgmt',
        icon: <IconPaperBag />,
        to: '/dashboard/policy',
    },
    // Add more Sidebar item objects here as your app grows.
];

export default function Sidebar() {
    const theme = useTheme();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                    borderRight: '0px solid',
                    borderColor: theme.palette.divider,
                }
            }}
            open={true}
        >
            {/* Logo at top */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 64, marginBottom: 8 }}>
                <LogoSection />
            </div>

            <List>
                {sidebarItems.map((item) => {
                    // Determine active: if both '/dashboard' and the item's "field" (from 'to') are present in the URL.
                    // For root dashboard, match exactly '/dashboard'
                    let isActive = false;
                    if (item.to === '/dashboard') {
                        isActive = location.pathname === '/dashboard';
                    } else {
                        // item.to should be like '/dashboard/customer', check if location.pathname starts with that
                        isActive = location.pathname.startsWith(item.to);
                    }
                    
                    return (
                        <ListItem key={item.label} disablePadding>
                            <ListItemButton
                                component={RouterLink}
                                to={item.to}
                                selected={isActive}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.lighter',
                                        '& .MuiListItemText-primary': {
                                            fontWeight: 700,
                                            color: 'primary.main',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.main'
                                        }
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'primary.main' : 'GrayText',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 700 : 400,
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
}