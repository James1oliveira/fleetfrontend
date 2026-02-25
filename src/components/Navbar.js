import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem 
} from '@mui/material';
import { 
  Logout, Dashboard, DirectionsCar, Person, Assignment, 
  Build, AttachMoney, Chat, Menu as MenuIcon 
} from '@mui/icons-material';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/vehicles', label: 'Vehicles', icon: <DirectionsCar /> },
    { path: '/drivers', label: 'Drivers', icon: <Person /> },
    { path: '/orders', label: 'Orders', icon: <Assignment /> },
    { path: '/maintenance', label: 'Maintenance', icon: <Build /> },
    { path: '/costs', label: 'Costs', icon: <AttachMoney /> },
    { path: '/communication', label: 'Chat', icon: <Chat /> }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Fleet Management
        </Typography>
        
        {user && (
          <>
            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Mobile Navigation */}
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Button color="inherit" onClick={handleMenu}>
                <MenuIcon />
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      handleClose();
                    }}
                  >
                    {item.icon}
                    <Typography sx={{ ml: 2 }}>{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2">
                {user.name} ({user.role})
              </Typography>
              <Button 
                color="inherit" 
                onClick={handleLogout}
                startIcon={<Logout />}
              >
                Logout
              </Button>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;