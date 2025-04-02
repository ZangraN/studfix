import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../db';
import { Payment, Student, Lesson } from '../types';
import { formatDate, formatCurrency } from '../utils/format';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    lessonId: '',
    amount: '',
    date: '',
    type: 'cash' as const,
    notes: ''
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadPayments();
    loadStudents();
    loadLessons();
  }, []);

  const loadPayments = async () => {
    const allPayments = await db.payments.toArray();
    setPayments(allPayments);
  };

  const loadStudents = async () => {
    const allStudents = await db.students.toArray();
    setStudents(allStudents);
  };

  const loadLessons = async () => {
    const allLessons = await db.lessons.toArray();
    setLessons(allLessons);
  };

  const handleOpen = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        studentId: payment.studentId.toString(),
        lessonId: payment.lessonId?.toString() || '',
        amount: payment.amount.toString(),
        date: payment.date,
        type: payment.type,
        notes: payment.notes || ''
      });
    } else {
      setEditingPayment(null);
      setFormData({
        studentId: '',
        lessonId: '',
        amount: '',
        date: '',
        type: 'cash',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPayment(null);
  };

  const handleSubmit = async () => {
    const paymentData = {
      ...formData,
      studentId: Number(formData.studentId),
      lessonId: formData.lessonId ? Number(formData.lessonId) : undefined,
      amount: Number(formData.amount),
      date: formData.date,
      type: formData.type as 'cash' | 'card' | 'transfer',
      notes: formData.notes || ''
    };

    if (editingPayment) {
      await db.payments.update(editingPayment.id!, paymentData);
    } else {
      await db.payments.add(paymentData);
    }
    handleClose();
    loadPayments();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот платеж?')) {
      await db.payments.delete(id);
      loadPayments();
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Неизвестный ученик';
  };

  const getLessonInfo = (lessonId?: number) => {
    if (!lessonId) return null;
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson ? `${formatDate(lesson.date)} • ${lesson.subject}` : null;
  };

  const getPaymentTypeLabel = (type: 'cash' | 'card' | 'transfer') => {
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
    <Box sx={{ p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5" component="h1">
          Платежи
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Добавить
        </Button>
      </Box>

      <Grid container spacing={2}>
        {payments.map((payment) => (
          <Grid item xs={12} sm={6} md={4} key={payment.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="h6" component="h2">
                    {getStudentName(payment.studentId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(payment.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(payment.amount)}
                  </Typography>
                  <Chip 
                    label={getPaymentTypeLabel(payment.type)}
                    color="primary"
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  {payment.lessonId && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {getLessonInfo(payment.lessonId)}
                    </Typography>
                  )}
                  {payment.notes && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mt: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {payment.notes}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 1, pt: 0 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpen(payment)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(payment.id!)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
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
          {editingPayment ? 'Редактировать платеж' : 'Добавить платеж'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Ученик</InputLabel>
              <Select
                value={formData.studentId}
                label="Ученик"
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Занятие</InputLabel>
              <Select
                value={formData.lessonId}
                label="Занятие"
                onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
              >
                <MenuItem value="">Без привязки к занятию</MenuItem>
                {lessons
                  .filter(lesson => lesson.studentId === Number(formData.studentId))
                  .map((lesson) => (
                    <MenuItem key={lesson.id} value={lesson.id}>
                      {formatDate(lesson.date)} • {lesson.subject}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              label="Сумма"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Дата"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required>
              <InputLabel>Тип платежа</InputLabel>
              <Select
                value={formData.type}
                label="Тип платежа"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'card' | 'transfer' })}
              >
                <MenuItem value="cash">Наличные</MenuItem>
                <MenuItem value="card">Карта</MenuItem>
                <MenuItem value="transfer">Перевод</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Заметки"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose}>Отмена</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.studentId || !formData.amount || !formData.date}
          >
            {editingPayment ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 