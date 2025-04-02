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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { db } from '../db';
import { Student } from '../types';
import { formatCurrency } from '../utils/format';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    subject: '',
    rate: 0,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await db.students.toArray();
    setStudents(data);
  };

  const handleOpen = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        subject: '',
        rate: 0,
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
      await db.students.update(editingStudent.id, formData);
    } else {
      await db.students.add(formData as Student);
    }
    handleClose();
    loadStudents();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого ученика?')) {
      await db.students.delete(id);
      loadStudents();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Ученики</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить ученика
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Фамилия</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Предмет</TableCell>
              <TableCell>Тариф (час)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.firstName}</TableCell>
                <TableCell>{student.lastName}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.subject}</TableCell>
                <TableCell>{formatCurrency(student.rate)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(student)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingStudent ? 'Редактировать ученика' : 'Добавить ученика'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Имя"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Фамилия"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Предмет"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Тариф (час)"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStudent ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 