import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { db } from '../db';
import { Student, Lesson, Payment } from '../types';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const theme = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allStudents, allLessons, allPayments] = await Promise.all([
      db.students.toArray(),
      db.lessons.toArray(),
      db.payments.toArray()
    ]);

    setStudents(allStudents);
    setLessons(allLessons);
    setPayments(allPayments);
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const monthlyLessons = lessons.filter(lesson => 
    new Date(lesson.date) >= startOfMonth && lesson.status === 'completed'
  );
  const weeklyLessons = lessons.filter(lesson => 
    new Date(lesson.date) >= startOfWeek && lesson.status === 'completed'
  );
  const monthlyPayments = payments.filter(payment => 
    new Date(payment.date) >= startOfMonth
  );

  const totalMonthlyIncome = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Панель управления
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Всего учеников
              </Typography>
              <Typography variant="h4" color="primary">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Занятий за месяц
              </Typography>
              <Typography variant="h4" color="primary">
                {monthlyLessons.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Доход за месяц
              </Typography>
              <Typography variant="h4" color="primary">
                {formatCurrency(totalMonthlyIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Ближайшие занятия
            </Typography>
            <Stack spacing={1}>
              {lessons
                .filter(lesson => new Date(lesson.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(lesson => {
                  const student = students.find(s => s.id === lesson.studentId);
                  return (
                    <Box key={lesson.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>
                        {student?.name || 'Неизвестный ученик'} • {lesson.subject}
                      </Typography>
                      <Typography color="text.secondary">
                        {new Date(lesson.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  );
                })}
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Последние платежи
            </Typography>
            <Stack spacing={1}>
              {payments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  return (
                    <Box key={payment.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>
                        {student?.name || 'Неизвестный ученик'}
                      </Typography>
                      <Typography color="primary">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </Box>
                  );
                })}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 