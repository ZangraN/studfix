import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { db } from '../db';
import { Payment, Lesson } from '../types';
import { formatCurrency } from '../utils/format';
import { jsPDF } from 'jspdf';
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

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const [paymentsData, lessonsData] = await Promise.all([
      db.payments.where('date').above(startDate).toArray(),
      db.lessons.where('date').above(startDate).toArray(),
    ]);

    setPayments(paymentsData);
    setLessons(lessonsData);

    const income = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalIncome(income);
    setTotalLessons(lessonsData.length);
    setAverageLessonCost(lessonsData.length > 0 ? income / lessonsData.length : 0);
  };

  const generateChartData = () => {
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
          const dayPayments = payments.filter(
            p => p.date.toDateString() === date.toDateString()
          );
          data.push(dayPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        break;
      case 'month':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric' }));
          const dayPayments = payments.filter(
            p => p.date.toDateString() === date.toDateString()
          );
          data.push(dayPayments.reduce((sum, p) => sum + p.amount, 0));
        }
        break;
      case 'year':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('ru-RU', { month: 'short' }));
          const monthPayments = payments.filter(
            p => p.date.getMonth() === date.getMonth() &&
                p.date.getFullYear() === date.getFullYear()
          );
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
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Статистика', 14, 15);

    const tableData = [
      ['Период', period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'],
      ['Общий доход', formatCurrency(totalIncome)],
      ['Всего занятий', totalLessons.toString()],
      ['Средняя стоимость занятия', formatCurrency(averageLessonCost)],
    ];

    (doc as any).autoTable({
      startY: 20,
      head: [['Параметр', 'Значение']],
      body: tableData,
    });

    doc.save('statistics.pdf');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Статистика</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
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
          <Button variant="contained" onClick={handleExportPDF}>
            Экспорт PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Общий доход
            </Typography>
            <Typography variant="h4">
              {formatCurrency(totalIncome)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Всего занятий
            </Typography>
            <Typography variant="h4">
              {totalLessons}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Средняя стоимость занятия
            </Typography>
            <Typography variant="h4">
              {formatCurrency(averageLessonCost)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              График дохода
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line
                data={generateChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Динамика дохода',
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 