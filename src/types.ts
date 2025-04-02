export interface Student {
  id?: number;
  name: string;
  phone: string;
  email: string;
  tariff: string;
  notes: string;
}

export interface Lesson {
  id?: number;
  studentId: number;
  date: string;
  duration: number;
  subject: string;
  status: 'completed' | 'cancelled';
  notes?: string;
}

export interface Payment {
  id?: number;
  studentId: number;
  lessonId?: number;
  amount: number;
  date: string;
  type: 'cash' | 'card' | 'transfer';
  notes?: string;
}

export interface Statistics {
  totalIncome: number;
  totalLessons: number;
  averageLessonCost: number;
} 