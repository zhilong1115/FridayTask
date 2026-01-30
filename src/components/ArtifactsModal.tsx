import { useState, useEffect, useMemo } from 'react';
import type { ArtifactType } from '../types';

interface ArtifactWithTask {
  id: number;
  task_id: number;
  name: string;
  url: string;
  type: ArtifactType;
  created_at: string;
  task_title: string;
  project: string;
}

interface ArtifactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtifactsModal({ isOpen, onClose }: ArtifactsModalProps) {
  const [artifacts, setArtifacts] = useState<ArtifactWithTask[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchArtifacts();
    }
  }, [isOpen]);

  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/artifacts');
      if (res.ok) {
        const data = await res.json();
        setArtifacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch artifacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const artifactsByProject = useMemo(() => {
    const grouped: Record<string, ArtifactWithTask[]> = {};
    artifacts.forEach((artifact) => {
      const project = artifact.project || 'Uncategorized';
      if (!grouped[project]) {
        grouped[project] = [];
      }
      grouped[project].push(artifact);
    });
    return grouped;
  }, [artifacts]);

  const getTypeIcon = (type: ArtifactType): string => {
    const icons: Record<ArtifactType, string> = {
      doc: '📄',
      pdf: '📋',
      link: '🔗',
      image: '🖼️',
      file: '📁',
    };
    return icons[type] || '📄';
  };

  const projectEmojis: Record<string, string> = {
    'Aspen': '🌲',
    'Task App': '✅',
    'Clawdbot': '🤖',
    'Uncategorized': '📁',
  };

  const getProjectEmoji = (proj: string) => projectEmojis[proj] || '📂';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#dadce0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">All Artifacts</h2>
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

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-7 py-4">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#e8f0fe] border-t-[#1a73e8] rounded-full animate-spin" />
              <p className="text-sm text-[#70757a] mt-3">Loading artifacts...</p>
            </div>
          )}

          {!loading && artifacts.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl mb-3 block">📂</span>
              <p className="text-sm text-[#70757a]">No artifacts yet</p>
            </div>
          )}

          {!loading && artifacts.length > 0 && (
            <div className="space-y-5">
              {Object.entries(artifactsByProject)
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([project, projectArtifacts]) => (
                  <div key={project}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{getProjectEmoji(project)}</span>
                      <span className="text-sm font-semibold text-[#3c4043]">{project}</span>
                      <span className="text-[10px] text-[#70757a] bg-[#f1f3f4] px-2 py-0.5 rounded-full">
                        {projectArtifacts.length}
                      </span>
                    </div>
                    <div className="ml-7 space-y-2">
                      {projectArtifacts.map((artifact) => (
                        <a
                          key={artifact.id}
                          href={artifact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#f8f9fa] transition-colors group"
                        >
                          <span className="text-lg shrink-0 mt-0.5">{getTypeIcon(artifact.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[#3c4043] group-hover:text-[#1a73e8] truncate">
                              {artifact.name}
                            </div>
                            <div className="text-xs text-[#70757a] mt-0.5 truncate">
                              {artifact.task_title}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-[#70757a] group-hover:text-[#1a73e8] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
