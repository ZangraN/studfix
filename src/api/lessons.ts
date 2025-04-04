import { db } from '../db';
import { Lesson } from '../types';

// GET /api/lessons
export async function getLessons() {
  try {
    const lessons = await db.lessons.toArray();
    return new Response(JSON.stringify(lessons), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error getting lessons:', error);
    return new Response(JSON.stringify({ error: 'Failed to get lessons' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// POST /api/lessons
export async function addLesson(request: Request) {
  try {
    const lesson: Lesson = await request.json();
    const id = await db.lessons.add(lesson);
    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    });
  } catch (error) {
    console.error('Error adding lesson:', error);
    return new Response(JSON.stringify({ error: 'Failed to add lesson' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// PUT /api/lessons/:id
export async function updateLesson(request: Request, id: number) {
  try {
    const lesson: Lesson = await request.json();
    await db.lessons.update(id, lesson);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return new Response(JSON.stringify({ error: 'Failed to update lesson' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

// DELETE /api/lessons/:id
export async function deleteLesson(id: number) {
  try {
    await db.lessons.delete(id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete lesson' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
} 