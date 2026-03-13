import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from './types';

const API = '/api/sunday';

// ─── SVG Icons (consistent with FridayTask style) ───────

const SunIcon = ({ size = 28, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
    <rect width="32" height="32" rx="7" fill="#f59e0b" />
    <circle cx="16" cy="16" r="5.5" fill="white" />
    <g stroke="white" strokeWidth="1.8" strokeLinecap="round">
      <line x1="16" y1="5" x2="16" y2="7.5" />
      <line x1="16" y1="24.5" x2="16" y2="27" />
      <line x1="5" y1="16" x2="7.5" y2="16" />
      <line x1="24.5" y1="16" x2="27" y2="16" />
      <line x1="8.22" y1="8.22" x2="9.99" y2="9.99" />
      <line x1="22.01" y1="22.01" x2="23.78" y2="23.78" />
      <line x1="23.78" y1="8.22" x2="22.01" y2="9.99" />
      <line x1="9.99" y1="22.01" x2="8.22" y2="23.78" />
    </g>
  </svg>
);

const PlusIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M12 4v16m8-8H4" />
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CalendarIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChecklistIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PalmIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M24 44V26" stroke="#d4a574" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24 26c-4-8-14-10-14-6s6 8 14 6z" fill="#86c166" opacity="0.7" />
    <path d="M24 26c4-8 14-10 14-6s-6 8-14 6z" fill="#86c166" opacity="0.7" />
    <path d="M24 24c-2-9-10-14-8-10s4 10 8 10z" fill="#6ba554" opacity="0.6" />
    <path d="M24 24c2-9 10-14 8-10s-4 10-8 10z" fill="#6ba554" opacity="0.6" />
    <path d="M24 22c0-10-4-16-2-12s2 10 2 12z" fill="#7db868" opacity="0.5" />
  </svg>
);

// Assignee avatar icons
const PersonIcon = ({ variant, size = 16 }: { variant: 'male' | 'female' | 'family'; size?: number }) => {
  if (variant === 'family') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
  if (variant === 'female') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M8 7c0-1 .5-3.5 4-4 3.5.5 4 3 4 4" fill="currentColor" opacity="0.15" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
};

// ─── Constants ───────────────────────────────────────────

type FilterTab = 'all' | 'active' | 'done';

const STATUS_FLOW: Record<string, TaskStatus> = {
  'approved': 'in-progress',
  'in-progress': 'done',
  'done': 'approved',
  'pending': 'approved',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'pending':     { label: '待确认', color: 'text-amber-700', bg: 'bg-amber-100' },
  'approved':    { label: '待开始', color: 'text-orange-700', bg: 'bg-orange-100' },
  'in-progress': { label: '进行中', color: 'text-rose-600', bg: 'bg-rose-100' },
  'done':        { label: '已完成', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  'rejected':    { label: '已取消', color: 'text-gray-500', bg: 'bg-gray-100' },
};

const PRIORITY_DOTS: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
};

const ASSIGNEES = [
  { id: 'zhilong', name: 'Zhilong', variant: 'male' as const, chipBg: 'bg-blue-50', chipText: 'text-blue-700' },
  { id: 'jessie', name: 'Jessie', variant: 'female' as const, chipBg: 'bg-pink-50', chipText: 'text-pink-700' },
];

// ─── App ─────────────────────────────────────────────────

