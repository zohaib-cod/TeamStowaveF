'use client';
import React, { useState } from 'react';
import { Plus, X, Calendar, User, Tag, Clock } from 'lucide-react';

export default function CreateTaskModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onCreateTask
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || '');
  const [priority, setPriority] = useState('urgent');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [tags, setTags] = useState('Strategic, Q4-Milestone');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTask({
      title,
      description,
      assignedTo: assignedTo || users[0]?.id,
      priority,
      dueDate,
      estimatedHours: Number(estimatedHours),
      tags: tags ? tags.split(',').map(t => t.trim()) : ['General']
    });
    onClose();
    setTitle('');
    setDescription('');
    setTags('');
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
            <Plus size={20} color="#e11d48" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>Assign Strategic Task</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Task Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Deploy High-Conversion Product Landing Page"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Detailed Description & Acceptance Criteria</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State exact deliverables, target metrics, and expected quality standards..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 550, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Assignee</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Deadline Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Estimated Hours</label>
              <input
                type="number"
                min="1"
                max="200"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Design, Sprint, High-ROI"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Assign Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
