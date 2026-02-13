import type { SidebarView } from '../types';

interface SidebarProps {
  view: SidebarView;
  onViewChange: (view: SidebarView) => void;
  filterAssignee: string;
  onFilterAssignee: (v: string) => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
  onCreateTask: () => void;
  onOpenAgents: () => void;
  onOpenArtifacts: () => void;
  onOpenKnowledge: () => void;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  view,
  onViewChange,
  filterAssignee,
  onFilterAssignee,
  filterStatus,
  onFilterStatus,
  onCreateTask,
  onOpenAgents,
  onOpenArtifacts,
  onOpenKnowledge,
  isAuthenticated,
  onLogin,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-[#dadce0] bg-white p-5 flex flex-col gap-6 max-md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-1 py-1">
        <svg width="36" height="36" viewBox="0 0 80 80" className="shrink-0">
          <rect width="80" height="80" rx="16" fill="#f9ab00"/>
          <rect x="12" y="12" width="20" height="20" rx="4" fill="white"/>
          <path d="M17 22l4 4 7-7" stroke="#f9ab00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="38" y="26" fontFamily="-apple-system, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="white">TGIF!</text>
          <rect x="12" y="38" width="20" height="20" rx="4" fill="white" opacity="0.5"/>
          <rect x="38" y="44" width="28" height="4" rx="2" fill="white" opacity="0.7"/>
          <rect x="38" y="52" width="20" height="3" rx="1.5" fill="white" opacity="0.4"/>
          <rect x="12" y="62" width="14" height="14" rx="3" fill="white" opacity="0.25"/>
          <rect x="32" y="66" width="22" height="3" rx="1.5" fill="white" opacity="0.3"/>
        </svg>
        <div>
          <h1 className="text-base font-semibold text-[#3c4043] tracking-wide">Friday Tasks</h1>
          <p className="text-xs text-[#70757a] -mt-0.5">Thank God It's Friday</p>
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
            { key: 'agents' as SidebarView, label: 'Agents', icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5" />
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
            onClick={onOpenAgents}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V17a2 2 0 01-2 2H7a2 2 0 01-2-2v-2.5" />
            </svg>
            Agents Panel
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
          <button
            onClick={onOpenKnowledge}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
            </svg>
            Knowledge
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

      {/* Auth */}
      <div className="mt-auto pt-4 border-t border-[#dadce0]">
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Admin Login
          </button>
        )}
      </div>
    </aside>
  );
}
