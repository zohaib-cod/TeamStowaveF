'use client';
import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Send, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Trash2, 
  BarChart2, 
  AlertCircle, 
  X, 
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

export default function FeedbackSurveys({
  surveys,
  currentUser,
  onOpenSurveyModal,
  onSubmitResponse,
  onSubmitSurveyResponse,
  onDeleteSurvey
}) {
  const isAdmin = currentUser?.role === 'admin';
  const submitFn = onSubmitResponse || onSubmitSurveyResponse;
  const [activeSurveyModal, setActiveSurveyModal] = useState(null);
  const [resultsSurveyModal, setResultsSurveyModal] = useState(null);
  const [answers, setAnswers] = useState({});

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
        ' at ' + 
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatRemainingTime = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return { expired: true, text: 'Expired & Closed' };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return {
      expired: false,
      text: `${hours}h ${minutes}m Remaining`
    };
  };

  const handleOpenParticipate = (survey) => {
    setActiveSurveyModal(survey);
    const initial = {};
    survey.questions?.forEach(q => {
      initial[q.id] = q.type === 'rating' ? 5 : '';
    });
    setAnswers(initial);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeSurveyModal) return;

    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }));

    const payload = {
      respondentId: currentUser?.id,
      respondentName: currentUser?.name,
      answers: formattedAnswers
    };

    if (submitFn) {
      submitFn(activeSurveyModal.id, payload);
    }
    setActiveSurveyModal(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* 1. Header & Create Banner */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(36px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '24px 28px',
        boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(217, 119, 6, 0.12)', color: '#b45309' }}>
                Psychological Safety & Leadership Pulse
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(225, 29, 72, 0.12)', color: '#be123c' }}>
                Time-Bound Duration
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Timed Feedback & Admin Evaluation Surveys
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 550, margin: '5px 0 0' }}>
              Evaluate leadership behaviour, operational bottlenecks, and workplace culture with live countdown timers and optional anonymous privacy.
            </p>
          </div>

          {isAdmin && (
            <button 
              onClick={onOpenSurveyModal} 
              style={{
                padding: '11px 22px',
                borderRadius: '9999px',
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
              }}
              id="btn-create-timed-survey"
            >
              <Plus size={16} /> Create New Timed Survey
            </button>
          )}
        </div>
      </div>

      {/* 2. Surveys Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '20px'
      }}>
        {surveys.map(survey => {
          const timer = formatRemainingTime(survey.expiresAt);
          const isClosed = timer.expired || survey.effectiveStatus === 'closed';

          return (
            <div
              key={survey.id}
              style={{
                padding: '24px',
                borderRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.76)',
                backdropFilter: 'blur(32px) saturate(210%)',
                WebkitBackdropFilter: 'blur(32px) saturate(210%)',
                border: isClosed ? '1.5px solid rgba(203, 213, 225, 0.95)' : '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
              }}
            >
              {/* Card Top: Privacy mode & Live Countdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  background: survey.isAnonymous ? 'rgba(124, 58, 237, 0.16)' : 'rgba(2, 132, 199, 0.16)',
                  color: survey.isAnonymous ? '#5b21b6' : '#075985',
                  border: survey.isAnonymous ? '1.5px solid rgba(124, 58, 237, 0.45)' : '1.5px solid rgba(2, 132, 199, 0.45)',
                  padding: '4px 11px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 850,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {survey.isAnonymous ? <Lock size={12} /> : <Unlock size={12} />}
                  {survey.isAnonymous ? 'Anonymous Responses' : 'Identifiable'}
                </span>

                {/* Countdown Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  background: isClosed ? 'rgba(239, 68, 68, 0.16)' : 'rgba(217, 119, 6, 0.16)',
                  color: isClosed ? '#991b1b' : '#92400e',
                  border: isClosed ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(217, 119, 6, 0.45)',
                  fontSize: '0.8rem',
                  fontWeight: 850
                }}>
                  <Clock size={14} />
                  <span>{timer.text}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000000', marginBottom: '8px' }}>
                  {survey.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 650, lineHeight: 1.6 }}>
                  {survey.description}
                </p>
              </div>

              {/* Meta details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(203, 213, 225, 0.95)',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 850, color: '#000000' }}>Duration</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>{survey.durationHours} Hours</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.76rem', fontWeight: 850, color: '#000000' }}>Questions</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>{survey.questions?.length || 0} Items</div>
                </div>
                <div 
                  onClick={() => setResultsSurveyModal(survey)}
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  title="Click to view responses & feedback details"
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 850, color: '#0284c7' }}>Submissions 📊</span>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#064e3b' }}>{survey.responseCount || 0} Received</div>
                </div>
              </div>

              {/* Questions Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 850, color: '#000000' }}>
                  Questions Covered:
                </span>
                {survey.questions?.slice(0, 3).map((q) => (
                  <div key={q.id} style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#e11d48', fontWeight: 850 }}>•</span> {q.text}
                  </div>
                ))}
                {survey.questions?.length > 3 && (
                  <span style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 800 }}>
                    +{survey.questions.length - 3} more questions...
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(226, 232, 240, 0.95)'
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    disabled={isClosed}
                    onClick={() => handleOpenParticipate(survey)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      background: isClosed ? 'rgba(241, 245, 249, 0.95)' : '#e11d48',
                      color: isClosed ? '#0f172a' : '#ffffff',
                      border: isClosed ? '1.5px solid #cbd5e1' : 'none',
                      fontSize: '0.86rem',
                      fontWeight: 850,
                      cursor: isClosed ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Send size={14} /> {isClosed ? 'Survey Closed' : 'Participate & Rate'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultsSurveyModal(survey)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1.5px solid #0284c7',
                      color: '#0284c7',
                      fontSize: '0.86rem',
                      fontWeight: 850,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
                    }}
                  >
                    <BarChart2 size={15} /> View Results & Ratings ({survey.responseCount || 0})
                  </button>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => onDeleteSurvey(survey.id)}
                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '6px' }}
                    title="Delete survey"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {surveys.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#000000' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 850, color: '#000000' }}>No feedback surveys active right now.</p>
            <p style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 650, marginTop: '4px' }}>Click "+ Create New Timed Survey" to launch an anonymous or open pulse.</p>
          </div>
        )}
      </div>

      {/* 3. Modal: Participate in Survey */}
      {activeSurveyModal && (
        <div className="modal-overlay" onClick={() => setActiveSurveyModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: activeSurveyModal.isAnonymous ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)', color: activeSurveyModal.isAnonymous ? '#7c3aed' : '#0284c7', display: 'inline-block', marginBottom: '6px' }}>
                  {activeSurveyModal.isAnonymous ? '🔒 100% Anonymous Feedback' : '👤 Open Feedback'}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                  {activeSurveyModal.title}
                </h3>
              </div>
              <button onClick={() => setActiveSurveyModal(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 550, marginBottom: '22px', lineHeight: 1.5 }}>
              {activeSurveyModal.description}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeSurveyModal.questions?.map((q, idx) => (
                <div key={q.id} style={{ padding: '16px', background: 'rgba(241, 245, 249, 0.95)', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#030712', marginBottom: '8px' }}>
                    {idx + 1}. {q.text}
                  </label>

                  {q.type === 'rating' ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: star })}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '10px',
                            background: answers[q.id] >= star ? 'rgba(251, 191, 36, 0.25)' : '#ffffff',
                            border: answers[q.id] >= star ? '1.5px solid #d97706' : '1.5px solid #cbd5e1',
                            color: answers[q.id] >= star ? '#b45309' : '#0f172a',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 800
                          }}
                        >
                          <Star size={16} fill={answers[q.id] >= star ? '#d97706' : 'none'} color="#d97706" />
                          <span>{star}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      required
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder="Type your honest evaluation and constructive insights..."
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid rgba(203, 213, 225, 0.95)',
                        fontSize: '0.88rem',
                        fontWeight: 550,
                        color: '#030712',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setActiveSurveyModal(null)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={15} /> Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: View Survey Results, Ratings & Feedback Comments */}
      {resultsSurveyModal && (() => {
        const responses = resultsSurveyModal.responses || [];
        const questions = resultsSurveyModal.questions || [];
        
        // Calculate overall average rating across all rating questions
        let totalRatingSum = 0;
        let totalRatingCount = 0;
        let totalCommentsCount = 0;

        questions.forEach(q => {
          if (q.type === 'rating') {
            responses.forEach(r => {
              const ans = r.answers?.find(a => a.questionId === q.id)?.answer;
              if (typeof ans === 'number') {
                totalRatingSum += ans;
                totalRatingCount++;
              }
            });
          } else {
            responses.forEach(r => {
              const ans = r.answers?.find(a => a.questionId === q.id)?.answer;
              if (ans && typeof ans === 'string' && ans.trim()) {
                totalCommentsCount++;
              }
            });
          }
        });

        const overallAverage = totalRatingCount > 0 
          ? (totalRatingSum / totalRatingCount).toFixed(1) 
          : null;

        return (
          <div className="modal-overlay" onClick={() => setResultsSurveyModal(null)}>
            <div 
              className="modal-content" 
              onClick={e => e.stopPropagation()} 
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(40px)',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                padding: '28px',
                maxWidth: '750px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 65px rgba(0, 0, 0, 0.22)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 850,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: resultsSurveyModal.isAnonymous ? 'rgba(124, 58, 237, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                      color: resultsSurveyModal.isAnonymous ? '#7c3aed' : '#0284c7'
                    }}>
                      {resultsSurveyModal.isAnonymous ? '🔒 100% Anonymous Responses' : '👤 Open Feedback'}
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 850,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(5, 150, 105, 0.12)',
                      color: '#059669'
                    }}>
                      {responses.length} Submissions Received
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
                    {resultsSurveyModal.title} — Analytics & Feedback
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b', fontWeight: 550 }}>
                    {resultsSurveyModal.description}
                  </p>
                </div>
                <button 
                  onClick={() => setResultsSurveyModal(null)} 
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#030712', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 3 Top Summary Metric Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(241, 245, 249, 0.95)', border: '1.5px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontSize: '0.76rem', fontWeight: 800 }}>
                    <Users size={14} /> Total Respondents
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
                    {responses.length}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650 }}>
                    Team members contributed
                  </span>
                </div>

                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(254, 243, 199, 0.65)', border: '1.5px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontSize: '0.76rem', fontWeight: 800 }}>
                    <Star size={14} fill="#b45309" /> Average Rating
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#92400e', marginTop: '4px' }}>
                    {overallAverage ? `${overallAverage} / 5.0` : 'N/A'}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 650 }}>
                    {totalRatingCount} ratings recorded
                  </span>
                </div>

                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(236, 253, 245, 0.75)', border: '1.5px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontSize: '0.76rem', fontWeight: 800 }}>
                    <MessageSquare size={14} /> Written Comments
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#064e3b', marginTop: '4px' }}>
                    {totalCommentsCount}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 650 }}>
                    Qualitative insights provided
                  </span>
                </div>
              </div>

              {/* Questions Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#030712', margin: 0, paddingBottom: '8px', borderBottom: '1.5px solid #e2e8f0' }}>
                  📋 Detailed Question-by-Question Breakdown & Comments
                </h4>

                {questions.map((q, qIndex) => {
                  if (q.type === 'rating') {
                    const qAnswers = responses
                      .map(r => ({
                        rating: r.answers?.find(a => a.questionId === q.id)?.answer,
                        respondent: r.respondentName,
                        date: r.submittedAt
                      }))
                      .filter(item => typeof item.rating === 'number');

                    const avg = qAnswers.length > 0 
                      ? (qAnswers.reduce((sum, item) => sum + item.rating, 0) / qAnswers.length).toFixed(1)
                      : null;

                    // Breakdown counts for 5, 4, 3, 2, 1
                    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                    qAnswers.forEach(item => {
                      if (starCounts[item.rating] !== undefined) starCounts[item.rating]++;
                    });

                    return (
                      <div key={q.id} style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>
                              Question {qIndex + 1} • Star Rating
                            </span>
                            <h5 style={{ fontSize: '0.98rem', fontWeight: 850, color: '#0f172a', margin: '4px 0 0' }}>
                              {q.text}
                            </h5>
                          </div>

                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fef3c7',
                            padding: '6px 14px',
                            borderRadius: '999px',
                            border: '1px solid #fde68a'
                          }}>
                            <Star size={16} fill="#d97706" color="#d97706" />
                            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#92400e' }}>
                              {avg ? `${avg} / 5.0` : 'No ratings yet'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700 }}>
                              ({qAnswers.length} responses)
                            </span>
                          </div>
                        </div>

                        {/* Star Distribution Visual Bars */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                          {[5, 4, 3, 2, 1].map(star => {
                            const count = starCounts[star] || 0;
                            const percentage = qAnswers.length > 0 ? Math.round((count / qAnswers.length) * 100) : 0;
                            return (
                              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                                <span style={{ width: '45px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  {star} <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                </span>
                                <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: star >= 4 ? '#059669' : (star === 3 ? '#f59e0b' : '#ef4444'),
                                    borderRadius: '999px',
                                    transition: 'width 0.3s ease'
                                  }} />
                                </div>
                                <span style={{ width: '60px', textAlign: 'right', fontWeight: 750, color: '#0f172a' }}>
                                  {count} ({percentage}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Individual Ratings List */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {qAnswers.map((item, i) => (
                            <span key={i} style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.74rem',
                              fontWeight: 750,
                              color: '#1e293b'
                            }}>
                              <span>{item.respondent}:</span>
                              <span style={{ color: '#b45309', fontWeight: 850 }}>⭐ {item.rating}/5</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // Text / Comments question
                    const qComments = responses
                      .map(r => ({
                        text: r.answers?.find(a => a.questionId === q.id)?.answer,
                        respondent: r.respondentName,
                        date: r.submittedAt
                      }))
                      .filter(item => item.text && typeof item.text === 'string' && item.text.trim());

                    return (
                      <div key={q.id} style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                      }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                            Question {qIndex + 1} • Written Feedback & Comments
                          </span>
                          <h5 style={{ fontSize: '0.98rem', fontWeight: 850, color: '#0f172a', margin: '4px 0 0' }}>
                            {q.text}
                          </h5>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                            {qComments.length} comments submitted
                          </span>
                        </div>

                        {qComments.length === 0 ? (
                          <div style={{ padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.82rem', fontWeight: 650 }}>
                            No written comments provided for this question yet.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {qComments.map((comment, cIdx) => (
                              <div key={cIdx} style={{
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(241, 245, 249, 0.85)',
                                border: '1px solid #cbd5e1'
                              }}>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#030712', fontWeight: 650, lineHeight: 1.5 }}>
                                  "{comment.text}"
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                                  <span style={{ color: resultsSurveyModal.isAnonymous ? '#7c3aed' : '#0284c7', fontWeight: 800 }}>
                                    {comment.respondent}
                                  </span>
                                  <span>{formatDateTime(comment.date)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}

                {responses.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 850, color: '#0f172a' }}>
                      Abhi tak kisi team member ne is survey may participate nahi kiya.
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                      Jaise hi team members survey fill karenge, unke ratings aur written comments yahan foran live show honge.
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setResultsSurveyModal(null)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Close Results
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
