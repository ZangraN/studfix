import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import { theme } from '../theme';
import { Student, Lesson, Payment } from '../types';
import { School as SchoolIcon, Payment as PaymentIcon } from '@mui/icons-material';

const Dashboard: React.FC = () => {
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
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const getUpcomingLessons = () => {
    const today = new Date();
    return lessons
      .filter(lesson => {
        const lessonDate = new Date(lesson.date);
        return lessonDate > today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  };

  const getRecentPayments = () => {
    return payments
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Неизвестный ученик';
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Наличные';
      case 'card':
        return 'Карта';
      case 'transfer':
        return 'Перевод';
      default:
        return type;
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Typography variant="h5" gutterBottom>
        Главная
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Всего учеников
              </Typography>
              <Typography variant="h4">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Всего занятий
              </Typography>
              <Typography variant="h4">
                {lessons.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Общий доход
              </Typography>
              <Typography variant="h4">
                {payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString('ru-RU')} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ближайшие занятия
            </Typography>
            <List>
              {getUpcomingLessons().map((lesson) => (
                <ListItem key={lesson.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getStudentName(lesson.studentId)}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {new Date(lesson.date).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={lesson.topic}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={lesson.duration}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Последние платежи
            </Typography>
            <List>
              {getRecentPayments().map((payment) => (
                <ListItem key={payment.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <PaymentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getStudentName(payment.studentId)}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {new Date(payment.date).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={`${payment.amount.toLocaleString('ru-RU')} ₽`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={getPaymentTypeLabel(payment.type)}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 