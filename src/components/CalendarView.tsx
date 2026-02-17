import { useState, useMemo } from 'react';
import type { Task, CronJob, ViewMode } from '../types';
import TimeGrid from './TimeGrid';
import { resolveAgent } from '../config/agents';
import {
  getMonthDays,
  getWeekDays,
  formatDate,
  isToday,
  isSameMonth,
  getMonthName,
  getDayName,
  getNextCronDates,
} from '../utils/date';

interface CalendarViewProps {
  tasks: Task[];
  cronJobs: CronJob[];
  onTaskClick: (task: Task) => void;
  onDateClick: (date: string, time?: string) => void;
  filterAssignee: string;
  filterStatus: string;
}

export default function CalendarView({
  tasks,
  cronJobs,
  onTaskClick,
  onDateClick,
  filterAssignee,
  filterStatus,
}: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDay, setSelectedDay] = useState(today);

  // Build task map by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      if (filterAssignee && resolveAgent(t.project, t.assignee).id !== filterAssignee) return;
      if (filterStatus && t.status !== filterStatus) return;
      const key = t.due_date;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks, filterAssignee, filterStatus]);

  // Build cron dates map
  const cronByDate = useMemo(() => {
    const map: Record<string, CronJob[]> = {};
    cronJobs.forEach((job) => {
      // Only process cron-type schedules with expr, skip 'every' and 'at' types
      if (job.schedule.kind !== 'cron' || !job.schedule.expr) return;
      const dates = getNextCronDates(job.schedule.expr, 90);
      dates.forEach((d) => {
        if (!map[d]) map[d] = [];
        map[d].push(job);
      });
    });
    return map;
  }, [cronJobs]);

  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(selectedDay), [selectedDay]);

  const goNext = () => {
    if (viewMode === 'month') {
      if (month === 11) { setMonth(0); setYear(year + 1); }
      else setMonth(month + 1);
    } else if (viewMode === 'week') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + 7);
      setSelectedDay(d);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    } else {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() + 1);
      setSelectedDay(d);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    }
  };

  const goPrev = () => {
    if (viewMode === 'month') {
      if (month === 0) { setMonth(11); setYear(year - 1); }
      else setMonth(month - 1);
    } else if (viewMode === 'week') {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() - 7);
      setSelectedDay(d);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    } else {
      const d = new Date(selectedDay);
      d.setDate(d.getDate() - 1);
      setSelectedDay(d);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    }
  };

  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
    setSelectedDay(t);
  };

  // Header title
  const headerTitle = (() => {
    if (viewMode === 'month') return `${getMonthName(month)} ${year}`;
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${getMonthName(start.getMonth())} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${getMonthName(start.getMonth())} ${start.getDate()} – ${getMonthName(end.getMonth())} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  })();

  // Task pill color based on status
  const getTaskPillClasses = (task: Task) => {
    switch (task.status) {
      case 'pending':
        return 'bg-[#feefc3] text-[#b06000] border border-dashed border-[#b06000]/30';
      case 'approved':
        return 'bg-[#d2e3fc] text-[#1967d2]';
      case 'in-progress':
        return 'bg-[#d2e3fc] text-[#1967d2]';
      case 'done':
        return 'bg-[#ceead6] text-[#137333]';
      case 'rejected':
        return 'bg-[#fce8e6] text-[#c5221f]';
      default:
        return 'bg-[#d2e3fc] text-[#1967d2]';
    }
  };

  // Status icon for pills
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'in-progress': return '◑';
      case 'done': return '✓';
      case 'rejected': return '✕';
      default: return '';
    }
  };

  // Mobile-friendly view labels
  const getViewLabel = (v: ViewMode, short: boolean) => {
    if (!short) return v;
    switch (v) {
      case 'day': return 'D';
      case 'week': return 'W';
      case 'month': return 'M';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar — Google Calendar Style */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-4 sm:pb-5 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Today button — outlined style */}
          <button
            onClick={goToday}
            className="px-3 sm:px-4 py-1.5 rounded-2xl border border-[#dadce0] text-xs sm:text-sm font-medium text-[#3c4043]
              hover:bg-[#f1f3f4] transition-colors"
          >
            Today
          </button>

          {/* Navigation arrows */}
          <div className="flex gap-0.5 sm:gap-1">
            <button
              onClick={goPrev}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a]"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a]"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-xl font-semibold text-[#3c4043] tracking-wide">
            {headerTitle}
          </h2>
        </div>

        {/* View Toggle — pill-shaped selector */}
        <div className="flex gap-0.5 bg-[#f1f3f4] rounded-2xl p-0.5 sm:p-1 border border-[#dadce0]">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-all
                ${viewMode === v
                  ? 'bg-[#1a73e8] text-white shadow-sm'
                  : 'text-[#70757a] hover:text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
            >
              <span className="hidden sm:inline capitalize">{v}</span>
              <span className="sm:hidden">{getViewLabel(v, true)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {viewMode === 'month' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day headers — small caps, light weight */}
          <div className="grid grid-cols-7 border-b border-[#dadce0] shrink-0">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="text-center text-[11px] font-medium text-[#70757a] py-2.5 uppercase tracking-widest">
                {getDayName(i)}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 flex-1 border-l border-[#dadce0]">
            {monthDays.map((day, idx) => {
              const dateStr = formatDate(day);
              const dayTasks = tasksByDate[dateStr] || [];
              const dayCrons = cronByDate[dateStr] || [];
              const inMonth = isSameMonth(day, year, month);
              const todayMatch = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => onDateClick(dateStr)}
                  className={`min-h-[110px] p-2 border-b border-r border-[#dadce0] transition-colors cursor-pointer
                    hover:bg-[#f1f3f4]
                    ${!inMonth ? 'bg-white' : 'bg-white'}`}
                >
                  {/* Date number */}
                  <div className="flex items-start mb-1.5">
                    <span
                      className={`text-xs w-6 h-6 flex items-center justify-center rounded-full
                        ${todayMatch
                          ? 'bg-[#1a73e8] text-white font-semibold'
                          : inMonth
                            ? 'text-[#3c4043] font-normal'
                            : 'text-[#dadce0] font-normal'
                        }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Task pills */}
                  <div className="flex flex-col gap-[3px]">
                    {dayTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={`w-full text-left px-2 py-[3px] rounded-md text-[11px] font-medium
                          hover:opacity-80 transition-all truncate flex items-center gap-1
                          ${getTaskPillClasses(task)}
                          ${task.status === 'done' ? 'opacity-60 line-through' : ''}
                          ${task.status === 'pending' ? 'opacity-75' : ''}`}
                      >
                        {task.status === 'in-progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1967d2] status-pulse shrink-0" />
                        )}
                        {getStatusIcon(task.status) && task.status !== 'in-progress' && (
                          <span className="shrink-0">{getStatusIcon(task.status)}</span>
                        )}
                        {task.start_time && !task.all_day ? (
                          <span className="opacity-70">
                            {task.start_time.replace(/^0/, '')}
                          </span>
                        ) : null}
                        <span className="truncate">{task.title}</span>
                        {task.subtask_count > 0 && (
                          <span className="ml-auto text-[9px] opacity-60 shrink-0">
                            {task.subtask_completed}/{task.subtask_count}
                          </span>
                        )}
                      </button>
                    ))}

                    {/* Cron jobs — purple pill with dashed left border */}
                    {dayCrons.slice(0, 2).map((job) => (
                      <div
                        key={job.id}
                        className="w-full px-2 py-[3px] rounded-md text-[11px] font-medium truncate
                          bg-[#e8dff5] text-[#7627bb] border-l-2 border-dashed border-l-[#7627bb]/50"
                        title={`Cron: ${job.name} (${job.schedule.expr})`}
                      >
                        ⟳ {job.name}
                      </div>
                    ))}

                    {/* Overflow */}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-[#70757a] pl-1 font-medium">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day & Week views — use TimeGrid */
        <TimeGrid
          dates={viewMode === 'day' ? [selectedDay] : weekDays}
          tasks={tasks}
          cronJobs={cronJobs}
          cronByDate={cronByDate}
          tasksByDate={tasksByDate}
          onTaskClick={onTaskClick}
          onSlotClick={(date, time) => onDateClick(date, time)}
          mode={viewMode}
        />
      )}
    </div>
  );
}
