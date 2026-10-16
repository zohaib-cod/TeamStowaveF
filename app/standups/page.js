'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import ReportsView from '../../components/ReportsView';

export default function StandupsPage() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const loadReportsData = async () => {
    try {
      const [reportsRes, usersRes] = await Promise.all([
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);
      setReports(reportsRes);
      setUsers(usersRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || usersRes.find(u => u.role === 'admin') || usersRes[0];
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleSubmitReport = async (reportData) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      loadReportsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewReport = async (reportId, reviewData) => {
    try {
      await fetch(`/api/reports/${reportId}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      loadReportsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      loadReportsData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <MainLayout>
      <ReportsView
        reports={reports}
        users={users}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onSubmitReport={handleSubmitReport}
        onReviewReport={handleReviewReport}
        onDeleteReport={handleDeleteReport}
      />
    </MainLayout>
  );
}
