import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useMediaQuery,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { theme } from '../theme';
import { Student, Lesson, Payment } from '../types';

interface StudentStats {
  name: string;
  totalLessons: number;
  completedLessons: number;
  cancelledLessons: number;
  totalPaid: number;
  averageCost: number;
}

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState({
    totalIncome: 0,
    totalLessons: 0,
    averageLessonCost: 0
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, lessonsRes, paymentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/lessons'),
        fetch('/api/payments')
      ]);

      const studentsData = await studentsRes.json();
      const lessonsData = await lessonsRes.json();
      const paymentsData = await paymentsRes.json();

      setStudents(studentsData);
      setLessons(lessonsData);
      setPayments(paymentsData);

      const totalIncome = paymentsData.reduce((sum: number, payment: Payment) => sum + payment.amount, 0);
      const totalLessons = lessonsData.length;
      const averageLessonCost = totalLessons > 0 ? totalIncome / totalLessons : 0;

      setStatistics({
        totalIncome,
        totalLessons,
        averageLessonCost
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const getStudentStats = (): StudentStats[] => {
    return students.map(student => {
      const studentLessons = lessons.filter(lesson => lesson.studentId === student.id);
      const studentPayments = payments.filter(payment => payment.studentId === student.id);
      const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const completedLessons = studentLessons.filter(lesson => lesson.status === 'completed').length;
      const cancelledLessons = studentLessons.filter(lesson => lesson.status === 'cancelled').length;

      return {
        name: `${student.firstName} ${student.lastName}`,
        totalLessons: studentLessons.length,
        completedLessons,
        cancelledLessons,
        totalPaid,
        averageCost: completedLessons > 0 ? totalPaid / completedLessons : 0
      };
    });
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Typography variant="h5" gutterBottom>
        Статистика
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Общий доход
              </Typography>
              <Typography variant="h4">
                {statistics.totalIncome.toLocaleString('ru-RU')} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Всего занятий
              </Typography>
              <Typography variant="h4">
                {statistics.totalLessons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Средняя стоимость
              </Typography>
              <Typography variant="h4">
                {statistics.averageLessonCost.toLocaleString('ru-RU')} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ overflow: 'auto' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ученик</TableCell>
                <TableCell align="right">Всего занятий</TableCell>
                <TableCell align="right">Завершено</TableCell>
                <TableCell align="right">Отменено</TableCell>
                <TableCell align="right">Оплачено</TableCell>
                <TableCell align="right">Средняя стоимость</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getStudentStats().map((stats) => (
                <TableRow key={stats.name}>
                  <TableCell>{stats.name}</TableCell>
                  <TableCell align="right">{stats.totalLessons}</TableCell>
                  <TableCell align="right">{stats.completedLessons}</TableCell>
                  <TableCell align="right">{stats.cancelledLessons}</TableCell>
                  <TableCell align="right">
                    {stats.totalPaid.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell align="right">
                    {stats.averageCost.toLocaleString('ru-RU')} ₽
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Statistics; 