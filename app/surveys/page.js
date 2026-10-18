'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import FeedbackSurveys from '../../components/FeedbackSurveys';
import CreateSurveyModal from '../../components/CreateSurveyModal';
import confetti from 'canvas-confetti';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  const loadSurveysData = async () => {
    try {
      const [surveysRes, usersRes] = await Promise.all([
        fetch('/api/surveys').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);
      setSurveys(surveysRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || null;
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading surveys:', err);
    }
  };

  useEffect(() => {
    loadSurveysData();
  }, []);

  const handleCreateSurvey = async (surveyData) => {
    try {
      await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData)
      });
      loadSurveysData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSurveyResponse = async (surveyId, responseData) => {
    try {
      const res = await fetch(`/api/surveys/${surveyId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });
      if (res.ok) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        loadSurveysData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    try {
      await fetch(`/api/surveys/${surveyId}`, { method: 'DELETE' });
      loadSurveysData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <MainLayout>
      <FeedbackSurveys
        surveys={surveys}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenSurveyModal={() => setIsSurveyModalOpen(true)}
        onSubmitSurveyResponse={handleSubmitSurveyResponse}
        onDeleteSurvey={handleDeleteSurvey}
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
