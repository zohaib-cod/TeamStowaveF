'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import TeamMembersView from '../../components/TeamMembersView';
import CreateTaskModal from '../../components/CreateTaskModal';

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadTeamData = async () => {
    try {
      const [usersRes, tasksRes, leavesRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/leaves').then(r => r.json())
      ]);

      setUsers(usersRes);
      setTasks(tasksRes);
      setLeaves(leavesRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || null;
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading team data:', err);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const handleAddUser = async (userData) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });
      loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewLeave = async (leaveId, status) => {
    try {
      await fetch(`/api/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewerId: currentUser?.id })
      });
      loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      loadTeamData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <MainLayout>
      <TeamMembersView
        users={users}
        currentUser={currentUser}
        isAdmin={isAdmin}
        tasks={tasks}
        leaves={leaves}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
        onApplyLeave={handleApplyLeave}
        onReviewLeave={handleReviewLeave}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
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
