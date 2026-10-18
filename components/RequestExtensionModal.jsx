'use client';
import React, { useState } from 'react';
import { Hourglass, X, Calendar, Clock, AlertCircle, Send } from 'lucide-react';

export default function RequestExtensionModal({
  isOpen,
  onClose,
  task,
  currentUser,
  onRequestExtension
}) {
  const [requestedDueDate, setRequestedDueDate] = useState('');
  const [requestedHours, setRequestedHours] = useState(4);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Set default requested date to current task dueDate + 2 days
  React.useEffect(() => {
    if (task?.dueDate) {
      try {
        const d = new Date(task.dueDate);
        d.setDate(d.getDate() + 2);
        setRequestedDueDate(d.toISOString().split('T')[0]);
      } catch {
        setRequestedDueDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedDueDate) {
      setError('Please select a requested new deadline.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason or obstacle summary for this extension.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onRequestExtension(task.id, {
        requestedDueDate,
        requestedHours: Number(requestedHours),
        reason: reason.trim(),
        userId: currentUser?.id
      });
      onClose();
      setReason('');
    } catch (err) {
      setError(err.message || 'Failed to request extension');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(36px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
          maxWidth: '560px',
          width: '100%'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Hourglass size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                Request Deadline Extension
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>
                Admin se task deliverable k liye izafi waqt ki darkhwast karein
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Current Info Card */}
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(241, 245, 249, 0.95)',
          border: '1px solid #cbd5e1',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Current Deliverable
          </span>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
            {task.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#475569', fontWeight: 700, marginTop: '2px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Current Due Date: <strong>{task.dueDate}</strong>
            </span>
            <span>•</span>
            <span>Est. Hours: {task.estimatedHours || 8}h</span>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#b91c1c', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* New Due Date & Extra Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Requested New Due Date *
              </label>
              <input
                required
                type="date"
                value={requestedDueDate}
                onChange={e => setRequestedDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 650,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Extra Hours Needed
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={requestedHours}
                onChange={e => setRequestedHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 650,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Reason / Roadblock */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
              Reason for Extension & Roadblocks *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Wajah wazeh karein (e.g. Third-party API delays, client revision requests, technical obstacle)..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 550,
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '9999px',
                background: 'none',
                border: '1.5px solid #cbd5e1',
                color: '#030712',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '9999px',
                background: '#d97706',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
              }}
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Sending Request...' : 'Submit Extension Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
