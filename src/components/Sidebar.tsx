import type { SidebarView } from '../types';

interface SidebarProps {
  view: SidebarView;
  onViewChange: (view: SidebarView) => void;
  filterAssignee: string;
  onFilterAssignee: (v: string) => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
  onCreateTask: () => void;
  onOpenSummary: () => void;
  onOpenArtifacts: () => void;
}

export default function Sidebar({
  view,
  onViewChange,
  filterAssignee,
  onFilterAssignee,
  filterStatus,
  onFilterStatus,
  onCreateTask,
  onOpenSummary,
  onOpenArtifacts,
}: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-[#dadce0] bg-white p-5 flex flex-col gap-6 max-md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-1 py-1">
        <div className="w-9 h-9 rounded-xl bg-[#f9ab00] flex items-center justify-center font-bold text-white text-sm">
          F
        </div>
        <div>
          <h1 className="text-base font-semibold text-[#3c4043] tracking-wide">Friday Tasks</h1>
        </div>
      </div>

      {/* New Task — Google-style create button */}
      <button
        onClick={onCreateTask}
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl
          bg-white border border-[#dadce0] text-[#3c4043] font-medium text-sm
          hover:bg-[#f8f9fa] hover:shadow-md transition-all active:scale-[0.98]"
      >
        <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create
      </button>

      {/* Views */}
      <div>
        <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-[0.1em] mb-3 px-2">Views</p>
        <div className="flex flex-col gap-1">
          {[
            { key: 'calendar' as SidebarView, label: 'Calendar', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )},
            { key: 'list' as SidebarView, label: 'List', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )},
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                ${view === key
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
          <button
            onClick={onOpenSummary}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Summary
          </button>
          <button
            onClick={onOpenArtifacts}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Artifacts
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-[0.1em] mb-3 px-2">Assignee</p>
        <div className="flex flex-col gap-1">
          {[
            { value: '', label: 'Everyone', dot: 'bg-[#70757a]' },
            { value: 'zhilong', label: 'Zhilong', dot: 'bg-[#1a73e8]' },
            { value: 'friday', label: 'Friday', dot: 'bg-[#f9ab00]' },
          ].map(({ value, label, dot }) => (
            <button
              key={value}
              onClick={() => onFilterAssignee(value)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                ${filterAssignee === value
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-[#70757a] uppercase tracking-[0.1em] mb-3 px-2">Status</p>
        <div className="flex flex-col gap-1">
          {[
            { value: '', label: 'All', icon: '●' },
            { value: 'pending', label: 'Pending', icon: '⏳' },
            { value: 'approved', label: 'Approved', icon: '✔' },
            { value: 'in-progress', label: 'In Progress', icon: '◑' },
            { value: 'done', label: 'Done', icon: '✓' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => onFilterStatus(value)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                ${filterStatus === value
                  ? 'bg-[#e8f0fe] text-[#1a73e8] font-medium'
                  : 'text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
            >
              <span className="w-4 text-center text-xs">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
