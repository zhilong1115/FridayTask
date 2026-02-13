import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import db from './db.js';
import { syncFridayInbox } from './friday-inbox.js';

const app = express();
const PORT = 4747;
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.join(__dirname, '..', 'dist');

// Admin password - set via env var or default
const ADMIN_PASSWORD = process.env.FRIDAY_ADMIN_PASSWORD || 'ilovefriday';

// Simple token store (in-memory, tokens expire after 7 days)
const validTokens = new Map();

// Auth middleware for write operations
const requireAuth = (req, res, next) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const tokenData = validTokens.get(token);
  if (!tokenData || tokenData.expires < Date.now()) {
    validTokens.delete(token);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  next();
};

app.use(cors());
app.use(express.json());

// ─── Auth API ────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    validTokens.set(token, { expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.json({ valid: false });
  }
  const tokenData = validTokens.get(token);
  if (!tokenData || tokenData.expires < Date.now()) {
    validTokens.delete(token);
    return res.json({ valid: false });
  }
  res.json({ valid: true });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (token) validTokens.delete(token);
  res.json({ success: true });
});

// Serve built frontend
app.use(express.static(distPath));

// Serve public directory (for knowledge reports, etc.)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// ─── Tasks API ───────────────────────────────────────────

// List tasks with optional filters (includes subtasks)
app.get('/api/tasks', (req, res) => {
  const { assignee, status, from, to } = req.query;
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (assignee) {
    sql += ' AND assignee = ?';
    params.push(assignee);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (from) {
    sql += ' AND due_date >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND due_date <= ?';
    params.push(to);
  }

  sql += ' ORDER BY due_date ASC, priority DESC';

  try {
    const tasks = db.prepare(sql).all(...params);

    // Attach subtasks, comment count, and artifact count to each task
    const subtaskStmt = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, id ASC');
    const commentCountStmt = db.prepare('SELECT COUNT(*) as cnt FROM comments WHERE task_id = ?');
    const artifactCountStmt = db.prepare('SELECT COUNT(*) as cnt FROM artifacts WHERE task_id = ?');
    const tasksWithSubtasks = tasks.map((task) => {
      const subtasks = subtaskStmt.all(task.id);
      const commentCount = commentCountStmt.get(task.id);
      const artifactCount = artifactCountStmt.get(task.id);
      return {
        ...task,
        subtasks,
        subtask_count: subtasks.length,
        subtask_completed: subtasks.filter((s) => s.completed === 1).length,
        comment_count: commentCount.cnt,
        artifact_count: artifactCount.cnt,
      };
    });

    res.json(tasksWithSubtasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (requires auth)
app.post('/api/tasks', requireAuth, (req, res) => {
  const { title, description, assignee, due_date, priority, status, start_time, end_time, all_day, project } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, assignee, due_date, priority, status, start_time, end_time, all_day, project)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Default status: friday tasks start as 'pending', zhilong tasks as 'approved'
    const effectiveAssignee = assignee || 'zhilong';
    const defaultStatus = effectiveAssignee === 'friday' ? 'pending' : 'approved';

    const result = stmt.run(
      title,
      description || '',
      effectiveAssignee,
      due_date || null,
      priority || 'medium',
      status || defaultStatus,
      start_time || null,
      end_time || null,
      all_day !== undefined ? (all_day ? 1 : 0) : 1,
      project || ''
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);

    // Sync Friday inbox if assigned to Friday
    if (task.assignee === 'friday') {
      syncFridayInbox(db);
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task (requires auth)
app.put('/api/tasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, description, assignee, due_date, priority, status, start_time, end_time, all_day, project } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const stmt = db.prepare(`
      UPDATE tasks SET
        title = ?,
        description = ?,
        assignee = ?,
        due_date = ?,
        priority = ?,
        status = ?,
        start_time = ?,
        end_time = ?,
        all_day = ?,
        project = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      title ?? existing.title,
      description ?? existing.description,
      assignee ?? existing.assignee,
      due_date ?? existing.due_date,
      priority ?? existing.priority,
      status ?? existing.status,
      start_time !== undefined ? start_time : existing.start_time,
      end_time !== undefined ? end_time : existing.end_time,
      all_day !== undefined ? (all_day ? 1 : 0) : existing.all_day,
      project !== undefined ? project : (existing.project || ''),
      id
    );

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    // Sync Friday inbox on any change
    syncFridayInbox(db);

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task (requires auth)
app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    syncFridayInbox(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Approve / Reject ────────────────────────────────────

app.put('/api/tasks/:id/approve', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    db.prepare(`UPDATE tasks SET status = 'approved', updated_at = datetime('now') WHERE id = ?`).run(id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    syncFridayInbox(db);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tasks/:id/reject', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });

    db.prepare(`UPDATE tasks SET status = 'rejected', updated_at = datetime('now') WHERE id = ?`).run(id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    syncFridayInbox(db);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Comments API ────────────────────────────────────────

// List comments for a task
app.get('/api/tasks/:id/comments', (req, res) => {
  const { id } = req.params;
  try {
    const comments = db.prepare('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC').all(id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create comment (requires auth)
app.post('/api/tasks/:id/comments', requireAuth, (req, res) => {
  const { id } = req.params;
  const { author, content } = req.body;

  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!author) return res.status(400).json({ error: 'Author is required' });

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // If zhilong comments, notified=0 so Friday picks it up; if friday comments, notified=1
    const notified = author === 'friday' ? 1 : 0;

    const result = db.prepare('INSERT INTO comments (task_id, author, content, notified) VALUES (?, ?, ?, ?)').run(id, author, content, notified);
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread comments (for Friday's heartbeat)
app.get('/api/comments/unread', (_req, res) => {
  try {
    const comments = db.prepare(`
      SELECT c.*, t.title as task_title
      FROM comments c
      JOIN tasks t ON c.task_id = t.id
      WHERE c.author = 'zhilong' AND c.notified = 0
      ORDER BY c.created_at ASC
    `).all();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark comment as read/notified (requires auth)
app.put('/api/comments/:id/read', requireAuth, (req, res) => {
  const { id } = req.params;
  try {
    const existing = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Comment not found' });

    db.prepare('UPDATE comments SET notified = 1 WHERE id = ?').run(id);
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Artifacts API ───────────────────────────────────────

// List ALL artifacts across all tasks (with task title)
app.get('/api/artifacts', (req, res) => {
  try {
    const artifacts = db.prepare(`
      SELECT a.*, t.title as task_title, t.project
      FROM artifacts a
      JOIN tasks t ON a.task_id = t.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(artifacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List artifacts for a task
app.get('/api/tasks/:id/artifacts', (req, res) => {
  const { id } = req.params;
  try {
    const artifacts = db.prepare('SELECT * FROM artifacts WHERE task_id = ? ORDER BY created_at DESC').all(id);
    res.json(artifacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create artifact (requires auth)
app.post('/api/tasks/:id/artifacts', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, url, type } = req.body;

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!url) return res.status(400).json({ error: 'URL is required' });
  if (!type) return res.status(400).json({ error: 'Type is required' });

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const result = db.prepare('INSERT INTO artifacts (task_id, name, url, type) VALUES (?, ?, ?, ?)').run(id, name, url, type);
    const artifact = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(artifact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete artifact (requires auth)
app.delete('/api/artifacts/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Artifact not found' });

    db.prepare('DELETE FROM artifacts WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Subtasks API ────────────────────────────────────────

// List subtasks for a task
app.get('/api/tasks/:id/subtasks', (req, res) => {
  const { id } = req.params;
  try {
    const subtasks = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, id ASC').all(id);
    res.json(subtasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create subtask (requires auth)
app.post('/api/tasks/:id/subtasks', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Get next sort_order
    const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as max_order FROM subtasks WHERE task_id = ?').get(id);
    const sortOrder = maxOrder.max_order + 1;

    const result = db.prepare('INSERT INTO subtasks (task_id, title, sort_order) VALUES (?, ?, ?)').run(id, title, sortOrder);
    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(subtask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update subtask (requires auth)
app.put('/api/subtasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, completed, sort_order } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Subtask not found' });

    db.prepare(`
      UPDATE subtasks SET
        title = ?,
        completed = ?,
        sort_order = ?
      WHERE id = ?
    `).run(
      title ?? existing.title,
      completed !== undefined ? (completed ? 1 : 0) : existing.completed,
      sort_order ?? existing.sort_order,
      id
    );

    const subtask = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    res.json(subtask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete subtask (requires auth)
app.delete('/api/subtasks/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Subtask not found' });

    db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cron Jobs API ───────────────────────────────────────

const CRON_JOBS_PATH = path.join(
  process.env.HOME || '/Users/zhilongzheng',
  '.clawdbot',
  'cron',
  'jobs.json'
);

// ─── Agents Status API ───────────────────────────────────

const AGENT_DEFS = [
  { id: 'polymarket', emoji: '📈', name: 'Polymarket', nameCn: '交易小五', description: 'Trading & market monitoring', projectPatterns: ['polymarket', 'trading'] },
  { id: 'hu', emoji: '🀄', name: 'HU', nameCn: '游戏小五', description: 'Mahjong roguelike game dev', projectPatterns: ['hu', 'game'] },
  { id: 'aspen', emoji: '📊', name: 'Aspen', nameCn: '量化小五', description: 'AI quant trading app', projectPatterns: ['aspen', 'quant', 'atrade', 'nofx'] },
  { id: 'artist', emoji: '🍌', name: 'Artist', nameCn: '画画小五', description: 'Image & content generation', projectPatterns: ['artist', 'design', 'avatar', 'image', 'banana'] },
  { id: 'fridaytask', emoji: '📋', name: 'FridayTask', nameCn: '任务小五', description: 'Task management system', projectPatterns: ['friday-task', 'friday', 'infra', 'task'] },
  { id: 'knowledge', emoji: '📚', name: 'Knowledge', nameCn: '知识小五', description: 'Daily knowledge push & learning', projectPatterns: ['knowledge', 'learning', 'ai-push', 'finance-push', 'learn', 'study'] },
];

app.get('/api/agents/status', (_req, res) => {
  try {
    const agents = AGENT_DEFS.map((agent) => {
      // Build SQL LIKE conditions for project matching
      const conditions = agent.projectPatterns.map((p) => `project LIKE '%${p}%'`).join(' OR ');
      const where = `(${conditions}) AND assignee = 'friday'`;

      const inProgress = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE status = 'in-progress' AND ${where}`).get().c;
      const approved = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE status = 'approved' AND ${where}`).get().c;
      const pending = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE status = 'pending' AND ${where}`).get().c;
      const done = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE status = 'done' AND ${where}`).get().c;
      const total = db.prepare(`SELECT COUNT(*) as c FROM tasks WHERE ${where}`).get().c;

      const recentTasks = db.prepare(
        `SELECT id, title, status, project, updated_at FROM tasks WHERE ${where} ORDER BY updated_at DESC LIMIT 5`
      ).all();

      const lastDone = db.prepare(
        `SELECT updated_at FROM tasks WHERE status = 'done' AND ${where} ORDER BY updated_at DESC LIMIT 1`
      ).get();

      let status = 'idle';
      if (inProgress > 0) status = 'working';
      else if (approved > 0 || pending > 0) status = 'pending';

      return {
        ...agent,
        status,
        stats: { inProgress, approved, pending, done, total },
        recentTasks,
        lastDoneAt: lastDone?.updated_at || null,
      };
    });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cron jobs for a specific agent
app.get('/api/agents/:id/crons', (_req, res) => {
  const { id } = _req.params;
  try {
    let cronData = [];
    try {
      const raw = execSync('openclaw cron list --json 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
      cronData = JSON.parse(raw);
      if (!Array.isArray(cronData)) cronData = cronData.jobs || [];
    } catch {
      // Fallback to jobs.json
      if (fs.existsSync(CRON_JOBS_PATH)) {
        const data = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
        cronData = data.jobs || [];
      }
    }

    const agentDef = AGENT_DEFS.find((a) => a.id === id);
    if (!agentDef) return res.status(404).json({ error: 'Agent not found' });

    const patterns = {
      polymarket: /polymarket|trading|market/i,
      hu: /\bhu\b/i,
      aspen: /aspen|atrade|nofx/i,
      artist: /artist|image|banana/i,
      fridaytask: /friday|task/i,
      knowledge: /knowledge|learn|study|daily.*news|ai.*news/i,
    };
    const pattern = patterns[id];
    const matched = pattern ? cronData.filter((j) => pattern.test(j.name || '')) : [];
    res.json(matched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cron-jobs', (_req, res) => {
  try {
    if (!fs.existsSync(CRON_JOBS_PATH)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
    const jobs = (data.jobs || []).filter((j) => j.enabled);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Knowledge Base API ──────────────────────────────────

const knowledgePath = path.join(__dirname, '..', 'public', 'knowledge');

// List all knowledge articles
app.get('/api/knowledge', (_req, res) => {
  try {
    const articles = [];
    const folders = ['ai', 'finance'];

    for (const folder of folders) {
      const folderPath = path.join(knowledgePath, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.html'));
        for (const file of files) {
          // Parse filename: YYYY-MM-DD-topic.html
          const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.html$/);
          let title = file.replace('.html', '');
          let date = new Date().toISOString().split('T')[0];

          if (match) {
            date = match[1];
            // Convert kebab-case to Title Case
            title = match[2]
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          } else {
            // Try to extract title from HTML file
            const content = fs.readFileSync(path.join(folderPath, file), 'utf-8');
            const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch) {
              title = titleMatch[1];
            }
          }

          articles.push({
            folder,
            filename: file,
            title,
            date,
          });
        }
      }
    }

    // Sort by date descending
    articles.sort((a, b) => b.date.localeCompare(a.date));
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific article content
app.get('/api/knowledge/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;

  // Validate folder
  if (!['ai', 'finance'].includes(folder)) {
    return res.status(400).json({ error: 'Invalid folder' });
  }

  // Validate filename (prevent path traversal)
  if (filename.includes('..') || filename.includes('/') || !filename.endsWith('.html')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(knowledgePath, folder, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.type('html').send(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SPA fallback ────────────────────────────────────────

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Friday Tasks API running on http://localhost:${PORT}`);
});