export default function SundayApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('active');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Create task form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('zhilong');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleStatus = async (task: Task) => {
    const nextStatus = STATUS_FLOW[task.status];
    if (!nextStatus) return;
    try {
      await fetch(`${API}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          assignee: newAssignee,
          priority: newPriority,
          due_date: newDueDate || null,
          status: 'approved',
        }),
      });
      setNewTitle('');
      setNewDueDate('');
      setShowCreate(false);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('确定删除这个任务吗？')) return;
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (filterAssignee && t.assignee !== filterAssignee) return false;
    if (filterTab === 'active') return t.status !== 'done' && t.status !== 'rejected';
    if (filterTab === 'done') return t.status === 'done';
    return true;
  });

  const counts = {
    all: tasks.filter((t) => !filterAssignee || t.assignee === filterAssignee).length,
    active: tasks.filter((t) => (t.status !== 'done' && t.status !== 'rejected') && (!filterAssignee || t.assignee === filterAssignee)).length,
    done: tasks.filter((t) => t.status === 'done' && (!filterAssignee || t.assignee === filterAssignee)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-600">
          <SunIcon size={32} className="animate-pulse" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-amber-200/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <SunIcon size={32} />
          <div>
            <h1 className="text-xl font-bold text-amber-900 tracking-tight">Sunday</h1>
            <p className="text-xs text-amber-600/70">Family Tasks</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Assignee Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: '', label: '全部', variant: 'family' as const },
            ...ASSIGNEES.map((a) => ({ key: a.id, label: a.name, variant: a.variant })),
          ].map(({ key, label, variant }) => (
            <button
              key={key}
              onClick={() => setFilterAssignee(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterAssignee === key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white/60 text-amber-800 hover:bg-white'
              }`}
            >
              <PersonIcon variant={variant} size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-5 bg-white/50 rounded-xl p-1">
          {([
            { key: 'active' as FilterTab, label: '进行中' },
            { key: 'done' as FilterTab, label: '已完成' },
            { key: 'all' as FilterTab, label: '全部' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                filterTab === key
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-600/70 hover:text-amber-800'
              }`}
            >
              {label}
              <span className="ml-1 text-xs opacity-60">({counts[key]})</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <PalmIcon size={56} />
              <p className="mt-3 text-amber-600/70 text-sm">
                {filterTab === 'done' ? '还没有完成的任务' : '没有待办事项，享受周末吧！'}
              </p>
            </div>
          ) : (
            filtered.map((task) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['approved'];
              const assignee = ASSIGNEES.find((a) => a.id === task.assignee) || ASSIGNEES[0];
              const priorityDot = PRIORITY_DOTS[task.priority] || PRIORITY_DOTS['medium'];

              return (
                <div
                  key={task.id}
                  className={`group bg-white rounded-xl p-4 shadow-sm border border-amber-100/50 transition-all hover:shadow-md ${
                    task.status === 'done' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status toggle */}
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : task.status === 'in-progress'
                          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                          : 'border-amber-300 hover:border-amber-400'
                      }`}
                      title={`切换到: ${STATUS_FLOW[task.status] ? STATUS_CONFIG[STATUS_FLOW[task.status]]?.label : ''}`}
                    >
                      {task.status === 'done' && <CheckIcon size={14} />}
                      {task.status === 'in-progress' && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot}`} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-400 mb-1.5 line-clamp-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${assignee.chipBg} ${assignee.chipText}`}>
                          <PersonIcon variant={assignee.variant} size={10} />
                          {assignee.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {task.due_date && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                            <CalendarIcon size={10} />
                            {task.due_date}
                          </span>
                        )}
                        {task.subtask_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
                            <ChecklistIcon size={10} />
                            {task.subtask_completed}/{task.subtask_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0 mt-1"
                      title="删除任务"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Create Task FAB */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <PlusIcon size={28} />
        </button>
      )}

      {/* Create Task Sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-2xl shadow-2xl p-5 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-4">新任务</h3>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="要做什么？"
              className="w-full px-4 py-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 mb-3"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createTask()}
            />

            {/* Assignee */}
            <div className="flex gap-2 mb-3">
              <span className="text-sm text-amber-600 py-2 shrink-0">谁来做：</span>
              {ASSIGNEES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setNewAssignee(a.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                    newAssignee === a.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <PersonIcon variant={a.variant} size={14} />
                  {a.name}
                </button>
              ))}
            </div>

            {/* Priority & Due Date */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-sm text-amber-600 mb-1 block">优先级</label>
                <div className="flex gap-1">
                  {([
                    { key: 'low' as const, label: '低', dot: 'bg-green-400' },
                    { key: 'medium' as const, label: '中', dot: 'bg-amber-400' },
                    { key: 'high' as const, label: '高', dot: 'bg-red-400' },
                  ]).map(({ key, label, dot }) => (
                    <button
                      key={key}
                      onClick={() => setNewPriority(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        newPriority === key
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm text-amber-600 mb-1 block">截止日期</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-200/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={createTask}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 transition-all shadow-md shadow-amber-200/50"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
