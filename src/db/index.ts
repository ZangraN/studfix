import Dexie, { Table } from 'dexie';
import { Student, Lesson, Payment } from '../types';

export class StudFixDB extends Dexie {
  students!: Table<Student>;
  lessons!: Table<Lesson>;
  payments!: Table<Payment>;

  constructor() {
    super('StudFixDB');
    this.version(3).stores({
      students: '++id, firstName, lastName, phone, email, subject, rate, tariff',
      lessons: '++id, studentId, date, duration, topic, understanding, status, cost',
      payments: '++id, studentId, lessonId, date, type, amount'
    });

    // Добавляем индексы для связей
    this.students.hook('creating', function (primKey, obj) {
      if (!obj.schedule) obj.schedule = { day: '', time: '' };
      return obj;
    });

    this.students.hook('updating', function (modifications, primKey, obj) {
      if (!obj.schedule) obj.schedule = { day: '', time: '' };
      return modifications;
    });
  }
}

export const db = new StudFixDB(); 