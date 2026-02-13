import { useState, useEffect, useMemo } from 'react';
import type { Task, CronJob } from '../types';

interface AgentsViewProps {
  tasks: Task[];
  cronJobs: CronJob[];
}

interface AgentDef {
  id: string;
  emoji: string;
  name: string;
  projectPatterns: RegExp[];
}

interface AgentCron {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { kind: string; expr?: string };
  lastRun?: { status: string; time: string };
  nextRun?: string;
}

const AGENTS: AgentDef[] = [
  { id: 'polymarket', emoji: '📈', name: 'Polymarket', projectPatterns: [/polymarket/i, /trading/i] },
  { id: 'hu', emoji: '🀄', name: 'HU', projectPatterns: [/\bhu\b/i, /game/i] },
  { id: 'aspen', emoji: '📊', name: 'Aspen', projectPatterns: [/aspen/i, /quant/i, /atrade/i, /nofx/i] },
  { id: 'artist', emoji: '🍌', name: 'Artist', projectPatterns: [/artist/i, /design/i, /avatar/i, /image/i, /banana/i] },
  { id: 'fridaytask', emoji: '📋', name: 'FridayTask', projectPatterns: [/friday/i, /infra/i, /\btask\b/i] },
  { id: 'knowledge', emoji: '📚', name: 'Knowledge', projectPatterns: [/knowledge/i, /learning/i, /ai-push/i, /finance-push/i, /learn/i, /study/i] },
];

type SubTab = 'completed' | 'working' | 'pending' | 'cron';

function matchAgent(task: Task, agent: AgentDef): boolean {
  if (task.assignee !== 'friday') return false;
  const project = task.project || '';
  return agent.projectPatterns.some((p) => p.test(project));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatElapsed(startStr: string): string {
  const diff = Date.now() - new Date(startStr).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ${Math.floor((diff % 3_600_000) / 60_000)}m`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function formatTimeSpent(task: Task): string {
  if (task.start_time && task.end_time) {
    const [sh, sm] = task.start_time.split(':').map(Number);
    const [eh, em] = task.end_time.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins > 0) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  }
  return '—';
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    high: 'bg-[#fce8e6] text-[#c5221f]',
    medium: 'bg-[#fef7e0] text-[#e37400]',
    low: 'bg-[#e6f4ea] text-[#1e8e3e]',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${config[priority] || config.medium}`}>
      {priority}
    </span>
  );
}

