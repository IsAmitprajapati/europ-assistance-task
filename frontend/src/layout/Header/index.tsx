// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import LogoSection from '../Logo';
import { Button, CircularProgress, Popover, Typography } from '@mui/material';
import { drawerWidth } from '../../constant';
import { useState } from 'react';
import { useProvider } from '../../context/Provider';
import { handleLogout } from '../../utils/api';
import Loader from '../../component/Loader';


export default function Header() {
    const theme = useTheme();
    const { user, globalLoading } = useProvider()
    const downMD = useMediaQuery(theme.breakpoints.down('md'));
    const [profileMenuOpen, setProfileMenuOpen] = useState<HTMLButtonElement | null>(null)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setProfileMenuOpen(event.currentTarget);
    };

    const handleClose = () => {
        setProfileMenuOpen(null);
    };


    const openProfile = Boolean(profileMenuOpen);
    const id = profileMenuOpen ? 'simple-popover' : undefined;
    return (
        <>
            {/* logo & toggler button */}
            <Box sx={{ width: downMD ? 'auto' : drawerWidth, display: 'flex', boxSizing: 'border-box', alignItems: "center", height: 64, px: 2 }}>
                <LogoSection />
            </Box>

            {/* header search */}
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ flexGrow: 1 }} />

            {/* User avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', pr: 2 }}>
                <Button
                    variant="text"
                    aria-describedby={id}
                    onClick={handleClick}
                    sx={{
                        border: 'none',
                        outline: 'none',
                        minWidth: 0,
                        p: 0,
                        borderRadius: '50%',
                    }}
                >
                    <Avatar
                        alt="User"
                        src="/user-round.svg"
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.main,
                        }}
                    />
                </Button>
            </Box>
            <Popover
                id={id}
                open={openProfile}
                anchorEl={profileMenuOpen}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: 1,
                        minWidth: 180,
                        boxShadow: '0 3px 16px rgba(0,0,0,0.15)',
                        p: 1
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
                        <Avatar
                            alt="User"
                            src="/user-round.svg"
                            sx={{
                                width: 38,
                                height: 38,
                                mr: 1.5,
                                bgcolor: theme.palette.primary.light,
                                color: theme.palette.primary.main,
                                fontSize: 18,
                                fontWeight: 700,
                            }}
                        />

                        {
                            globalLoading ? <CircularProgress size={48} color="primary" /> : (
                                <Box>
                                    <Box sx={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name}</Box>
                                    <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{user?.email}</Box>
                                </Box>
                            )
                        }

                    </Box>
                    <Box sx={{ my: 1, height: '1px', bgcolor: 'divider', width: '100%' }} />
                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            textTransform: 'none',
                        }}
                        onClick={() => {
                            // TODO: Add logout logic here
                            handleLogout()
                            handleClose();
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Popover>

        </>
    );
}
