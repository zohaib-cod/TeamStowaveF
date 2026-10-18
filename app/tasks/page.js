'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import TaskBoard from '../../components/TaskBoard';
import CreateTaskModal from '../../components/CreateTaskModal';
import confetti from 'canvas-confetti';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadTasksData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);
      setTasks(tasksRes);
      setUsers(usersRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || null;
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  useEffect(() => {
    loadTasksData();

    const handleUpdate = () => loadTasksData();
    window.addEventListener('tasks-updated', handleUpdate);
    window.addEventListener('stowave_data_updated', handleUpdate);

    return () => {
      window.removeEventListener('tasks-updated', handleUpdate);
      window.removeEventListener('stowave_data_updated', handleUpdate);
    };
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitWork = async (taskId, submissionData) => {
    try {
      await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewTask = async (taskId, reviewData) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewData, reviewerId: currentUser?.id })
      });
      if (res.ok && reviewData.status === 'completed') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnsubmitWork = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/unsubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete submission');
      }
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestExtension = async (taskId, extensionData) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/request-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extensionData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to request extension');
      }
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewExtension = async (taskId, reviewData) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/review-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to review extension');
      }
      loadTasksData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <TaskBoard
        tasks={tasks}
        users={users}
        currentUser={currentUser}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onSubmitWork={handleSubmitWork}
        onUnsubmitWork={handleUnsubmitWork}
        onReviewTask={handleReviewTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTaskStatus={loadTasksData}
        onRequestExtension={handleRequestExtension}
        onReviewExtension={handleReviewExtension}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onCreateTask={handleCreateTask}
      />
    </MainLayout>
  );
}
