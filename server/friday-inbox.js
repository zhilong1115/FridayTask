import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inboxPath = path.join(__dirname, '..', 'data', 'friday-inbox.json');

export function syncFridayInbox(db) {
  const fridayTasks = db
    .prepare(`SELECT * FROM tasks WHERE assignee = 'friday' AND status != 'done' ORDER BY due_date ASC`)
    .all();

  const inbox = {
    updatedAt: new Date().toISOString(),
    tasks: fridayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      assignedTo: 'friday',
      dueDate: t.due_date,
      priority: t.priority,
      status: t.status,
      createdAt: t.created_at,
    })),
  };

  fs.writeFileSync(inboxPath, JSON.stringify(inbox, null, 2));
}
