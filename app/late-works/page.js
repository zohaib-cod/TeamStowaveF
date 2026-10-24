'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import LateWorksHub from '../../components/LateWorksHub';

export default function LateWorksPage() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);

      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || null;
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Failed to load Late Works data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('tasks-updated', handleUpdate);
    window.addEventListener('stowave_data_updated', handleUpdate);

    return () => {
      window.removeEventListener('tasks-updated', handleUpdate);
      window.removeEventListener('stowave_data_updated', handleUpdate);
    };
  }, []);

  return (
    <MainLayout>
      <div style={{ minHeight: 'calc(100vh - 80px)' }}>
        <LateWorksHub
          tasks={tasks}
          users={users}
          currentUser={currentUser}
          onRefresh={loadData}
        />
      </div>
    </MainLayout>
  );
}
