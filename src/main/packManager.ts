import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const PACKS_URL = 'https://github.com/smartstudy-packs/releases/download/v1/';

interface PackInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  items: number;
  filename: string;
  version: string;
  tables: string[];
}

const AVAILABLE_PACKS: PackInfo[] = [
  { id: 'english', name: '英语素材包', description: '500篇双语阅读素材，覆盖全部7个级别', size: '2MB', items: 500, filename: 'english_pack_v1.json', version: '1.0', tables: ['english_materials'] },
  { id: 'k12', name: 'K12知识包', description: '3000+条知识点，9科×3年级全覆盖', size: '3MB', items: 3000, filename: 'k12_pack_v1.json', version: '1.0', tables: ['k12_knowledge_points'] },
  { id: 'life', name: '生活常识包', description: '500条生活常识，8大分类', size: '1MB', items: 500, filename: 'life_pack_v1.json', version: '1.0', tables: ['life_tips'] },
  { id: 'cert', name: '证书知识包', description: '1000条证书考试知识点，含驾照/计算机/教资/会计/二建', size: '2MB', items: 1000, filename: 'cert_pack_v1.json', version: '1.0', tables: ['cert_knowledge'] },
  { id: 'questions', name: '题目包', description: '5000+道练习题，各科目难度分级', size: '5MB', items: 5000, filename: 'questions_pack_v1.json', version: '1.0', tables: ['questions'] },
];

export function getAvailablePacks(): PackInfo[] {
  return AVAILABLE_PACKS;
}

export function getDownloadedPacks(): string[] {
  const packsDir = path.join(app.getPath('userData'), 'packs');
  if (!fs.existsSync(packsDir)) return [];
  return fs.readdirSync(packsDir).filter(f => f.endsWith('.json'));
}

export function isPackDownloaded(packId: string): boolean {
  const pack = AVAILABLE_PACKS.find(p => p.id === packId);
  if (!pack) return false;
  const packPath = path.join(app.getPath('userData'), 'packs', pack.filename);
  return fs.existsSync(packPath);
}

export async function downloadPack(packId: string, onProgress?: (percent: number) => void): Promise<void> {
  const pack = AVAILABLE_PACKS.find(p => p.id === packId);
  if (!pack) throw new Error(`Pack ${packId} not found`);

  const packsDir = path.join(app.getPath('userData'), 'packs');
  if (!fs.existsSync(packsDir)) fs.mkdirSync(packsDir, { recursive: true });

  const url = `${PACKS_URL}${pack.filename}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength) : 0;
  let loaded = 0;

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (total && onProgress) {
      onProgress(Math.round((loaded / total) * 100));
    }
  }

  const data = new Uint8Array(loaded);
  let pos = 0;
  for (const chunk of chunks) {
    data.set(chunk, pos);
    pos += chunk.length;
  }

  const destPath = path.join(packsDir, pack.filename);
  fs.writeFileSync(destPath, Buffer.from(data));
}

export async function importPack(packId: string, db: any): Promise<number> {
  const pack = AVAILABLE_PACKS.find(p => p.id === packId);
  if (!pack) throw new Error(`Pack ${packId} not found`);

  const packPath = path.join(app.getPath('userData'), 'packs', pack.filename);
  if (!fs.existsSync(packPath)) throw new Error('Pack not downloaded');

  const raw = fs.readFileSync(packPath, 'utf-8');
  const data = JSON.parse(raw);
  let count = 0;

  for (const table of pack.tables) {
    const items = data[table];
    if (!items?.length) continue;

    if (table === 'english_materials') {
      const sql = 'INSERT OR IGNORE INTO english_materials (type, title, author, level, content_en, content_cn, vocabulary, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      for (const item of items) {
        db.run(sql, [item.type, item.title, item.author, item.level, item.content_en, item.content_cn, item.vocabulary, item.source]);
      }
    } else if (table === 'k12_knowledge_points') {
      const sql = 'INSERT OR IGNORE INTO k12_knowledge_points (subject, grade, chapter, section, title, content, formulas, key_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      for (const item of items) {
        db.run(sql, [item.subject, item.grade, item.chapter, item.section, item.title, item.content, item.formulas, item.key_points]);
      }
    } else if (table === 'life_tips') {
      const sql = 'INSERT OR IGNORE INTO life_tips (category, title, content, source, source_url) VALUES (?, ?, ?, ?, ?)';
      for (const item of items) {
        db.run(sql, [item.category, item.title, item.content, item.source, null]);
      }
    } else if (table === 'cert_knowledge') {
      const sql = 'INSERT OR IGNORE INTO cert_knowledge (cert_type, cert_name, chapter_name, content, key_points) VALUES (?, ?, ?, ?, ?)';
      for (const item of items) {
        db.run(sql, [item.cert_type, item.cert_name, item.chapter_name, item.content, item.key_points]);
      }
    } else if (table === 'questions') {
      const sql = 'INSERT OR IGNORE INTO questions (subject_id, chapter_id, type, difficulty, content, options, answer, explanation, tags, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      for (const item of items) {
        let qtype = item.type || 'single_choice';
        if (qtype === 'choice') qtype = 'single_choice';
        db.run(sql, [item.subject_id, item.chapter_id, qtype, item.difficulty || 3, item.content, item.options ? JSON.stringify(item.options) : null, item.answer, item.explanation, item.tags, 'pack']);
      }
    }
    count += items.length;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'smartstudy.db');
  const buffer = Buffer.from(db.export());
  fs.writeFileSync(dbPath, buffer);

  return count;
}