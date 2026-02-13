import type { Task, CronJob } from '../types';

interface AgentsViewProps {
  tasks: Task[];
  cronJobs: CronJob[];
}

interface AgentDef {
  id: string;
  emoji: string;
  name: string;
  nameCn: string;
  description: string;
  projectMatch: (p: string) => boolean;
  cronMatch: (name: string) => boolean;
}

const AGENTS: AgentDef[] = [
  {
    id: 'polymarket',
    emoji: '📈',
    name: 'Polymarket',
    nameCn: '交易小五',
    description: 'Trading & market monitoring',
    projectMatch: (p) => /polymarket|trading/i.test(p),
    cronMatch: (n) => /polymarket|trading|market/i.test(n),
  },
  {
    id: 'hu',
    emoji: '🀄',
    name: 'HU',
    nameCn: '游戏小五',
    description: 'Mahjong roguelike game dev',
    projectMatch: (p) => /^hu$/i.test(p),
    cronMatch: (n) => /\bhu\b/i.test(n),
  },
  {
    id: 'aspen',
    emoji: '📊',
    name: 'Aspen',
    nameCn: '量化小五',
    description: 'AI quant trading app',
    projectMatch: (p) => /aspen|atrade|nofx/i.test(p),
    cronMatch: (n) => /aspen|atrade|nofx/i.test(n),
  },
  {
    id: 'artist',
    emoji: '🍌',
    name: 'Artist',
    nameCn: '创作小五',
    description: 'Image & content generation',
    projectMatch: (p) => /artist|image|banana/i.test(p),
    cronMatch: (n) => /artist|image|banana/i.test(n),
  },
  {
    id: 'fridaytask',
    emoji: '📋',
    name: 'FridayTask',
    nameCn: '任务小五',
    description: 'Task management system',
    projectMatch: (p) => /friday|task/i.test(p),
    cronMatch: (n) => /friday|task/i.test(n),
  },
  {
    id: 'knowledge',
    emoji: '📚',
    name: 'Knowledge',
    nameCn: '学习小五',
    description: 'Daily knowledge push & learning',
    projectMatch: (p) => /knowledge|learn|study/i.test(p),
    cronMatch: (n) => /knowledge|learn|study|daily.*news|ai.*news/i.test(n),
  },
];

function StatusBadge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-[#e6f4ea] text-[#1e8e3e]',
    yellow: 'bg-[#fef7e0] text-[#e37400]',
    gray: 'bg-[#f1f3f4] text-[#70757a]',
    blue: 'bg-[#e8f0fe] text-[#1a73e8]',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

function getAgentStatus(agentTasks: Task[]): { label: string; color: string } {
  const active = agentTasks.filter((t) => t.status === 'in-progress');
  if (active.length > 0) return { label: `Working (${active.length})`, color: 'green' };
  const approved = agentTasks.filter((t) => t.status === 'approved');
  if (approved.length > 0) return { label: `Pending (${approved.length})`, color: 'yellow' };
  return { label: 'Idle', color: 'gray' };
}

function formatCronSchedule(job: CronJob): string {
  if (job.schedule.kind === 'cron' && job.schedule.expr) return job.schedule.expr;
  if (job.schedule.kind === 'every') return 'recurring';
  return job.schedule.kind;
}

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function AgentsView({ tasks, cronJobs }: AgentsViewProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-[#3c4043]">小五 / Agents</h2>
        <span className="text-xs text-[#70757a]">{AGENTS.length} agents</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((agent) => {
          const agentTasks = tasks.filter((t) => agent.projectMatch(t.project || ''));
          const agentCrons = cronJobs.filter((j) => agent.cronMatch(j.name || ''));
          const status = getAgentStatus(agentTasks);
          const recentTasks = [...agentTasks]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 3);
          const doneTasks = agentTasks.filter((t) => t.status === 'done').length;

          return (
            <div
              key={agent.id}
              className="border border-[#dadce0] rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-medium text-sm text-[#3c4043]">{agent.name}</div>
                    <div className="text-[11px] text-[#70757a]">{agent.nameCn}</div>
                  </div>
                </div>
                <StatusBadge label={status.label} color={status.color} />
              </div>

              <p className="text-xs text-[#70757a] mb-3">{agent.description}</p>

              {/* Stats row */}
              <div className="flex gap-3 mb-3 text-[11px] text-[#70757a]">
                <span>{agentTasks.length} tasks</span>
                <span>·</span>
                <span>{doneTasks} done</span>
                <span>·</span>
                <span>{agentCrons.length} crons</span>
              </div>

              {/* Cron jobs */}
              {agentCrons.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1.5">Cron Jobs</div>
                  <div className="space-y-1">
                    {agentCrons.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center gap-2 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${job.enabled ? 'bg-[#1e8e3e]' : 'bg-[#dadce0]'}`} />
                        <span className="text-[#3c4043] truncate flex-1">{job.name || job.id}</span>
                        <span className="text-[#70757a] font-mono text-[10px]">{formatCronSchedule(job)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent tasks */}
              {recentTasks.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1.5">Recent Tasks</div>
                  <div className="space-y-1">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 text-[11px]">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          task.status === 'done' ? 'bg-[#1e8e3e]' :
                          task.status === 'in-progress' ? 'bg-[#1a73e8]' :
                          task.status === 'approved' ? 'bg-[#f9ab00]' :
                          'bg-[#dadce0]'
                        }`} />
                        <span className="text-[#3c4043] truncate flex-1">#{task.id} {task.title}</span>
                        {task.updated_at && (
                          <span className="text-[#70757a] text-[10px] shrink-0">
                            {formatRelativeTime(new Date(task.updated_at).getTime())}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {recentTasks.length === 0 && agentCrons.length === 0 && (
                <div className="text-center py-3 text-[11px] text-[#70757a]">
                  No tasks or crons yet
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
