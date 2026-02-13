import type { Task, CronJob } from '../types';
import { AgentAccordion } from './AgentsModal';

interface AgentsViewProps {
  tasks: Task[];
  cronJobs: CronJob[];
}

export default function AgentsView({ tasks, cronJobs }: AgentsViewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold text-[#3c4043] mb-4">Agents</h2>
      <AgentAccordion tasks={tasks} cronJobs={cronJobs} />
    </div>
  );
}
