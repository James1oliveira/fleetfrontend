import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Box, Chip, IconButton, Paper
} from '@mui/material';
import { Add, Edit, Delete, PersonAdd, PersonRemove } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    year: '',
    type: 'truck',
    capacity: '',
    capacityUnit: 'kg',
    fuelType: 'diesel',
    fuelConsumption: '',
    mileage: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    loadVehicles();
    loadAvailableDrivers();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadAvailableDrivers = async () => {
    try {
      const { data } = await api.get('/drivers?status=available');
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setEditMode(true);
      setCurrentVehicle(vehicle);
      setFormData({
        vehicleNumber: vehicle.vehicleNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        capacity: vehicle.capacity,
        capacityUnit: vehicle.capacityUnit,
        fuelType: vehicle.fuelType,
        fuelConsumption: vehicle.fuelConsumption,
        mileage: vehicle.mileage,
        status: vehicle.status,
        notes: vehicle.notes || ''
      });
    } else {
      setEditMode(false);
      setCurrentVehicle(null);
      setFormData({
        vehicleNumber: '',
        make: '',
        model: '',
        year: '',
        type: 'truck',
        capacity: '',
        capacityUnit: 'kg',
        fuelType: 'diesel',
        fuelConsumption: '',
        mileage: '',
        status: 'available',
        notes: ''
      });
    }
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
      if (editMode) {
        await api.put(`/vehicles/${currentVehicle._id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      loadVehicles();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert(error.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await api.delete(`/vehicles/${id}`);
        alert('Vehicle deleted successfully!');
        loadVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert(error.response?.data?.message || 'Error deleting vehicle');
      }
    }
  };

  const handleOpenAssignDialog = (vehicle) => {
    setCurrentVehicle(vehicle);
    setSelectedDriver('');
    setOpenAssignDialog(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      alert('Please select a driver');
      return;
    }

    try {
      await api.put(`/vehicles/${currentVehicle._id}`, {
        assignedDriver: selectedDriver,
        status: 'in-use'
      });

      await api.put(`/drivers/${selectedDriver}`, {
        currentVehicle: currentVehicle._id,
        status: 'on-duty'
      });

      loadVehicles();
      loadAvailableDrivers();
      setOpenAssignDialog(false);
      alert('Driver assigned successfully!');
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert(error.response?.data?.message || 'Error assigning driver');
    }
  };

  const handleUnassignDriver = async (vehicle) => {
    if (!window.confirm('Are you sure you want to unassign the driver from this vehicle?')) {
      return;
    }

    try {
      const driverId = vehicle.assignedDriver._id;

      await api.put(`/vehicles/${vehicle._id}`, {
        assignedDriver: null,
        status: 'available'
      });

      await api.put(`/drivers/${driverId}`, {
        currentVehicle: null,
        status: 'available'
      });

      loadVehicles();
      loadAvailableDrivers();
      alert('Driver unassigned successfully!');
    } catch (error) {
      console.error('Error unassigning driver:', error);
      alert(error.response?.data?.message || 'Error unassigning driver');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      'in-use': 'primary',
      maintenance: 'warning',
      'out-of-service': 'error'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Vehicles</Typography>
        {(user?.role === 'admin' || user?.role === 'dispatcher') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Vehicle
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {vehicles.map((vehicle) => (
          <Grid item xs={12} sm={6} md={4} key={vehicle._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6">{vehicle.vehicleNumber}</Typography>
                <Chip
                  label={vehicle.status}
                  color={getStatusColor(vehicle.status)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                Type: <strong>{vehicle.type}</strong>
              </Typography>

              <Typography variant="body2">
                Capacity: <strong>{vehicle.capacity} {vehicle.capacityUnit}</strong>
              </Typography>

              <Typography variant="body2">
                Fuel: <strong>{vehicle.fuelType}</strong>
              </Typography>

              <Typography variant="body2">
                Mileage: <strong>{vehicle.mileage.toLocaleString()} km</strong>
              </Typography>

              {vehicle.assignedDriver ? (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Assigned Driver:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {vehicle.assignedDriver.user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    License: {vehicle.assignedDriver.licenseNumber}
                  </Typography>
                  {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ 
                          color: 'white', 
                          borderColor: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderColor: 'white'
                          }
                        }}
                        startIcon={<PersonRemove />}
                        onClick={() => handleUnassignDriver(vehicle)}
                      >
                        Unassign
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<PersonAdd />}
                      onClick={() => handleOpenAssignDialog(vehicle)}
                      fullWidth
                    >
                      Assign Driver
                    </Button>
                  )}
                </Box>
              )}

              {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(vehicle)}
                    title="Edit Vehicle"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(vehicle._id)}
                    title="Delete Vehicle"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Make" name="make" value={formData.make} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Model" name="model" value={formData.model} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select name="type" value={formData.type} onChange={handleChange} label="Type">
                    <MenuItem value="truck">Truck</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Capacity Unit</InputLabel>
                  <Select name="capacityUnit" value={formData.capacityUnit} onChange={handleChange} label="Capacity Unit">
                    <MenuItem value="kg">Kilograms (kg)</MenuItem>
                    <MenuItem value="tons">Tons</MenuItem>
                    <MenuItem value="cubic_meters">Cubic Meters</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select name="fuelType" value={formData.fuelType} onChange={handleChange} label="Fuel Type">
                    <MenuItem value="petrol">Petrol</MenuItem>
                    <MenuItem value="diesel">Diesel</MenuItem>
                    <MenuItem value="electric">Electric</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Fuel Consumption (L/100km)" name="fuelConsumption" type="number" value={formData.fuelConsumption} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Current Mileage (km)" name="mileage" type="number" value={formData.mileage} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="in-use">In Use</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="out-of-service">Out of Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" name="notes" multiline rows={3} value={formData.notes} onChange={handleChange} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">{editMode ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Driver to {currentVehicle?.vehicleNumber}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Driver</InputLabel>
              <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} label="Select Driver">
                {drivers.map((driver) => (
                  <MenuItem key={driver._id} value={driver._id}>
                    <Box>
                      <Typography variant="body1">{driver.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        License: {driver.licenseNumber} | Experience: {driver.experience} years | Rating: {driver.rating}/5
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {drivers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No available drivers. All drivers are currently assigned to vehicles.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignDriver} disabled={!selectedDriver}>Assign Driver</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Vehicles;