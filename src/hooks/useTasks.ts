import { useState, useEffect, useCallback } from 'react';
import type { Task, CronJob, TaskFormData, Subtask, Comment, Artifact, ArtifactType } from '../types';

const API = '/api';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, []);

  const fetchCronJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/cron-jobs`);
      const data = await res.json();
      setCronJobs(data);
    } catch (err) {
      console.error('Failed to fetch cron jobs:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchCronJobs()]).finally(() => setLoading(false));
  }, [fetchTasks, fetchCronJobs]);

  const createTask = async (data: TaskFormData): Promise<Task | null> => {
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          all_day: data.all_day ? 1 : 0,
          start_time: data.all_day ? null : data.start_time || null,
          end_time: data.all_day ? null : data.end_time || null,
        }),
      });
      const task = await res.json();
      await fetchTasks(); // Refresh to get subtasks included
      return task;
    } catch (err) {
      console.error('Failed to create task:', err);
      return null;
    }
  };

  const updateTask = async (id: number, data: Partial<TaskFormData>): Promise<Task | null> => {
    try {
      const body: Record<string, unknown> = { ...data };
      if (data.all_day !== undefined) {
        body.all_day = data.all_day ? 1 : 0;
        if (data.all_day) {
          body.start_time = null;
          body.end_time = null;
        }
      }
      const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const task = await res.json();
      await fetchTasks(); // Refresh to get subtasks included
      return task;
    } catch (err) {
      console.error('Failed to update task:', err);
      return null;
    }
  };

  const deleteTask = async (id: number): Promise<boolean> => {
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      return false;
    }
  };

  // Approve / Reject
  const approveTask = async (id: number): Promise<Task | null> => {
    try {
      const res = await fetch(`${API}/tasks/${id}/approve`, { method: 'PUT' });
      const task = await res.json();
      await fetchTasks();
      return task;
    } catch (err) {
      console.error('Failed to approve task:', err);
      return null;
    }
  };

  const rejectTask = async (id: number): Promise<Task | null> => {
    try {
      const res = await fetch(`${API}/tasks/${id}/reject`, { method: 'PUT' });
      const task = await res.json();
      await fetchTasks();
      return task;
    } catch (err) {
      console.error('Failed to reject task:', err);
      return null;
    }
  };

  // Subtask operations
  const createSubtask = async (taskId: number, title: string): Promise<Subtask | null> => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const subtask = await res.json();
      await fetchTasks();
      return subtask;
    } catch (err) {
      console.error('Failed to create subtask:', err);
      return null;
    }
  };

  const updateSubtask = async (subtaskId: number, data: Partial<Subtask>): Promise<Subtask | null> => {
    try {
      const res = await fetch(`${API}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const subtask = await res.json();
      await fetchTasks();
      return subtask;
    } catch (err) {
      console.error('Failed to update subtask:', err);
      return null;
    }
  };

  const deleteSubtask = async (subtaskId: number): Promise<boolean> => {
    try {
      await fetch(`${API}/subtasks/${subtaskId}`, { method: 'DELETE' });
      await fetchTasks();
      return true;
    } catch (err) {
      console.error('Failed to delete subtask:', err);
      return false;
    }
  };

  // Comment operations
  const fetchComments = async (taskId: number): Promise<Comment[]> => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/comments`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      return [];
    }
  };

  const createComment = async (taskId: number, author: string, content: string): Promise<Comment | null> => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      const comment = await res.json();
      await fetchTasks(); // Refresh comment counts
      return comment;
    } catch (err) {
      console.error('Failed to create comment:', err);
      return null;
    }
  };

  // Artifact operations
  const fetchArtifacts = async (taskId: number): Promise<Artifact[]> => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/artifacts`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch artifacts:', err);
      return [];
    }
  };

  const createArtifact = async (taskId: number, name: string, url: string, type: ArtifactType): Promise<Artifact | null> => {
    try {
      const res = await fetch(`${API}/tasks/${taskId}/artifacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url, type }),
      });
      const artifact = await res.json();
      await fetchTasks(); // Refresh artifact counts
      return artifact;
    } catch (err) {
      console.error('Failed to create artifact:', err);
      return null;
    }
  };

  const deleteArtifact = async (artifactId: number): Promise<boolean> => {
    try {
      await fetch(`${API}/artifacts/${artifactId}`, { method: 'DELETE' });
      await fetchTasks();
      return true;
    } catch (err) {
      console.error('Failed to delete artifact:', err);
      return false;
    }
  };

  return {
    tasks,
    cronJobs,
    loading,
    createTask,
    updateTask,
    deleteTask,
    approveTask,
    rejectTask,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    fetchComments,
    createComment,
    fetchArtifacts,
    createArtifact,
    deleteArtifact,
    refreshTasks: fetchTasks,
  };
}
