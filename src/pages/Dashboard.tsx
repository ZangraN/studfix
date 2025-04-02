import { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { db } from '../db';
import { Statistics } from '../types';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState<Statistics>({
    totalIncome: 0,
    totalStudents: 0,
    totalLessons: 0,
    totalPayments: 0,
    incomeByPeriod: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      const students = await db.students.count();
      const lessons = await db.lessons.count();
      const payments = await db.payments.count();
      
      const totalIncome = await db.payments.toArray()
        .then(payments => payments.reduce((sum, payment) => sum + payment.amount, 0));

      // Получаем доход по дням за последние 7 дней
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const incomeByPeriod = await db.payments
        .where('date')
        .between(lastWeek, today)
        .toArray()
        .then(payments => {
          const dailyIncome = new Map<string, number>();
          payments.forEach(payment => {
            const date = payment.date.toISOString().split('T')[0];
            dailyIncome.set(date, (dailyIncome.get(date) || 0) + payment.amount);
          });
          return Array.from(dailyIncome.entries()).map(([date, amount]) => ({
            date,
            amount,
          }));
        });

      setStats({
        totalIncome,
        totalStudents: students,
        totalLessons: lessons,
        totalPayments: payments,
        incomeByPeriod,
      });
    };

    loadStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Общий доход
            </Typography>
            <Typography variant="h4">
              {formatCurrency(stats.totalIncome)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Всего учеников
            </Typography>
            <Typography variant="h4">
              {stats.totalStudents}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Всего занятий
            </Typography>
            <Typography variant="h4">
              {stats.totalLessons}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Всего платежей
            </Typography>
            <Typography variant="h4">
              {stats.totalPayments}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 