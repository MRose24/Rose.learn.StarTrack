export type EmotionType = 'ดีมาก' | 'ดี' | 'ปกติ' | 'เศร้า' | 'เครียด' | 'โกรธ';

export interface EmotionRecord {
  id: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  timestamp?: string;
  emotion: EmotionType;
  emoji: string;
  note: string;
}

export type BehaviorType = 'good' | 'bad' | 'redeem';

export interface BehaviorRecord {
  id: string;
  studentName: string;
  date: string;
  type: BehaviorType;
  details: string;
  starChange: number;
}

export interface TeacherReport {
  id: string;
  studentName: string;
  teacherName: string;
  date: string;
  content: string;
}

export interface DiaryEntry {
  id: string;
  studentName: string;
  date: string;
  content: string;
}

export interface Appointment {
  id: string;
  studentName: string;
  datetime: string;
  topic: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface PsyTestRecord {
  id: string;
  userName: string;
  date: string;
  testType: string;
  score: number;
  result: string;
}

export interface Student {
  id: string;
  name: string;
}

// Global state shape for local storage
export interface AppData {
  emotions: EmotionRecord[];
  behaviors: Record<string, BehaviorRecord[]>; // Keyed by student name
  diary: DiaryEntry[];
  appointments: Appointment[];
  psyTests: PsyTestRecord[];
  teacherReports: TeacherReport[];
}

export const STUDENTS: Student[] = [
  { id: '1', name: 'นายเอกชัย สมใจ' },
  { id: '2', name: 'ด.ญ.ศิรดา ดารา' },
  { id: '3', name: 'ด.ช.วรพล ดวงดี' },
];