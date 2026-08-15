import { contextBridge, ipcRenderer } from 'electron';

const api = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },
  autoLaunch: {
    set: (enabled: boolean) => ipcRenderer.invoke('autoLaunch:set', enabled),
  },
  subjects: {
    getAll: () => ipcRenderer.invoke('subjects:getAll'),
    getByCategory: (category: string) => ipcRenderer.invoke('subjects:getByCategory', category),
  },
  chapters: {
    getBySubject: (subjectId: number) => ipcRenderer.invoke('chapters:getBySubject', subjectId),
  },
  questions: {
    create: (data: any) => ipcRenderer.invoke('questions:create', data),
    getBySubject: (subjectId: number, limit?: number, offset?: number) => ipcRenderer.invoke('questions:getBySubject', subjectId, limit, offset),
    getById: (id: number) => ipcRenderer.invoke('questions:getById', id),
    search: (keyword: string, subjectId?: number) => ipcRenderer.invoke('questions:search', keyword, subjectId),
  },
  answer: {
    record: (data: { question_id: number; user_answer: string; is_correct: number; time_spent: number }) => ipcRenderer.invoke('answer:record', data),
  },
  wrongQuestions: {
    getAll: () => ipcRenderer.invoke('wrongQuestions:getAll'),
    markMastered: (questionId: number) => ipcRenderer.invoke('wrongQuestions:markMastered', questionId),
  },
  tomato: {
    record: (data: { duration: number; type: string; started_at: string; ended_at: string; completed: number }) => ipcRenderer.invoke('tomato:record', data),
    getStats: (days: number) => ipcRenderer.invoke('tomato:getStats', days),
  },
  plans: {
    create: (data: { title: string; subject_id?: number; daily_goal: number; remind_time?: string }) => ipcRenderer.invoke('plans:create', data),
    getAll: () => ipcRenderer.invoke('plans:getAll'),
  },
  checkin: {
    record: (data: { plan_id?: number; completed_minutes: number; question_count: number }) => ipcRenderer.invoke('checkin:record', data),
    getCalendar: (month: string) => ipcRenderer.invoke('checkin:getCalendar', month),
  },
  english: {
    getMaterials: (type?: string, level?: string) => ipcRenderer.invoke('english:getMaterials', type, level),
    getMaterialById: (id: number) => ipcRenderer.invoke('english:getMaterialById', id),
    addMaterial: (data: any) => ipcRenderer.invoke('english:addMaterial', data),
  },
  pronunciation: {
    record: (data: any) => ipcRenderer.invoke('pronunciation:record', data),
  },
  lifeTips: {
    getAll: (category?: string) => ipcRenderer.invoke('lifeTips:getAll', category),
    search: (keyword: string) => ipcRenderer.invoke('lifeTips:search', keyword),
    add: (data: any) => ipcRenderer.invoke('lifeTips:add', data),
    toggleFavorite: (id: number) => ipcRenderer.invoke('lifeTips:toggleFavorite', id),
  },
  cert: {
    getAll: (certType?: string) => ipcRenderer.invoke('cert:getAll', certType),
    getByType: (certType: string) => ipcRenderer.invoke('cert:getByType', certType),
  },
  k12: {
    getSubjects: () => ipcRenderer.invoke('k12:getSubjects'),
    getBySubject: (subject: string, grade?: string) => ipcRenderer.invoke('k12:getBySubject', subject, grade),
    getGrades: (subject: string) => ipcRenderer.invoke('k12:getGrades', subject),
  },
  analysis: {
    weakPoints: () => ipcRenderer.invoke('analysis:weakPoints'),
  },
  notification: {
    send: (title: string, body: string) => ipcRenderer.invoke('notification:send', title, body),
  },
  audio: {
    getDevices: () => ipcRenderer.invoke('audio:getDevices'),
  },
  pack: {
    getAvailable: () => ipcRenderer.invoke('pack:getAvailable'),
    getDownloaded: () => ipcRenderer.invoke('pack:getDownloaded'),
    download: (packId: string, onProgress?: (p: number) => void) => ipcRenderer.invoke('pack:download', packId),
    import: (packId: string) => ipcRenderer.invoke('pack:import', packId),
    delete: (packId: string) => ipcRenderer.invoke('pack:delete', packId),
  },
  todo: {
    getAll: () => ipcRenderer.invoke('todo:getAll'),
    create: (data: any) => ipcRenderer.invoke('todo:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('todo:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('todo:delete', id),
    toggle: (id: number) => ipcRenderer.invoke('todo:toggle', id),
  },
  openExternal: (url: string) => ipcRenderer.invoke('openExternal', url),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
};

contextBridge.exposeInMainWorld('api', api);