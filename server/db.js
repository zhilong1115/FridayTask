import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tasks.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    assignee TEXT NOT NULL DEFAULT 'zhilong',
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Graceful migration: add time columns if they don't exist
function columnExists(table, column) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  return cols.some((c) => c.name === column);
}

if (!columnExists('tasks', 'start_time')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN start_time TEXT;`);
}
if (!columnExists('tasks', 'end_time')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN end_time TEXT;`);
}
if (!columnExists('tasks', 'all_day')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN all_day INTEGER DEFAULT 1;`);
}
if (!columnExists('tasks', 'project')) {
  db.exec(`ALTER TABLE tasks ADD COLUMN project TEXT DEFAULT '';`);
}

// Create subtasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

// Create comments table
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    notified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Migrate old status values: todo → approved
const todoCount = db.prepare(`SELECT COUNT(*) as cnt FROM tasks WHERE status = 'todo'`).get();
if (todoCount.cnt > 0) {
  db.prepare(`UPDATE tasks SET status = 'approved' WHERE status = 'todo'`).run();
  console.log(`✅ Migrated ${todoCount.cnt} tasks from 'todo' → 'approved'`);
}

export default db;
