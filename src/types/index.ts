export type TaskStatus = 'pending' | 'approved' | 'in-progress' | 'done' | 'rejected';

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  completed: number; // 0 or 1
  sort_order: number;
  created_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  author: 'zhilong' | 'friday';
  content: string;
  notified: number; // 0 or 1
  created_at: string;
}

export type ArtifactType = 'doc' | 'pdf' | 'link' | 'image' | 'file' | 'html';

export interface Artifact {
  id: number;
  task_id: number;
  name: string;
  url: string;
  type: ArtifactType;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: 'zhilong' | 'friday';
  due_date: string | null;
  start_time: string | null; // e.g., "09:00"
  end_time: string | null;   // e.g., "10:00"
  all_day: number;           // 1 = all-day, 0 = has specific time
  project: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  subtask_count: number;
  subtask_completed: number;
  comment_count: number;
  artifact_count: number;
}

export interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
  };
  payload?: {
    kind: string;
    message: string;
  };
  state?: {
    nextRunAtMs: number;
    lastRunAtMs: number;
    lastStatus: string;
  };
}

export type ViewMode = 'month' | 'week' | 'day';
export type SidebarView = 'calendar' | 'list';

export interface TaskFormData {
  title: string;
  description: string;
  assignee: 'zhilong' | 'friday';
  due_date: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  project: string;
  priority: 'low' | 'medium' | 'high';
  status: TaskStatus;
}
