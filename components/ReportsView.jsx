'use client';
import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Star, 
  Filter, 
  Plus, 
  X, 
  MessageSquare,
  Target
} from 'lucide-react';

export default function ReportsView({
  reports,
  users,
  currentUser,
  onSubmitReport,
  onReviewReport
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewingReport, setReviewingReport] = useState(null);
  const [filterMember, setFilterMember] = useState('all');

  // Submit Form state
  const [achievements, setAchievements] = useState('');
  const [plannedNext, setPlannedNext] = useState('');
  const [blockers, setBlockers] = useState('');
  const [hoursWorked, setHoursWorked] = useState(8);
  const [reportType, setReportType] = useState('daily');

  // Review Form state
  const [reviewFeedback, setReviewFeedback] = useState('Excellent progress! Keep it up.');
  const [reviewScore, setReviewScore] = useState(5);

  const filteredReports = reports.filter(r => {
    return filterMember === 'all' || r.userId === filterMember;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReport({
      achievements,
      plannedNext,
      blockers,
      hoursWorked: Number(hoursWorked),
      type: reportType
    });
    setAchievements('');
    setPlannedNext('');
    setBlockers('');
    setShowSubmitModal(false);
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!reviewingReport) return;
    onReviewReport(reviewingReport.id, {
      feedback: reviewFeedback,
      score: reviewScore
    });
    setReviewingReport(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* 1. Header & Controls */}
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
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
                Asynchronous Standups
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(5, 150, 105, 0.12)', color: '#047857' }}>
                Daily & Weekly EOD
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Team Standup & EOD Reports
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 550, margin: '5px 0 0' }}>
              Eliminate redundant meetings: submit high-impact daily achievements, unblock critical issues, and receive direct executive grading.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowSubmitModal(true)} 
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
              id="btn-file-standup"
            >
              <Send size={16} /> File Standup Report
            </button>
          </div>
        </div>

        {/* Filter */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)'
        }}>
          <div style={{ minWidth: '220px' }}>
            <select
              value={filterMember}
              onChange={e => setFilterMember(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                fontSize: '0.86rem',
                fontWeight: 650,
                color: '#030712',
                background: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="all">All Team Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Reports Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredReports.map(rep => {
          const author = users.find(u => u.id === rep.userId);
          const isPending = rep.status === 'pending';

          return (
            <div 
              key={rep.id}
              style={{
                padding: '24px',
                borderRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.76)',
                backdropFilter: 'blur(32px) saturate(210%)',
                WebkitBackdropFilter: 'blur(32px) saturate(210%)',
                border: isPending ? '1.5px solid rgba(2, 132, 199, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={author?.avatar || '/icon.png'} 
                    alt={author?.name} 
                    style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid #cbd5e1' }} 
                  />
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000000' }}>
                      {author?.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 750 }}>
                      {author?.title} • {rep.date} ({rep.type.toUpperCase()})
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${rep.status === 'reviewed' ? 'completed' : 'progress'}`} style={{ fontWeight: 850 }}>
                    {rep.status?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.86rem', color: '#000000', fontWeight: 800 }}>
                    {rep.hoursWorked} hrs
                  </span>
                </div>
              </div>

              {/* Report 3 Sections */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '14px'
              }}>
                {/* Achievements */}
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', border: '1.5px solid rgba(16, 185, 129, 0.4)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#047857', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Completed Achievements
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 650, lineHeight: 1.55 }}>
                    {rep.achievements}
                  </p>
                </div>

                {/* Planned Next */}
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(2, 132, 199, 0.12)', border: '1.5px solid rgba(2, 132, 199, 0.4)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#0284c7', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Target size={16} /> Planned Next
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 650, lineHeight: 1.55 }}>
                    {rep.plannedNext}
                  </p>
                </div>

                {/* Blockers */}
                <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid rgba(239, 68, 68, 0.4)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 850, color: '#b91c1c', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Blockers & Escalations
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 650, lineHeight: 1.55 }}>
                    {rep.blockers || 'No blockers reported.'}
                  </p>
                </div>
              </div>

              {/* Admin Feedback Box */}
              {rep.status === 'reviewed' && (
                <div style={{
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: 'rgba(251, 191, 36, 0.16)',
                  border: '1.5px solid rgba(217, 119, 6, 0.45)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 850, color: '#92400e' }}>
                      Executive Review Feedback
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#000000', fontWeight: 750, margin: '4px 0 0' }}>
                      "{rep.feedback}"
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={15} fill={s <= rep.score ? '#d97706' : 'none'} color="#d97706" />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Action: Grade Report */}
              {isAdmin && rep.status === 'pending' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                  <button
                    onClick={() => setReviewingReport(rep)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '9999px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 850,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Star size={14} /> Review & Grade Standup
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#000000' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 850, color: '#000000' }}>No reports found.</p>
            <p style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 650, marginTop: '4px' }}>Submit an asynchronous EOD standup to track progress.</p>
          </div>
        )}
      </div>

      {/* 3. Modal: File Standup */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>File Standup Report</h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  What did you complete / achieve today?
                </label>
                <textarea
                  required
                  rows={3}
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  placeholder="Completed microservices routing, closed customer support tickets, tested Apify radar..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.88rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  What are you working on next?
                </label>
                <textarea
                  required
                  rows={3}
                  value={plannedNext}
                  onChange={e => setPlannedNext(e.target.value)}
                  placeholder="Focus on mobile UI responsiveness and database indexing..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.88rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Any blockers or escalations needing attention?
                </label>
                <textarea
                  rows={2}
                  value={blockers}
                  onChange={e => setBlockers(e.target.value)}
                  placeholder="Waiting on API keys, design assets, or approvals..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.88rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hoursWorked}
                    onChange={e => setHoursWorked(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(203, 213, 225, 0.95)',
                      fontSize: '0.88rem',
                      color: '#030712',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                    Report Cadence
                  </label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(203, 213, 225, 0.95)',
                      fontSize: '0.88rem',
                      color: '#030712',
                      fontWeight: 650,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="daily">Daily EOD</option>
                    <option value="weekly">Weekly Wrap</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={15} /> Submit Standup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Review Standup */}
      {reviewingReport && (
        <div className="modal-overlay" onClick={() => setReviewingReport(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0 }}>Grade & Review Standup</h3>
              </div>
              <button onClick={() => setReviewingReport(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Rating (1 - 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewScore(star)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: star <= reviewScore ? 'rgba(251, 191, 36, 0.25)' : 'rgba(241, 245, 249, 0.9)',
                        border: star <= reviewScore ? '1.5px solid #d97706' : '1.5px solid #cbd5e1',
                        color: star <= reviewScore ? '#b45309' : '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 800
                      }}
                    >
                      <Star size={16} fill={star <= reviewScore ? '#d97706' : 'none'} color="#d97706" />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Executive Guidance & Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  placeholder="Great milestone delivery, appreciate the proactive unblocking..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.88rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setReviewingReport(null)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#059669', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Approve & Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
