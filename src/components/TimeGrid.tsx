import { useMemo, useEffect, useState, useRef } from 'react';
import type { Task, CronJob } from '../types';
import { formatDate } from '../utils/date';

interface TimeGridProps {
  dates: Date[];
  tasks: Task[];
  cronJobs: CronJob[];
  cronByDate: Record<string, CronJob[]>;
  tasksByDate: Record<string, Task[]>;
  onTaskClick: (task: Task) => void;
  onSlotClick: (date: string, time: string) => void;
  mode: 'day' | 'week';
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // px per hour

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function getAssigneeColor(assignee: string, status: string) {
  switch (status) {
    case 'pending':
      return { bg: 'bg-[#feefc3]', border: 'border-dashed border-[#b06000]/30', text: 'text-[#b06000]', solid: '#b06000' };
    case 'done':
      return { bg: 'bg-[#ceead6]', border: 'border-[#137333]/20', text: 'text-[#137333]', solid: '#137333' };
    case 'rejected':
      return { bg: 'bg-[#fce8e6]', border: 'border-[#c5221f]/20', text: 'text-[#c5221f]', solid: '#c5221f' };
    case 'in-progress':
      return { bg: 'bg-[#d2e3fc]', border: 'border-[#1967d2]/20', text: 'text-[#1967d2]', solid: '#1967d2' };
    case 'approved':
    default:
      return assignee === 'friday'
        ? { bg: 'bg-[#feefc3]', border: 'border-[#b06000]/20', text: 'text-[#b06000]', solid: '#b06000' }
        : { bg: 'bg-[#d2e3fc]', border: 'border-[#1967d2]/20', text: 'text-[#1967d2]', solid: '#1967d2' };
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return '#b06000';
    case 'approved': return '#1967d2';
    case 'in-progress': return '#1a73e8';
    case 'done': return '#137333';
    case 'rejected': return '#c5221f';
    default: return '#70757a';
  }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function TimeGrid({
  dates,
  tasks,
  cronJobs,
  cronByDate,
  tasksByDate,
  onTaskClick,
  onSlotClick,
  mode,
}: TimeGridProps) {
  const [now, setNow] = useState(new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const currentHour = new Date().getHours();
      const scrollTo = Math.max(0, (currentHour - 1) * HOUR_HEIGHT);
      gridRef.current.scrollTop = scrollTo;
    }
  }, []);

