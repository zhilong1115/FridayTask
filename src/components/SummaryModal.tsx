import { useState, useMemo } from 'react';
import type { Task } from '../types';

type Period = 'today' | 'week' | 'month' | 'ytd';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export default function SummaryModal({ isOpen, onClose, tasks }: SummaryModalProps) {
  const [period, setPeriod] = useState<Period>('today');

  const periods: { key: Period; label: string; icon: string }[] = [
    { key: 'today', label: 'Today', icon: '📅' },
    { key: 'week', label: 'This Week', icon: '📆' },
    { key: 'month', label: 'This Month', icon: '🗓️' },
    { key: 'ytd', label: 'YTD', icon: '📊' },
  ];

  const summary = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Week start (Monday)
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const cutoff = {
      today,
      week: weekStart,
      month: monthStart,
      ytd: yearStart,
    }[period];

    // Filter tasks that were updated/created within the period
    const filtered = tasks.filter((t) => {
      const updated = new Date(t.updated_at);
      return updated >= cutoff;
    });

    const done = filtered.filter((t) => t.status === 'done');
    const inProgress = filtered.filter((t) => t.status === 'in-progress');
    const approved = filtered.filter((t) => t.status === 'approved');
    const pending = filtered.filter((t) => t.status === 'pending');

    // Group done tasks by project
    const byProject: Record<string, Task[]> = {};
    done.forEach((t) => {
      const proj = t.project || 'Uncategorized';
      if (!byProject[proj]) byProject[proj] = [];
      byProject[proj].push(t);
    });

    // Group active tasks by project
    const activeByProject: Record<string, Task[]> = {};
    [...inProgress, ...approved].forEach((t) => {
      const proj = t.project || 'Uncategorized';
      if (!activeByProject[proj]) activeByProject[proj] = [];
      activeByProject[proj].push(t);
    });

    return { filtered, done, inProgress, approved, pending, byProject, activeByProject };
  }, [tasks, period]);

  if (!isOpen) return null;

  const projectEmojis: Record<string, string> = {
    'Aspen': '🌲',
    'Task App': '✅',
    'Clawdbot': '🤖',
    'Uncategorized': '📁',
  };

  const getProjectEmoji = (proj: string) => projectEmojis[proj] || '📂';

  const assigneeEmoji = (a: string) => a === 'friday' ? '🤖' : '🧑‍💻';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#dadce0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Period tabs */}
        <div className="px-7 pt-4 pb-2 flex gap-2 shrink-0">
          {periods.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
                ${period === key
                  ? 'bg-[#e8f0fe] text-[#1a73e8] ring-1 ring-[#1a73e8]/30'
                  : 'bg-[#f1f3f4] text-[#70757a] hover:text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-7 py-4">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Done', count: summary.done.length, color: 'text-[#137333]', bg: 'bg-[#ceead6]' },
              { label: 'Active', count: summary.inProgress.length, color: 'text-[#1967d2]', bg: 'bg-[#d2e3fc]' },
              { label: 'Queued', count: summary.approved.length, color: 'text-[#1967d2]', bg: 'bg-[#d2e3fc]/60' },
              { label: 'Pending', count: summary.pending.length, color: 'text-[#b06000]', bg: 'bg-[#feefc3]' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <div className={`text-xl font-bold ${color}`}>{count}</div>
                <div className="text-[10px] font-medium text-[#70757a] uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Completed by project */}
          {Object.keys(summary.byProject).length > 0 && (
            <div className="mb-5">
              <h3 className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-sm">✅</span> Completed
              </h3>
              {Object.entries(summary.byProject)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([project, projectTasks]) => (
                  <div key={project} className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{getProjectEmoji(project)}</span>
                      <span className="text-xs font-semibold text-[#3c4043]">{project}</span>
                      <span className="text-[10px] text-[#70757a] bg-[#f1f3f4] px-1.5 py-0.5 rounded-full">
                        {projectTasks.length}
                      </span>
                    </div>
                    <ul className="ml-7 space-y-1">
                      {projectTasks.map((t) => (
                        <li key={t.id} className="flex items-start gap-2 text-sm text-[#3c4043]">
                          <span className="text-[#137333] mt-0.5 shrink-0">•</span>
                          <span className="flex-1">
                            {t.title}
                            <span className="ml-1.5 text-[10px] text-[#70757a]">{assigneeEmoji(t.assignee)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}

          {/* Active / Queued by project */}
          {Object.keys(summary.activeByProject).length > 0 && (
            <div className="mb-5">
              <h3 className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="text-sm">🔄</span> In Progress / Queued
              </h3>
              {Object.entries(summary.activeByProject)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([project, projectTasks]) => (
                  <div key={project} className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">{getProjectEmoji(project)}</span>
                      <span className="text-xs font-semibold text-[#3c4043]">{project}</span>
                      <span className="text-[10px] text-[#70757a] bg-[#f1f3f4] px-1.5 py-0.5 rounded-full">
                        {projectTasks.length}
                      </span>
                    </div>
                    <ul className="ml-7 space-y-1">
                      {projectTasks.map((t) => (
                        <li key={t.id} className="flex items-start gap-2 text-sm text-[#3c4043]">
                          <span className={`mt-0.5 shrink-0 ${t.status === 'in-progress' ? 'text-[#1967d2]' : 'text-[#70757a]'}`}>
                            {t.status === 'in-progress' ? '◑' : '○'}
                          </span>
                          <span className="flex-1">
                            {t.title}
                            <span className="ml-1.5 text-[10px] text-[#70757a]">{assigneeEmoji(t.assignee)}</span>
                            {t.status === 'in-progress' && (
                              <span className="ml-1 text-[10px] text-[#1967d2] bg-[#d2e3fc] px-1.5 py-0.5 rounded-full">active</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}

          {/* Empty state */}
          {summary.filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">🌤️</span>
              <p className="text-sm text-[#70757a]">No tasks in this period</p>
            </div>
          )}

          {summary.filtered.length > 0 && summary.done.length === 0 && Object.keys(summary.activeByProject).length === 0 && (
            <div className="text-center py-8">
              <span className="text-3xl mb-2 block">📝</span>
              <p className="text-sm text-[#70757a]">
                {summary.pending.length} task{summary.pending.length !== 1 ? 's' : ''} pending approval
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
