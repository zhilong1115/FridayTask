import { useState, useEffect, useMemo } from 'react';
import type { Task, CronJob } from '../types';

interface AgentsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  { id: 'alpha', emoji: '📈', name: 'Alpha', projectPatterns: [/polymarket/i, /trading/i] },
  { id: 'hu', emoji: '🀄', name: 'HU', projectPatterns: [/\bhu\b/i, /game/i] },
  { id: 'aspen', emoji: '📊', name: 'Aspen', projectPatterns: [/aspen/i, /quant/i, /atrade/i, /nofx/i] },
  { id: 'artist', emoji: '🍌', name: 'Artist', projectPatterns: [/artist/i, /design/i, /avatar/i, /image/i, /banana/i] },
  { id: 'fridaytask', emoji: '📋', name: 'FridayTask', projectPatterns: [/friday/i, /infra/i, /\btask\b/i] },
  { id: 'knowledge', emoji: '📚', name: 'Knowledge', projectPatterns: [/knowledge/i, /learning/i, /ai-push/i, /finance-push/i, /learn/i, /study/i] },
];

const cronMatchPatterns: Record<string, RegExp> = {
  alpha: /polymarket|alpha|trading|market|crypto|stock/i,
  hu: /\bhu\b/i,
  aspen: /aspen|atrade|nofx/i,
  artist: /artist|image|banana/i,
  fridaytask: /friday|task/i,
  knowledge: /knowledge|learn|study|daily.*news|ai.*news/i,
};

type SubTab = 'working' | 'pending' | 'completed' | 'cron';

