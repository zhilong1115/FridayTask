import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import TaskModal from './components/TaskModal';
import SummaryModal from './components/SummaryModal';
import ArtifactsModal from './components/ArtifactsModal';
import KnowledgeModal from './components/KnowledgeModal';
import MobileNav from './components/MobileNav';
import type { Task, TaskFormData, SidebarView } from './types';

export default function App() {
  const {
    tasks, cronJobs, loading,
    createTask, updateTask, deleteTask,
    approveTask, rejectTask,
    createSubtask, updateSubtask, deleteSubtask,
    fetchComments, createComment,
    fetchArtifacts, createArtifact, deleteArtifact,
  } = useTasks();

  const [sidebarView, setSidebarView] = useState<SidebarView>('list');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal state
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [artifactsOpen, setArtifactsOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultTime, setDefaultTime] = useState('');

  const openCreate = (date?: string, time?: string) => {
    setEditingTask(null);
    setDefaultDate(date || new Date().toISOString().split('T')[0]);
    setDefaultTime(time || '');
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDefaultDate('');
    setDefaultTime('');
    setModalOpen(true);
  };

  const handleSave = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (editingTask) {
      await deleteTask(editingTask.id);
      setModalOpen(false);
    }
  };

  const handleApprove = async () => {
    if (editingTask) {
      const updated = await approveTask(editingTask.id);
      if (updated) {
        // Refresh editingTask with latest from tasks list
        setEditingTask((prev) => prev ? { ...prev, status: 'approved' } : null);
      }
    }
  };

  const handleReject = async () => {
    if (editingTask) {
      const updated = await rejectTask(editingTask.id);
      if (updated) {
        setEditingTask((prev) => prev ? { ...prev, status: 'rejected' } : null);
      }
    }
  };

  // Keep editingTask in sync with tasks array
  const currentTask = editingTask
    ? tasks.find((t) => t.id === editingTask.id) || editingTask
    : null;

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#70757a]">
          <div className="w-9 h-9 rounded-xl bg-[#f9ab00] animate-pulse" />
          <span className="text-sm font-medium">Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-[#3c4043] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar
        view={sidebarView}
        onViewChange={setSidebarView}
        filterAssignee={filterAssignee}
        onFilterAssignee={setFilterAssignee}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
        onCreateTask={() => openCreate()}
        onOpenSummary={() => setSummaryOpen(true)}
        onOpenArtifacts={() => setArtifactsOpen(true)}
        onOpenKnowledge={() => setKnowledgeOpen(true)}
      />

      {/* Mobile Nav */}
      <MobileNav
        view={sidebarView}
        onViewChange={setSidebarView}
        onCreateTask={() => openCreate()}
        onOpenSummary={() => setSummaryOpen(true)}
        onOpenArtifacts={() => setArtifactsOpen(true)}
        onOpenKnowledge={() => setKnowledgeOpen(true)}
        filterAssignee={filterAssignee}
        onFilterAssignee={setFilterAssignee}
        filterStatus={filterStatus}
        onFilterStatus={setFilterStatus}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-white">
        {sidebarView === 'calendar' ? (
          <CalendarView
            tasks={tasks}
            cronJobs={cronJobs}
            onTaskClick={openEdit}
            onDateClick={(date, time) => openCreate(date, time)}
            filterAssignee={filterAssignee}
            filterStatus={filterStatus}
          />
        ) : (
          <ListView
            tasks={tasks}
            cronJobs={cronJobs}
            onTaskClick={openEdit}
            filterAssignee={filterAssignee}
            filterStatus={filterStatus}
          />
        )}
      </main>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        tasks={tasks}
      />

      {/* Artifacts Modal */}
      <ArtifactsModal
        isOpen={artifactsOpen}
        onClose={() => setArtifactsOpen(false)}
      />

      {/* Knowledge Modal */}
      <KnowledgeModal
        isOpen={knowledgeOpen}
        onClose={() => setKnowledgeOpen(false)}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={editingTask ? handleDelete : undefined}
        onApprove={currentTask?.status === 'pending' ? handleApprove : undefined}
        onReject={currentTask?.status === 'pending' ? handleReject : undefined}
        task={currentTask}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        onCreateSubtask={createSubtask}
        onUpdateSubtask={updateSubtask}
        onDeleteSubtask={deleteSubtask}
        onFetchComments={fetchComments}
        onCreateComment={createComment}
        onFetchArtifacts={fetchArtifacts}
        onCreateArtifact={createArtifact}
        onDeleteArtifact={deleteArtifact}
      />
    </div>
  );
}
