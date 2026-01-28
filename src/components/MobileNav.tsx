import { useState } from 'react';
import type { SidebarView } from '../types';

interface MobileNavProps {
  view: SidebarView;
  onViewChange: (v: SidebarView) => void;
  onCreateTask: () => void;
  filterAssignee: string;
  onFilterAssignee: (v: string) => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
}

export default function MobileNav({
  view,
  onViewChange,
  onCreateTask,
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
          <div className="w-8 h-8 rounded-xl bg-[#f9ab00] flex items-center justify-center font-bold text-white text-xs">
            F
          </div>
          <span className="font-semibold text-sm text-[#3c4043]">Friday Tasks</span>
        </div>
        <div className="flex items-center gap-2">
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
