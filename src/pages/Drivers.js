import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Chip, Paper, Avatar, IconButton
} from '@mui/material';
import { Person, Star, Edit, Delete } from '@mui/icons-material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Drivers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: '',
    experience: '',
    status: 'available',
    address: ''
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleOpenDialog = (driver) => {
    setCurrentDriver(driver);
    setFormData({
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : '',
      licenseType: driver.licenseType,
      experience: driver.experience,
      status: driver.status,
      address: driver.address || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/drivers/${currentDriver._id}`, formData);
      loadDrivers();
      handleCloseDialog();
      alert('Driver updated successfully!');
    } catch (error) {
      console.error('Error updating driver:', error);
      alert(error.response?.data?.message || 'Error updating driver');
    }
  };

  const handleDelete = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/drivers/${driverId}`);
      alert('Driver deleted successfully!');
      loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert(error.response?.data?.message || 'Error deleting driver');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      'on-duty': 'primary',
      'off-duty': 'warning',
      'on-leave': 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Drivers</Typography>
      </Box>

      <Grid container spacing={3}>
        {drivers.map((driver) => (
          <Grid item xs={12} sm={6} md={4} key={driver._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    {driver.user?.name}
                  </Typography>
                  <Chip
                    label={driver.status}
                    color={getStatusColor(driver.status)}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary">
                License: {driver.licenseNumber}
              </Typography>

              <Typography variant="body2">
                Type: {driver.licenseType}
              </Typography>

              <Typography variant="body2">
                Experience: {driver.experience} years
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Star sx={{ color: 'gold', fontSize: 18, mr: 0.5 }} />
                <Typography variant="body2">
                  {driver.rating.toFixed(1)} / 5.0
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Total Trips: {driver.totalTrips}
              </Typography>

              <Typography variant="body2">
                Total Distance: {driver.totalDistance.toLocaleString()} km
              </Typography>

              {driver.currentVehicle && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Vehicle: {driver.currentVehicle.vehicleNumber}
                </Typography>
              )}

              {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(driver)}
                    title="Edit Driver"
                  >
                    <Edit />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(driver._id)}
                    title="Delete Driver"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Driver - {currentDriver?.user?.name}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Expiry"
                  name="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="License Type"
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Experience (years)"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="on-duty">On Duty</MenuItem>
                    <MenuItem value="off-duty">Off Duty</MenuItem>
                    <MenuItem value="on-leave">On Leave</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Drivers;