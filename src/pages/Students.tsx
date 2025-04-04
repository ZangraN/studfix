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
  Divider,
  Paper
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { theme } from '../theme';
import { Student } from '../types';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Student>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    tariff: '',
    schedule: {
      day: '',
      time: ''
    },
    notes: ''
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
      }
      const data = await response.json();
      console.log('Загруженные студенты:', data);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Ошибка при загрузке списка учеников');
    }
  };

  const handleOpen = (student?: Student) => {
    if (student) {
      setCurrentStudent(student);
      setFormData(student);
    } else {
      setCurrentStudent(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        tariff: '',
        schedule: {
          day: '',
          time: ''
        },
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentStudent(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        alert('Пожалуйста, заполните обязательные поля');
        return;
      }

      console.log('Отправляемые данные:', formData);

      if (currentStudent) {
        const response = await fetch(`/api/students/${currentStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ошибка при обновлении');
        }
      } else {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ошибка при добавлении');
        }
      }
      handleClose();
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Ошибка при сохранении. Пожалуйста, попробуйте снова.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого ученика?')) {
      try {
        await fetch(`/api/students/${id}`, {
          method: 'DELETE',
        });
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Ученики</Typography>
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
        {students.map((student) => (
          <Grid item xs={12} key={student.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6">
                      {student.firstName} {student.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.phone}
                    </Typography>
                    {student.email && (
                      <Typography variant="body2" color="text.secondary">
                        {student.email}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(student)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(student.id!)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    {student.tariff && (
                      <Chip
                        label={student.tariff}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {student.schedule && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={`${student.schedule.day} ${student.schedule.time}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {student.lastLesson && (
                    <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Последнее занятие
                      </Typography>
                      <Typography variant="body2">
                        Дата: {student.lastLesson.date}
                      </Typography>
                      <Typography variant="body2">
                        Тема: {student.lastLesson.topic}
                      </Typography>
                      <Typography variant="body2">
                        Усвоение: {student.lastLesson.understanding}
                      </Typography>
                      {student.lastLesson.homework && (
                        <Typography variant="body2">
                          ДЗ: {student.lastLesson.homework}
                        </Typography>
                      )}
                      {student.lastLesson.assignments && (
                        <Typography variant="body2">
                          Задания: {student.lastLesson.assignments}
                        </Typography>
                      )}
                    </Paper>
                  )}

                  {student.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {student.notes}
                    </Typography>
                  )}
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
          {currentStudent ? 'Редактировать ученика' : 'Добавить ученика'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Тариф"
                value={formData.tariff}
                onChange={(e) => setFormData({ ...formData, tariff: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="День занятий"
                value={formData.schedule?.day}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, day: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Время занятий"
                value={formData.schedule?.time}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule!, time: e.target.value }
                })}
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
            {currentStudent ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students; 