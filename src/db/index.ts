import Dexie, { Table } from 'dexie';
import { Student, Lesson, Payment } from '../types';

export class StudFixDB extends Dexie {
  students!: Table<Student>;
  lessons!: Table<Lesson>;
  payments!: Table<Payment>;

  constructor() {
    super('StudFixDB');
    this.version(1).stores({
      students: '++id, firstName, lastName, phone, email, subject, rate',
      lessons: '++id, date, duration, status, studentId, cost',
      payments: '++id, date, type, studentId, lessonId, amount',
    });
  }
}

export const db = new StudFixDB(); 