import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Card, CardContent 
} from '@mui/material';
import { 
  DirectionsCar, Person, Assignment, Build, AttachMoney 
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    activeDrivers: 0,
    pendingOrders: 0,
    activeOrders: 0,
    totalCosts: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vehicles, drivers, orders, costs] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/orders'),
        api.get('/costs')
      ]);

      setStats({
        totalVehicles: vehicles.data.length,
        activeVehicles: vehicles.data.filter(v => v.status === 'in-use').length,
        totalDrivers: drivers.data.length,
        activeDrivers: drivers.data.filter(d => d.status === 'on-duty').length,
        pendingOrders: orders.data.filter(o => o.status === 'pending').length,
        activeOrders: orders.data.filter(o => o.status === 'in-progress').length,
        totalCosts: costs.data.reduce((sum, c) => sum + c.amount, 0)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color, fontSize: 48 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, {user?.name}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={<DirectionsCar />}
            color="primary.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Vehicles"
            value={stats.activeVehicles}
            icon={<DirectionsCar />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Drivers"
            value={stats.totalDrivers}
            icon={<Person />}
            color="info.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Drivers"
            value={stats.activeDrivers}
            icon={<Person />}
            color="success.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<Assignment />}
            color="warning.main"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={<Assignment />}
            color="primary.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Total Operating Costs
            </Typography>
            <Typography variant="h3" color="error">
              R{stats.totalCosts.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;