export default function AgentsView({ tasks, cronJobs }: AgentsViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [subTab, setSubTab] = useState<SubTab>('working');
  const [agentCrons, setAgentCrons] = useState<AgentCron[]>([]);
  const [cronsLoading, setCronsLoading] = useState(false);

  // Compute tasks per agent
  const agentTasks = useMemo(() => {
    const map: Record<string, { completed: Task[]; working: Task[]; pending: Task[] }> = {};
    for (const agent of AGENTS) {
      map[agent.id] = { completed: [], working: [], pending: [] };
    }
    for (const task of tasks) {
      for (const agent of AGENTS) {
        if (matchAgent(task, agent)) {
          if (task.status === 'done') map[agent.id].completed.push(task);
          else if (task.status === 'in-progress') map[agent.id].working.push(task);
          else if (task.status === 'approved' || task.status === 'pending') map[agent.id].pending.push(task);
        }
      }
    }
    return map;
  }, [tasks]);

  // Cron count per agent (from cronJobs prop)
  const cronMatchPatterns: Record<string, RegExp> = {
    polymarket: /polymarket|trading|market/i,
    hu: /\bhu\b/i,
    aspen: /aspen|atrade|nofx/i,
    artist: /artist|image|banana/i,
    fridaytask: /friday|task/i,
    knowledge: /knowledge|learn|study|daily.*news|ai.*news/i,
  };

  const agentCronCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const agent of AGENTS) {
      const pattern = cronMatchPatterns[agent.id];
      counts[agent.id] = pattern ? cronJobs.filter((j) => pattern.test(j.name || '')).length : 0;
    }
    return counts;
  }, [cronJobs]);

  // Default select first agent with active tasks
  useEffect(() => {
    if (!selectedAgent) {
      const active = AGENTS.find((a) => agentTasks[a.id]?.working.length > 0);
      const withPending = AGENTS.find((a) => agentTasks[a.id]?.pending.length > 0);
      setSelectedAgent((active || withPending || AGENTS[0]).id);
    }
  }, [agentTasks, selectedAgent]);

  // Fetch crons when agent or tab changes
  useEffect(() => {
    if (subTab === 'cron' && selectedAgent) {
      setCronsLoading(true);
      fetch(`/api/agents/${selectedAgent}/crons`)
        .then((r) => r.json())
        .then((data) => {
          setAgentCrons(Array.isArray(data) ? data : []);
          setCronsLoading(false);
        })
        .catch(() => {
          // Fallback: filter from cronJobs prop
          const pattern = cronMatchPatterns[selectedAgent];
          const matched = pattern ? cronJobs.filter((j) => pattern.test(j.name || '')) : [];
          setAgentCrons(matched as unknown as AgentCron[]);
          setCronsLoading(false);
        });
    }
  }, [subTab, selectedAgent, cronJobs]);

  const current = agentTasks[selectedAgent] || { completed: [], working: [], pending: [] };
  const tabCounts: Record<SubTab, number> = {
    completed: current.completed.length,
    working: current.working.length,
    pending: current.pending.length,
    cron: agentCronCounts[selectedAgent] || 0,
  };

  // Auto-select best subtab when agent changes
  useEffect(() => {
    if (current.working.length > 0) setSubTab('working');
    else if (current.pending.length > 0) setSubTab('pending');
    else if (current.completed.length > 0) setSubTab('completed');
    else setSubTab('cron');
  }, [selectedAgent]);

  const agentStatus = (id: string) => {
    const t = agentTasks[id];
    if (!t) return 'idle';
    if (t.working.length > 0) return 'working';
    if (t.pending.length > 0) return 'pending';
    return 'idle';
  };

  const statusColors: Record<string, string> = {
    working: 'bg-[#1e8e3e]',
    pending: 'bg-[#f9ab00]',
    idle: 'bg-[#dadce0]',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <h2 className="text-lg font-semibold text-[#3c4043] mb-4">Agents</h2>

      {/* Agent selector - horizontal scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 scrollbar-hide">
        {AGENTS.map((agent) => {
          const status = agentStatus(agent.id);
          const isSelected = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all shrink-0
                ${isSelected
                  ? 'border-[#f9ab00] bg-[#fef7e0] shadow-sm'
                  : 'border-[#dadce0] bg-white hover:bg-[#f8f9fa] hover:shadow-sm'
                }`}
            >
              <span className="text-xl">{agent.emoji}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-[#3c4043]' : 'text-[#70757a]'}`}>
                {agent.name}
              </span>
              <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            </button>
          );
        })}
      </div>

      {/* Sub tabs - Material style */}
      <div className="border-b border-[#dadce0] flex gap-0 mb-4">
        {(['working', 'pending', 'completed', 'cron'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors capitalize
              ${subTab === tab ? 'text-[#f9ab00]' : 'text-[#70757a] hover:text-[#3c4043]'}`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                ${subTab === tab ? 'bg-[#f9ab00] text-white' : 'bg-[#e8eaed] text-[#70757a]'}`}>
                {tabCounts[tab]}
              </span>
            )}
            {subTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f9ab00] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {subTab === 'working' && (
          <TaskList
            tasks={current.working}
            emptyMessage="No tasks in progress"
            renderExtra={(task) => (
              <div className="flex items-center gap-3 text-[11px] text-[#70757a]">
                {task.start_time && <span>Started {task.start_time}</span>}
                {task.updated_at && <span>Active {formatElapsed(task.updated_at)}</span>}
              </div>
            )}
          />
        )}

        {subTab === 'pending' && (
          <TaskList
            tasks={current.pending}
            emptyMessage="No pending tasks"
            renderExtra={(task) => (
              <div className="flex items-center gap-3 text-[11px]">
                <PriorityBadge priority={task.priority} />
                <span className="text-[#70757a]">{formatDate(task.created_at)}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${task.status === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#f1f3f4] text-[#70757a]'}`}>
                  {task.status}
                </span>
              </div>
            )}
          />
        )}

        {subTab === 'completed' && (
          <TaskList
            tasks={current.completed.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))}
            emptyMessage="No completed tasks"
            renderExtra={(task) => (
              <div className="flex items-center gap-3 text-[11px] text-[#70757a]">
                <span>{formatDate(task.updated_at)}</span>
                <span>{formatTimeSpent(task)}</span>
              </div>
            )}
          />
        )}

        {subTab === 'cron' && (
          <CronList crons={agentCrons} loading={cronsLoading} cronJobs={cronJobs} agentId={selectedAgent} />
        )}
      </div>
    </div>
  );
}

