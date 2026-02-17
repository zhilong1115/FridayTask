import { useMemo } from 'react';
import type { Task, CronJob, TaskStatus } from '../types';
import { resolveAgent, type AgentConfig } from '../config/agents';
import { AgentIcon } from './AgentIcons';

interface ListViewProps {
  tasks: Task[];
  cronJobs: CronJob[];
  onTaskClick: (task: Task) => void;
  filterAssignee: string;
  filterStatus: string;
}

export default function ListView({
  tasks,
  cronJobs,
  onTaskClick,
  filterAssignee,
  filterStatus,
}: ListViewProps) {
  const groupedTasks = useMemo(() => {
    let result = [...tasks];
    if (filterAssignee) {
      // Filter by agent: match project or assignee
      result = result.filter((t) => {
        const agent = resolveAgent(t.project, t.assignee);
        return agent.id === filterAssignee;
      });
    }
    if (filterStatus) result = result.filter((t) => t.status === filterStatus);

    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const statusOrder: Record<TaskStatus, number> = { pending: 0, approved: 1, 'in-progress': 2, done: 3, rejected: 4 };
    result.sort((a, b) => {
      const po = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (po !== 0) return po;
      const so = statusOrder[a.status] - statusOrder[b.status];
      if (so !== 0) return so;
      return (a.due_date || '').localeCompare(b.due_date || '');
    });

    // Group by agent
    const groups: { agent: AgentConfig; tasks: Task[] }[] = [];
    const agentMap = new Map<string, Task[]>();
    const agentConfigMap = new Map<string, AgentConfig>();

    for (const task of result) {
      const agent = resolveAgent(task.project, task.assignee);
      if (!agentMap.has(agent.id)) {
        agentMap.set(agent.id, []);
        agentConfigMap.set(agent.id, agent);
      }
      agentMap.get(agent.id)!.push(task);
    }

    for (const [id, taskList] of agentMap) {
      groups.push({ agent: agentConfigMap.get(id)!, tasks: taskList });
    }

    return groups;
  }, [tasks, filterAssignee, filterStatus]);

  const priorityBadge = (p: string) => {
    if (p === 'high') return 'bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/20';
    if (p === 'medium') return 'bg-[#feefc3] text-[#b06000] border-[#b06000]/20';
    return 'bg-[#f1f3f4] text-[#70757a] border-[#dadce0]';
  };

  const statusConfig: Record<TaskStatus, { icon: string; color: string }> = {
    pending: { icon: '⏳', color: 'text-[#b06000]' },
    approved: { icon: '✔', color: 'text-[#1967d2]' },
    'in-progress': { icon: '◑', color: 'text-[#1a73e8]' },
    done: { icon: '✓', color: 'text-[#137333]' },
    rejected: { icon: '✕', color: 'text-[#c5221f]' },
  };

  const formatDue = (date: string | null) => {
    if (!date) return 'No date';
    const d = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff < -1) return `${-diff}d ago`;
    if (diff <= 7) return `In ${diff}d`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dueColor = (date: string | null) => {
    if (!date) return 'text-[#70757a]';
    const d = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'text-[#c5221f]';
    if (diff === 0) return 'text-[#1a73e8]';
    return 'text-[#70757a]';
  };

  const allTasks = groupedTasks.flatMap((g) => g.tasks);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h2 className="text-xl font-semibold text-[#3c4043] tracking-wide px-1 pb-1">All Tasks</h2>

      {groupedTasks.map(({ agent, tasks: agentTasks }) => (
        <div key={agent.id}>
          {/* Agent header */}
          <div className="flex items-center gap-2.5 px-2 mb-2">
            <AgentIcon agentId={agent.id} size={20} />
            <h3 className="text-sm font-semibold text-[#3c4043]">{agent.label}</h3>
            <span className="text-xs text-[#70757a]">{agentTasks.length}</span>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-1.5">
            {agentTasks.map((task) => {
              const si = statusConfig[task.status];
              const isPending = task.status === 'pending';
              const isDone = task.status === 'done';
              const isRejected = task.status === 'rejected';
              return (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`w-full text-left px-4 py-3.5 rounded-lg bg-white
                    hover:bg-[#f1f3f4] hover:border-[#bdc1c6] transition-all group
                    ${isPending ? 'border border-dashed border-[#b06000]/30 opacity-80' : 'border border-[#dadce0]'}
                    ${isDone || isRejected ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <span className={`text-lg ${si.color} flex items-center`}>
                      {task.status === 'in-progress' ? (
                        <span className="relative flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#1a73e8] status-pulse" />
                        </span>
                      ) : si.icon}
                    </span>

                    {/* Agent color dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isDone ? 'line-through text-[#70757a]' : isRejected ? 'line-through text-[#c5221f]/60' : 'text-[#3c4043]'}`}>
                          {task.title}
                        </span>
                        {isPending && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#feefc3] text-[#b06000]">
                            PENDING
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-[#70757a] truncate mt-0.5">{task.description}</p>
                      )}
                      {/* Subtask progress */}
                      {task.subtask_count > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 max-w-[120px] h-1.5 bg-[#f1f3f4] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#137333] rounded-full transition-all duration-300"
                              style={{ width: `${(task.subtask_completed / task.subtask_count) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#70757a]">
                            {task.subtask_completed}/{task.subtask_count}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {task.start_time && !task.all_day && (
                        <span className="text-xs text-[#70757a]">
                          {task.start_time}
                        </span>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-2xl border ${priorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs ${dueColor(task.due_date)} w-16 text-right`}>
                        {formatDue(task.due_date)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {allTasks.length === 0 && (
        <div className="text-center py-20 text-[#70757a]">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm">No tasks match your filters</p>
        </div>
      )}

      {/* Cron Jobs Section */}
      {cronJobs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold text-[#70757a] uppercase tracking-[0.1em] px-2 mb-3">
            Scheduled Jobs
          </h3>
          <div className="flex flex-col gap-1.5">
            {cronJobs.map((job) => (
              <div
                key={job.id}
                className="px-4 py-3.5 rounded-lg border border-dashed border-[#7627bb]/25 bg-[#e8dff5]/30"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7627bb] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#7627bb]">{job.name}</div>
                    <div className="text-xs text-[#70757a] mt-0.5">
                      <code className="text-[#7627bb]/60">{job.schedule.expr}</code>
                      {job.state?.nextRunAtMs && (
                        <span className="ml-2">
                          · Next: {new Date(job.state.nextRunAtMs).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-2xl bg-[#e8dff5] text-[#7627bb] border border-[#7627bb]/20">
                    cron
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
