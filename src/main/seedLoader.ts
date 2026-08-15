import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let db: any;

export function setDb(database: any) {
  db = database;
}

function saveDb() {
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'smartstudy.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export async function loadSeedData() {
  const isDev = !app.isPackaged;
  const seedPath = isDev
    ? path.join(__dirname, '../../resources/seed-data.json')
    : path.join(process.resourcesPath, 'seed-data.json');

  if (!fs.existsSync(seedPath)) {
    console.log('seed-data.json not found at', seedPath);
    return;
  }

  const raw = fs.readFileSync(seedPath, 'utf-8');
  const data = JSON.parse(raw);

  const countEnglish = db.exec('SELECT COUNT(*) as c FROM english_materials')[0]?.values[0]?.[0] || 0;
  if (countEnglish === 0 && data.englishMaterials?.length) {
    const sql = 'INSERT INTO english_materials (type, title, author, level, content_en, content_cn, vocabulary, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    for (const item of data.englishMaterials) {
      db.run(sql, [item.type, item.title, item.author, item.level, item.content_en, item.content_cn, item.vocabulary, item.source]);
    }
    saveDb();
    console.log(`Loaded ${data.englishMaterials.length} English materials`);
  }

  const countK12 = db.exec('SELECT COUNT(*) as c FROM k12_knowledge_points')[0]?.values[0]?.[0] || 0;
  if (countK12 === 0 && data.k12Points?.length) {
    const sql = 'INSERT INTO k12_knowledge_points (subject, grade, chapter, section, title, content, formulas, key_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    for (const item of data.k12Points) {
      db.run(sql, [item.subject, item.grade, item.chapter, item.section, item.title, item.content, item.formulas, item.key_points]);
    }
    saveDb();
    console.log(`Loaded ${data.k12Points.length} K12 knowledge points`);
  }

  const countLife = db.exec('SELECT COUNT(*) as c FROM life_tips')[0]?.values[0]?.[0] || 0;
  if (countLife === 0 && data.lifeTips?.length) {
    const sql = 'INSERT INTO life_tips (category, title, content, source, source_url) VALUES (?, ?, ?, ?, ?)';
    for (const item of data.lifeTips) {
      db.run(sql, [item.category, item.title, item.content, item.source, item.source_url || null]);
    }
    saveDb();
    console.log(`Loaded ${data.lifeTips.length} life tips`);
  }

  const countCert = db.exec('SELECT COUNT(*) as c FROM cert_knowledge')[0]?.values[0]?.[0] || 0;
  if (countCert === 0 && data.certKnowledge?.length) {
    const sql = 'INSERT INTO cert_knowledge (cert_type, cert_name, chapter_name, content, key_points) VALUES (?, ?, ?, ?, ?)';
    for (const item of data.certKnowledge) {
      db.run(sql, [item.cert_type, item.cert_name, item.chapter_name, item.content, item.key_points]);
    }
    saveDb();
    console.log(`Loaded ${data.certKnowledge.length} cert knowledge items`);
  }

  const countChapters = db.exec('SELECT COUNT(*) as c FROM chapters')[0]?.values[0]?.[0] || 0;
  if (countChapters === 0 && data.chapters?.length) {
    const sql = 'INSERT INTO chapters (subject_id, parent_id, name, sort_order) VALUES (?, ?, ?, ?)';
    for (const item of data.chapters) {
      db.run(sql, [item.subject_id, item.parent_id || null, item.name, item.sort_order || 0]);
    }
    saveDb();
    console.log(`Loaded ${data.chapters.length} chapters`);
  }

  const countQuestions = db.exec('SELECT COUNT(*) as c FROM questions')[0]?.values[0]?.[0] || 0;
  if (countQuestions === 0 && data.questions?.length) {
    const sql = 'INSERT INTO questions (subject_id, chapter_id, type, difficulty, content, options, answer, explanation, tags, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    for (const item of data.questions) {
      let qtype = item.type || 'single_choice';
      if (qtype === 'choice') qtype = 'single_choice';
      db.run(sql, [
        item.subject_id || null,
        item.chapter_id || null,
        qtype,
        item.difficulty || 3,
        item.content,
        item.options ? JSON.stringify(item.options) : null,
        item.answer,
        item.explanation || '',
        item.tags || '',
        'seed'
      ]);
    }
    saveDb();
    console.log(`Loaded ${data.questions.length} questions`);
  }
}