  const todayStr = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Collect all-day tasks for the visible dates
  const allDayByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    dates.forEach((d) => {
      const key = formatDate(d);
      const dayTasks = tasksByDate[key] || [];
      map[key] = dayTasks.filter((t) => t.all_day === 1 || (!t.start_time));
    });
    return map;
  }, [dates, tasksByDate]);

  // Timed tasks
  const timedByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    dates.forEach((d) => {
      const key = formatDate(d);
      const dayTasks = tasksByDate[key] || [];
      map[key] = dayTasks.filter((t) => t.all_day === 0 && t.start_time);
    });
    return map;
  }, [dates, tasksByDate]);

  const hasAnyAllDay = dates.some((d) => {
    const key = formatDate(d);
    return (allDayByDate[key]?.length || 0) > 0 || (cronByDate[key]?.length || 0) > 0;
  });

  const isDay = mode === 'day';
  const colCount = dates.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-[#dadce0] shrink-0">
        {/* Time gutter */}
        <div className="w-16 shrink-0" />

        {/* Day columns headers */}
        <div className={`flex-1 grid`} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
          {dates.map((d, i) => {
            const dateStr = formatDate(d);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={i}
                className={`text-center py-2 border-l border-[#dadce0] first:border-l-0`}
              >
                <div className={`text-[11px] font-medium tracking-widest uppercase ${isToday ? 'text-[#1a73e8]' : 'text-[#70757a]'}`}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </div>
                <div
                  className={`text-2xl font-light mt-0.5 w-11 h-11 flex items-center justify-center mx-auto rounded-full
                    ${isToday ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}`}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        {/* Scrollbar spacer */}
        <div className="w-2 shrink-0" />
      </div>

      {/* All-day section */}
      {hasAnyAllDay && (
        <div className="flex border-b border-[#dadce0] shrink-0 bg-[#f8f9fa]">
          <div className="w-16 shrink-0 flex items-center justify-end pr-2">
            <span className="text-[10px] text-[#70757a] uppercase tracking-wide">All Day</span>
          </div>
          <div className={`flex-1 grid py-1`} style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {dates.map((d, i) => {
              const key = formatDate(d);
              const dayAllDay = allDayByDate[key] || [];
              const dayCrons = cronByDate[key] || [];
              return (
                <div key={i} className="px-1 border-l border-[#dadce0] first:border-l-0 flex flex-col gap-0.5 min-h-[28px]">
                  {dayAllDay.map((task) => {
                    const colors = getAssigneeColor(task.assignee, task.status);
                    return (
                      <button
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className={`w-full text-left px-2 py-0.5 rounded-md text-xs truncate border transition-all
                          hover:opacity-80 active:scale-[0.98]
                          ${colors.bg} ${colors.border} ${colors.text}
                          ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        />
                        {task.title}
                      </button>
                    );
                  })}
                  {dayCrons.map((job) => (
                    <div
                      key={job.id}
                      className="w-full px-2 py-0.5 rounded-md text-xs truncate
                        bg-[#e8dff5] text-[#7627bb] border border-dashed border-[#7627bb]/30"
                      title={`Cron: ${job.name} (${job.schedule.expr})`}
                    >
                      ⟳ {job.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="w-2 shrink-0" />
        </div>
      )}

      {/* Scrollable time grid */}
      <div ref={gridRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="flex relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-[11px] text-[#70757a] leading-none"
                style={{ top: h * HOUR_HEIGHT - 5 }}
              >
                {h > 0 ? formatHour(h) : ''}
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div className="flex-1 relative" style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {dates.map((d, colIdx) => {
              const key = formatDate(d);
              const isToday = key === todayStr;
              const timedTasks = timedByDate[key] || [];

              return (
                <div
                  key={colIdx}
                  className={`relative border-l border-[#dadce0] first:border-l-0`}
                >
                  {/* Hour lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 border-t border-[#dadce0] cursor-pointer hover:bg-[#f1f3f4] transition-colors"
                      style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                      onClick={() => {
                        const timeStr = `${String(h).padStart(2, '0')}:00`;
                        onSlotClick(key, timeStr);
                      }}
                    />
                  ))}

                  {/* Current time indicator */}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: (currentMinutes / 60) * HOUR_HEIGHT }}
                    >
                      <div className="relative flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] -ml-1 time-indicator-dot" />
                        <div className="flex-1 h-[2px] bg-[#ea4335]" />
                      </div>
                    </div>
                  )}

                  {/* Timed tasks */}
                  {timedTasks.map((task) => {
                    const startMin = timeToMinutes(task.start_time!);
                    const endMin = task.end_time ? timeToMinutes(task.end_time) : startMin + 60;
                    const top = (startMin / 60) * HOUR_HEIGHT;
                    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24);
                    const colors = getAssigneeColor(task.assignee, task.status);

                    return (
                      <button
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className={`absolute left-1 right-1 z-10 rounded-lg px-2 py-1 text-left overflow-hidden
                          border transition-all hover:opacity-80 hover:shadow-md active:scale-[0.99]
                          ${colors.bg} ${colors.border} ${colors.text}
                          ${task.status === 'done' ? 'opacity-60' : ''}`}
                        style={{ top, height }}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          />
                          <span className={`text-xs font-medium truncate ${task.status === 'done' ? 'line-through' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                        {height > 36 && (
                          <div className="text-[10px] opacity-70 mt-0.5">
                            {task.start_time}{task.end_time ? ` – ${task.end_time}` : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Scrollbar spacer */}
          <div className="w-2 shrink-0" />
        </div>
      </div>
    </div>
  );
}
