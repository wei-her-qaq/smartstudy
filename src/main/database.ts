import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { setDb, loadSeedData } from './seedLoader';

let db: any;

export function getDb(): any {
  return db;
}

export async function initDatabase() {
  const isDev = !app.isPackaged;
  const SQL = await initSqlJs({
    locateFile: (file: string) => isDev
      ? path.join(__dirname, '../../node_modules/sql.js/dist/', file)
      : path.join(process.resourcesPath, file)
  });
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'smartstudy.db');

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT DEFAULT '同学',
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      icon TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      parent_id INTEGER,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (parent_id) REFERENCES chapters(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER,
      chapter_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('single_choice','multi_choice','true_false','fill_blank','short_answer','code')),
      difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      explanation TEXT,
      tags TEXT,
      source TEXT,
      source_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );

    CREATE TABLE IF NOT EXISTS answer_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL DEFAULT 0,
      time_spent INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS wrong_question_book (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL UNIQUE,
      wrong_count INTEGER DEFAULT 1,
      last_wrong_at TEXT DEFAULT (datetime('now')),
      mastered INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS tomato_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('work','short_break','long_break')),
      started_at TEXT NOT NULL,
      ended_at TEXT,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS study_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject_id INTEGER,
      daily_goal INTEGER DEFAULT 30,
      remind_time TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS study_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER,
      checkin_date TEXT NOT NULL,
      completed_minutes INTEGER DEFAULT 0,
      question_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (plan_id) REFERENCES study_plans(id)
    );

    CREATE TABLE IF NOT EXISTS english_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('poem','novel','article','essay','news')),
      title TEXT NOT NULL,
      author TEXT,
      level TEXT CHECK(level IN ('junior','senior','cet4','cet6','postgrad','toefl','ielts')),
      content_en TEXT NOT NULL,
      content_cn TEXT NOT NULL,
      vocabulary TEXT,
      source TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pronunciation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER,
      reference_text TEXT NOT NULL,
      user_transcript TEXT,
      accuracy_score REAL,
      fluency_score REAL,
      completeness_score REAL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (material_id) REFERENCES english_materials(id)
    );

    CREATE TABLE IF NOT EXISTS life_tips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK(category IN ('health','safety','finance','law','food','environment','travel','tech')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      is_favorite INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cert_knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cert_type TEXT NOT NULL CHECK(cert_type IN ('driving','computer','teacher','accounting','builder','other')),
      cert_name TEXT NOT NULL,
      chapter_name TEXT NOT NULL,
      content TEXT NOT NULL,
      key_points TEXT,
      download_status TEXT DEFAULT 'pending' CHECK(download_status IN ('pending','downloading','completed','failed')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS k12_knowledge_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      chapter TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      formulas TEXT,
      key_points TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority INTEGER DEFAULT 2 CHECK(priority BETWEEN 1 AND 3),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
      due_date TEXT,
      subject_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS review_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      plan_date TEXT,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const userCount = db.exec('SELECT COUNT(*) as count FROM users');
  if (userCount.length === 0 || userCount[0].values[0][0] === 0) {
    db.run('INSERT INTO users (nickname) VALUES (?)', ['同学']);
  }

  saveDb();
  initDefaultSubjects(db);
  initDefaultSettings(db);
  setDb(db);
  await loadSeedData();
}

function saveDb() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'smartstudy.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function queryAll(sql: string, params?: any[]): any[] {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql: string, params?: any[]): any | undefined {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : undefined;
}

function run(sql: string, params?: any[]): { lastInsertRowid: number; changes: number } {
  db.run(sql, params || []);
  saveDb();
  const lastId = db.exec('SELECT last_insert_rowid() as id');
  const changes = db.exec('SELECT changes() as c');
  return {
    lastInsertRowid: lastId[0]?.values[0]?.[0] || 0,
    changes: changes[0]?.values[0]?.[0] || 0,
  };
}

export { queryAll, queryOne, run };

function initDefaultSubjects(db: any) {
  const subjects = [
    { name: '语文', category: 'k12' },
    { name: '数学', category: 'k12' },
    { name: '英语', category: 'k12' },
    { name: '物理', category: 'k12' },
    { name: '化学', category: 'k12' },
    { name: '生物', category: 'k12' },
    { name: '政治', category: 'k12' },
    { name: '历史', category: 'k12' },
    { name: '地理', category: 'k12' },
    { name: '大学英语四级', category: 'english' },
    { name: '大学英语六级', category: 'english' },
    { name: '考研英语', category: 'english' },
    { name: '托福', category: 'english' },
    { name: '雅思', category: 'english' },
    { name: '驾照科目一', category: 'cert' },
    { name: '驾照科目四', category: 'cert' },
    { name: '计算机等级', category: 'cert' },
    { name: '教师资格证', category: 'cert' },
    { name: '会计初级', category: 'cert' },
    { name: '生活常识', category: 'life' },
    { name: '编程技术', category: 'tech' },
  ];

  for (const s of subjects) {
    db.run('INSERT OR IGNORE INTO subjects (name, category, icon) VALUES (?, ?, ?)', [s.name, s.category, null]);
  }
  saveDb();
}

function initDefaultSettings(db: any) {
  const defaults: Record<string, string> = {
    'theme': 'light',
    'auto_launch': 'false',
    'ai_api_key': '',
    'ai_model': 'gpt-3.5-turbo',
    'ai_base_url': 'https://api.openai.com/v1',
    'notification_enabled': 'true',
    'tomato_work_duration': '25',
    'tomato_short_break': '5',
    'tomato_long_break': '15',
    'tomato_long_interval': '4',
    'daily_remind_time': '09:00',
    'audio_output_device': '',
    'audio_input_device': '',
    'audio_volume': '80',
    'noise_reduction': 'true',
  };

  for (const [key, value] of Object.entries(defaults)) {
    db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
  saveDb();
}