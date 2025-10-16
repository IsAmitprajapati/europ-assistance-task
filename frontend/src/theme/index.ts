import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// 🎨 Base Theme
let theme = createTheme({
  palette: {
    mode: 'light', // or 'dark'
    primary: {
      main: '#1976d2',       // blue (you can change to '#1E88E5' for softer tone)
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',       // purple accent
      light: '#d05ce3',
      dark: '#6a0080',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb',    // light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4f4f4f',
    },
    divider: 'rgba(0,0,0,0.12)',
    success: {
      main: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
  },

  shape: {
    borderRadius: 7,
  },

  typography: {
    fontFamily: 'Nunito, Roboto, sans-serif',//`'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif,`  ,
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      color: '#333',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 10,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 7,
          textTransform: 'none',
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;