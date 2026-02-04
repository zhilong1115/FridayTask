import { useState, useEffect, useCallback } from 'react';
import type { Task, CronJob, TaskFormData, Subtask, Comment, Artifact, ArtifactType } from '../types';

const API = '/api';

// Helper to get auth headers from localStorage
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('friday-auth-token');
  return token ? { 'Content-Type': 'application/json', 'X-Auth-Token': token } : { 'Content-Type': 'application/json' };
};

// Helper for auth-required fetch that throws on 401
const authFetch = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  if (res.status === 401) {
    throw new Error('AUTH_REQUIRED');
  }
  return res;
};

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
    const res = await authFetch(`${API}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        all_day: data.all_day ? 1 : 0,
        start_time: data.all_day ? null : data.start_time || null,
        end_time: data.all_day ? null : data.end_time || null,
      }),
    });
    const task = await res.json();
    await fetchTasks();
    return task;
  };

  const updateTask = async (id: number, data: Partial<TaskFormData>): Promise<Task | null> => {
    const body: Record<string, unknown> = { ...data };
    if (data.all_day !== undefined) {
      body.all_day = data.all_day ? 1 : 0;
      if (data.all_day) {
        body.start_time = null;
        body.end_time = null;
      }
    }
    const res = await authFetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    const task = await res.json();
    await fetchTasks();
    return task;
  };

  const deleteTask = async (id: number): Promise<boolean> => {
    await authFetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  // Approve / Reject
  const approveTask = async (id: number): Promise<Task | null> => {
    const res = await authFetch(`${API}/tasks/${id}/approve`, { method: 'PUT' });
    const task = await res.json();
    await fetchTasks();
    return task;
  };

  const rejectTask = async (id: number): Promise<Task | null> => {
    const res = await authFetch(`${API}/tasks/${id}/reject`, { method: 'PUT' });
    const task = await res.json();
    await fetchTasks();
    return task;
  };

  // Subtask operations
  const createSubtask = async (taskId: number, title: string): Promise<Subtask | null> => {
    const res = await authFetch(`${API}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    const subtask = await res.json();
    await fetchTasks();
    return subtask;
  };

  const updateSubtask = async (subtaskId: number, data: Partial<Subtask>): Promise<Subtask | null> => {
    const res = await authFetch(`${API}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const subtask = await res.json();
    await fetchTasks();
    return subtask;
  };

  const deleteSubtask = async (subtaskId: number): Promise<boolean> => {
    await authFetch(`${API}/subtasks/${subtaskId}`, { method: 'DELETE' });
    await fetchTasks();
    return true;
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
    const res = await authFetch(`${API}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    });
    const comment = await res.json();
    await fetchTasks();
    return comment;
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
    const res = await authFetch(`${API}/tasks/${taskId}/artifacts`, {
      method: 'POST',
      body: JSON.stringify({ name, url, type }),
    });
    const artifact = await res.json();
    await fetchTasks();
    return artifact;
  };

  const deleteArtifact = async (artifactId: number): Promise<boolean> => {
    await authFetch(`${API}/artifacts/${artifactId}`, { method: 'DELETE' });
    await fetchTasks();
    return true;
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