function TaskList({
  tasks,
  emptyMessage,
  renderExtra,
}: {
  tasks: Task[];
  emptyMessage: string;
  renderExtra: (task: Task) => React.ReactNode;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-[#70757a] text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="border border-[#dadce0] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[#3c4043] truncate">
                <span className="text-[#70757a] text-xs mr-1.5">#{task.id}</span>
                {task.title}
              </div>
              <div className="mt-1">
                {renderExtra(task)}
              </div>
            </div>
            {task.project && (
              <span className="px-2 py-0.5 rounded bg-[#f1f3f4] text-[10px] text-[#70757a] shrink-0">
                {task.project}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CronList({ crons, loading, cronJobs, agentId }: { crons: AgentCron[]; loading: boolean; cronJobs: CronJob[]; agentId: string }) {
  // Fallback to cronJobs prop if API returned empty
  const cronMatchPatterns: Record<string, RegExp> = {
    polymarket: /polymarket|trading|market/i,
    hu: /\bhu\b/i,
    aspen: /aspen|atrade|nofx/i,
    artist: /artist|image|banana/i,
    fridaytask: /friday|task/i,
    knowledge: /knowledge|learn|study|daily.*news|ai.*news/i,
  };

  const displayCrons = crons.length > 0 ? crons : (() => {
    const pattern = cronMatchPatterns[agentId];
    return pattern ? cronJobs.filter((j) => pattern.test(j.name || '')).map((j) => ({
      id: j.id,
      name: j.name || j.id,
      enabled: j.enabled,
      schedule: j.schedule,
      lastRun: undefined,
      nextRun: undefined,
    })) : [];
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[#70757a] text-sm">
        <div className="w-4 h-4 border-2 border-[#f9ab00] border-t-transparent rounded-full animate-spin mr-2" />
        Loading cron jobs...
      </div>
    );
  }

  if (displayCrons.length === 0) {
    return (
      <div className="text-center py-12 text-[#70757a] text-sm">
        No cron jobs for this agent
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayCrons.map((cron) => (
        <div key={cron.id} className="border border-[#dadce0] rounded-lg p-3 hover:shadow-sm transition-shadow bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cron.enabled ? 'bg-[#1e8e3e]' : 'bg-[#dadce0]'}`} />
              <span className="text-sm font-medium text-[#3c4043] truncate">{cron.name}</span>
            </div>
            <span className="text-[11px] font-mono text-[#70757a] shrink-0">
              {cron.schedule?.expr || cron.schedule?.kind || '—'}
            </span>
          </div>
          {(cron.lastRun || cron.nextRun) && (
            <div className="flex items-center gap-4 mt-1.5 text-[11px] text-[#70757a]">
              {cron.lastRun && (
                <span>
                  Last: <span className={cron.lastRun.status === 'ok' ? 'text-[#1e8e3e]' : 'text-[#ea4335]'}>{cron.lastRun.status}</span>
                  {' '}{formatDate(cron.lastRun.time)}
                </span>
              )}
              {cron.nextRun && <span>Next: {formatDate(cron.nextRun)}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
