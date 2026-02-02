import { useState } from 'react';
import type { SidebarView } from '../types';

interface MobileNavProps {
  view: SidebarView;
  onViewChange: (v: SidebarView) => void;
  onCreateTask: () => void;
  onOpenSummary: () => void;
  onOpenArtifacts: () => void;
  onOpenKnowledge: () => void;
  filterAssignee: string;
  onFilterAssignee: (v: string) => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
}

export default function MobileNav({
  view,
  onViewChange,
  onCreateTask,
  onOpenSummary,
  onOpenArtifacts,
  onOpenKnowledge,
  filterAssignee,
  onFilterAssignee,
  filterStatus,
  onFilterStatus,
}: MobileNavProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#dadce0] bg-white">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 80 80" className="shrink-0">
            <rect width="80" height="80" rx="16" fill="#f9ab00"/>
            <rect x="12" y="12" width="20" height="20" rx="4" fill="white"/>
            <path d="M17 22l4 4 7-7" stroke="#f9ab00" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="38" y="26" fontFamily="-apple-system, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="white">TGIF!</text>
            <rect x="12" y="38" width="20" height="20" rx="4" fill="white" opacity="0.5"/>
            <rect x="38" y="44" width="28" height="4" rx="2" fill="white" opacity="0.7"/>
          </svg>
          <span className="font-semibold text-sm text-[#3c4043]">TGIF!</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSummary}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70757a] hover:bg-[#f1f3f4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={onOpenArtifacts}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70757a] hover:bg-[#f1f3f4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button
            onClick={onOpenKnowledge}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#70757a] hover:bg-[#f1f3f4] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
            </svg>
          </button>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              ${filtersOpen ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#70757a] hover:bg-[#f1f3f4]'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          <button
            onClick={onCreateTask}
            className="w-8 h-8 rounded-lg bg-[#1a73e8] flex items-center justify-center text-white font-bold
              hover:bg-[#1765cc] transition-colors active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable filters */}
      {filtersOpen && (
        <div className="px-4 py-3 border-b border-[#dadce0] bg-[#f8f9fa] space-y-2">
          {/* View toggles */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
                ${view === 'calendar' ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#70757a] border border-[#dadce0]'}`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all
                ${view === 'list' ? 'bg-[#1a73e8] text-white' : 'bg-white text-[#70757a] border border-[#dadce0]'}`}
            >
              📋 List
            </button>
          </div>

          {/* Assignee & Status chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: '', label: 'All', group: 'assignee' },
              { value: 'zhilong', label: '🧑‍💻 Zhilong', group: 'assignee' },
              { value: 'friday', label: '🤖 Friday', group: 'assignee' },
            ].map(({ value, label }) => (
              <button
                key={`a-${value}`}
                onClick={() => onFilterAssignee(filterAssignee === value ? '' : value)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium transition-all
                  ${filterAssignee === value
                    ? 'bg-[#e8f0fe] text-[#1a73e8] ring-1 ring-[#1a73e8]/30'
                    : 'bg-white text-[#70757a] border border-[#dadce0]'}`}
              >
                {label}
              </button>
            ))}
            <div className="w-px h-5 bg-[#dadce0] mx-0.5 self-center" />
            {[
              { value: '', label: 'Any' },
              { value: 'pending', label: '⏳ Pending' },
              { value: 'approved', label: '✔ Approved' },
              { value: 'in-progress', label: '◑ Active' },
              { value: 'done', label: '✓ Done' },
            ].map(({ value, label }) => (
              <button
                key={`s-${value}`}
                onClick={() => onFilterStatus(filterStatus === value ? '' : value)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-medium transition-all
                  ${filterStatus === value
                    ? 'bg-[#e8f0fe] text-[#1a73e8] ring-1 ring-[#1a73e8]/30'
                    : 'bg-white text-[#70757a] border border-[#dadce0]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
