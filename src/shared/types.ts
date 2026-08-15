export interface Subject {
  id: number;
  name: string;
  category: string;
  icon: string | null;
  created_at: string;
}

export interface Chapter {
  id: number;
  subject_id: number;
  parent_id: number | null;
  name: string;
  sort_order: number;
}

export interface Question {
  id: number;
  subject_id: number | null;
  chapter_id: number | null;
  type: 'single_choice' | 'multi_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'code';
  difficulty: number;
  content: string;
  options: string | null;
  answer: string;
  explanation: string | null;
  tags: string | null;
  source: string | null;
  source_url: string | null;
  created_at: string;
  wrong_count?: number;
  last_wrong_at?: string;
  mastered?: number;
  avg_time?: number;
}

export interface AnswerRecord {
  id: number;
  question_id: number;
  user_answer: string;
  is_correct: number;
  time_spent: number;
  created_at: string;
}

export interface TomatoRecord {
  id: number;
  duration: number;
  type: 'work' | 'short_break' | 'long_break';
  started_at: string;
  ended_at: string | null;
  completed: number;
}

export interface StudyPlan {
  id: number;
  title: string;
  subject_id: number | null;
  daily_goal: number;
  remind_time: string | null;
  is_active: number;
  created_at: string;
}

export interface StudyCheckin {
  id: number;
  plan_id: number | null;
  checkin_date: string;
  completed_minutes: number;
  question_count: number;
}

export interface EnglishMaterial {
  id: number;
  type: 'poem' | 'novel' | 'article' | 'essay' | 'news';
  title: string;
  author: string | null;
  level: 'junior' | 'senior' | 'cet4' | 'cet6' | 'postgrad' | 'toefl' | 'ielts' | null;
  content_en: string;
  content_cn: string;
  vocabulary: string | null;
  source: string | null;
  created_at: string;
}

export interface PronunciationRecord {
  id: number;
  material_id: number | null;
  reference_text: string;
  user_transcript: string | null;
  accuracy_score: number | null;
  fluency_score: number | null;
  completeness_score: number | null;
  created_at: string;
}

export interface LifeTip {
  id: number;
  category: string;
  title: string;
  content: string;
  source: string | null;
  source_url: string | null;
  is_favorite: number;
  created_at: string;
}

export interface CertKnowledge {
  id: number;
  cert_type: string;
  cert_name: string;
  chapter_name: string;
  content: string;
  key_points: string | null;
  download_status: string;
  created_at: string;
}

export interface K12KnowledgePoint {
  id: number;
  subject: string;
  grade: string;
  chapter: string;
  section: string;
  title: string;
  content: string;
  formulas: string | null;
  key_points: string | null;
  created_at: string;
}

export interface WeakPoint {
  tags: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface AnalysisResult {
  weakPoints: WeakPoint[];
  hardQuestions: Question[];
}

export interface WindowApi {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
}

export interface SettingsApi {
  get: (key: string) => Promise<string | undefined>;
  set: (key: string, value: string) => Promise<boolean>;
  getAll: () => Promise<Record<string, string>>;
}

export interface Api {
  window: WindowApi;
  settings: SettingsApi;
  autoLaunch: { set: (enabled: boolean) => Promise<boolean> };
  subjects: { getAll: () => Promise<Subject[]>; getByCategory: (category: string) => Promise<Subject[]> };
  chapters: { getBySubject: (subjectId: number) => Promise<Chapter[]> };
  questions: {
    create: (data: any) => Promise<number>;
    getBySubject: (subjectId: number, limit?: number, offset?: number) => Promise<Question[]>;
    getById: (id: number) => Promise<Question | undefined>;
    search: (keyword: string, subjectId?: number) => Promise<Question[]>;
  };
  answer: { record: (data: { question_id: number; user_answer: string; is_correct: number; time_spent: number }) => Promise<boolean> };
  wrongQuestions: { getAll: () => Promise<Question[]>; markMastered: (questionId: number) => Promise<boolean> };
  tomato: { record: (data: any) => Promise<number>; getStats: (days: number) => Promise<any> };
  plans: { create: (data: any) => Promise<number>; getAll: () => Promise<StudyPlan[]> };
  checkin: { record: (data: any) => Promise<boolean>; getCalendar: (month: string) => Promise<any[]> };
  english: { getMaterials: (type?: string, level?: string) => Promise<EnglishMaterial[]>; getMaterialById: (id: number) => Promise<EnglishMaterial | undefined>; addMaterial: (data: any) => Promise<number> };
  pronunciation: { record: (data: any) => Promise<number> };
  lifeTips: { getAll: (category?: string) => Promise<LifeTip[]>; search: (keyword: string) => Promise<LifeTip[]>; add: (data: any) => Promise<number>; toggleFavorite: (id: number) => Promise<boolean> };
  cert: { getAll: (certType?: string) => Promise<CertKnowledge[]>; getByType: (certType: string) => Promise<any[]> };
  k12: { getSubjects: () => Promise<any[]>; getBySubject: (subject: string, grade?: string) => Promise<K12KnowledgePoint[]>; getGrades: (subject: string) => Promise<any[]> };
  analysis: { weakPoints: () => Promise<AnalysisResult> };
  notification: { send: (title: string, body: string) => Promise<boolean> };
  audio: { getDevices: () => Promise<any[]> };
  openExternal: (url: string) => Promise<void>;
  on: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    api: Api;
  }
}