import type { Task, CronJob } from '../types';
import { AgentAccordion, RobotIcon } from './AgentsModal';

interface AgentsPageProps {
  tasks: Task[];
  cronJobs: CronJob[];
  onBack: () => void;
}

export default function AgentsPage({ tasks, cronJobs, onBack }: AgentsPageProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <RobotIcon />
          <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">Agents</h2>
        </div>
      </div>

      {/* Agent accordion list */}
      <AgentAccordion tasks={tasks} cronJobs={cronJobs} />
    </div>
  );
}
