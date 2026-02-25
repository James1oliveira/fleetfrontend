import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Box, Chip, Paper, IconButton
} from '@mui/material';
import { Add, Edit, Build, Delete } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Maintenance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    vehicle: '',
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    description: '',
    scheduledDate: '',
    cost: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
    loadVehicles();
  }, []);

  const loadRecords = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setRecords(data);
    } catch (error) {
      console.error('Error loading maintenance records:', error);
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

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditMode(true);
      setCurrentRecord(record);
      setFormData({
        vehicle: record.vehicle._id,
        type: record.type,
        status: record.status,
        priority: record.priority,
        description: record.description,
        scheduledDate: record.scheduledDate ? record.scheduledDate.split('T')[0] : '',
        cost: record.cost,
        notes: record.notes || ''
      });
    } else {
      setEditMode(false);
      setCurrentRecord(null);
      setFormData({
        vehicle: '',
        type: 'preventive',
        status: 'scheduled',
        priority: 'medium',
        description: '',
        scheduledDate: '',
        cost: '',
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
        await api.put(`/maintenance/${currentRecord._id}`, formData);
      } else {
        await api.post('/maintenance', formData);
      }
      loadRecords();
      handleCloseDialog();
      alert('Maintenance record saved successfully!');
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      alert(error.response?.data?.message || 'Error saving maintenance record');
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/maintenance/${recordId}`);
      alert('Maintenance record deleted successfully!');
      loadRecords();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      alert(error.response?.data?.message || 'Error deleting record');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'info',
      'in-progress': 'warning',
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Maintenance Schedule</Typography>
        {(user?.role === 'admin' || user?.role === 'dispatcher') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Schedule Maintenance
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Build color="primary" />
                <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip
                    label={record.status}
                    color={getStatusColor(record.status)}
                    size="small"
                  />
                  <Chip
                    label={record.priority}
                    color={getPriorityColor(record.priority)}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                {record.type}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Vehicle: {record.vehicle?.vehicleNumber}
              </Typography>

              <Typography variant="body2" gutterBottom>
                {record.vehicle?.make} {record.vehicle?.model}
              </Typography>

              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Scheduled:</strong> {formatDate(record.scheduledDate)}
              </Typography>

              {record.completedDate && (
                <Typography variant="body2">
                  <strong>Completed:</strong> {formatDate(record.completedDate)}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mt: 1 }}>
                {record.description}
              </Typography>

              {record.cost > 0 && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                  Cost: R{record.cost.toLocaleString()}
                </Typography>
              )}

              {(user?.role === 'admin' || user?.role === 'dispatcher') && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(record)}
                    title="Edit Maintenance"
                  >
                    <Edit />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(record._id)}
                    title="Delete Maintenance"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Update Maintenance' : 'Schedule Maintenance'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    label="Vehicle"
                  >
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
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="preventive">Preventive</MenuItem>
                    <MenuItem value="corrective">Corrective</MenuItem>
                    <MenuItem value="inspection">Inspection</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                  </Select>
                </FormControl>
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

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Scheduled Date"
                  name="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cost (R)"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleChange}
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
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Schedule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Maintenance;