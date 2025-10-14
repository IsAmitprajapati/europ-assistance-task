import { useState } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import Provider from './context/Provider'
import { Toaster } from 'react-hot-toast';
import ProtectedRoutes from './component/ProtectedRoutes'


function App() {

  return (
    <Provider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
            <Outlet />
          <Toaster/>
        </ThemeProvider>
        {/**
         * checking the user has login or not
         */}
        <ProtectedRoutes/>
    </Provider>
  )
}

export default App
