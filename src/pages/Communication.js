import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Paper, List, ListItem,
  ListItemText, TextField, Button, Avatar, Divider, Chip, IconButton
} from '@mui/material';
import { Send, Person, Delete } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

function Communication() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadUsers();

    const socket = getSocket();
    if (socket) {
      socket.on('newMessage', (message) => {
        if (selectedUser && 
            (message.sender._id === selectedUser._id || message.recipient === user._id)) {
          setMessages(prev => [...prev, message]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('newMessage');
      }
    };
  }, [selectedUser, user._id]);

  const loadUsers = async () => {
    try {
      const [driversRes, authRes] = await Promise.all([
        api.get('/drivers'),
        api.get('/auth/me')
      ]);

      const allUsers = driversRes.data
        .map(driver => driver.user)
        .filter(u => u._id !== user._id);

      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const { data } = await api.get(`/messages/conversation/${userId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    loadConversation(selectedUser._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await api.post('/messages', {
        recipient: selectedUser._id,
        message: newMessage,
        type: 'direct'
      });

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(messages.filter(m => m._id !== messageId));
      alert('Message deleted successfully!');
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(error.response?.data?.message || 'Error deleting message');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Communication
      </Typography>

      <Grid container spacing={2} sx={{ height: '70vh' }}>
        {/* Users List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">Contacts</Typography>
            </Box>
            <List>
              {users.map((u) => (
                <ListItem
                  key={u._id}
                  button
                  selected={selectedUser?._id === u._id}
                  onClick={() => handleUserSelect(u)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'action.selected'
                    }
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    <Person />
                  </Avatar>
                  <ListItemText
                    primary={u.name}
                    secondary={u.email}
                  />
                  <Chip
                    label={u.role}
                    size="small"
                    color={u.role === 'driver' ? 'primary' : 'secondary'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="caption">{selectedUser.role}</Typography>
                </Box>

                <Divider />

                {/* Messages */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: msg.sender._id === user._id ? 'primary.light' : 'grey.200',
                          color: msg.sender._id === user._id ? 'white' : 'black',
                          borderRadius: 2,
                          p: 1.5,
                          position: 'relative'
                        }}
                      >
                        <Typography variant="body2">{msg.message}</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            mt: 0.5,
                            display: 'block'
                          }}
                        >
                          {formatTime(msg.createdAt)}
                        </Typography>
                        
                        {/* Delete button for own messages */}
                        {msg.sender._id === user._id && (
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: 'inherit',
                              opacity: 0.7,
                              '&:hover': { opacity: 1 }
                            }}
                            onClick={() => handleDeleteMessage(msg._id)}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider />

                {/* Message Input */}
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    endIcon={<Send />}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select a contact to start chatting
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Communication;