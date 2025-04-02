export interface Student {
  id?: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  tariff?: string;
  subject?: string;
  rate?: number;
  notes?: string;
}

export interface Lesson {
  id?: number;
  studentId: number;
  date: string | Date;
  duration: number | string;
  subject: string;
  status: 'completed' | 'cancelled';
  cost?: number;
  notes?: string;
}

export interface Payment {
  id?: number;
  studentId: number;
  lessonId?: number;
  amount: number;
  date: string | Date;
  type: 'cash' | 'card' | 'transfer';
  description?: string;
  notes?: string;
}

export interface Statistics {
  totalIncome: number;
  totalLessons: number;
  averageLessonCost: number;
} 