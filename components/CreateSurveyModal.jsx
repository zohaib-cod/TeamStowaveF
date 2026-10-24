'use client';
import React, { useState } from 'react';
import { Clock, Plus, Trash2, X, Lock, ShieldCheck } from 'lucide-react';

export default function CreateSurveyModal({
  isOpen,
  onClose,
  currentUser,
  onCreateSurvey
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState('admin_behaviour');
  const [durationHours, setDurationHours] = useState(48);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Dynamic Questions list
  const [questions, setQuestions] = useState([
    { id: 'q1', text: 'How transparent and supportive was leadership communication this week?', type: 'rating' },
    { id: 'q2', text: 'Did you experience any blockers or micro-management that slowed down your execution?', type: 'text' },
    { id: 'q3', text: 'How would you rate psychological safety and team morale right now?', type: 'rating' }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('rating');

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions([
      ...questions,
      { id: `q_${Date.now()}`, text: newQuestionText.trim(), type: newQuestionType }
    ]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert('Please add at least one survey question.');
      return;
    }

    onCreateSurvey({
      title,
      description,
      targetType,
      durationHours: Number(durationHours),
      isAnonymous,
      questions,
      createdBy: currentUser?.id
    });

    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
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
            <Clock size={20} color="#d97706" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>Create Timed Feedback Survey</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Survey Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Leadership & Admin Behaviour 360 Review"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Context / Instructions for Team</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain how this feedback will be used to improve company culture..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 550, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Evaluation Target</label>
              <select
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="admin_behaviour">Admin & Leadership Behaviour</option>
                <option value="team_culture">Workplace Culture & Safety</option>
                <option value="project">Sprint & Engineering Delivery</option>
                <option value="general">General Company Strategy</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Duration Countdown (Hours)</label>
              <select
                value={durationHours}
                onChange={e => setDurationHours(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}
              >
                <option value={12}>12 Hours (Flash pulse)</option>
                <option value={24}>24 Hours (1 Day)</option>
                <option value={48}>48 Hours (2 Days - Recommended)</option>
                <option value={72}>72 Hours (3 Days)</option>
                <option value={168}>168 Hours (1 Week)</option>
              </select>
            </div>
          </div>

          {/* Anonymous toggle */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1.5px solid rgba(124, 58, 237, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <Lock size={18} color="#7c3aed" />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#030712' }}>
                  Enable 100% Anonymous Submissions
                </span>
                <p style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 550, margin: '2px 0 0' }}>
                  Employee names will never be revealed or logged, ensuring complete psychological safety.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
            />
          </div>

          {/* Questions Builder */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Survey Questions ({questions.length})</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '10px' }}>
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(241, 245, 249, 0.95)',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ fontSize: '0.86rem', color: '#030712', fontWeight: 650, flex: 1 }}>
                    <strong style={{ color: '#e11d48' }}>{idx + 1}.</strong> {q.text}
                    <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                      ({q.type === 'rating' ? '1-5 Rating' : 'Text Reflection'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add question inline */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                placeholder="Type a new custom question..."
                style={{ flex: '1 1 180px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', color: '#030712', fontWeight: 550, outline: 'none' }}
              />
              <select
                value={newQuestionType}
                onChange={e => setNewQuestionType(e.target.value)}
                style={{ flex: '1 1 120px', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem', color: '#030712', fontWeight: 650, outline: 'none' }}
              >
                <option value="rating">Rating (1-5)</option>
                <option value="text">Text Answer</option>
              </select>
              <button
                type="button"
                onClick={handleAddQuestion}
                style={{ padding: '8px 16px', borderRadius: '10px', background: '#090d16', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: '0 0 auto' }}
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Launch Timed Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
