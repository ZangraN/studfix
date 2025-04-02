import { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        pb: 7 // Отступ для нижней навигации
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
        <BottomNavigation
          value={currentPage}
          onChange={(event, newValue) => setCurrentPage(newValue)}
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
      </Box>
    </ThemeProvider>
  );
}

export default App; 