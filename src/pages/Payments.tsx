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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { db } from '../db';
import { Payment, Student, Lesson } from '../types';
import { formatDate, formatCurrency } from '../utils/format';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({
    date: new Date(),
    amount: 0,
    type: 'cash',
    studentId: '',
    lessonId: '',
    description: '',
  });

  useEffect(() => {
    loadPayments();
    loadStudents();
    loadLessons();
  }, []);

  const loadPayments = async () => {
    const data = await db.payments.toArray();
    setPayments(data);
  };

  const loadStudents = async () => {
    const data = await db.students.toArray();
    setStudents(data);
  };

  const loadLessons = async () => {
    const data = await db.lessons.toArray();
    setLessons(data);
  };

  const handleOpen = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData(payment);
    } else {
      setEditingPayment(null);
      setFormData({
        date: new Date(),
        amount: 0,
        type: 'cash',
        studentId: '',
        lessonId: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPayment(null);
  };

  const handleSubmit = async () => {
    if (editingPayment) {
      await db.payments.update(editingPayment.id, formData);
    } else {
      await db.payments.add(formData as Payment);
    }
    handleClose();
    loadPayments();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот платеж?')) {
      await db.payments.delete(id);
      loadPayments();
    }
  };

  const handleStudentChange = (studentId: string) => {
    setFormData({ ...formData, studentId, lessonId: '' });
  };

  const handleLessonChange = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (lesson) {
      setFormData({ ...formData, lessonId, amount: lesson.cost });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Платежи</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить платеж
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Ученик</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Занятие</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => {
              const student = students.find(s => s.id === payment.studentId);
              const lesson = lessons.find(l => l.id === payment.lessonId);
              return (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    {student ? `${student.firstName} ${student.lastName}` : 'Неизвестно'}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    {payment.type === 'cash' ? 'Наличные' :
                     payment.type === 'card' ? 'Карта' : 'Перевод'}
                  </TableCell>
                  <TableCell>
                    {lesson ? formatDate(lesson.date) : '-'}
                  </TableCell>
                  <TableCell>{payment.description || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(payment)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(payment.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingPayment ? 'Редактировать платеж' : 'Добавить платеж'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Дата"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Ученик</InputLabel>
                <Select
                  value={formData.studentId}
                  label="Ученик"
                  onChange={(e) => handleStudentChange(e.target.value)}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {formData.studentId && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Занятие</InputLabel>
                  <Select
                    value={formData.lessonId}
                    label="Занятие"
                    onChange={(e) => handleLessonChange(e.target.value)}
                  >
                    <MenuItem value="">Без привязки к занятию</MenuItem>
                    {lessons
                      .filter(l => l.studentId === formData.studentId)
                      .map((lesson) => (
                        <MenuItem key={lesson.id} value={lesson.id}>
                          {formatDate(lesson.date)} - {formatCurrency(lesson.cost)}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Сумма"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Тип</InputLabel>
                <Select
                  value={formData.type}
                  label="Тип"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'cash' | 'card' | 'transfer' })}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPayment ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 