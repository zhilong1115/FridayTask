import { useState, useEffect, useCallback } from 'react';
import {
  SunLogo, FamilyIcon, PersonMale, PersonFemale,
  PlusIcon, CheckIcon, TrashIcon, CalendarIcon, ChecklistIcon,
  CozyHouse, PriorityDot, TagIcon, BellIcon,
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

const TAGS = [
  { id: '采购', bg: 'bg-lime-100', text: 'text-lime-700', ring: 'ring-lime-300' },
  { id: '宝宝', bg: 'bg-pink-100', text: 'text-pink-600', ring: 'ring-pink-300' },
  { id: '账单', bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-300' },
  { id: '健康', bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300' },
  { id: '预约', bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300' },
  { id: '出行', bg: 'bg-cyan-100', text: 'text-cyan-700', ring: 'ring-cyan-300' },
  { id: '修理', bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300' },
];

const getTagConfig = (tagId: string) => TAGS.find((t) => t.id === tagId) || { id: tagId, bg: 'bg-gray-100', text: 'text-gray-600', ring: 'ring-gray-300' };
const parseTags = (tags: string | undefined): string[] => tags ? tags.split(',').filter(Boolean) : [];
const serializeTags = (tags: string[]): string => tags.join(',');

// ─── Tag Picker ──────────────────────────────────────────

function TagPicker({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  const toggle = (tagId: string) => {
    onChange(selected.includes(tagId) ? selected.filter((t) => t !== tagId) : [...selected, tagId]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              active ? `${tag.bg} ${tag.text} ring-1 ${tag.ring}` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {tag.id}
          </button>
        );
      })}
    </div>
  );
}

// ─── Close Icon ──────────────────────────────────────────

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── Task Detail Modal ───────────────────────────────────

function TaskDetail({ task, onClose, onSave, onDelete }: {
  task: Task;
  onClose: () => void;
  onSave: (id: number, data: Partial<Task>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignee, setAssignee] = useState(task.assignee);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [tags, setTags] = useState<string[]>(parseTags((task as any).tags));
  const [reminderDate, setReminderDate] = useState((task as any).reminder_date || '');
  const [dirty, setDirty] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      assignee,
      priority,
      due_date: dueDate || null,
      tags: serializeTags(tags),
      reminder_date: reminderDate || null,
    } as any);
    onClose();
  };

  const handleChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['approved'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            <PriorityDot level={task.priority} size={5} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(setTitle)(e.target.value)}
            className="w-full text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none placeholder-amber-300"
            placeholder="任务标题"
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => handleChange(setDescription)(e.target.value)}
            placeholder="添加详细内容..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-amber-50/40 border border-amber-200/40 text-sm text-gray-700 placeholder-amber-300/70 focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
          />

          {/* Assignee */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-amber-600 shrink-0">负责人：</span>
            {ASSIGNEES.map((a) => (
              <button
                key={a.id}
                onClick={() => handleChange(setAssignee)(a.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                  assignee === a.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <a.Icon size={14} />
                {a.name}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm text-amber-600 mb-1.5 block">标签</label>
            <TagPicker selected={tags} onChange={(v) => { setTags(v); setDirty(true); }} />
          </div>

          {/* Priority & Dates row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-amber-600 mb-1.5 block">优先级</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChange(setPriority)(p)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      priority === p
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <PriorityDot level={p} size={3} />
                    {p === 'low' ? '低' : p === 'medium' ? '中' : '高'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-amber-600 mb-1.5 block">截止日期</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleChange(setDueDate)(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-200/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              />
            </div>
          </div>

          {/* Reminder date */}
          <div className="flex items-center gap-2">
            <BellIcon size={14} className="text-amber-500 shrink-0" />
            <label className="text-sm text-amber-600 shrink-0">提醒日期</label>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => handleChange(setReminderDate)(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-200/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            />
            {reminderDate && (
              <button onClick={() => handleChange(setReminderDate)('')} className="text-gray-400 hover:text-gray-600 text-xs">清除</button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-amber-100/60 bg-amber-50/30">
          <button
            onClick={async () => { await onDelete(task.id); onClose(); }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <TrashIcon size={14} />
            删除
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || !dirty}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 transition-all shadow-sm"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────

export default function SundayApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>('active');
  const [filterAssignee, setFilterAssignee] = useState('');

  // Create task form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState('zhilong');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newReminderDate, setNewReminderDate] = useState('');

  // Detail modal
  const [detailTask, setDetailTask] = useState<Task | null>(null);

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

  const toggleStatus = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't open detail
    const nextStatus = STATUS_FLOW[task.status];
    if (!nextStatus) return;
    await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    await fetchTasks();
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
        description: newDescription.trim(),
        assignee: newAssignee,
        priority: newPriority,
        due_date: newDueDate || null,
        tags: serializeTags(newTags),
        reminder_date: newReminderDate || null,
        status: 'approved',
      }),
    });
    setNewTitle('');
    setNewDescription('');
    setNewDueDate('');
    setNewTags([]);
    setNewReminderDate('');
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

  // Group tasks by due_date for schedule view
  const grouped = (() => {
    const groups: Record<string, Task[]> = {};
    for (const t of filtered) {
      const key = t.due_date || '_no_date';
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    }
    // Sort date keys: real dates first (ascending), then _no_date last
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a === '_no_date') return 1;
      if (b === '_no_date') return -1;
      return a.localeCompare(b);
    });
    return sortedKeys.map((key) => ({ dateKey: key, tasks: groups[key] }));
  })();

  const formatDateHeader = (dateKey: string) => {
    if (dateKey === '_no_date') return { weekday: '', day: '', month: '', isToday: false, label: '未定' };
    const d = new Date(dateKey + 'T12:00:00'); // noon to avoid TZ issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isToday = today.getTime() === taskDate.getTime();
    const isTomorrow = taskDate.getTime() - today.getTime() === 86400000;
    const isYesterday = today.getTime() - taskDate.getTime() === 86400000;
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return {
      weekday: isToday ? '今天' : isTomorrow ? '明天' : isYesterday ? '昨天' : `周${weekdays[d.getDay()]}`,
      day: String(d.getDate()),
      month: months[d.getMonth()],
      isToday,
      label: '',
    };
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

        {/* Schedule View — grouped by date */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CozyHouse size={88} />
            <p className="mt-4 text-amber-600/60 text-sm">
              {filterTab === 'done' ? '还没有完成的任务' : '没有待办事项，享受周末吧！'}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {grouped.map(({ dateKey, tasks: dateTasks }) => {
              const dh = formatDateHeader(dateKey);
              return (
                <div key={dateKey} className="flex gap-0">
                  {/* Date column — sticky left side */}
                  <div className="w-16 shrink-0 pt-3 pr-3 text-right">
                    {dh.label ? (
                      <span className="text-xs font-medium text-amber-400">{dh.label}</span>
                    ) : (
                      <>
                        <div className={`text-[11px] font-semibold tracking-wide ${dh.isToday ? 'text-amber-600' : 'text-amber-400'}`}>
                          {dh.weekday}
                        </div>
                        <div className={`text-2xl font-bold leading-tight ${dh.isToday ? 'text-white bg-amber-500 rounded-full w-9 h-9 flex items-center justify-center ml-auto' : 'text-amber-800'}`}>
                          {dh.day}
                        </div>
                        <div className="text-[10px] text-amber-400 mt-0.5">{dh.month}</div>
                      </>
                    )}
                  </div>

                  {/* Tasks column */}
                  <div className="flex-1 border-l-2 border-amber-200/40 pl-4 pb-6 space-y-2">
                    {dateTasks.map((task) => {
                      const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['approved'];
                      const assignee = ASSIGNEES.find((a) => a.id === task.assignee) || ASSIGNEES[0];

                      return (
                        <div
                          key={task.id}
                          onClick={() => setDetailTask(task)}
                          className={`group bg-white/90 rounded-xl p-3.5 shadow-sm border border-amber-100/60 transition-all hover:shadow-md hover:bg-white cursor-pointer ${
                            task.status === 'done' ? 'opacity-55' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Status toggle */}
                            <button
                              onClick={(e) => toggleStatus(task, e)}
                              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                                task.status === 'done'
                                  ? 'bg-emerald-400 border-emerald-400 text-white'
                                  : task.status === 'in-progress'
                                  ? 'border-amber-400 bg-amber-50 hover:bg-amber-100'
                                  : 'border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                              }`}
                            >
                              {task.status === 'done' && <CheckIcon size={12} />}
                              {task.status === 'in-progress' && (
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                  {task.title}
                                </span>
                                <PriorityDot level={task.priority} size={4} />
                              </div>

                              {task.description && (
                                <p className="text-xs text-gray-400 mb-1 line-clamp-1">{task.description}</p>
                              )}

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${assignee.chipBg} ${assignee.chipText}`}>
                                  <assignee.Icon size={9} />
                                  {assignee.name}
                                </span>
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                                  {status.label}
                                </span>
                                {parseTags((task as any).tags).map((tagId) => {
                                  const tc = getTagConfig(tagId);
                                  return (
                                    <span key={tagId} className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${tc.bg} ${tc.text}`}>
                                      {tc.id}
                                    </span>
                                  );
                                })}
                                {(task as any).reminder_date && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-500">
                                    <BellIcon size={9} />
                                    {(task as any).reminder_date}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      {!showCreate && !detailTask && (
        <button
          onClick={() => setShowCreate(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-lg shadow-amber-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <PlusIcon size={28} />
        </button>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <TaskDetail
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
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

            {/* Title */}
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="要做什么？"
              className="w-full px-4 py-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-gray-800 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300/50 mb-3 text-[15px]"
              autoFocus
            />

            {/* Description (optional) */}
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="详细内容（可选）"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-amber-50/30 border border-amber-200/30 text-sm text-gray-700 placeholder-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none mb-4"
            />

            {/* Tags */}
            <div className="mb-4">
              <label className="text-sm text-amber-600 mb-1.5 block">标签</label>
              <TagPicker selected={newTags} onChange={setNewTags} />
            </div>

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

            {/* Reminder */}
            <div className="flex items-center gap-2 mb-5">
              <BellIcon size={14} className="text-amber-500 shrink-0" />
              <label className="text-sm text-amber-600 shrink-0">提醒日期</label>
              <input
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-200/50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              />
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
          from { transform: translateY(100%); opacity: 0.5; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
