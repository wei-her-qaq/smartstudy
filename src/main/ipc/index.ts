import { ipcMain, app, Notification, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { queryAll, queryOne, run } from '../database';
import { toggleAutoLaunch } from '../autoLaunch';
import { getAvailablePacks, getDownloadedPacks, isPackDownloaded, downloadPack, importPack } from '../packManager';
import { getDb } from '../database';

export function registerIpcHandlers() {
  ipcMain.handle('window:minimize', () => {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win) win.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMaximized()) win.unmaximize();
      else win.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    const win = require('electron').BrowserWindow.getAllWindows()[0];
    if (win) win.close();
  });

  ipcMain.handle('settings:get', (_event, key: string) => {
    const row = queryOne('SELECT value FROM settings WHERE key = ?', [key]);
    return row?.value;
  });

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
    return true;
  });

  ipcMain.handle('settings:getAll', () => {
    const rows = queryAll('SELECT key, value FROM settings');
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  });

  ipcMain.handle('autoLaunch:set', async (_event, enabled: boolean) => {
    await toggleAutoLaunch(enabled);
    return true;
  });

  ipcMain.handle('subjects:getAll', () => {
    return queryAll('SELECT * FROM subjects ORDER BY category, name');
  });

  ipcMain.handle('subjects:getByCategory', (_event, category: string) => {
    return queryAll('SELECT * FROM subjects WHERE category = ? ORDER BY name', [category]);
  });

  ipcMain.handle('chapters:getBySubject', (_event, subjectId: number) => {
    return queryAll('SELECT * FROM chapters WHERE subject_id = ? ORDER BY sort_order', [subjectId]);
  });

  ipcMain.handle('questions:create', (_event, data: any) => {
    const result = run(
      'INSERT INTO questions (subject_id, chapter_id, type, difficulty, content, options, answer, explanation, tags, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.subject_id, data.chapter_id || null, data.type, data.difficulty, data.content, JSON.stringify(data.options), data.answer, data.explanation, data.tags, data.source]
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('questions:getBySubject', (_event, subjectId: number, limit?: number, offset?: number) => {
    return queryAll('SELECT * FROM questions WHERE subject_id = ? ORDER BY RANDOM() LIMIT ? OFFSET ?', [subjectId, limit || 50, offset || 0]);
  });

  ipcMain.handle('questions:getById', (_event, id: number) => {
    return queryOne('SELECT * FROM questions WHERE id = ?', [id]);
  });

  ipcMain.handle('questions:search', (_event, keyword: string, subjectId?: number) => {
    if (subjectId) {
      return queryAll('SELECT * FROM questions WHERE subject_id = ? AND (content LIKE ? OR tags LIKE ?) LIMIT 50', [subjectId, `%${keyword}%`, `%${keyword}%`]);
    }
    return queryAll('SELECT * FROM questions WHERE content LIKE ? OR tags LIKE ? LIMIT 50', [`%${keyword}%`, `%${keyword}%`]);
  });

  ipcMain.handle('answer:record', (_event, data: { question_id: number; user_answer: string; is_correct: number; time_spent: number }) => {
    run('INSERT INTO answer_records (question_id, user_answer, is_correct, time_spent) VALUES (?, ?, ?, ?)',
      [data.question_id, data.user_answer, data.is_correct, data.time_spent]);

    if (data.is_correct === 0) {
      const existing = queryOne('SELECT * FROM wrong_question_book WHERE question_id = ?', [data.question_id]);
      if (existing) {
        run('UPDATE wrong_question_book SET wrong_count = wrong_count + 1, last_wrong_at = datetime("now") WHERE question_id = ?', [data.question_id]);
      } else {
        run('INSERT INTO wrong_question_book (question_id, wrong_count, last_wrong_at) VALUES (?, 1, datetime("now"))', [data.question_id]);
      }
    }
    return true;
  });

  ipcMain.handle('wrongQuestions:getAll', () => {
    return queryAll(`
      SELECT q.*, w.wrong_count, w.last_wrong_at, w.mastered
      FROM wrong_question_book w
      JOIN questions q ON q.id = w.question_id
      WHERE w.mastered = 0
      ORDER BY w.wrong_count DESC, w.last_wrong_at ASC
    `);
  });

  ipcMain.handle('wrongQuestions:markMastered', (_event, questionId: number) => {
    run('UPDATE wrong_question_book SET mastered = 1 WHERE question_id = ?', [questionId]);
    return true;
  });

  ipcMain.handle('tomato:record', (_event, data: { duration: number; type: string; started_at: string; ended_at: string; completed: number }) => {
    const result = run('INSERT INTO tomato_records (duration, type, started_at, ended_at, completed) VALUES (?, ?, ?, ?, ?)',
      [data.duration, data.type, data.started_at, data.ended_at, data.completed]);
    return result.lastInsertRowid;
  });

  ipcMain.handle('tomato:getStats', (_event, days: number) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const total = queryOne('SELECT COUNT(*) as count, COALESCE(SUM(duration), 0) as total_duration FROM tomato_records WHERE completed = 1 AND started_at >= ?', [since]);
    const daily = queryAll(`
      SELECT DATE(started_at) as date, COALESCE(SUM(duration), 0) as total_duration, COUNT(*) as count
      FROM tomato_records WHERE completed = 1 AND started_at >= ?
      GROUP BY DATE(started_at) ORDER BY date
    `, [since]);
    return { total, daily };
  });

  ipcMain.handle('plans:create', (_event, data: { title: string; subject_id?: number; daily_goal: number; remind_time?: string }) => {
    const result = run('INSERT INTO study_plans (title, subject_id, daily_goal, remind_time) VALUES (?, ?, ?, ?)',
      [data.title, data.subject_id || null, data.daily_goal, data.remind_time || null]);
    return result.lastInsertRowid;
  });

  ipcMain.handle('plans:getAll', () => {
    return queryAll('SELECT * FROM study_plans WHERE is_active = 1 ORDER BY created_at DESC');
  });

  ipcMain.handle('checkin:record', (_event, data: { plan_id?: number; completed_minutes: number; question_count: number }) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = queryOne('SELECT * FROM study_checkins WHERE plan_id = ? AND checkin_date = ?', [data.plan_id, today]);
    if (existing) {
      run('UPDATE study_checkins SET completed_minutes = completed_minutes + ?, question_count = question_count + ? WHERE id = ?',
        [data.completed_minutes, data.question_count, existing.id]);
    } else {
      run('INSERT INTO study_checkins (plan_id, checkin_date, completed_minutes, question_count) VALUES (?, ?, ?, ?)',
        [data.plan_id, today, data.completed_minutes, data.question_count]);
    }
    return true;
  });

  ipcMain.handle('checkin:getCalendar', (_event, month: string) => {
    return queryAll(
      'SELECT checkin_date, COALESCE(SUM(completed_minutes), 0) as total_minutes, COALESCE(SUM(question_count), 0) as total_questions FROM study_checkins WHERE checkin_date LIKE ? GROUP BY checkin_date',
      [`${month}%`]
    );
  });

  ipcMain.handle('english:getMaterials', (_event, type?: string, level?: string) => {
    let sql = 'SELECT * FROM english_materials WHERE 1=1';
    const params: any[] = [];
    if (type) { sql += ' AND type = ?'; params.push(type); }
    if (level) { sql += ' AND level = ?'; params.push(level); }
    sql += ' ORDER BY RANDOM() LIMIT 20';
    return queryAll(sql, params);
  });

  ipcMain.handle('english:getMaterialById', (_event, id: number) => {
    return queryOne('SELECT * FROM english_materials WHERE id = ?', [id]);
  });

  ipcMain.handle('english:addMaterial', (_event, data: any) => {
    const result = run(
      'INSERT INTO english_materials (type, title, author, level, content_en, content_cn, vocabulary, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.type, data.title, data.author, data.level, data.content_en, data.content_cn, JSON.stringify(data.vocabulary || []), data.source]
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('pronunciation:record', (_event, data: any) => {
    const result = run(
      'INSERT INTO pronunciation_records (material_id, reference_text, user_transcript, accuracy_score, fluency_score, completeness_score) VALUES (?, ?, ?, ?, ?, ?)',
      [data.material_id, data.reference_text, data.user_transcript, data.accuracy_score, data.fluency_score, data.completeness_score]
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('lifeTips:getAll', (_event, category?: string) => {
    if (category) {
      return queryAll('SELECT * FROM life_tips WHERE category = ? ORDER BY RANDOM() LIMIT 50', [category]);
    }
    return queryAll('SELECT * FROM life_tips ORDER BY RANDOM() LIMIT 50');
  });

  ipcMain.handle('lifeTips:search', (_event, keyword: string) => {
    return queryAll('SELECT * FROM life_tips WHERE title LIKE ? OR content LIKE ? LIMIT 50', [`%${keyword}%`, `%${keyword}%`]);
  });

  ipcMain.handle('lifeTips:add', (_event, data: any) => {
    const result = run(
      'INSERT INTO life_tips (category, title, content, source, source_url) VALUES (?, ?, ?, ?, ?)',
      [data.category, data.title, data.content, data.source, data.source_url]
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('lifeTips:toggleFavorite', (_event, id: number) => {
    run('UPDATE life_tips SET is_favorite = CASE WHEN is_favorite = 0 THEN 1 ELSE 0 END WHERE id = ?', [id]);
    return true;
  });

  ipcMain.handle('cert:getAll', (_event, certType?: string) => {
    if (certType) {
      return queryAll('SELECT * FROM cert_knowledge WHERE cert_type = ? ORDER BY cert_name, chapter_name', [certType]);
    }
    return queryAll('SELECT * FROM cert_knowledge ORDER BY cert_type, cert_name, chapter_name');
  });

  ipcMain.handle('cert:getByType', (_event, certType: string) => {
    return queryAll('SELECT DISTINCT cert_name FROM cert_knowledge WHERE cert_type = ?', [certType]);
  });

  ipcMain.handle('k12:getSubjects', () => {
    return queryAll('SELECT DISTINCT subject FROM k12_knowledge_points');
  });

  ipcMain.handle('k12:getBySubject', (_event, subject: string, grade?: string) => {
    if (grade) {
      return queryAll('SELECT * FROM k12_knowledge_points WHERE subject = ? AND grade = ? ORDER BY chapter, section', [subject, grade]);
    }
    return queryAll('SELECT * FROM k12_knowledge_points WHERE subject = ? ORDER BY grade, chapter, section', [subject]);
  });

  ipcMain.handle('k12:getGrades', (_event, subject: string) => {
    return queryAll('SELECT DISTINCT grade FROM k12_knowledge_points WHERE subject = ? ORDER BY grade', [subject]);
  });

  ipcMain.handle('analysis:weakPoints', () => {
    const weakPoints = queryAll(`
      SELECT q.tags, COUNT(*) as total, COALESCE(SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END), 0) as correct,
             ROUND(CAST(COALESCE(SUM(CASE WHEN ar.is_correct = 1 THEN 1 ELSE 0 END), 0) AS REAL) / COUNT(*) * 100, 1) as accuracy
      FROM answer_records ar
      JOIN questions q ON q.id = ar.question_id
      WHERE q.tags IS NOT NULL AND q.tags != ''
      GROUP BY q.tags
      ORDER BY accuracy ASC
    `);

    const hardQuestions = queryAll(`
      SELECT q.*, w.wrong_count, AVG(ar.time_spent) as avg_time
      FROM wrong_question_book w
      JOIN questions q ON q.id = w.question_id
      LEFT JOIN answer_records ar ON ar.question_id = q.id
      WHERE w.wrong_count >= 3
      GROUP BY q.id
      ORDER BY w.wrong_count DESC
    `);

    return { weakPoints, hardQuestions };
  });

  ipcMain.handle('notification:send', (_event, title: string, body: string) => {
    new Notification({ title, body }).show();
    return true;
  });

  ipcMain.handle('openExternal', (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle('audio:getDevices', async () => {
    return [];
  });

  ipcMain.handle('pack:getAvailable', () => {
    return getAvailablePacks();
  });

  ipcMain.handle('pack:getDownloaded', () => {
    return getDownloadedPacks();
  });

  ipcMain.handle('pack:download', async (_event, packId: string) => {
    await downloadPack(packId);
    return true;
  });

  ipcMain.handle('pack:import', async (_event, packId: string) => {
    const db = getDb();
    const count = await importPack(packId, db);
    return count;
  });

  ipcMain.handle('pack:delete', (_event, packId: string) => {
    const pack = getAvailablePacks().find(p => p.id === packId);
    if (pack) {
      const packPath = path.join(app.getPath('userData'), 'packs', pack.filename);
      if (fs.existsSync(packPath)) fs.unlinkSync(packPath);
    }
    return true;
  });

  ipcMain.handle('todo:getAll', () => {
    return queryAll('SELECT * FROM todos ORDER BY priority ASC, due_date ASC, created_at DESC');
  });

  ipcMain.handle('todo:create', (_event, data: { title: string; description?: string; priority?: number; due_date?: string; subject_id?: number }) => {
    const result = run(
      'INSERT INTO todos (title, description, priority, due_date, subject_id) VALUES (?, ?, ?, ?, ?)',
      [data.title, data.description || null, data.priority || 2, data.due_date || null, data.subject_id || null]
    );
    return result.lastInsertRowid;
  });

  ipcMain.handle('todo:update', (_event, id: number, data: { title?: string; description?: string; priority?: number; due_date?: string; subject_id?: number }) => {
    const fields: string[] = [];
    const params: any[] = [];
    if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
    if (data.priority !== undefined) { fields.push('priority = ?'); params.push(data.priority); }
    if (data.due_date !== undefined) { fields.push('due_date = ?'); params.push(data.due_date); }
    if (data.subject_id !== undefined) { fields.push('subject_id = ?'); params.push(data.subject_id); }
    if (fields.length > 0) {
      params.push(id);
      run(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    return true;
  });

  ipcMain.handle('todo:delete', (_event, id: number) => {
    run('DELETE FROM todos WHERE id = ?', [id]);
    return true;
  });

  ipcMain.handle('todo:toggle', (_event, id: number) => {
    const todo = queryOne('SELECT status, completed_at FROM todos WHERE id = ?', [id]);
    if (todo) {
      if (todo.status === 'completed') {
        run('UPDATE todos SET status = ? WHERE id = ?', ['pending', id]);
      } else {
        run('UPDATE todos SET status = ?, completed_at = datetime("now") WHERE id = ?', ['completed', id]);
      }
    }
    return true;
  });
}