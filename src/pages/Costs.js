import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Box, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import { Add, AttachMoney, Delete } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Costs() {
  const { user } = useAuth();
  const [costs, setCosts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [formData, setFormData] = useState({
    vehicle: '',
    type: 'fuel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    loadCosts();
    loadVehicles();
  }, []);

  useEffect(() => {
    const total = costs.reduce((sum, cost) => sum + cost.amount, 0);
    setTotalCost(total);
  }, [costs]);

  const loadCosts = async () => {
    try {
      const { data } = await api.get('/costs');
      setCosts(data);
    } catch (error) {
      console.error('Error loading costs:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      vehicle: '',
      type: 'fuel',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      quantity: '',
      unitPrice: '',
      paymentMethod: 'cash',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Auto-calculate amount if quantity and unitPrice are provided
    if (name === 'quantity' || name === 'unitPrice') {
      const qty = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
      const price = name === 'unitPrice' ? parseFloat(value) : parseFloat(formData.unitPrice);
      if (!isNaN(qty) && !isNaN(price)) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          amount: (qty * price).toFixed(2)
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/costs', formData);
      loadCosts();
      handleCloseDialog();
      alert('Cost record added successfully!');
    } catch (error) {
      console.error('Error creating cost record:', error);
      alert(error.response?.data?.message || 'Error creating cost record');
    }
  };

  const handleDelete = async (costId) => {
    if (!window.confirm('Are you sure you want to delete this cost record? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/costs/${costId}`);
      alert('Cost record deleted successfully!');
      loadCosts();
    } catch (error) {
      console.error('Error deleting cost:', error);
      alert(error.response?.data?.message || 'Error deleting cost');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCostsByType = () => {
    const grouped = costs.reduce((acc, cost) => {
      if (!acc[cost.type]) {
        acc[cost.type] = 0;
      }
      acc[cost.type] += cost.amount;
      return acc;
    }, {});
    return grouped;
  };

  const costsByType = getCostsByType();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Cost Tracking</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Add Cost
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'error.main', color: 'white' }}>
            <Typography variant="h6">Total Costs</Typography>
            <Typography variant="h3">R{totalCost.toLocaleString()}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Cost Breakdown</Typography>
            <Grid container spacing={2}>
              {Object.entries(costsByType).map(([type, amount]) => (
                <Grid item xs={6} sm={4} key={type}>
                  <Typography variant="body2" color="text.secondary">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Typography>
                  <Typography variant="h6">
                    R{amount.toLocaleString()}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Costs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Payment</TableCell>
                {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                  <TableCell align="center">Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {costs.map((cost) => (
                <TableRow key={cost._id}>
                  <TableCell>{formatDate(cost.date)}</TableCell>
                  <TableCell>{cost.vehicle?.vehicleNumber}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {cost.type}
                    </Typography>
                  </TableCell>
                  <TableCell>{cost.description}</TableCell>
                  <TableCell align="right">{cost.quantity || '-'}</TableCell>
                  <TableCell align="right">
                    {cost.unitPrice ? `R${cost.unitPrice.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    <strong>R{cost.amount.toLocaleString()}</strong>
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {cost.paymentMethod}
                  </TableCell>
                  
                  {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cost._id)}
                        title="Delete Cost"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Cost Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Cost Record</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Vehicle</InputLabel>
                  <Select name="vehicle" value={formData.vehicle} onChange={handleChange} label="Vehicle">
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select name="type" value={formData.type} onChange={handleChange} label="Type">
                    <MenuItem value="fuel">Fuel</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="insurance">Insurance</MenuItem>
                    <MenuItem value="tax">Tax</MenuItem>
                    <MenuItem value="toll">Toll</MenuItem>
                    <MenuItem value="parking">Parking</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Date" name="date" type="date" value={formData.date} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="E.g., Full tank - diesel" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="E.g., 65 liters" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Unit Price (R)" name="unitPrice" type="number" value={formData.unitPrice} onChange={handleChange} placeholder="E.g., 22.50" />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Total Amount (R)" name="amount" type="number" value={formData.amount} onChange={handleChange} required helperText="Auto-calculated if quantity and unit price provided" />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Payment Method</InputLabel>
                  <Select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} label="Payment Method">
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Notes" name="notes" multiline rows={2} value={formData.notes} onChange={handleChange} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">Add Cost</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Costs;