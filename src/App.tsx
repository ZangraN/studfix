import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, Paper, BottomNavigation, BottomNavigationAction, Typography, useMediaQuery } from '@mui/material';
import { theme } from './theme';
import Students from './pages/Students';
import Lessons from './pages/Lessons';
import Payments from './pages/Payments';
import Statistics from './pages/Statistics';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';

function App() {
  const [currentPage, setCurrentPage] = useState('students');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    if (isDesktop) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isDesktop]);

  const renderPage = () => {
    if (isDesktop) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h4" gutterBottom>
            Мобильная версия не поддерживается
          </Typography>
          <Typography variant="body1">
            Пожалуйста, используйте приложение на мобильном устройстве
          </Typography>
        </Box>
      );
    }

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

  const handlePageChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentPage(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        pb: isMobile ? 7 : 0
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            bgcolor: 'background.default'
          }}
        >
          {renderPage()}
        </Paper>
        {isMobile && (
          <BottomNavigation
            value={currentPage}
            onChange={handlePageChange}
            showLabels
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                p: 1
              }
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
              icon={<SchoolIcon />}
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
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App; 