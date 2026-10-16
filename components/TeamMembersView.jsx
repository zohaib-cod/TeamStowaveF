'use client';
import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  X, 
  Check, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function TeamMembersView({
  users,
  currentUser,
  tasks,
  leaves = [],
  onAddUser,
  onDeleteUser,
  onApplyLeave,
  onUpdateLeaveStatus
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'leaves'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // New Member Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [department, setDepartment] = useState('Engineering');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Leave Form
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddUser({
      name,
      email,
      role,
      department,
      title: title || (role === 'admin' ? 'Strategic Lead' : 'Specialist'),
      phone: phone || '+92 300 0000000',
      bio: bio || 'High-performing contributor driving company excellence.',
      skills: skills ? skills.split(',').map(s => s.trim()) : ['Collaboration', 'Execution'],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=200&q=80`
    });
    setName('');
    setEmail('');
    setTitle('');
    setSkills('');
    setShowAddModal(false);
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    onApplyLeave({
      type: leaveType,
      startDate,
      endDate,
      reason
    });
    setReason('');
    setShowLeaveModal(false);
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
                {users.length} Active Team Members
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(225, 29, 72, 0.12)', color: '#be123c' }}>
                Role-Based Portals
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Team Directory & Operations
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 550, margin: '5px 0 0' }}>
              Manage member profiles, skill competencies, points balances, and review leave applications.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowLeaveModal(true)} 
              style={{
                padding: '10px 18px',
                borderRadius: '9999px',
                background: '#ffffff',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                color: '#030712',
                fontSize: '0.84rem',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              id="btn-apply-leave"
            >
              <Calendar size={15} /> Apply for Leave
            </button>
            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)} 
                style={{
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
                }}
                id="btn-add-team-member"
              >
                <Plus size={16} /> Add Team Member
              </button>
            )}
          </div>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid rgba(226, 232, 240, 0.9)' }}>
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: activeTab === 'members' ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
              background: activeTab === 'members' ? '#e11d48' : '#ffffff',
              color: activeTab === 'members' ? '#ffffff' : '#030712',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={15} /> Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: activeTab === 'leaves' ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
              background: activeTab === 'leaves' ? '#e11d48' : '#ffffff',
              color: activeTab === 'leaves' ? '#ffffff' : '#030712',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} /> Leave Applications ({leaves.length})
          </button>
        </div>
      </div>

      {/* 2. Directory Grid */}
      {activeTab === 'members' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {users.map(u => {
            const userTasks = tasks.filter(t => t.assignedTo === u.id);
            const completedCount = userTasks.filter(t => t.status === 'completed').length;

            return (
              <div 
                key={u.id}
                style={{
                  padding: '24px',
                  borderRadius: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(36px) saturate(210%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 10px 30px -6px rgba(15, 23, 42, 0.06)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={u.avatar || '/icon.png'} 
                        alt={u.name} 
                        style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: u.role === 'admin' ? '2.5px solid #e11d48' : '2.5px solid #059669' }} 
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid #ffffff',
                        background: u.status === 'online' ? '#059669' : u.status === 'busy' ? '#d97706' : '#0284c7'
                      }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#030712', margin: 0 }}>{u.name}</h3>
                        <span style={{
                          background: u.role === 'admin' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                          color: u.role === 'admin' ? '#be123c' : '#047857',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.68rem',
                          fontWeight: 800
                        }}>
                          {u.role?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#be123c', fontWeight: 700, marginTop: '2px' }}>
                        {u.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 750 }}>
                        {u.department}
                      </div>
                    </div>
                  </div>

                  {isAdmin && u.id !== currentUser?.id && (
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                      title="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 550, lineHeight: 1.45, margin: 0 }}>
                  {u.bio}
                </p>

                {/* Stats row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'rgba(241, 245, 249, 0.95)',
                  border: '1px solid #cbd5e1',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>Tasks</span>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#030712' }}>{completedCount}/{userTasks.length}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>Points</span>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#e11d48' }}>{u.points || 0} pts</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>Status</span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: u.status === 'online' ? '#059669' : '#030712', textTransform: 'capitalize' }}>{u.status}</div>
                  </div>
                </div>

                {/* Skills tags */}
                {u.skills && u.skills.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {u.skills.map((skill, idx) => (
                      <span key={idx} style={{
                        padding: '3px 9px',
                        borderRadius: '999px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#030712'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leave Applications Tab */}
      {activeTab === 'leaves' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {leaves.map(l => {
            const applicant = users.find(u => u.id === l.userId);
            return (
              <div
                key={l.id}
                style={{
                  padding: '20px 24px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(36px) saturate(210%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.96rem', fontWeight: 850, color: '#030712' }}>{applicant?.name || 'Member'}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', textTransform: 'uppercase' }}>
                      {l.type} Leave
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 550 }}>
                    Dates: <strong>{l.startDate}</strong> to <strong>{l.endDate}</strong> • Reason: "{l.reason}"
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: l.status === 'approved' ? '#059669' : l.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                    Status: {l.status?.toUpperCase()}
                  </span>
                  {isAdmin && l.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onUpdateLeaveStatus(l.id, 'approved')}
                        style={{ padding: '6px 14px', borderRadius: '999px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onUpdateLeaveStatus(l.id, 'rejected')}
                        style={{ padding: '6px 14px', borderRadius: '999px', background: '#dc2626', color: '#fff', border: 'none', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {leaves.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#334155' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#030712' }}>No leave applications filed yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>Add Team Member</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ayesha Khan" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Email Address</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ayesha@company.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Design / Operations" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Job Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Lead Product Designer" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Skills (comma separated)</label>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="Figma, UI Systems, Next.js" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={15} /> Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
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
                <Calendar size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: 0 }}>Apply for Leave</h3>
              </div>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Leave Type</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 650, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="emergency">Emergency / Personal</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Start Date</label>
                  <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>End Date</label>
                  <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>Reason</label>
                <textarea required rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for leave request..." style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', color: '#030712', fontWeight: 550, outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} style={{ padding: '10px 20px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: '9999px', background: '#e11d48', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
