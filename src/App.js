import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Orders from './pages/Orders';
import Maintenance from './pages/Maintenance';
import Costs from './pages/Costs';
import Communication from './pages/Communication';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/vehicles" 
              element={
                <PrivateRoute>
                  <Vehicles />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/drivers" 
              element={
                <PrivateRoute>
                  <Drivers />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/maintenance" 
              element={
                <PrivateRoute>
                  <Maintenance />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/costs" 
              element={
                <PrivateRoute>
                  <Costs />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/communication" 
              element={
                <PrivateRoute>
                  <Communication />
                </PrivateRoute>
              } 
            />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;