function matchAgent(task: Task, agent: AgentDef): boolean {
  if (task.assignee !== 'friday') return false;
  return agent.projectPatterns.some((p) => p.test(task.project || ''));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatElapsed(startStr: string): string {
  const diff = Date.now() - new Date(startStr).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
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

export default function AgentsModal({ isOpen, onClose, tasks, cronJobs }: AgentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#dadce0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">Agents</h2>
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

        {/* Agent list */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <AgentAccordion tasks={tasks} cronJobs={cronJobs} />
        </div>
      </div>
    </div>
  );
}

// Shared accordion used by both modal and main view
export function AgentAccordion({ tasks, cronJobs }: { tasks: Task[]; cronJobs: CronJob[] }) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [subTabs, setSubTabs] = useState<Record<string, SubTab>>({});

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

  const agentCronCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const agent of AGENTS) {
      const pattern = cronMatchPatterns[agent.id];
      counts[agent.id] = pattern ? cronJobs.filter((j) => pattern.test(j.name || '')).length : 0;
    }
    return counts;
  }, [cronJobs]);

  const toggleAgent = (id: string) => {
    if (expandedAgent === id) {
      setExpandedAgent(null);
    } else {
      setExpandedAgent(id);
      // Auto-select best subtab
      if (!subTabs[id]) {
        const t = agentTasks[id];
        let tab: SubTab = 'working';
        if (t.working.length > 0) tab = 'working';
        else if (t.pending.length > 0) tab = 'pending';
        else if (t.completed.length > 0) tab = 'completed';
        else tab = 'cron';
        setSubTabs((prev) => ({ ...prev, [id]: tab }));
      }
    }
  };

  const setSubTab = (agentId: string, tab: SubTab) => {
    setSubTabs((prev) => ({ ...prev, [agentId]: tab }));
  };

  const statusBadge = (id: string) => {
    const t = agentTasks[id];
    if (t.working.length > 0) return '🟢';
    if (t.pending.length > 0) return '🟡';
    return '⚪';
  };

  const statusSummary = (id: string) => {
    const t = agentTasks[id];
    const parts: string[] = [];
    if (t.working.length > 0) parts.push(`${t.working.length} working`);
    if (t.pending.length > 0) parts.push(`${t.pending.length} pending`);
    if (t.completed.length > 0) parts.push(`${t.completed.length} done`);
    return parts.length > 0 ? parts.join(', ') : 'idle';
  };

  return (
    <div className="space-y-2">
      {AGENTS.map((agent) => {
        const isExpanded = expandedAgent === agent.id;
        const currentTab = subTabs[agent.id] || 'working';
        const t = agentTasks[agent.id];
        const tabCounts: Record<SubTab, number> = {
          working: t.working.length,
          pending: t.pending.length,
          completed: t.completed.length,
          cron: agentCronCounts[agent.id] || 0,
        };

        return (
          <div key={agent.id} className="border border-[#dadce0] rounded-xl overflow-hidden bg-white">
            {/* Collapsed header */}
            <button
              onClick={() => toggleAgent(agent.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f9fa]
                ${isExpanded ? 'bg-[#fef7e0] border-b border-[#dadce0]' : ''}`}
            >
              <span className="text-xl">{agent.emoji}</span>
              <span className="text-sm font-medium text-[#3c4043] flex-1">{agent.name}</span>
              <span className="text-xs text-[#70757a]">{statusSummary(agent.id)}</span>
              <span className="text-sm">{statusBadge(agent.id)}</span>
              <svg
                className={`w-4 h-4 text-[#70757a] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-4 py-3">
                {/* Sub tabs */}
                <div className="border-b border-[#dadce0] flex gap-0 mb-3">
                  {(['working', 'pending', 'completed', 'cron'] as SubTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSubTab(agent.id, tab)}
                      className={`relative px-3 py-2 text-xs font-medium transition-colors capitalize
                        ${currentTab === tab ? 'text-[#f9ab00]' : 'text-[#70757a] hover:text-[#3c4043]'}`}
                    >
                      {tab}
                      {tabCounts[tab] > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                          ${currentTab === tab ? 'bg-[#f9ab00] text-white' : 'bg-[#e8eaed] text-[#70757a]'}`}>
                          {tabCounts[tab]}
                        </span>
                      )}
                      {currentTab === tab && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f9ab00] rounded-t" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <AgentTabContent
                  agentId={agent.id}
                  tab={currentTab}
                  tasks={t}
                  cronJobs={cronJobs}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AgentTabContent({
  agentId,
  tab,
  tasks,
  cronJobs,
}: {
  agentId: string;
  tab: SubTab;
  tasks: { completed: Task[]; working: Task[]; pending: Task[] };
  cronJobs: CronJob[];
}) {
  const [agentCrons, setAgentCrons] = useState<AgentCron[]>([]);
  const [cronsLoading, setCronsLoading] = useState(false);

  useEffect(() => {
    if (tab === 'cron') {
      setCronsLoading(true);
      fetch(`/api/agents/${agentId}/crons`)
        .then((r) => r.json())
        .then((data) => { setAgentCrons(Array.isArray(data) ? data : []); setCronsLoading(false); })
        .catch(() => {
          const pattern = cronMatchPatterns[agentId];
          const matched = pattern ? cronJobs.filter((j) => pattern.test(j.name || '')) : [];
          setAgentCrons(matched.map((j) => ({
            id: j.id, name: j.name || j.id, enabled: j.enabled,
            schedule: j.schedule, lastRun: undefined, nextRun: undefined,
          })) as AgentCron[]);
          setCronsLoading(false);
        });
    }
  }, [tab, agentId, cronJobs]);

  if (tab === 'working') {
    return tasks.working.length === 0 ? (
      <Empty msg="No tasks in progress" />
    ) : (
      <div className="space-y-1.5">
        {tasks.working.map((task) => (
          <TaskRow key={task.id} task={task}>
            <div className="flex items-center gap-3 text-[11px] text-[#70757a]">
              {task.start_time && <span>Started {task.start_time}</span>}
              {task.updated_at && <span>Active {formatElapsed(task.updated_at)}</span>}
            </div>
          </TaskRow>
        ))}
      </div>
    );
  }

  if (tab === 'pending') {
    return tasks.pending.length === 0 ? (
      <Empty msg="No pending tasks" />
    ) : (
      <div className="space-y-1.5">
        {tasks.pending.map((task) => (
          <TaskRow key={task.id} task={task}>
            <div className="flex items-center gap-3 text-[11px]">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium
                ${({ high: 'bg-[#fce8e6] text-[#c5221f]', medium: 'bg-[#fef7e0] text-[#e37400]', low: 'bg-[#e6f4ea] text-[#1e8e3e]' })[task.priority] || 'bg-[#fef7e0] text-[#e37400]'}`}>
                {task.priority}
              </span>
              <span className="text-[#70757a]">{formatDate(task.created_at)}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                ${task.status === 'approved' ? 'bg-[#e6f4ea] text-[#1e8e3e]' : 'bg-[#f1f3f4] text-[#70757a]'}`}>
                {task.status}
              </span>
            </div>
          </TaskRow>
        ))}
      </div>
    );
  }

  if (tab === 'completed') {
    const sorted = [...tasks.completed].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
    return sorted.length === 0 ? (
      <Empty msg="No completed tasks" />
    ) : (
      <div className="space-y-1.5">
        {sorted.map((task) => (
          <TaskRow key={task.id} task={task}>
            <div className="flex items-center gap-3 text-[11px] text-[#70757a]">
              <span>{formatDate(task.updated_at)}</span>
              <span>{formatTimeSpent(task)}</span>
            </div>
          </TaskRow>
        ))}
      </div>
    );
  }

  // Cron tab
  if (cronsLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-[#70757a] text-sm">
        <div className="w-4 h-4 border-2 border-[#f9ab00] border-t-transparent rounded-full animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  const displayCrons = agentCrons.length > 0 ? agentCrons : (() => {
    const pattern = cronMatchPatterns[agentId];
    return pattern ? cronJobs.filter((j) => pattern.test(j.name || '')).map((j) => ({
      id: j.id, name: j.name || j.id, enabled: j.enabled,
      schedule: j.schedule, lastRun: undefined, nextRun: undefined,
    })) : [];
  })();

  return displayCrons.length === 0 ? (
    <Empty msg="No cron jobs" />
  ) : (
    <div className="space-y-1.5">
      {displayCrons.map((cron) => (
        <div key={cron.id} className="border border-[#dadce0] rounded-lg p-2.5 bg-white text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cron.enabled ? 'bg-[#1e8e3e]' : 'bg-[#dadce0]'}`} />
              <span className="font-medium text-[#3c4043] truncate text-xs">{cron.name}</span>
            </div>
            <span className="text-[10px] font-mono text-[#70757a] shrink-0">
              {cron.schedule?.expr || cron.schedule?.kind || '—'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskRow({ task, children }: { task: Task; children: React.ReactNode }) {
  return (
    <div className="border border-[#dadce0] rounded-lg p-2.5 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-[#3c4043] truncate">
            <span className="text-[#70757a] text-[10px] mr-1">#{task.id}</span>
            {task.title}
          </div>
          <div className="mt-1">{children}</div>
        </div>
        {task.project && (
          <span className="px-1.5 py-0.5 rounded bg-[#f1f3f4] text-[9px] text-[#70757a] shrink-0">
            {task.project}
          </span>
        )}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-center py-8 text-[#70757a] text-xs">{msg}</div>;
}
