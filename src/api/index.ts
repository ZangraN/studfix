import { getStudents, addStudent, updateStudent, deleteStudent } from './students';
import { getLessons, addLesson, updateLesson, deleteLesson } from './lessons';
import { getPayments, addPayment, updatePayment, deletePayment } from './payments';

export async function handleApiRequest(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Извлекаем id из URL для операций PUT и DELETE
  const id = path.split('/').pop();
  const numericId = id ? parseInt(id, 10) : null;

  try {
    // Маршруты для студентов
    if (path === '/api/students') {
      if (method === 'GET') return getStudents();
      if (method === 'POST') return addStudent(request);
    }
    if (path.match(/^\/api\/students\/\d+$/)) {
      if (!numericId) throw new Error('Invalid ID');
      if (method === 'PUT') return updateStudent(request, numericId);
      if (method === 'DELETE') return deleteStudent(numericId);
    }

    // Маршруты для занятий
    if (path === '/api/lessons') {
      if (method === 'GET') return getLessons();
      if (method === 'POST') return addLesson(request);
    }
    if (path.match(/^\/api\/lessons\/\d+$/)) {
      if (!numericId) throw new Error('Invalid ID');
      if (method === 'PUT') return updateLesson(request, numericId);
      if (method === 'DELETE') return deleteLesson(numericId);
    }

    // Маршруты для платежей
    if (path === '/api/payments') {
      if (method === 'GET') return getPayments();
      if (method === 'POST') return addPayment(request);
    }
    if (path.match(/^\/api\/payments\/\d+$/)) {
      if (!numericId) throw new Error('Invalid ID');
      if (method === 'PUT') return updatePayment(request, numericId);
      if (method === 'DELETE') return deletePayment(numericId);
    }

    // Если маршрут не найден
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 