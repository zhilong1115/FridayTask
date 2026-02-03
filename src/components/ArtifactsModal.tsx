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
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithTask | null>(null);
  const [artifactContent, setArtifactContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const openInNewTab = () => {
    if (selectedArtifact) {
      window.open(selectedArtifact.url, '_blank');
    }
  };

  const fetchArtifactContent = async (artifact: ArtifactWithTask) => {
    setSelectedArtifact(artifact);
    // Only fetch content for HTML artifacts that are local
    if (artifact.type === 'html' && artifact.url.startsWith('/')) {
      setLoadingContent(true);
      try {
        const res = await fetch(artifact.url);
        if (res.ok) {
          const html = await res.text();
          setArtifactContent(html);
        }
      } catch (err) {
        console.error('Failed to fetch artifact content:', err);
        setArtifactContent('<p>Failed to load content</p>');
      } finally {
        setLoadingContent(false);
      }
    } else {
      // For non-HTML or external URLs, just open in new tab
      window.open(artifact.url, '_blank');
      setSelectedArtifact(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArtifacts();
    } else {
      setSelectedArtifact(null);
      setArtifactContent('');
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
      html: '🌐',
    };
    return icons[type] || '📄';
  };

  const projectEmojis: Record<string, string> = {
    'Aspen': '🌲',
    'Task App': '✅',
    'Clawdbot': '🤖',
    'HU!': '🀄',
    'Uncategorized': '📁',
  };

  const getProjectEmoji = (proj: string) => projectEmojis[proj] || '📂';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/30 hidden md:block" onClick={onClose} />

      <div className={`relative bg-white md:rounded-2xl border-0 md:border border-[#dadce0] shadow-2xl overflow-hidden flex flex-col transition-all duration-200
        ${isFullscreen 
          ? 'w-full h-full md:max-w-none md:max-h-none md:rounded-none md:m-0' 
          : 'w-full h-full md:h-auto md:max-w-6xl md:max-h-[90vh]'
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">📁</span>
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">All Artifacts</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Open in new tab button */}
            {selectedArtifact && (
              <button
                onClick={openInNewTab}
                className="hidden md:flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
                title="Open in new tab"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            )}
            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with artifacts list */}
          <div className={`${selectedArtifact ? 'hidden md:flex md:w-80 border-r border-[#dadce0]' : 'flex-1'} flex flex-col shrink-0 transition-all overflow-y-auto`}>
            <div className="p-4">
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
                            <button
                              key={artifact.id}
                              onClick={() => fetchArtifactContent(artifact)}
                              className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors group
                                ${selectedArtifact?.id === artifact.id
                                  ? 'bg-[#e8f0fe] border border-[#1a73e8]/20'
                                  : 'hover:bg-[#f8f9fa] border border-transparent'
                                }`}
                            >
                              <span className="text-lg shrink-0 mt-0.5">{getTypeIcon(artifact.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm truncate transition-colors
                                  ${selectedArtifact?.id === artifact.id
                                    ? 'text-[#1a73e8]'
                                    : 'text-[#3c4043] group-hover:text-[#1a73e8]'
                                  }`}>
                                  {artifact.name}
                                </div>
                                <div className="text-xs text-[#70757a] mt-0.5 truncate">
                                  {artifact.task_title}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Artifact content viewer */}
          {selectedArtifact && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Artifact header */}
              <div className="px-6 py-4 border-b border-[#dadce0] bg-[#f8f9fa]">
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="flex md:hidden items-center gap-1 text-xs text-[#70757a] hover:text-[#1a73e8] mb-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to list
                </button>
                <h3 className="text-base font-semibold text-[#3c4043]">{selectedArtifact.name}</h3>
                <p className="text-xs text-[#70757a] mt-1">{selectedArtifact.task_title}</p>
              </div>

              {/* Artifact content */}
              <div className="flex-1 overflow-auto">
                {loadingContent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="inline-block w-8 h-8 border-4 border-[#e8f0fe] border-t-[#1a73e8] rounded-full animate-spin" />
                  </div>
                ) : (
                  <iframe
                    srcDoc={artifactContent}
                    className="w-full h-full border-0"
                    title={selectedArtifact.name}
                    sandbox="allow-same-origin"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
