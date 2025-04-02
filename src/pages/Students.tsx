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
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../db';
import { Student } from '../types';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tariff: '',
    notes: ''
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const allStudents = await db.students.toArray();
    setStudents(allStudents);
  };

  const handleOpen = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        phone: student.phone,
        email: student.email,
        tariff: student.tariff,
        notes: student.notes
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        tariff: '',
        notes: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async () => {
    if (editingStudent) {
      await db.students.update(editingStudent.id!, formData);
    } else {
      await db.students.add(formData);
    }
    handleClose();
    loadStudents();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого ученика?')) {
      await db.students.delete(id);
      loadStudents();
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
          Ученики
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
        {students.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
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
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.phone}
                  </Typography>
                  {student.email && (
                    <Typography variant="body2" color="text.secondary">
                      {student.email}
                    </Typography>
                  )}
                  <Chip 
                    label={`Тариф: ${student.tariff} ₽`}
                    color="primary"
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  {student.notes && (
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
                      {student.notes}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 1, pt: 0 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpen(student)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(student.id!)}
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
          {editingStudent ? 'Редактировать ученика' : 'Добавить ученика'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Имя"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Телефон"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Тариф"
              value={formData.tariff}
              onChange={(e) => setFormData({ ...formData, tariff: e.target.value })}
              fullWidth
              required
              type="number"
            />
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
            disabled={!formData.name || !formData.phone || !formData.tariff}
          >
            {editingStudent ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 