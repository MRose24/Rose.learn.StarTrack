import { BehaviorRecord, EmotionRecord, DiaryEntry, Appointment, PsyTestRecord, TeacherReport, STUDENTS } from '../types';

const STORAGE_KEY_EMOTIONS = 'emotions_v2';
const STORAGE_KEY_BEHAVIORS = 'behaviors';
const STORAGE_KEY_DIARY = 'diary';
const STORAGE_KEY_APPOINTMENTS = 'appointments';
const STORAGE_KEY_PSYTESTS = 'psytests';
const STORAGE_KEY_REPORTS = 'teacher_reports';

export const getTodayDate = (): string => {
  return new Date().toISOString().slice(0, 10);
};

// --- CSV Export Utility ---
export const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Add BOM for Excel support (UTF-8)
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- Emotions ---
export const getEmotions = (): EmotionRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_EMOTIONS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading emotions", e);
    return [];
  }
};

export const saveEmotion = (record: EmotionRecord) => {
  const current = getEmotions();
  current.push(record);
  localStorage.setItem(STORAGE_KEY_EMOTIONS, JSON.stringify(current));
};

// --- Behaviors ---
export const getBehaviors = (): Record<string, BehaviorRecord[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BEHAVIORS);
    let parsed = data ? JSON.parse(data) : {};
    
    // Seed data if empty for demo purposes
    if (Object.keys(parsed).length === 0) {
        parsed = seedMockData();
        localStorage.setItem(STORAGE_KEY_BEHAVIORS, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error("Error reading behaviors", e);
    return {};
  }
};

export const saveBehavior = (studentName: string, record: BehaviorRecord) => {
  const current = getBehaviors();
  if (!current[studentName]) {
    current[studentName] = [];
  }
  current[studentName].push(record);
  localStorage.setItem(STORAGE_KEY_BEHAVIORS, JSON.stringify(current));
};

// --- Diary ---
export const getDiary = (studentName: string): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_DIARY);
    const all: DiaryEntry[] = data ? JSON.parse(data) : [];
    return all.filter(d => d.studentName === studentName).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e) { return []; }
};

export const saveDiary = (entry: DiaryEntry) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_DIARY);
    const all: DiaryEntry[] = data ? JSON.parse(data) : [];
    all.push(entry);
    localStorage.setItem(STORAGE_KEY_DIARY, JSON.stringify(all));
  } catch (e) { console.error(e); }
};

export const deleteDiary = (id: string) => {
   try {
    const data = localStorage.getItem(STORAGE_KEY_DIARY);
    let all: DiaryEntry[] = data ? JSON.parse(data) : [];
    all = all.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY_DIARY, JSON.stringify(all));
  } catch (e) { console.error(e); }
};

// --- Appointments ---
export const getAppointments = (studentName: string): Appointment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    const all: Appointment[] = data ? JSON.parse(data) : [];
    return all.filter(a => a.studentName === studentName).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  } catch (e) { return []; }
};

export const saveAppointment = (appt: Appointment) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    const all: Appointment[] = data ? JSON.parse(data) : [];
    all.push(appt);
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(all));
  } catch (e) { console.error(e); }
};

// --- PsyTests ---
export const getPsyTests = (userName: string): PsyTestRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PSYTESTS);
    const all: PsyTestRecord[] = data ? JSON.parse(data) : [];
    return all.filter(t => t.userName === userName).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (e) { return []; }
};

export const savePsyTest = (record: PsyTestRecord) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PSYTESTS);
    const all: PsyTestRecord[] = data ? JSON.parse(data) : [];
    all.push(record);
    localStorage.setItem(STORAGE_KEY_PSYTESTS, JSON.stringify(all));
  } catch (e) { console.error(e); }
};

// --- Teacher Reports ---
export const getTeacherReports = (): TeacherReport[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
};

export const saveTeacherReport = (report: TeacherReport) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    const all: TeacherReport[] = data ? JSON.parse(data) : [];
    all.push(report);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(all));
  } catch (e) { console.error(e); }
};

// Seed some initial data for visualization
const seedMockData = () => {
  const mockData: Record<string, BehaviorRecord[]> = {};
  const today = new Date();
  
  STUDENTS.forEach(student => {
    mockData[student.name] = [];
    // Add past 7 days random data
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        
        if (Math.random() > 0.3) {
            mockData[student.name].push({
                id: Math.random().toString(36).substr(2, 9),
                studentName: student.name,
                date: dateStr,
                type: 'good',
                details: 'ตั้งใจเรียนและช่วยตอบคำถาม',
                starChange: 1
            });
        }
        if (Math.random() > 0.8) {
             mockData[student.name].push({
                id: Math.random().toString(36).substr(2, 9),
                studentName: student.name,
                date: dateStr,
                type: 'bad',
                details: 'คุยเสียงดังในเวลาเรียน',
                starChange: -1
            });
        }
    }
  });
  return mockData;
};