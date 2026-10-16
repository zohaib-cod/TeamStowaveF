'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import DashboardOverview from '../components/DashboardOverview';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateSurveyModal from '../components/CreateSurveyModal';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [shoutouts, setShoutouts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, tasksRes, reportsRes, surveysRes, shoutoutsRes, annRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/surveys').then(r => r.json()),
        fetch('/api/shoutouts').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json())
      ]);

      setStats(statsRes);
      setUsers(usersRes);
      setTasks(tasksRes);
      setReports(reportsRes);
      setSurveys(surveysRes);
      setShoutouts(shoutoutsRes);
      setAnnouncements(annRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || usersRes.find(u => u.role === 'admin') || usersRes[0];
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSurvey = async (surveyData) => {
    try {
      await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <DashboardOverview
        stats={stats}
        currentUser={currentUser}
        users={users}
        tasks={tasks}
        reports={reports}
        surveys={surveys}
        shoutouts={shoutouts}
        announcements={announcements}
        setCurrentTab={(tab) => {
          const routeMap = {
            tasks: '/tasks',
            reports: '/standups',
            surveys: '/surveys',
            recognition: '/recognition',
            team: '/team',
            apify: '/apify'
          };
          if (routeMap[tab]) window.location.href = routeMap[tab];
        }}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        onOpenSurveyModal={() => setIsSurveyModalOpen(true)}
        onOpenGiftModal={() => window.location.href = '/recognition'}
        onOpenAiDrawer={() => {}}
      />

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onCreateTask={handleCreateTask}
      />

      <CreateSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        currentUser={currentUser}
        onCreateSurvey={handleCreateSurvey}
      />
    </MainLayout>
  );
}
