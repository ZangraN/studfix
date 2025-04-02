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
import { Lesson, Student } from '../types';
import { formatDate, formatTime, formatDuration, formatCurrency, calculateLessonCost } from '../utils/format';

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Partial<Lesson>>({
    date: new Date(),
    duration: 60,
    status: 'completed',
    studentId: '',
    cost: 0,
  });

  useEffect(() => {
    loadLessons();
    loadStudents();
  }, []);

  const loadLessons = async () => {
    const data = await db.lessons.toArray();
    setLessons(data);
  };

  const loadStudents = async () => {
    const data = await db.students.toArray();
    setStudents(data);
  };

  const handleOpen = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData(lesson);
    } else {
      setEditingLesson(null);
      setFormData({
        date: new Date(),
        duration: 60,
        status: 'completed',
        studentId: '',
        cost: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLesson(null);
  };

  const handleSubmit = async () => {
    if (editingLesson) {
      await db.lessons.update(editingLesson.id, formData);
    } else {
      await db.lessons.add(formData as Lesson);
    }
    handleClose();
    loadLessons();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это занятие?')) {
      await db.lessons.delete(id);
      loadLessons();
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const cost = calculateLessonCost(student.rate, formData.duration || 60);
      setFormData({ ...formData, studentId, cost });
    }
  };

  const handleDurationChange = (duration: number) => {
    const student = students.find(s => s.id === formData.studentId);
    if (student) {
      const cost = calculateLessonCost(student.rate, duration);
      setFormData({ ...formData, duration, cost });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Занятия</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить занятие
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Время</TableCell>
              <TableCell>Ученик</TableCell>
              <TableCell>Длительность</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Стоимость</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((lesson) => {
              const student = students.find(s => s.id === lesson.studentId);
              return (
                <TableRow key={lesson.id}>
                  <TableCell>{formatDate(lesson.date)}</TableCell>
                  <TableCell>{formatTime(lesson.date)}</TableCell>
                  <TableCell>
                    {student ? `${student.firstName} ${student.lastName}` : 'Неизвестно'}
                  </TableCell>
                  <TableCell>{formatDuration(lesson.duration)}</TableCell>
                  <TableCell>
                    {lesson.status === 'completed' ? 'Проведено' : 'Отменено'}
                  </TableCell>
                  <TableCell>{formatCurrency(lesson.cost)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(lesson)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(lesson.id)}>
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
          {editingLesson ? 'Редактировать занятие' : 'Добавить занятие'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Дата и время"
                type="datetime-local"
                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Длительность (мин)"
                type="number"
                value={formData.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'completed' | 'cancelled' })}
                >
                  <MenuItem value="completed">Проведено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Стоимость"
                value={formData.cost}
                disabled
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLesson ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 