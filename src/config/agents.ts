// Agent configuration — maps agent names to display properties
export interface AgentConfig {
  id: string;
  label: string;
  emoji: string;
  color: string;       // Primary brand color
  bgColor: string;     // Light background for badges/groups
  dotColor: string;    // Tailwind class for dot
}

export const AGENTS: Record<string, AgentConfig> = {
  alpha: {
    id: 'alpha',
    label: 'Alpha',
    emoji: '📈',
    color: '#e8710a',
    bgColor: '#fef3e2',
    dotColor: 'bg-[#e8710a]',
  },
  hu: {
    id: 'hu',
    label: 'HU',
    emoji: '🀄',
    color: '#d93025',
    bgColor: '#fce8e6',
    dotColor: 'bg-[#d93025]',
  },
  aspen: {
    id: 'aspen',
    label: 'Aspen',
    emoji: '📊',
    color: '#1a73e8',
    bgColor: '#d2e3fc',
    dotColor: 'bg-[#1a73e8]',
  },
  artist: {
    id: 'artist',
    label: 'Artist',
    emoji: '🍌',
    color: '#f9ab00',
    bgColor: '#feefc3',
    dotColor: 'bg-[#f9ab00]',
  },
  'friday-task': {
    id: 'friday-task',
    label: 'FridayTask',
    emoji: '📋',
    color: '#f9ab00',
    bgColor: '#feefc3',
    dotColor: 'bg-[#f9ab00]',
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge',
    emoji: '📚',
    color: '#7627bb',
    bgColor: '#e8dff5',
    dotColor: 'bg-[#7627bb]',
  },
  social: {
    id: 'social',
    label: 'Social',
    emoji: '📱',
    color: '#137333',
    bgColor: '#ceead6',
    dotColor: 'bg-[#137333]',
  },
  friday: {
    id: 'friday',
    label: 'Friday',
    emoji: '✨',
    color: '#1a73e8',
    bgColor: '#d2e3fc',
    dotColor: 'bg-[#1a73e8]',
  },
  zhilong: {
    id: 'zhilong',
    label: 'Zhilong',
    emoji: '👤',
    color: '#3c4043',
    bgColor: '#f1f3f4',
    dotColor: 'bg-[#3c4043]',
  },
};

// Default for unknown agents
export const DEFAULT_AGENT: AgentConfig = {
  id: 'unknown',
  label: 'Other',
  emoji: '📌',
  color: '#70757a',
  bgColor: '#f1f3f4',
  dotColor: 'bg-[#70757a]',
};

/**
 * Resolve an agent config from a task.
 * Priority: project field (if it matches an agent id) → assignee field → default
 */
export function resolveAgent(project: string, assignee: string): AgentConfig {
  // Normalize: lowercase, trim
  const p = (project || '').toLowerCase().trim();
  const a = (assignee || '').toLowerCase().trim();

  // Project field takes priority if it maps to an agent
  if (p && AGENTS[p]) return AGENTS[p];

  // Legacy project names → agent mapping
  const projectToAgent: Record<string, string> = {
    'task app': 'friday-task',
    'fridaytask': 'friday-task',
  };
  if (p && projectToAgent[p]) return AGENTS[projectToAgent[p]];

  // Fall back to assignee
  if (a && AGENTS[a]) return AGENTS[a];

  return DEFAULT_AGENT;
}

/** Get ordered list of all agents for sidebar */
export function getAgentList(): AgentConfig[] {
  return [
    AGENTS['friday'],
    AGENTS['alpha'],
    AGENTS['aspen'],
    AGENTS['hu'],
    AGENTS['artist'],
    AGENTS['friday-task'],
    AGENTS['knowledge'],
    AGENTS['social'],
    AGENTS['zhilong'],
  ];
}
