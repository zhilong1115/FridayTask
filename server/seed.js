import db from './db.js';
import { syncFridayInbox } from './friday-inbox.js';

// Clear existing tasks
db.exec('DELETE FROM tasks');

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const tasks = [
  {
    title: 'Review weekly goals',
    description: 'Go through this week\'s priorities and adjust as needed',
    assignee: 'zhilong',
    due_date: fmt(today),
    priority: 'high',
    status: 'todo',
  },
  {
    title: 'Research vector database options',
    description: 'Compare Pinecone, Weaviate, and Chroma for the knowledge base project',
    assignee: 'friday',
    due_date: fmt(addDays(today, 1)),
    priority: 'high',
    status: 'in-progress',
  },
  {
    title: 'Update Clawdbot memory system',
    description: 'Implement better memory consolidation during heartbeats',
    assignee: 'friday',
    due_date: fmt(addDays(today, 2)),
    priority: 'medium',
    status: 'todo',
  },
  {
    title: 'Fix NoFX portfolio layout',
    description: 'The mobile layout breaks on smaller screens - fix the grid',
    assignee: 'zhilong',
    due_date: fmt(addDays(today, 3)),
    priority: 'medium',
    status: 'todo',
  },
  {
    title: 'Set up automated backups',
    description: 'Configure Time Machine + offsite backup for important projects',
    assignee: 'zhilong',
    due_date: fmt(addDays(today, 5)),
    priority: 'low',
    status: 'todo',
  },
  {
    title: 'Draft blog post about AI assistants',
    description: 'Write about the experience of building Friday as a personal AI',
    assignee: 'zhilong',
    due_date: fmt(addDays(today, 7)),
    priority: 'low',
    status: 'todo',
  },
  {
    title: 'Summarize Hacker News trends',
    description: 'Collect top AI/ML stories from the past week and provide a summary',
    assignee: 'friday',
    due_date: fmt(addDays(today, 1)),
    priority: 'low',
    status: 'todo',
  },
  {
    title: 'Organize project documentation',
    description: 'Clean up README files across all active projects',
    assignee: 'friday',
    due_date: fmt(addDays(today, 4)),
    priority: 'medium',
    status: 'todo',
  },
  {
    title: 'Completed: Deploy staging environment',
    description: 'Set up staging server for testing',
    assignee: 'zhilong',
    due_date: fmt(addDays(today, -2)),
    priority: 'high',
    status: 'done',
  },
  {
    title: 'Completed: Configure CI/CD pipeline',
    description: 'GitHub Actions workflow for auto-deployment',
    assignee: 'friday',
    due_date: fmt(addDays(today, -1)),
    priority: 'high',
    status: 'done',
  },
];

const stmt = db.prepare(`
  INSERT INTO tasks (title, description, assignee, due_date, priority, status)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertAll = db.transaction(() => {
  for (const t of tasks) {
    stmt.run(t.title, t.description, t.assignee, t.due_date, t.priority, t.status);
  }
});

insertAll();
syncFridayInbox(db);

console.log(`✅ Seeded ${tasks.length} tasks`);
console.log('📋 Friday inbox synced');
