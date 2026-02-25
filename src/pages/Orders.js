import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Box, Chip, Paper, Stepper, Step, StepLabel
} from '@mui/material';
import { Add, LocalShipping } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    pickupLocation: {
      address: ''
    },
    deliveryLocation: {
      address: ''
    },
    cargoDetails: {
      description: '',
      weight: '',
      quantity: ''
    },
    priority: 'medium',
    distance: '',
    estimatedDeliveryTime: '',
    cost: '',
    notes: ''
  });
  const [assignData, setAssignData] = useState({
    vehicleId: '',
    driverId: ''
  });

  useEffect(() => {
    loadOrders();
    loadVehicles();
    loadDrivers();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles?status=available');
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadDrivers = async () => {
    try {
      const { data } = await api.get('/drivers?status=available');
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      customer: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      pickupLocation: {
        address: ''
      },
      deliveryLocation: {
        address: ''
      },
      cargoDetails: {
        description: '',
        weight: '',
        quantity: ''
      },
      priority: 'medium',
      distance: '',
      estimatedDeliveryTime: '',
      cost: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', formData);
      loadOrders();
      handleCloseDialog();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error creating order');
    }
  };

  const handleOpenAssignDialog = (order) => {
    setCurrentOrder(order);
    setAssignData({ vehicleId: '', driverId: '' });
    setOpenAssignDialog(true);
  };

  const handleAssign = async () => {
    try {
      await api.put(`/orders/${currentOrder._id}/assign`, assignData);
      loadOrders();
      loadVehicles();
      loadDrivers();
      setOpenAssignDialog(false);
      alert('Order assigned successfully!');
    } catch (error) {
      console.error('Error assigning order:', error);
      alert(error.response?.data?.message || 'Error assigning order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      loadOrders();
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.message || 'Error updating order');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      alert('Order deleted successfully!');
      loadOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(error.response?.data?.message || 'Error deleting order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      assigned: 'info',
      'in-progress': 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusSteps = () => ['pending', 'assigned', 'in-progress', 'completed'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
        {(user?.role === 'admin' || user?.role === 'dispatcher') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
          >
            Create Order
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{order.orderNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer: {order.customer?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                  />
                  <Chip
                    label={order.priority}
                    color={getPriorityColor(order.priority)}
                  />
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Pickup:</strong> {order.pickupLocation?.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Delivery:</strong> {order.deliveryLocation?.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Distance:</strong> {order.distance} km
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cost:</strong> R{order.cost}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  {order.cargoDetails && (
                    <>
                      <Typography variant="body2">
                        <strong>Cargo:</strong> {order.cargoDetails.description}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Weight:</strong> {order.cargoDetails.weight} kg
                      </Typography>
                      <Typography variant="body2">
                        <strong>Quantity:</strong> {order.cargoDetails.quantity}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>

              {order.assignedDriver && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Driver:</strong> {order.assignedDriver.user?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Vehicle:</strong> {order.assignedVehicle?.vehicleNumber}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Stepper activeStep={getStatusSteps().indexOf(order.status)}>
                  {getStatusSteps().map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {order.status === 'pending' && (user?.role === 'admin' || user?.role === 'dispatcher') && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleOpenAssignDialog(order)}
                  >
                    Assign Driver
                  </Button>
                )}

                {order.status === 'assigned' && user?.role === 'driver' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUpdateStatus(order._id, 'in-progress')}
                  >
                    Start Delivery
                  </Button>
                )}

                {order.status === 'in-progress' && user?.role === 'driver' && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleUpdateStatus(order._id, 'completed')}
                  >
                    Complete Delivery
                  </Button>
                )}

                {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Create Order Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Customer Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customer.name"
                  value={formData.customer.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Phone"
                  name="customer.phone"
                  value={formData.customer.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  name="customer.email"
                  type="email"
                  value={formData.customer.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Address"
                  name="customer.address"
                  value={formData.customer.address}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Pickup & Delivery</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pickup Address"
                  name="pickupLocation.address"
                  value={formData.pickupLocation.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  name="deliveryLocation.address"
                  value={formData.deliveryLocation.address}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Cargo Details</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cargo Description"
                  name="cargoDetails.description"
                  value={formData.cargoDetails.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="cargoDetails.weight"
                  type="number"
                  value={formData.cargoDetails.weight}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="cargoDetails.quantity"
                  type="number"
                  value={formData.cargoDetails.quantity}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Order Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Distance (km)"
                  name="distance"
                  type="number"
                  value={formData.distance}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estimated Delivery"
                  name="estimatedDeliveryTime"
                  type="datetime-local"
                  value={formData.estimatedDeliveryTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost (R)"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Create Order</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Order to Driver & Vehicle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Vehicle</InputLabel>
                <Select
                  value={assignData.vehicleId}
                  onChange={(e) => setAssignData({ ...assignData, vehicleId: e.target.value })}
                  label="Select Vehicle"
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Select Driver</InputLabel>
                <Select
                  value={assignData.driverId}
                  onChange={(e) => setAssignData({ ...assignData, driverId: e.target.value })}
                  label="Select Driver"
                >
                  {drivers.map((driver) => (
                    <MenuItem key={driver._id} value={driver._id}>
                      {driver.user?.name} - License: {driver.licenseNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAssign}
            disabled={!assignData.vehicleId || !assignData.driverId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Orders;