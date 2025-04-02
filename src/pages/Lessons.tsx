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
import { Lesson, Student } from '../types';
import { formatDate, formatDuration } from '../utils/format';

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    duration: '',
    subject: '',
    status: 'completed' as const,
    notes: ''
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadLessons();
    loadStudents();
  }, []);

  const loadLessons = async () => {
    const allLessons = await db.lessons.toArray();
    setLessons(allLessons);
  };

  const loadStudents = async () => {
    const allStudents = await db.students.toArray();
    setStudents(allStudents);
  };

  const handleOpen = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        studentId: lesson.studentId.toString(),
        date: lesson.date,
        duration: lesson.duration.toString(),
        subject: lesson.subject,
        status: lesson.status,
        notes: lesson.notes || ''
      });
    } else {
      setEditingLesson(null);
      setFormData({
        studentId: '',
        date: '',
        duration: '',
        subject: '',
        status: 'completed',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingLesson(null);
  };

  const handleSubmit = async () => {
    const lessonData = {
      ...formData,
      studentId: Number(formData.studentId),
      duration: Number(formData.duration)
    };

    if (editingLesson) {
      await db.lessons.update(editingLesson.id!, lessonData);
    } else {
      await db.lessons.add(lessonData);
    }
    handleClose();
    loadLessons();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это занятие?')) {
      await db.lessons.delete(id);
      loadLessons();
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Неизвестный ученик';
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
          Занятия
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
        {lessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
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
                    {getStudentName(lesson.studentId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(lesson.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lesson.subject} • {formatDuration(lesson.duration)}
                  </Typography>
                  <Chip 
                    label={lesson.status === 'completed' ? 'Проведено' : 'Отменено'}
                    color={lesson.status === 'completed' ? 'success' : 'error'}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  {lesson.notes && (
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
                      {lesson.notes}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 1, pt: 0 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpen(lesson)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(lesson.id!)}
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
          {editingLesson ? 'Редактировать занятие' : 'Добавить занятие'}
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
            <TextField
              label="Дата"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Длительность (минут)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Предмет"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
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
            disabled={!formData.studentId || !formData.date || !formData.duration || !formData.subject}
          >
            {editingLesson ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 