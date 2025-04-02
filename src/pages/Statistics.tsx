import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { db } from '../db';
import { Payment, Lesson } from '../types';
import { formatCurrency } from '../utils/format';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Period = 'week' | 'month' | 'year';

export default function Statistics() {
  const [period, setPeriod] = useState<Period>('month');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [averageLessonCost, setAverageLessonCost] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const allPayments = await db.payments.toArray();
    const allLessons = await db.lessons.toArray();

    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredPayments = allPayments.filter(payment => 
      new Date(payment.date) >= startDate
    );
    const filteredLessons = allLessons.filter(lesson => 
      new Date(lesson.date) >= startDate && lesson.status === 'completed'
    );

    setPayments(filteredPayments);
    setLessons(filteredLessons);

    const income = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalIncome(income);
    setTotalLessons(filteredLessons.length);
    setAverageLessonCost(filteredLessons.length > 0 ? income / filteredLessons.length : 0);
  };

  const generateChartData = () => {
    const labels: string[] = [];
    const data: number[] = [];
    const now = new Date();
    let currentDate = new Date();

    switch (period) {
      case 'week':
        for (let i = 6; i >= 0; i--) {
          currentDate = new Date(now);
          currentDate.setDate(now.getDate() - i);
          labels.push(currentDate.toLocaleDateString('ru-RU', { weekday: 'short' }));
          const dayPayments = payments.filter(p => 
            new Date(p.date).toDateString() === currentDate.toDateString()
          );
          data.push(dayPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        break;
      case 'month':
        for (let i = 29; i >= 0; i--) {
          currentDate = new Date(now);
          currentDate.setDate(now.getDate() - i);
          labels.push(currentDate.toLocaleDateString('ru-RU', { day: 'numeric' }));
          const dayPayments = payments.filter(p => 
            new Date(p.date).toDateString() === currentDate.toDateString()
          );
          data.push(dayPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        break;
      case 'year':
        for (let i = 11; i >= 0; i--) {
          currentDate = new Date(now);
          currentDate.setMonth(now.getMonth() - i);
          labels.push(currentDate.toLocaleDateString('ru-RU', { month: 'short' }));
          const monthPayments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentDate.getMonth() &&
                   paymentDate.getFullYear() === currentDate.getFullYear();
          });
          data.push(monthPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        break;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Доход',
          data,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main + '20',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = `Статистика за ${period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'год'}`;
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(12);

    const tableData = [
      ['Показатель', 'Значение'],
      ['Общий доход', formatCurrency(totalIncome)],
      ['Количество занятий', totalLessons.toString()],
      ['Средняя стоимость занятия', formatCurrency(averageLessonCost)]
    ];

    (doc as any).autoTable({
      startY: 25,
      head: [['Показатель', 'Значение']],
      body: tableData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 10 }
    });

    doc.save(`statistics_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" component="h1">
          Статистика
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              label="Период"
              onChange={(e) => setPeriod(e.target.value as Period)}
            >
              <MenuItem value="week">Неделя</MenuItem>
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ borderRadius: 2 }}
          >
            Экспорт PDF
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Общий доход
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Количество занятий
              </Typography>
              <Typography variant="h4" color="primary">
                {totalLessons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Средняя стоимость занятия
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(averageLessonCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Динамика дохода
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={generateChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => formatCurrency(value as number)
                      }
                    }
                  }
                }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 