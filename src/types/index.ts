export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  rate: number;
}

export interface Lesson {
  id: string;
  date: Date;
  duration: number; // в минутах
  status: 'completed' | 'cancelled';
  studentId: string;
  cost: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  type: 'cash' | 'card' | 'transfer';
  studentId: string;
  lessonId?: string;
  description?: string;
}

export interface Statistics {
  totalIncome: number;
  totalStudents: number;
  totalLessons: number;
  totalPayments: number;
  incomeByPeriod: {
    date: string;
    amount: number;
  }[];
} 