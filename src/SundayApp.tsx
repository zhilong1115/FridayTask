import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginModal from './components/LoginModal';
import type { Task, TaskStatus } from './types';

const API = '/api';

// Auth helpers (same pattern as useTasks)
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('friday-auth-token');
  return token ? { 'Content-Type': 'application/json', 'X-Auth-Token': token } : { 'Content-Type': 'application/json' };
};

const authFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  return res;
};

type FilterTab = 'all' | 'active' | 'done';

const STATUS_FLOW: Record<string, TaskStatus> = {
  'approved': 'in-progress',
  'in-progress': 'done',
  'done': 'approved',
  'pending': 'approved',
};

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'pending': { label: '待确认', emoji: '⏳', color: 'bg-amber-100 text-amber-700' },
  'approved': { label: '待开始', emoji: '📋', color: 'bg-orange-100 text-orange-700' },
  'in-progress': { label: '进行中', emoji: '🔥', color: 'bg-rose-100 text-rose-600' },
  'done': { label: '已完成', emoji: '✅', color: 'bg-emerald-100 text-emerald-700' },
  'rejected': { label: '已取消', emoji: '❌', color: 'bg-gray-100 text-gray-500' },
};

const PRIORITY_DOTS: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
};

const ASSIGNEE_AVATAR: Record<string, { emoji: string; name: string; color: string }> = {
  zhilong: { emoji: '👨', name: 'Zhilong', color: 'bg-blue-100 text-blue-700' },
  jessie: { emoji: '👩', name: 'Jessie', color: 'bg-pink-100 text-pink-700' },
};

export default function SundayApp() {
  const { isAuthenticated, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('active');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  // Create task form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('zhilong');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks?project=family`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleStatus = async (task: Task) => {
    const nextStatus = STATUS_FLOW[task.status];
    if (!nextStatus) return;
    try {
      await authFetch(`${API}/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setLoginOpen(true);
      }
    }
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await authFetch(`${API}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          assignee: newAssignee,
          priority: newPriority,
          due_date: newDueDate || null,
          project: 'family',
          status: 'approved',
          all_day: 1,
        }),
      });
      setNewTitle('');
      setNewDueDate('');
      setShowCreate(false);
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setLoginOpen(true);
      }
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm('确定删除这个任务吗？')) return;
    try {
      await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      await fetchTasks();
    } catch (err) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setLoginOpen(true);
      }
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
          <span className="text-3xl animate-bounce">☀️</span>
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-amber-200/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">☀️</span>
            <div>
              <h1 className="text-xl font-bold text-amber-900 tracking-tight">Sunday</h1>
              <p className="text-xs text-amber-600/70">Family Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-xs text-amber-500 hover:text-amber-700 transition-colors px-2 py-1"
              >
                退出
              </button>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="text-xs text-amber-500 hover:text-amber-700 transition-colors px-2 py-1"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Assignee Filter */}
        <div className="flex gap-2 mb-4">
          {[
            { key: '', label: '全部', emoji: '👨‍👩‍👦' },
            { key: 'zhilong', label: 'Zhilong', emoji: '👨' },
            { key: 'jessie', label: 'Jessie', emoji: '👩' },
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilterAssignee(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterAssignee === key
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white/60 text-amber-800 hover:bg-white'
              }`}
            >
              <span>{emoji}</span>
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
              <span className="text-5xl">🌴</span>
              <p className="mt-3 text-amber-600/70 text-sm">
                {filterTab === 'done' ? '还没有完成的任务' : '没有待办事项，享受周末吧！'}
              </p>
            </div>
          ) : (
            filtered.map((task) => {
              const status = STATUS_LABELS[task.status] || STATUS_LABELS['approved'];
              const assignee = ASSIGNEE_AVATAR[task.assignee] || ASSIGNEE_AVATAR['zhilong'];
              const priorityDot = PRIORITY_DOTS[task.priority] || PRIORITY_DOTS['medium'];

              return (
                <div
                  key={task.id}
                  className={`group bg-white rounded-xl p-4 shadow-sm border border-amber-100/50 transition-all hover:shadow-md ${
                    task.status === 'done' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status toggle button */}
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : task.status === 'in-progress'
                          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                          : 'border-amber-300 hover:border-amber-400'
                      }`}
                      title={`切换到: ${STATUS_FLOW[task.status] ? STATUS_LABELS[STATUS_FLOW[task.status]]?.label : ''}`}
                    >
                      {task.status === 'done' && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${assignee.color}`}>
                          {assignee.emoji} {assignee.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                          {status.emoji} {status.label}
                        </span>
                        {task.due_date && (
                          <span className="text-[10px] text-gray-400">
                            📅 {task.due_date}
                          </span>
                        )}
                        {task.subtask_count > 0 && (
                          <span className="text-[10px] text-gray-400">
                            ☑️ {task.subtask_completed}/{task.subtask_count}
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
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Create Task Sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-2xl shadow-2xl p-5 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-amber-900 mb-4">新任务</h3>

            {/* Title */}
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
              {['zhilong', 'jessie'].map((a) => {
                const info = ASSIGNEE_AVATAR[a];
                return (
                  <button
                    key={a}
                    onClick={() => setNewAssignee(a)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                      newAssignee === a
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {info.emoji} {info.name}
                  </button>
                );
              })}
            </div>

            {/* Priority & Due Date */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-sm text-amber-600 mb-1 block">优先级</label>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        newPriority === p
                          ? p === 'high' ? 'bg-red-100 text-red-700' : p === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {p === 'high' ? '🔴 高' : p === 'medium' ? '🟡 中' : '🟢 低'}
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

            {/* Actions */}
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
                创建 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

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
