export interface Student {
  id?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  subject?: string;
  rate?: number;
  tariff?: string;
  schedule: {
    day: string;
    time: string;
  };
  notes?: string;
  lastLesson?: {
    date: string;
    topic: string;
    understanding: 'excellent' | 'good' | 'satisfactory' | 'poor';
    homework?: string;
    assignments?: string;
  };
}

export interface Lesson {
  id?: number;
  studentId: number;
  date: string;
  duration: string;
  topic: string;
  understanding: 'excellent' | 'good' | 'satisfactory' | 'poor';
  homework?: string;
  assignments?: string;
  status: 'completed' | 'cancelled';
  cost: number;
  notes?: string;
}

export interface Payment {
  id?: number;
  studentId: number;
  lessonId?: number;
  amount: number;
  date: string;
  type: 'cash' | 'card' | 'transfer';
  description?: string;
  notes?: string;
}

export interface Statistics {
  totalIncome: number;
  totalLessons: number;
  averageLessonCost: number;
} 