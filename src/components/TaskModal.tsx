import { useState, useEffect, useMemo, useRef } from 'react';
import type { Task, TaskFormData, Subtask, TaskStatus, Comment, Artifact, ArtifactType } from '../types';
import { resolveAgent, getAgentList } from '../config/agents';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  task?: Task | null;
  defaultDate?: string;
  defaultTime?: string;
  onCreateSubtask?: (taskId: number, title: string) => Promise<Subtask | null>;
  onUpdateSubtask?: (subtaskId: number, data: Partial<Subtask>) => Promise<Subtask | null>;
  onDeleteSubtask?: (subtaskId: number) => Promise<boolean>;
  onFetchComments?: (taskId: number) => Promise<Comment[]>;
  onCreateComment?: (taskId: number, author: string, content: string) => Promise<Comment | null>;
  onFetchArtifacts?: (taskId: number) => Promise<Artifact[]>;
  onCreateArtifact?: (taskId: number, name: string, url: string, type: ArtifactType) => Promise<Artifact | null>;
  onDeleteArtifact?: (artifactId: number) => Promise<boolean>;
  onAuthRequired?: () => void;
}

export default function TaskModal({
  isOpen, onClose, onSave, onDelete,
  onApprove, onReject,
  task, defaultDate, defaultTime,
  onCreateSubtask, onUpdateSubtask, onDeleteSubtask,
  onFetchComments, onCreateComment,
  onFetchArtifacts, onCreateArtifact, onDeleteArtifact,
  onAuthRequired,
}: TaskModalProps) {
  // Helper to handle auth errors
  const handleAuthError = (err: unknown): boolean => {
    if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
      onAuthRequired?.();
      return true;
    }
    return false;
  };
  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    assignee: 'zhilong',
    due_date: defaultDate || new Date().toISOString().split('T')[0],
    start_time: defaultTime || '',
    end_time: '',
    all_day: !defaultTime,
    project: '',
    priority: 'medium',
    status: 'approved',
  });

  const [newSubtask, setNewSubtask] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [newArtifactName, setNewArtifactName] = useState('');
  const [newArtifactUrl, setNewArtifactUrl] = useState('');
  const [newArtifactType, setNewArtifactType] = useState<ArtifactType>('link');
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        due_date: task.due_date || '',
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        all_day: task.all_day === 1,
        project: task.project || '',
        priority: task.priority,
        status: task.status,
      });
    } else {
      let endTime = '';
      if (defaultTime) {
        const [h] = defaultTime.split(':').map(Number);
        endTime = `${String(Math.min(h + 1, 23)).padStart(2, '0')}:00`;
      }
      setForm({
        title: '',
        description: '',
        assignee: 'zhilong',
        due_date: defaultDate || new Date().toISOString().split('T')[0],
        start_time: defaultTime || '',
        end_time: endTime,
        all_day: !defaultTime,
        project: '',
        priority: 'medium',
        status: 'approved',
      });
    }
    setNewSubtask('');
    setNewComment('');
    setNewArtifactName('');
    setNewArtifactUrl('');
    setNewArtifactType('link');
    setIsEditing(!task); // New task → edit mode; existing task → view mode

    // Load comments for existing tasks
    if (task && onFetchComments) {
      setLoadingComments(true);
      onFetchComments(task.id).then((c) => {
        setComments(c);
        setLoadingComments(false);
      });
    } else {
      setComments([]);
    }

    // Load artifacts for existing tasks
    if (task && onFetchArtifacts) {
      setLoadingArtifacts(true);
      onFetchArtifacts(task.id).then((a) => {
        setArtifacts(a);
        setLoadingArtifacts(false);
      });
    } else {
      setArtifacts([]);
    }
  }, [task, defaultDate, defaultTime, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !task || !onCreateSubtask) return;
    try {
      await onCreateSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    if (!onUpdateSubtask) return;
    try {
      await onUpdateSubtask(subtask.id, { completed: subtask.completed ? 0 : 1 });
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!onDeleteSubtask) return;
    try {
      await onDeleteSubtask(subtaskId);
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !task || !onCreateComment) return;
    try {
      const comment = await onCreateComment(task.id, 'zhilong', newComment.trim());
      if (comment) {
        setComments((prev) => [...prev, comment]);
        setNewComment('');
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const handleAddArtifact = async () => {
    if (!newArtifactName.trim() || !newArtifactUrl.trim() || !task || !onCreateArtifact) return;
    try {
      const artifact = await onCreateArtifact(task.id, newArtifactName.trim(), newArtifactUrl.trim(), newArtifactType);
      if (artifact) {
        setArtifacts((prev) => [artifact, ...prev]);
        setNewArtifactName('');
        setNewArtifactUrl('');
        setNewArtifactType('link');
      }
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const handleDeleteArtifact = async (artifactId: number) => {
    if (!onDeleteArtifact) return;
    try {
      const success = await onDeleteArtifact(artifactId);
      if (success) {
        setArtifacts((prev) => prev.filter((a) => a.id !== artifactId));
      }
    } catch (err) {
      if (!handleAuthError(err)) throw err;
    }
  };

  const formatCommentTime = (dateStr: string) => {
    const date = new Date(dateStr + 'Z'); // UTC from SQLite
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getArtifactIcon = (type: ArtifactType) => {
    switch (type) {
      case 'doc': return '📄';
      case 'pdf': return '📋';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'file': return '📁';
      default: return '📎';
    }
  };

  const priorityOptions = [
    { value: 'low' as const, label: 'Low', color: 'bg-[#f1f3f4] text-[#70757a]', active: 'bg-[#e8eaed] text-[#3c4043] ring-1 ring-[#dadce0]' },
    { value: 'medium' as const, label: 'Medium', color: 'bg-[#feefc3]/50 text-[#b06000]/60', active: 'bg-[#feefc3] text-[#b06000] ring-1 ring-[#b06000]/30' },
    { value: 'high' as const, label: 'High', color: 'bg-[#fce8e6]/50 text-[#c5221f]/60', active: 'bg-[#fce8e6] text-[#c5221f] ring-1 ring-[#c5221f]/30' },
  ];

  const statusOptions: { value: TaskStatus; label: string; icon: string; color: string; active: string }[] = [
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'bg-[#feefc3]/50 text-[#b06000]/60', active: 'bg-[#feefc3] text-[#b06000] ring-1 ring-[#b06000]/30' },
    { value: 'approved', label: 'Approved', icon: '✔', color: 'bg-[#d2e3fc]/50 text-[#1967d2]/60', active: 'bg-[#d2e3fc] text-[#1967d2] ring-1 ring-[#1967d2]/30' },
    { value: 'in-progress', label: 'Active', icon: '◑', color: 'bg-[#d2e3fc]/50 text-[#1967d2]/60', active: 'bg-[#d2e3fc] text-[#1967d2] ring-1 ring-[#1967d2]/30' },
    { value: 'done', label: 'Done', icon: '✓', color: 'bg-[#ceead6]/50 text-[#137333]/60', active: 'bg-[#ceead6] text-[#137333] ring-1 ring-[#137333]/30' },
    { value: 'rejected', label: 'Rejected', icon: '✕', color: 'bg-[#fce8e6]/50 text-[#c5221f]/60', active: 'bg-[#fce8e6] text-[#c5221f] ring-1 ring-[#c5221f]/30' },
  ];

  const inputClass = `w-full px-3 py-2.5 bg-transparent border-0 border-b border-[#dadce0] text-sm text-[#3c4043]
    focus:outline-none focus:border-[#1a73e8] placeholder-[#70757a] transition-all`;

  const subtasks = task?.subtasks || [];
  const subtaskCompleted = subtasks.filter((s) => s.completed === 1).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#dadce0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#dadce0] shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-[#3c4043] tracking-wide">
              {!task ? 'New Task' : isEditing ? 'Edit Task' : 'Task Details'}
            </h2>
            {task && (
              <StatusBadge status={task.status} />
            )}
          </div>
          <div className="flex items-center gap-1">
            {task && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] transition-colors text-[#70757a] hover:text-[#3c4043]"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
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

        {/* Approve / Reject banner for pending tasks */}
        {task && task.status === 'pending' && (onApprove || onReject) && (
          <div className="px-7 py-3 bg-[#feefc3]/40 border-b border-[#dadce0] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#b06000]">⏳ This task is awaiting approval</span>
            </div>
            <div className="flex gap-2">
              {onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="px-4 py-1.5 text-sm font-medium text-[#c5221f] bg-[#fce8e6] rounded-xl
                    hover:bg-[#f8d7da] transition-colors active:scale-[0.98]"
                >
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  type="button"
                  onClick={onApprove}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-[#137333] rounded-xl
                    hover:bg-[#0d5626] transition-colors active:scale-[0.98]"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* VIEW MODE */}
          {task && !isEditing ? (
            <div className="p-7 flex flex-col gap-5">
              {/* Title */}
              <h3 className="text-xl font-semibold text-[#3c4043]">{task.title}</h3>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: resolveAgent(task.project, task.assignee).bgColor, color: resolveAgent(task.project, task.assignee).color }}>
                  {resolveAgent(task.project, task.assignee).emoji} {resolveAgent(task.project, task.assignee).label}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  task.priority === 'high' ? 'bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/20' :
                  task.priority === 'medium' ? 'bg-[#feefc3] text-[#b06000] border-[#b06000]/20' :
                  'bg-[#f1f3f4] text-[#70757a] border-[#dadce0]'
                }`}>
                  {task.priority}
                </span>
                {task.project && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#f1f3f4] text-[#3c4043]">
                    📁 {task.project}
                  </span>
                )}
              </div>

              {/* Date & Time */}
              {task.due_date && (
                <div className="flex items-center gap-3 text-sm text-[#3c4043]">
                  <svg className="w-5 h-5 text-[#70757a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    {task.start_time && !task.all_day && ` · ${task.start_time}${task.end_time ? ' – ' + task.end_time : ''}`}
                  </span>
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#70757a] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <p className="text-sm text-[#3c4043] whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Subtasks */}
              {subtasks.length > 0 && (
                <div className="border-t border-[#dadce0] pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#70757a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider">
                      Subtasks ({subtaskCompleted}/{subtasks.length})
                    </span>
                  </div>
                  {subtasks.length > 0 && (
                    <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-[#137333] rounded-full transition-all duration-300"
                        style={{ width: `${(subtaskCompleted / subtasks.length) * 100}%` }} />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#f1f3f4] transition-colors">
                        <button type="button" onClick={() => handleToggleSubtask(subtask)}
                          className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                            ${subtask.completed ? 'bg-[#137333] border-[#137333] text-white' : 'border-[#dadce0] hover:border-[#1a73e8]'}`}>
                          {subtask.completed === 1 && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-[#70757a]' : 'text-[#3c4043]'}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="border-t border-[#dadce0] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#70757a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider">
                    Comments
                    {comments.length > 0 && (
                      <span className="ml-1.5 normal-case tracking-normal font-medium">
                        ({comments.length})
                      </span>
                    )}
                  </span>
                </div>

                {/* Comment list */}
                {loadingComments ? (
                  <div className="text-xs text-[#70757a] py-2">Loading comments...</div>
                ) : comments.length > 0 ? (
                  <div className="flex flex-col gap-2.5 mb-3 max-h-48 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                          ${comment.author === 'friday'
                            ? 'bg-[#feefc3] text-[#b06000]'
                            : 'bg-[#d2e3fc] text-[#1967d2]'
                          }`}>
                          {comment.author === 'friday' ? '🤖' : '🧑‍💻'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#3c4043]">
                              {comment.author === 'friday' ? 'Friday' : 'Zhilong'}
                            </span>
                            <span className="text-[10px] text-[#70757a]">
                              {formatCommentTime(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-[#3c4043] mt-0.5 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                ) : (
                  <div className="text-xs text-[#70757a] py-2 mb-2">No comments yet</div>
                )}

                {/* Add comment input */}
                {onCreateComment && (
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium bg-[#d2e3fc] text-[#1967d2]">
                      🧑‍💻
                    </span>
                    <div className="flex-1 flex items-end gap-2 border border-[#dadce0] rounded-xl px-3 py-2 focus-within:border-[#1a73e8] transition-colors">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment();
                          }
                        }}
                        placeholder="Add a comment..."
                        rows={1}
                        className="flex-1 text-sm text-[#3c4043] placeholder-[#70757a] bg-transparent border-0
                          focus:outline-none resize-none"
                      />
                      {newComment.trim() && (
                        <button
                          type="button"
                          onClick={handleAddComment}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full
                            bg-[#1a73e8] text-white hover:bg-[#1765cc] transition-colors active:scale-[0.95]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M5 12h14m-7-7l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Artifacts */}
              <div className="border-t border-[#dadce0] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#70757a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider">
                    Artifacts
                    {artifacts.length > 0 && (
                      <span className="ml-1.5 normal-case tracking-normal font-medium">
                        ({artifacts.length})
                      </span>
                    )}
                  </span>
                </div>

                {/* Artifact list */}
                {loadingArtifacts ? (
                  <div className="text-xs text-[#70757a] py-2">Loading artifacts...</div>
                ) : artifacts.length > 0 ? (
                  <div className="flex flex-col gap-2 mb-3">
                    {artifacts.map((artifact) => (
                      <div key={artifact.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f1f3f4] group transition-colors">
                        <span className="text-lg shrink-0">{getArtifactIcon(artifact.type)}</span>
                        <a
                          href={artifact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-sm text-[#1a73e8] hover:underline truncate"
                        >
                          {artifact.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteArtifact(artifact.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100
                            text-[#70757a] hover:text-[#c5221f] hover:bg-[#fce8e6] transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#70757a] py-2 mb-2">No artifacts yet</div>
                )}

                {/* Add artifact form */}
                {onCreateArtifact && (
                  <div className="flex flex-col gap-2 p-3 border border-[#dadce0] rounded-xl">
                    <input
                      type="text"
                      value={newArtifactName}
                      onChange={(e) => setNewArtifactName(e.target.value)}
                      placeholder="Artifact name"
                      className="w-full px-2 py-1.5 text-sm text-[#3c4043] placeholder-[#70757a] bg-transparent border-0 border-b border-[#dadce0]
                        focus:outline-none focus:border-[#1a73e8]"
                    />
                    <input
                      type="url"
                      value={newArtifactUrl}
                      onChange={(e) => setNewArtifactUrl(e.target.value)}
                      placeholder="URL"
                      className="w-full px-2 py-1.5 text-sm text-[#3c4043] placeholder-[#70757a] bg-transparent border-0 border-b border-[#dadce0]
                        focus:outline-none focus:border-[#1a73e8]"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newArtifactType}
                        onChange={(e) => setNewArtifactType(e.target.value as ArtifactType)}
                        className="flex-1 px-2 py-1.5 text-sm text-[#3c4043] bg-transparent border border-[#dadce0] rounded-lg
                          focus:outline-none focus:border-[#1a73e8]"
                      >
                        <option value="link">🔗 Link</option>
                        <option value="doc">📄 Document</option>
                        <option value="pdf">📋 PDF</option>
                        <option value="image">🖼️ Image</option>
                        <option value="file">📁 File</option>
                      </select>
                      {newArtifactName.trim() && newArtifactUrl.trim() && (
                        <button
                          type="button"
                          onClick={handleAddArtifact}
                          className="px-4 py-1.5 text-xs font-medium text-white bg-[#1a73e8] rounded-lg
                            hover:bg-[#1765cc] transition-colors active:scale-[0.98]"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View mode footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#dadce0]">
                <div className="text-xs text-[#70757a]">
                  Created {new Date(task.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 text-sm font-medium bg-[#1a73e8] text-white rounded-xl
                    hover:bg-[#1765cc] transition-colors active:scale-[0.98]"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
          /* EDIT MODE */
          <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Add title"
                className={`${inputClass} text-lg font-medium px-0`}
                autoFocus={!task}
              />
            </div>

            {/* Date & Time row */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#70757a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className={`${inputClass} flex-1`}
                />
              </div>

              {/* All-day toggle */}
              <div className="flex items-center gap-3 pl-8">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm({ ...form, all_day: !form.all_day, start_time: '', end_time: '' })}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer
                      ${form.all_day ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                        ${form.all_day ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                  </div>
                  <span className="text-sm text-[#70757a]">All day</span>
                </label>
              </div>

              {/* Time pickers */}
              {!form.all_day && (
                <div className="flex items-center gap-3 pl-8">
                  <svg className="w-5 h-5 text-[#70757a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className={`${inputClass} flex-1`}
                    placeholder="Start"
                  />
                  <span className="text-[#70757a]">–</span>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className={`${inputClass} flex-1`}
                    placeholder="End"
                  />
                </div>
              )}
            </div>

            {/* Project/Epic */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#70757a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <input
                type="text"
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                placeholder="Project (e.g., Aspen, Task App)"
                className={`${inputClass} flex-1`}
                list="project-suggestions"
              />
              <datalist id="project-suggestions">
                <option value="Aspen" />
                <option value="Task App" />
                <option value="Clawdbot" />
              </datalist>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#70757a] shrink-0 mt-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add description"
                rows={2}
                className={`${inputClass} resize-none flex-1`}
              />
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#70757a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex gap-2 flex-1 flex-wrap">
                {getAgentList().map((agent) => ({ value: agent.id, label: `${agent.emoji} ${agent.label}`, color: agent.color, bg: agent.bgColor })).map(({ value, label, color, bg }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, assignee: value })}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all
                      ${form.assignee === value
                        ? ''
                        : 'bg-[#f1f3f4] text-[#70757a] hover:text-[#3c4043] hover:bg-[#e8eaed]'
                      }`}
                    style={form.assignee === value ? {
                      backgroundColor: bg,
                      color: color,
                      boxShadow: `inset 0 0 0 1px ${color}40`,
                    } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority & Status row */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#70757a] uppercase tracking-wider mb-2">Priority</label>
                <div className="flex gap-1.5">
                  {priorityOptions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium capitalize transition-all
                        ${form.priority === p.value ? p.active : `${p.color} hover:opacity-80`}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#70757a] uppercase tracking-wider mb-2">Status</label>
                <div className="flex gap-1 flex-wrap">
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setForm({ ...form, status: s.value })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all
                        ${form.status === s.value ? s.active : `${s.color} hover:opacity-80`}`}
                    >
                      <span className="mr-1">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtasks section (only for existing tasks) */}
            {task && (
              <div className="border-t border-[#dadce0] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#70757a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-[11px] font-semibold text-[#70757a] uppercase tracking-wider">
                    Subtasks
                    {subtasks.length > 0 && (
                      <span className="ml-1.5 normal-case tracking-normal font-medium">
                        ({subtaskCompleted}/{subtasks.length})
                      </span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                {subtasks.length > 0 && (
                  <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-[#137333] rounded-full transition-all duration-300"
                      style={{ width: `${(subtaskCompleted / subtasks.length) * 100}%` }}
                    />
                  </div>
                )}

                {/* Subtask list */}
                <div className="flex flex-col gap-1">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#f1f3f4] group transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(subtask)}
                        className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                          ${subtask.completed
                            ? 'bg-[#137333] border-[#137333] text-white'
                            : 'border-[#dadce0] hover:border-[#1a73e8]'
                          }`}
                      >
                        {subtask.completed === 1 && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm transition-all
                          ${subtask.completed ? 'line-through text-[#70757a]' : 'text-[#3c4043]'}`}
                      >
                        {subtask.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100
                          text-[#70757a] hover:text-[#c5221f] hover:bg-[#fce8e6] transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add subtask input */}
                <div className="flex items-center gap-2.5 mt-2 px-2">
                  <div className="w-[18px] h-[18px] rounded-md border-2 border-dashed border-[#dadce0] shrink-0" />
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Add subtask..."
                    className="flex-1 text-sm text-[#3c4043] placeholder-[#70757a] bg-transparent border-0
                      focus:outline-none py-1.5"
                  />
                  {newSubtask.trim() && (
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="text-xs font-medium text-[#1a73e8] hover:text-[#1765cc] px-2 py-1 rounded-lg
                        hover:bg-[#e8f0fe] transition-colors"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#dadce0]">
              <div>
                {task && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="px-4 py-2 text-sm text-[#ea4335] hover:bg-[#fce8e6] rounded-xl transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-[#70757a] hover:text-[#3c4043] hover:bg-[#f1f3f4] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-medium bg-[#1a73e8] text-white rounded-xl
                    hover:bg-[#1765cc] transition-colors active:scale-[0.98]"
                >
                  {task ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Status badge component
function StatusBadge({ status }: { status: TaskStatus }) {
  const config: Record<TaskStatus, { bg: string; text: string; label: string; dot?: boolean }> = {
    pending: { bg: 'bg-[#feefc3]', text: 'text-[#b06000]', label: 'Pending' },
    approved: { bg: 'bg-[#d2e3fc]', text: 'text-[#1967d2]', label: 'Approved' },
    'in-progress': { bg: 'bg-[#d2e3fc]', text: 'text-[#1967d2]', label: 'In Progress', dot: true },
    done: { bg: 'bg-[#ceead6]', text: 'text-[#137333]', label: 'Done' },
    rejected: { bg: 'bg-[#fce8e6]', text: 'text-[#c5221f]', label: 'Rejected' },
  };

  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.bg} ${c.text}`}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#1967d2] status-pulse" />}
      {c.label}
    </span>
  );
}
