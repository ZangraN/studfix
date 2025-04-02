import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, BottomNavigation, BottomNavigationAction, AppBar, Toolbar, IconButton, Drawer } from '@mui/material';
import { theme } from './theme';
import Students from './pages/Students';
import Lessons from './pages/Lessons';
import Payments from './pages/Payments';
import Statistics from './pages/Statistics';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventIcon from '@mui/icons-material/Event';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';

function App() {
  const [currentPage, setCurrentPage] = useState('students');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerWidth] = useState(250);

  const renderPage = () => {
    switch (currentPage) {
      case 'students':
        return <Students />;
      case 'lessons':
        return <Lessons />;
      case 'payments':
        return <Payments />;
      case 'statistics':
        return <Statistics />;
      default:
        return <Students />;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePageChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentPage(newValue);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const DrawerContent = () => (
    <div>
      {/* Drawer content implementation */}
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              StudFix
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            <DrawerContent />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            <DrawerContent />
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8
          }}
        >
          {renderPage()}
        </Box>
        <BottomNavigation
          value={currentPage}
          onChange={handlePageChange}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: { sm: 'none' },
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          <BottomNavigationAction
            label="Ученики"
            value="students"
            icon={<PeopleIcon />}
          />
          <BottomNavigationAction
            label="Занятия"
            value="lessons"
            icon={<EventIcon />}
          />
          <BottomNavigationAction
            label="Платежи"
            value="payments"
            icon={<PaymentIcon />}
          />
          <BottomNavigationAction
            label="Статистика"
            value="statistics"
            icon={<BarChartIcon />}
          />
        </BottomNavigation>
      </Box>
    </ThemeProvider>
  );
}

export default App; 