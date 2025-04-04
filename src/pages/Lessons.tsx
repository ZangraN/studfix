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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { theme } from '../theme';
import { Lesson, Student } from '../types';

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<Lesson>({
    studentId: 0,
    date: '',
    duration: '',
    topic: '',
    understanding: 'satisfactory',
    homework: '',
    assignments: '',
    status: 'completed',
    cost: 0,
    notes: ''
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadLessons();
    loadStudents();
  }, []);

  const loadLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error loading lessons:', error);
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

  const handleOpen = (lesson?: Lesson) => {
    if (lesson) {
      setCurrentLesson(lesson);
      setFormData(lesson);
    } else {
      setCurrentLesson(null);
      setFormData({
        studentId: 0,
        date: '',
        duration: '',
        topic: '',
        understanding: 'satisfactory',
        homework: '',
        assignments: '',
        status: 'completed',
        cost: 0,
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentLesson(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentLesson) {
        await fetch(`/api/lessons/${currentLesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      handleClose();
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это занятие?')) {
      try {
        await fetch(`/api/lessons/${id}`, {
          method: 'DELETE',
        });
        loadLessons();
      } catch (error) {
        console.error('Error deleting lesson:', error);
      }
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Неизвестный ученик';
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Занятия</Typography>
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
        {lessons.map((lesson) => (
          <Grid item xs={12} key={lesson.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">
                      {getStudentName(lesson.studentId)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lesson.date}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(lesson)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(lesson.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      label={lesson.duration}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={lesson.status === 'completed' ? 'Завершено' : 'Отменено'}
                      size="small"
                      color={lesson.status === 'completed' ? 'success' : 'error'}
                      variant="outlined"
                    />
                    <Chip
                      label={lesson.understanding}
                      size="small"
                      color={
                        lesson.understanding === 'excellent' ? 'success' :
                        lesson.understanding === 'good' ? 'primary' :
                        lesson.understanding === 'satisfactory' ? 'warning' : 'error'
                      }
                      variant="outlined"
                    />
                  </Stack>

                  <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Тема: {lesson.topic}
                    </Typography>
                    {lesson.homework && (
                      <Typography variant="body2">
                        ДЗ: {lesson.homework}
                      </Typography>
                    )}
                    {lesson.assignments && (
                      <Typography variant="body2">
                        Задания: {lesson.assignments}
                      </Typography>
                    )}
                    {lesson.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {lesson.notes}
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
          {currentLesson ? 'Редактировать занятие' : 'Добавить занятие'}
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
              <TextField
                fullWidth
                label="Дата и время"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Длительность"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Тема"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Усвоение</InputLabel>
                <Select
                  value={formData.understanding}
                  label="Усвоение"
                  onChange={(e) => setFormData({ ...formData, understanding: e.target.value as any })}
                  required
                >
                  <MenuItem value="excellent">Отлично</MenuItem>
                  <MenuItem value="good">Хорошо</MenuItem>
                  <MenuItem value="satisfactory">Удовлетворительно</MenuItem>
                  <MenuItem value="poor">Плохо</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Домашнее задание"
                multiline
                rows={2}
                value={formData.homework}
                onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Задания"
                multiline
                rows={2}
                value={formData.assignments}
                onChange={(e) => setFormData({ ...formData, assignments: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  label="Статус"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                >
                  <MenuItem value="completed">Завершено</MenuItem>
                  <MenuItem value="cancelled">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Стоимость"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
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
            {currentLesson ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Lessons; 