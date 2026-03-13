import { useState, useEffect, useCallback } from 'react';
import {
  SunLogo, FamilyIcon, PersonMale, PersonFemale,
  PlusIcon, CheckIcon, TrashIcon, CalendarIcon, ChecklistIcon,
  CozyHouse, PriorityDot,
} from './SundayIcons';
import type { Task, TaskStatus } from './types';

const API = '/api/sunday';

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

const ASSIGNEES = [
  { id: 'zhilong', name: 'Zhilong', Icon: PersonMale, chipBg: 'bg-blue-50', chipText: 'text-blue-600' },
  { id: 'jessie', name: 'Jessie', Icon: PersonFemale, chipBg: 'bg-pink-50', chipText: 'text-pink-600' },
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
    await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    await fetchTasks();
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
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
  };

  const deleteTask = async (id: number) => {
    if (!confirm('确定删除这个任务吗？')) return;
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    await fetchTasks();
  };

  // Filters
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
          <SunLogo size={36} className="animate-pulse" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-amber-200/50">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <SunLogo size={36} />
          <div>
            <h1 className="text-xl font-bold text-amber-900 tracking-tight">Sunday</h1>
            <p className="text-[11px] text-amber-600/70 -mt-0.5">Family Tasks</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Assignee Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterAssignee('')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              filterAssignee === ''
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                : 'bg-white/70 text-amber-800 hover:bg-white shadow-sm'
            }`}
          >
            <FamilyIcon size={16} />
            <span>全部</span>
          </button>
          {ASSIGNEES.map((a) => (
            <button
              key={a.id}
              onClick={() => setFilterAssignee(a.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                filterAssignee === a.id
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-white/70 text-amber-800 hover:bg-white shadow-sm'
              }`}
            >
              <a.Icon size={16} />
              <span>{a.name}</span>
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-5 bg-white/50 rounded-2xl p-1 shadow-sm">
          {([
            { key: 'active' as FilterTab, label: '进行中' },
            { key: 'done' as FilterTab, label: '已完成' },
            { key: 'all' as FilterTab, label: '全部' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                filterTab === key
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-amber-600/60 hover:text-amber-700'
              }`}
            >
              {label}
              <span className="ml-1 text-xs opacity-50">({counts[key]})</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <CozyHouse size={88} />
              <p className="mt-4 text-amber-600/60 text-sm">
                {filterTab === 'done' ? '还没有完成的任务' : '没有待办事项，享受周末吧！'}
              </p>
            </div>
          ) : (
            filtered.map((task) => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['approved'];
              const assignee = ASSIGNEES.find((a) => a.id === task.assignee) || ASSIGNEES[0];

              return (
                <div
                  key={task.id}
                  className={`group bg-white/90 rounded-2xl p-4 shadow-sm border border-amber-100/60 transition-all hover:shadow-md hover:bg-white ${
                    task.status === 'done' ? 'opacity-55' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status toggle */}
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        task.status === 'done'
                          ? 'bg-emerald-400 border-emerald-400 text-white'
                          : task.status === 'in-progress'
                          ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                          : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                      }`}
                    >
                      {task.status === 'done' && <CheckIcon size={14} />}
                      {task.status === 'in-progress' && (
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[15px] font-medium leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                        <PriorityDot level={task.priority} size={5} />
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-400 mb-2 line-clamp-1">{task.description}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${assignee.chipBg} ${assignee.chipText}`}>
                          <assignee.Icon size={10} />
                          {assignee.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                        {task.due_date && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500">
                            <CalendarIcon size={10} />
                            {task.due_date}
                          </span>
                        )}
                        {task.subtask_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-500">
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
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* FAB */}
      {!showCreate && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <PlusIcon size={28} />
        </button>
      )}

      {/* Create Task Sheet */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl p-6 pb-8 animate-slide-up">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <SunLogo size={24} />
              新任务
            </h3>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="要做什么？"
              className="w-full px-4 py-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/50 mb-4 text-[15px]"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createTask()}
            />

            {/* Assignee */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-amber-600 shrink-0">谁来做：</span>
              {ASSIGNEES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setNewAssignee(a.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all ${
                    newAssignee === a.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <a.Icon size={15} />
                  {a.name}
                </button>
              ))}
            </div>

            {/* Priority & Due Date */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <label className="text-sm text-amber-600 mb-1.5 block">优先级</label>
                <div className="flex gap-1.5">
                  {([
                    { key: 'low' as const, label: '低' },
                    { key: 'medium' as const, label: '中' },
                    { key: 'high' as const, label: '高' },
                  ]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setNewPriority(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        newPriority === key
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      <PriorityDot level={key} size={4} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-sm text-amber-600 mb-1.5 block">截止日期</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-amber-50/50 border border-amber-200/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={createTask}
                disabled={!newTitle.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 transition-all shadow-md shadow-amber-200/50"
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
