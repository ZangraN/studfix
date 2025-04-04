import { db } from '../db';
import { Student } from '../types';

// GET /api/students
export async function getStudents() {
  try {
    const students = await db.students.toArray();
    return new Response(JSON.stringify(students), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error getting students:', error);
    return new Response(JSON.stringify({ error: 'Failed to get students' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// POST /api/students
export async function addStudent(request: Request) {
  try {
    const student: Student = await request.json();
    const id = await db.students.add(student);
    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Error adding student:', error);
    return new Response(JSON.stringify({ error: 'Failed to add student' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// PUT /api/students/:id
export async function updateStudent(request: Request, id: number) {
  try {
    const student: Student = await request.json();
    await db.students.update(id, student);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return new Response(JSON.stringify({ error: 'Failed to update student' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// DELETE /api/students/:id
export async function deleteStudent(id: number) {
  try {
    await db.students.delete(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete student' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 