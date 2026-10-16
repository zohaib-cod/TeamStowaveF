'use client';
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Star, 
  Check, 
  X, 
  Send, 
  Trash2, 
  LayoutGrid, 
  ListFilter 
} from 'lucide-react';

export default function TaskBoard({
  tasks,
  users,
  currentUser,
  onOpenTaskModal,
  onSubmitWork,
  onReviewTask,
  onDeleteTask,
  onUpdateTaskStatus
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Submit Work Modal state
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [actualHours, setActualHours] = useState(8);

  // Review Task Modal state
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('Outstanding deliverable! Approved.');
  const [reviewRating, setReviewRating] = useState(5);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesMember = filterMember === 'all' || task.assignedTo === filterMember;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesMember && matchesPriority;
  });

  const columns = [
    { id: 'todo', label: 'To Do', color: '#0f172a', bgAccent: 'rgba(15, 23, 42, 0.08)' },
    { id: 'in_progress', label: 'In Progress', color: '#0284c7', bgAccent: 'rgba(2, 132, 199, 0.1)' },
    { id: 'review', label: 'In Review', color: '#7c3aed', bgAccent: 'rgba(124, 58, 237, 0.1)' },
    { id: 'completed', label: 'Completed', color: '#059669', bgAccent: 'rgba(5, 150, 105, 0.1)' }
  ];

  const handleOpenSubmit = (task) => {
    setSubmittingTask(task);
    setSubmissionNotes(task.submissionNotes || '');
    setSubmissionLink(task.submissionLink || '');
    setActualHours(task.actualHours || task.estimatedHours || 8);
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!submittingTask) return;
    onSubmitWork(submittingTask.id, {
      submissionNotes,
      submissionLink,
      actualHours: Number(actualHours)
    });
    setSubmittingTask(null);
  };

  const handleOpenReview = (task) => {
    setReviewingTask(task);
    setReviewFeedback(task.reviewFeedback || 'Great work on this deliverable!');
    setReviewRating(task.rating || 5);
  };

  const handleConfirmReview = (status) => {
    if (!reviewingTask) return;
    onReviewTask(reviewingTask.id, {
      status, // 'completed' or 'in_progress'
      reviewFeedback,
      rating: reviewRating
    });
    setReviewingTask(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header & Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(36px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '22px 28px',
        boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Strategic Task Operations
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 550, margin: '4px 0 0' }}>
              Assign, track, submit deliverables, review, and reward completed sprint milestones.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(241, 245, 249, 0.95)', border: '1.5px solid rgba(203, 213, 225, 0.9)', borderRadius: '9999px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: viewMode === 'kanban' ? '#e11d48' : 'transparent',
                  color: viewMode === 'kanban' ? '#ffffff' : '#030712',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 750
                }}
              >
                <LayoutGrid size={15} /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: viewMode === 'list' ? '#e11d48' : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : '#030712',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 750
                }}
              >
                <ListFilter size={15} /> Table List
              </button>
            </div>

            {isAdmin && (
              <button 
                onClick={onOpenTaskModal} 
                style={{
                  padding: '10px 22px',
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
                id="btn-assign-new-task"
              >
                <Plus size={16} /> Assign New Task
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={16} color="#030712" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: '12px',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#030712',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Member Filter */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
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
              <option value="all">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
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
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Task View: Kanban vs Table List */}
      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '18px',
          alignItems: 'start'
        }}>
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                style={{
                  padding: '20px',
                  borderRadius: '22px',
                  background: 'rgba(255, 255, 255, 0.76)',
                  backdropFilter: 'blur(32px) saturate(210%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(210%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 35px -6px rgba(15, 23, 42, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>
                      {col.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.78rem',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: col.bgAccent,
                    color: col.color,
                    fontWeight: 850
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assignedTo);
                    const isMyTask = task.assignedTo === currentUser?.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          border: '1.5px solid rgba(226, 232, 240, 0.95)',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Top: Priority & Due Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.72rem', fontWeight: 850 }}>
                            {task.priority?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 800 }}>
                            Due {task.dueDate}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#000000', marginBottom: '4px' }}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Assignee & Footer */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                              src={assignee?.avatar || '/icon.png'}
                              alt={assignee?.name}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                            />
                            <span style={{ fontSize: '0.82rem', color: '#000000', fontWeight: 800 }}>
                              {assignee?.name?.split(' ')[0]}
                            </span>
                          </div>

                          {/* Quick Interactive Status / Submit Actions */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* Member can Submit Work */}
                            {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && (
                              <button
                                onClick={() => handleOpenSubmit(task)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '999px',
                                  background: 'rgba(241, 245, 249, 0.95)',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  color: '#030712',
                                  cursor: 'pointer'
                                }}
                                title="Submit deliverables for review"
                              >
                                Submit Work
                              </button>
                            )}

                            {/* Admin can Review work */}
                            {isAdmin && task.status === 'review' && (
                              <button
                                onClick={() => handleOpenReview(task)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '999px',
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  cursor: 'pointer'
                                }}
                                title="Review, Grade, and Approve"
                              >
                                Review Work
                              </button>
                            )}

                            {/* Delete (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }}
                                title="Delete Task"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: '#0f172a', fontSize: '0.86rem', fontWeight: 750 }}>
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div style={{
          background: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(32px) saturate(210%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: '24px',
          boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)', color: '#000000', fontWeight: 850 }}>
                <th style={{ padding: '12px' }}>Task</th>
                <th style={{ padding: '12px' }}>Priority</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Assignee</th>
                <th style={{ padding: '12px' }}>Due Date</th>
                <th style={{ padding: '12px' }}>Est / Act</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                const isMyTask = task.assignedTo === currentUser?.id;

                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.85)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 850, color: '#000000' }}>{task.title}</div>
                      {task.tags && (
                        <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                          {task.tags.join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${task.priority}`} style={{ fontWeight: 850 }}>{task.priority?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${task.status}`} style={{ fontWeight: 800 }}>{task.status?.replace('_', ' ')}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#000000' }}>{assignee?.name || 'Unassigned'}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#000000', fontWeight: 800 }}>{task.dueDate}</td>
                    <td style={{ padding: '12px', color: '#0f172a', fontWeight: 750 }}>{task.estimatedHours}h / {task.actualHours || '-'}h</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && (
                          <button onClick={() => handleOpenSubmit(task)} style={{ padding: '5px 10px', borderRadius: '8px', background: '#090d16', color: '#fff', border: 'none', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}>
                            Submit
                          </button>
                        )}
                        {isAdmin && task.status === 'review' && (
                          <button onClick={() => handleOpenReview(task)} style={{ padding: '5px 10px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}>
                            Review
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => onDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer' }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Modal: Member Submits Work */}
      {submittingTask && (
        <div className="modal-overlay" onClick={() => setSubmittingTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0 }}>Submit Deliverables for Review</h3>
              </div>
              <button onClick={() => setSubmittingTask(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '14px', background: 'rgba(241, 245, 249, 0.95)', borderRadius: '12px', marginBottom: '18px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Task Name</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#030712', margin: '2px 0 0' }}>{submittingTask.title}</h4>
            </div>

            <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Submission Notes & Summary of Work
                </label>
                <textarea
                  required
                  rows={4}
                  value={submissionNotes}
                  onChange={e => setSubmissionNotes(e.target.value)}
                  placeholder="Detail your completed milestones, architecture decisions, tests executed..."
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
                  Deliverable URL / Artifact Link
                </label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={e => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/company/pr/124 or https://figma.com/file/..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
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
                  Actual Hours Spent
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={actualHours}
                  onChange={e => setActualHours(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSubmittingTask(null)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 22px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={15} /> Send to Admin for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Admin Reviews and Grades Work */}
      {reviewingTask && (
        <div className="modal-overlay" onClick={() => setReviewingTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0 }}>Admin Deliverable Review</h3>
              </div>
              <button onClick={() => setReviewingTask(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px', background: 'rgba(241, 245, 249, 0.95)', borderRadius: '14px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#030712', marginBottom: '6px' }}>{reviewingTask.title}</h4>
              <p style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 550, marginBottom: '8px' }}>
                <strong>Member Notes:</strong> {reviewingTask.submissionNotes || 'No notes attached.'}
              </p>
              {reviewingTask.submissionLink && (
                <a href={reviewingTask.submissionLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.84rem', color: '#be123c', fontWeight: 700 }}>
                  🔗 Open Link: {reviewingTask.submissionLink}
                </a>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Deliverable Rating (1 - 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: star <= reviewRating ? 'rgba(251, 191, 36, 0.25)' : 'rgba(241, 245, 249, 0.9)',
                        border: star <= reviewRating ? '1.5px solid #d97706' : '1.5px solid #cbd5e1',
                        color: star <= reviewRating ? '#b45309' : '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 800
                      }}
                    >
                      <Star size={16} fill={star <= reviewRating ? '#d97706' : 'none'} color="#d97706" />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Executive Feedback & Guidance
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  placeholder="Provide praise or detailed instructions for revision..."
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleConfirmReview('in_progress')}
                  style={{ padding: '10px 18px', borderRadius: '9999px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Send back for revisions"
                >
                  <X size={15} /> Request Revisions
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReview('completed')}
                  style={{ padding: '10px 22px', borderRadius: '9999px', background: '#059669', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Approve and award points"
                >
                  <Check size={15} /> Approve & Award Points (+{reviewRating * 20} pts)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
