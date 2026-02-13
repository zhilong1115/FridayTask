import { useState, useEffect } from 'react';
import type { CronJob } from '../types';

interface AgentTask {
  id: number;
  title: string;
  status: string;
  project: string;
  updated_at: string;
}

interface AgentData {
  id: string;
  emoji: string;
  name: string;
  nameCn: string;
  description: string;
  status: 'working' | 'pending' | 'idle';
  stats: {
    inProgress: number;
    approved: number;
    pending: number;
    done: number;
    total: number;
  };
  recentTasks: AgentTask[];
  lastDoneAt: string | null;
}

interface AgentsViewProps {
  tasks: unknown[];
  cronJobs: CronJob[];
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: string; label: string; cls: string }> = {
    working: { icon: '🟢', label: 'Working', cls: 'bg-[#e6f4ea] text-[#1e8e3e]' },
    pending: { icon: '🟡', label: 'Pending', cls: 'bg-[#fef7e0] text-[#e37400]' },
    idle: { icon: '⚪', label: 'Idle', cls: 'bg-[#f1f3f4] text-[#70757a]' },
  };
  const c = config[status] || config.idle;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

function TaskStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    done: 'bg-[#1e8e3e]',
    'in-progress': 'bg-[#1a73e8]',
    approved: 'bg-[#f9ab00]',
    pending: 'bg-[#dadce0]',
    rejected: 'bg-[#ea4335]',
  };
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[status] || 'bg-[#dadce0]'}`} />;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatCronSchedule(job: CronJob): string {
  if (job.schedule.kind === 'cron' && job.schedule.expr) return job.schedule.expr;
  if (job.schedule.kind === 'every') return 'recurring';
  return job.schedule.kind;
}

function AgentCard({ agent, cronJobs }: { agent: AgentData; cronJobs: CronJob[] }) {
  const [expanded, setExpanded] = useState(false);

  // Match crons by agent
  const cronMatchPatterns: Record<string, RegExp> = {
    polymarket: /polymarket|trading|market/i,
    hu: /\bhu\b/i,
    aspen: /aspen|atrade|nofx/i,
    artist: /artist|image|banana/i,
    fridaytask: /friday|task/i,
    knowledge: /knowledge|learn|study|daily.*news|ai.*news/i,
  };
  const cronPattern = cronMatchPatterns[agent.id];
  const agentCrons = cronPattern ? cronJobs.filter((j) => cronPattern.test(j.name || '')) : [];

  return (
    <div
      className={`border rounded-xl transition-all bg-white cursor-pointer select-none ${
        expanded ? 'border-[#f9ab00] shadow-md' : 'border-[#dadce0] hover:shadow-md'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{agent.emoji}</span>
            <div>
              <div className="font-medium text-sm text-[#3c4043]">{agent.name}</div>
              <div className="text-[11px] text-[#70757a]">{agent.nameCn}</div>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        <p className="text-xs text-[#70757a] mb-3">{agent.description}</p>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap text-[11px]">
          {agent.stats.inProgress > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#e8f0fe] text-[#1a73e8]">
              {agent.stats.inProgress} in progress
            </span>
          )}
          {(agent.stats.approved + agent.stats.pending) > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#fef7e0] text-[#e37400]">
              {agent.stats.approved + agent.stats.pending} queued
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-[#f1f3f4] text-[#70757a]">
            {agent.stats.done} done
          </span>
          {agentCrons.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-[#f1f3f4] text-[#70757a]">
              {agentCrons.length} crons
            </span>
          )}
        </div>

        {agent.lastDoneAt && (
          <div className="mt-2 text-[10px] text-[#70757a]">
            Last completed: {formatRelativeTime(agent.lastDoneAt)}
          </div>
        )}
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-[#dadce0] px-4 py-3 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Cron jobs */}
          {agentCrons.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1.5">
                Cron Jobs
              </div>
              <div className="space-y-1">
                {agentCrons.map((job) => (
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
          {agent.recentTasks.length > 0 ? (
            <div>
              <div className="text-[10px] font-semibold text-[#70757a] uppercase tracking-wider mb-1.5">
                Recent Tasks
              </div>
              <div className="space-y-1">
                {agent.recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-[11px]">
                    <TaskStatusDot status={task.status} />
                    <span className="text-[#3c4043] truncate flex-1">#{task.id} {task.title}</span>
                    {task.updated_at && (
                      <span className="text-[#70757a] text-[10px] shrink-0">
                        {formatRelativeTime(task.updated_at)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-[11px] text-[#70757a]">No tasks yet</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentsView({ cronJobs }: AgentsViewProps) {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents/status')
      .then((r) => r.json())
      .then((data) => {
        setAgents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const workingCount = agents.filter((a) => a.status === 'working').length;
  const pendingCount = agents.filter((a) => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#70757a] text-sm">
        <div className="w-5 h-5 border-2 border-[#f9ab00] border-t-transparent rounded-full animate-spin mr-3" />
        Loading agents...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-[#3c4043]">小五 / Agents</h2>
        <span className="text-xs text-[#70757a]">
          {agents.length} agents
          {workingCount > 0 && <span className="ml-1">· {workingCount} working</span>}
          {pendingCount > 0 && <span className="ml-1">· {pendingCount} pending</span>}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} cronJobs={cronJobs} />
        ))}
      </div>
    </div>
  );
}
