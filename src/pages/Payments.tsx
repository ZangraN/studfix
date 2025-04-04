import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Chip,
  Stack,
  useMediaQuery,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { theme } from '../theme';
import { Payment, Student, Lesson } from '../types';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Payment>({
    studentId: 0,
    lessonId: 0,
    amount: 0,
    date: '',
    type: 'cash',
    description: '',
    notes: ''
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadPayments();
    loadStudents();
    loadLessons();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const handleOpen = (payment?: Payment) => {
    if (payment) {
      setCurrentPayment(payment);
      setFormData(payment);
    } else {
      setCurrentPayment(null);
      setFormData({
        studentId: 0,
        lessonId: 0,
        amount: 0,
        date: '',
        type: 'cash',
        description: '',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentPayment(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentPayment) {
        await fetch(`/api/payments/${currentPayment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      handleClose();
      loadPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот платеж?')) {
      try {
        await fetch(`/api/payments/${id}`, {
          method: 'DELETE',
        });
        loadPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Неизвестный ученик';
  };

  const getLessonDate = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? lesson.date : 'Неизвестное занятие';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Платежи</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          size={isMobile ? 'small' : 'medium'}
        >
          Добавить
        </Button>
      </Box>

      <Grid container spacing={2}>
        {payments.map((payment) => (
          <Grid item xs={12} key={payment.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">
                      {getStudentName(payment.studentId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {payment.date}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(payment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(payment.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      icon={<PaymentIcon />}
                      label={`${payment.amount} ₽`}
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

                  <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                    {payment.lessonId && (
                      <Typography variant="body2">
                        Занятие: {getLessonDate(payment.lessonId)}
                      </Typography>
                    )}
                    {payment.description && (
                      <Typography variant="body2">
                        Описание: {payment.description}
                      </Typography>
                    )}
                    {payment.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {payment.notes}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentPayment ? 'Редактировать платеж' : 'Добавить платеж'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ученик</InputLabel>
                <Select
                  value={formData.studentId}
                  label="Ученик"
                  onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Занятие</InputLabel>
                <Select
                  value={formData.lessonId}
                  label="Занятие"
                  onChange={(e) => setFormData({ ...formData, lessonId: Number(e.target.value) })}
                >
                  <MenuItem value={0}>Не привязано к занятию</MenuItem>
                  {lessons
                    .filter(lesson => lesson.studentId === formData.studentId)
                    .map((lesson) => (
                      <MenuItem key={lesson.id} value={lesson.id}>
                        {lesson.date} - {lesson.topic}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Сумма"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Дата"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Тип оплаты</InputLabel>
                <Select
                  value={formData.type}
                  label="Тип оплаты"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                >
                  <MenuItem value="cash">Наличные</MenuItem>
                  <MenuItem value="card">Карта</MenuItem>
                  <MenuItem value="transfer">Перевод</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Заметки"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentPayment ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments; 