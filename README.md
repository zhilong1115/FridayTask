# Friday Tasks

A minimal, personal task management app built for human–AI collaboration. Designed for use with [Clawdbot](https://github.com/clawdbot/clawdbot), where an AI assistant (Friday) and a human (you) share a task board — creating, assigning, and completing tasks together.

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

## Features

- **Calendar + List views** — Google Calendar-inspired weekly/monthly calendar and a filterable list view
- **Dual assignee workflow** — Tasks belong to either the human or the AI agent, with per-assignee filtering
- **Approval flow** — AI-created tasks start as "pending" and require human approval before work begins
- **Subtasks** — Break tasks into checkable subtasks with progress tracking
- **Comments** — Leave comments on tasks; the AI agent picks them up via polling and responds
- **Projects** — Tag tasks with project/epic labels for organization
- **Time blocks** — Schedule tasks with specific start/end times on the calendar
- **Priority levels** — Low / Medium / High with visual indicators
- **Status tracking** — Pending → Approved → In Progress → Done (or Rejected)
- **Mobile responsive** — Works on desktop and mobile with adaptive layout

## Architecture

```
friday-tasks/
├── server/            # Express + SQLite backend
│   ├── index.js       # REST API (tasks, subtasks, comments, cron)
│   ├── db.js          # Database schema & migrations
│   └── seed.js        # Sample data seeder
├── src/               # React + TypeScript frontend
│   ├── App.tsx         # Main app with routing & state
│   ├── components/
│   │   ├── CalendarView.tsx   # Weekly/monthly calendar
│   │   ├── ListView.tsx       # Filterable task list
│   │   ├── TaskModal.tsx      # Task detail/edit modal
│   │   ├── Sidebar.tsx        # Desktop navigation
│   │   ├── MobileNav.tsx      # Mobile navigation
│   │   └── TimeGrid.tsx       # Calendar time grid
│   ├── hooks/
│   │   └── useTasks.ts        # API hook for all task operations
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── index.html
├── vite.config.ts
└── package.json
```

**Backend:** Express.js with better-sqlite3 — zero-config, single-file database.  
**Frontend:** React 19 + TypeScript + Tailwind CSS 4, built with Vite.

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (API on :3001, UI on :3002)
npm run dev

# Or run separately:
npm run dev:server   # Express API with --watch
npm run dev:client   # Vite dev server
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Seed Sample Data

```bash
npm run seed
```

### Build for Production

```bash
npm run build
```

Static files are output to `dist/`. Serve them alongside the Express API.

## API

All endpoints are under `/api`.

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks (query: `assignee`, `status`, `from`, `to`) |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PUT` | `/api/tasks/:id/approve` | Approve a pending task |
| `PUT` | `/api/tasks/:id/reject` | Reject a pending task |

### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks/:id/subtasks` | List subtasks |
| `POST` | `/api/tasks/:id/subtasks` | Create a subtask |
| `PUT` | `/api/subtasks/:id` | Update a subtask |
| `DELETE` | `/api/subtasks/:id` | Delete a subtask |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks/:id/comments` | List comments for a task |
| `POST` | `/api/tasks/:id/comments` | Add a comment (`{ author, content }`) |
| `GET` | `/api/comments/unread` | Unread comments (for AI polling) |
| `PUT` | `/api/comments/:id/read` | Mark a comment as read |

### Cron Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/cron-jobs` | List active cron jobs (reads from Clawdbot config) |

## AI Integration

Friday Tasks is designed to work with an AI assistant that:

1. **Polls for approved tasks** — picks up tasks assigned to it and starts working
2. **Creates tasks** — proposes work items that go through human approval
3. **Reads comments** — polls `/api/comments/unread` to respond to questions
4. **Updates progress** — moves tasks through status stages as work completes

The approval flow ensures the human stays in control while the AI stays productive.

## License

MIT
