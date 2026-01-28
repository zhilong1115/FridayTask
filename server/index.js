import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { syncFridayInbox } from './friday-inbox.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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

    // Attach subtasks and comment count to each task
    const subtaskStmt = db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order ASC, id ASC');
    const commentCountStmt = db.prepare('SELECT COUNT(*) as cnt FROM comments WHERE task_id = ?');
    const tasksWithSubtasks = tasks.map((task) => {
      const subtasks = subtaskStmt.all(task.id);
      const commentCount = commentCountStmt.get(task.id);
      return {
        ...task,
        subtasks,
        subtask_count: subtasks.length,
        subtask_completed: subtasks.filter((s) => s.completed === 1).length,
        comment_count: commentCount.cnt,
      };
    });

    res.json(tasksWithSubtasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
app.post('/api/tasks', (req, res) => {
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

// Update task
app.put('/api/tasks/:id', (req, res) => {
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

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
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

app.put('/api/tasks/:id/approve', (req, res) => {
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

app.put('/api/tasks/:id/reject', (req, res) => {
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

// Create comment
app.post('/api/tasks/:id/comments', (req, res) => {
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

// Mark comment as read/notified
app.put('/api/comments/:id/read', (req, res) => {
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

// Create subtask
app.post('/api/tasks/:id/subtasks', (req, res) => {
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

// Update subtask
app.put('/api/subtasks/:id', (req, res) => {
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

// Delete subtask
app.delete('/api/subtasks/:id', (req, res) => {
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

// ─── Start ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Friday Tasks API running on http://localhost:${PORT}`);
});
