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
  UserCheck,
  Eye,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  Crown,
  Shield
} from 'lucide-react';
import ImageLightboxModal from './ImageLightboxModal';

/**
 * Parses comma-separated duties/skills into an array of distinct, clean task items.
 */
function parseResponsibilities(deptStr, skillsArr = []) {
  const items = new Set();

  if (deptStr && typeof deptStr === 'string') {
    deptStr.split(',').forEach(s => {
      const trimmed = s.trim();
      if (trimmed && trimmed.length > 3) {
        items.add(trimmed);
      }
    });
  }

  if (Array.isArray(skillsArr)) {
    skillsArr.forEach(s => {
      if (typeof s === 'string') {
        s.split(',').forEach(sub => {
          const trimmed = sub.trim();
          if (trimmed && trimmed.length > 3 && !['Operations', 'Collaboration'].includes(trimmed)) {
            items.add(trimmed);
          }
        });
      }
    });
  }

  return Array.from(items);
}

/**
 * Generates an initial letter avatar with consistent gradient if photo fails to load.
 */
function FallbackAvatar({ name = '', size = 56, role = 'member' }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const isMaster = role === 'master_admin';
  const isAdmin = role === 'admin';

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '16px',
      background: isMaster 
        ? 'linear-gradient(135deg, #d97706, #b45309)' 
        : isAdmin 
        ? 'linear-gradient(135deg, #e11d48, #be123c)' 
        : 'linear-gradient(135deg, #0284c7, #0369a1)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.round(size * 0.42)}px`,
      fontWeight: 900,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      flexShrink: 0
    }}>
      {initial}
    </div>
  );
}

export default function TeamMembersView({
  users = [],
  currentUser,
  tasks = [],
  leaves = [],
  onAddUser,
  onDeleteUser,
  onApplyLeave,
  onUpdateLeaveStatus
}) {
  const isMasterAdmin = currentUser?.role === 'master_admin' || currentUser?.isFirstAdmin || currentUser?.email === 'alizohaib.web@gmail.com';
  const isAdmin = currentUser?.role === 'admin' || isMasterAdmin;

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'leaves'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Selected User for Detailed Profile Modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Lightbox Photo Viewer
  const [lightboxData, setLightboxData] = useState(null); // { url, title, subtitle }

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

  // Avatar Image load failure state map
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  const handleOpenLightbox = (e, u) => {
    e.stopPropagation();
    const avatarUrl = u.avatar || '/icon.png';
    setLightboxData({
      url: avatarUrl,
      title: `${u.name} — Profile Photo`,
      subtitle: `${u.title || u.role?.toUpperCase()} • ${u.department || 'Stowave Global'}`
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddUser({
      name,
      email,
      role,
      department,
      title: title || (role === 'master_admin' ? 'Executive Master Admin' : role === 'admin' ? 'Strategic Lead' : 'Specialist'),
      phone: phone || '+92 300 0000000',
      bio: bio || 'High-performing contributor driving company excellence.',
      skills: skills ? skills.split(',').map(s => s.trim()) : ['Collaboration', 'Execution'],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?auto=format&fit=crop&w=300&q=80`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                {users.length} Registered Team Members
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: 'rgba(5, 150, 105, 0.12)', color: '#059669' }}>
                🟢 {users.filter(u => u.isOnline || u.status === 'online').length} Online Right Now
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Team Directory & Operations
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 550, margin: '5px 0 0' }}>
              Click any team member card to view complete responsibilities, assigned duties, and performance history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: 'auto' }}>
            <button 
              onClick={() => setShowLeaveModal(true)} 
              style={{
                padding: '9px 16px',
                borderRadius: '9999px',
                background: '#ffffff',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                color: '#030712',
                cursor: 'pointer',
                fontWeight: 750,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flex: '1 1 auto'
              }}
            >
              <Calendar size={15} color="#e11d48" /> Apply Leave
            </button>

            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)} 
                style={{
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)',
                  flex: '1 1 auto'
                }}
              >
                <Plus size={16} /> Add Member
              </button>
            )}
          </div>
        </div>

        {/* Tab Toggle: Members / Leaves */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeTab === 'members' ? '1.5px solid #0f172a' : '1.5px solid rgba(203, 213, 225, 0.9)',
              background: activeTab === 'members' ? '#0f172a' : '#ffffff',
              color: activeTab === 'members' ? '#ffffff' : '#030712',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flex: '1 1 auto'
            }}
          >
            <Users size={15} /> Team Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: activeTab === 'leaves' ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
              background: activeTab === 'leaves' ? '#e11d48' : '#ffffff',
              color: activeTab === 'leaves' ? '#ffffff' : '#030712',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flex: '1 1 auto'
            }}
          >
            <Calendar size={15} /> Leave Applications ({leaves.length})
          </button>
        </div>
      </div>

      {/* 2. Directory Grid — Clean, Compact, Aesthetic Cards */}
      {activeTab === 'members' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '20px'
        }}>
          {users.map(u => {
            const userTasks = tasks.filter(t => t.assignedTo === u.id);
            const completedCount = userTasks.filter(t => t.status === 'completed').length;
            const isOnline = Boolean(u.isOnline || u.status === 'online');
            const isMaster = u.role === 'master_admin' || u.isFirstAdmin || u.isMasterAdmin;
            const hasBrokenImage = imageErrors[u.id];

            // Primary clean designation
            const cleanTitle = u.title || (isMaster ? 'Executive Master Admin & Director' : u.role === 'admin' ? 'Operations Administrator' : 'Team Specialist');

            return (
              <div 
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  padding: '22px',
                  borderRadius: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.90)',
                  backdropFilter: 'blur(36px) saturate(210%)',
                  border: isMaster 
                    ? '2px solid rgba(217, 119, 6, 0.45)' 
                    : u.role === 'admin' 
                    ? '1.5px solid rgba(225, 29, 72, 0.35)' 
                    : '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 10px 30px -6px rgba(15, 23, 42, 0.06)',
                  cursor: 'pointer',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  position: 'relative'
                }}
              >
                {/* Header Row: Avatar, Names, and Delete Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Clickable Avatar to view full photo in Lightbox */}
                    <div 
                      onClick={(e) => handleOpenLightbox(e, u)}
                      style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                      title="Click to view full photo"
                    >
                      {!hasBrokenImage && u.avatar ? (
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          onError={() => handleImageError(u.id)}
                          style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '18px',
                            objectFit: 'cover',
                            border: isMaster 
                              ? '2.5px solid #d97706' 
                              : u.role === 'admin' 
                              ? '2.5px solid #e11d48' 
                              : '2.5px solid #059669',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                          }} 
                        />
                      ) : (
                        <FallbackAvatar name={u.name} size={58} role={u.role} />
                      )}

                      {/* Online / Offline Dot Indicator */}
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: '2px solid #ffffff',
                        background: isOnline ? '#10b981' : '#94a3b8',
                        boxShadow: isOnline ? '0 0 8px #10b981' : 'none'
                      }} 
                      title={isOnline ? 'Online Now' : 'Offline'}
                      />

                      {/* Hover zoom eye badge */}
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(0,0,0,0.55)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.85
                      }}>
                        <Eye size={10} />
                      </div>
                    </div>

                    {/* Name & Role Badges */}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                          {u.name}
                        </h3>

                        {isMaster ? (
                          <span style={{
                            background: 'linear-gradient(135deg, #d97706, #b45309)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.66rem',
                            fontWeight: 900,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Crown size={10} /> MASTER ADMIN
                          </span>
                        ) : (
                          <span style={{
                            background: u.role === 'admin' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                            color: u.role === 'admin' ? '#be123c' : '#047857',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.66rem',
                            fontWeight: 850
                          }}>
                            {u.role?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.80rem', color: isMaster ? '#b45309' : '#be123c', fontWeight: 750, marginTop: '2px' }}>
                        {cleanTitle}
                      </div>
                    </div>
                  </div>

                  {/* Delete Member Button */}
                  {isAdmin && u.id !== currentUser?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUser(u.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                      title="Remove member"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Stats Row */}
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
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>Tasks</span>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#030712' }}>{completedCount}/{userTasks.length}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>Points</span>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#e11d48' }}>{u.points || 0} pts</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569' }}>Status</span>
                    <div style={{
                      fontSize: '0.90rem',
                      fontWeight: 900,
                      color: isOnline ? '#10b981' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isOnline ? '#10b981' : '#94a3b8' }} />
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                {/* Card Action Link: View Profile & Duties */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(226, 232, 240, 0.8)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  <span style={{ color: '#be123c', fontWeight: 850 }}>View Profile & Operational Duties</span>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a'
                  }}>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Leave Applications Tab */}
      {activeTab === 'leaves' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(36px) saturate(210%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: '24px',
          boxShadow: '0 10px 30px -6px rgba(15, 23, 42, 0.06)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#030712', margin: '0 0 16px' }}>
            Submitted Leave Applications ({leaves.length})
          </h3>
          {leaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Calendar size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontWeight: 700 }}>No leave applications currently pending or recorded.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map(l => (
                <div
                  key={l.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: '#ffffff',
                    border: '1.5px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>{l.userName}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '999px', background: '#f1f5f9', color: '#475569', fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {l.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.80rem', color: '#64748b', marginTop: '2px' }}>
                      📅 {l.startDate} to {l.endDate}
                    </div>
                    {l.reason && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.80rem', color: '#1e293b', fontStyle: 'italic' }}>
                        "{l.reason}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: l.status === 'approved' ? 'rgba(5, 150, 105, 0.12)' : l.status === 'rejected' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                      color: l.status === 'approved' ? '#047857' : l.status === 'rejected' ? '#be123c' : '#b45309',
                      fontSize: '0.76rem',
                      fontWeight: 850,
                      textTransform: 'uppercase'
                    }}>
                      {l.status}
                    </span>

                    {isAdmin && l.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => onUpdateLeaveStatus(l.id, 'approved')}
                          style={{ padding: '5px 10px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateLeaveStatus(l.id, 'rejected')}
                          style={{ padding: '5px 10px', borderRadius: '8px', background: '#e11d48', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Detailed Member Profile Modal (Opens when user card is clicked) */}
      {selectedUser && (() => {
        const u = selectedUser;
        const userTasks = tasks.filter(t => t.assignedTo === u.id);
        const completedCount = userTasks.filter(t => t.status === 'completed').length;
        const isOnline = Boolean(u.isOnline || u.status === 'online');
        const isMaster = u.role === 'master_admin' || u.isFirstAdmin || u.isMasterAdmin;
        const dutiesList = parseResponsibilities(u.department, u.skills);
        const hasBrokenImage = imageErrors[u.id];

        return (
          <div 
            onClick={() => setSelectedUser(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '26px',
                padding: '28px',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Modal Header: Avatar, Name, and Close Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* Big Clickable Avatar */}
                  <div
                    onClick={(e) => handleOpenLightbox(e, u)}
                    style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                    title="Click to view full photo in high resolution"
                  >
                    {!hasBrokenImage && u.avatar ? (
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        onError={() => handleImageError(u.id)}
                        style={{
                          width: '76px',
                          height: '76px',
                          borderRadius: '22px',
                          objectFit: 'cover',
                          border: isMaster 
                            ? '3px solid #d97706' 
                            : u.role === 'admin' 
                            ? '3px solid #e11d48' 
                            : '3px solid #059669',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
                        }} 
                      />
                    ) : (
                      <FallbackAvatar name={u.name} size={76} role={u.role} />
                    )}

                    <div style={{
                      position: 'absolute',
                      bottom: '-3px',
                      right: '-3px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2.5px solid #ffffff',
                      background: isOnline ? '#10b981' : '#94a3b8',
                      boxShadow: isOnline ? '0 0 10px #10b981' : 'none'
                    }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                        {u.name}
                      </h2>
                      {isMaster ? (
                        <span style={{
                          background: 'linear-gradient(135deg, #d97706, #b45309)',
                          color: '#ffffff',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.70rem',
                          fontWeight: 900,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Crown size={12} /> MASTER ADMIN
                        </span>
                      ) : (
                        <span style={{
                          background: u.role === 'admin' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(5, 150, 105, 0.12)',
                          color: u.role === 'admin' ? '#be123c' : '#047857',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '0.70rem',
                          fontWeight: 850
                        }}>
                          {u.role?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: isMaster ? '#b45309' : '#be123c', fontWeight: 800, marginTop: '2px' }}>
                      {u.title || (isMaster ? 'Executive Master Admin & Director' : 'Team Specialist')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: isOnline ? '#10b981' : '#64748b', fontWeight: 800, marginTop: '2px' }}>
                      {isOnline ? '🟢 Online in Portal Right Now' : '⚪ Currently Offline'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px' }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Contact Bar */}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '12px 16px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.80rem'
              }}>
                <a
                  href={`mailto:${u.email}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0369a1', textDecoration: 'none', fontWeight: 750 }}
                >
                  <Mail size={14} /> {u.email}
                </a>

                {u.phone && (
                  <>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <a
                      href={`tel:${u.phone}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', textDecoration: 'none', fontWeight: 750 }}
                    >
                      <Phone size={14} /> {u.phone}
                    </a>

                    <a
                      href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#25D366',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        marginLeft: 'auto'
                      }}
                    >
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </>
                )}
              </div>

              {/* Performance Metrics Tiles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                textAlign: 'center'
              }}>
                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>TASKS COMPLETED</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0369a1', marginTop: '2px' }}>
                    {completedCount} / {userTasks.length}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.25)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#e11d48' }}>REWARD POINTS</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#be123c', marginTop: '2px' }}>
                    {u.points || 0} pts
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669' }}>STATUS</span>
                  <div style={{ fontSize: '1.10rem', fontWeight: 900, color: isOnline ? '#047857' : '#64748b', marginTop: '2px' }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>

              {/* CORE ASSIGNED DUTIES & OPERATIONAL TASKS (Hur Kaam Alug Alug) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: '#be123c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={14} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: '#0f172a' }}>
                    Core Assigned Responsibilities & Workflow Duties
                  </h4>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                    ({dutiesList.length} Tasks)
                  </span>
                </div>

                {dutiesList.length === 0 ? (
                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', color: '#64748b', fontSize: '0.82rem' }}>
                    General operational procedures and collaboration duties.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dutiesList.map((duty, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(5, 150, 105, 0.15)',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Check size={12} />
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 750, color: '#0f172a', lineHeight: 1.4 }}>
                          {duty}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio Statement */}
              {u.bio && (
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                    Professional Bio & Statement
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', lineHeight: 1.5 }}>
                    {u.bio}
                  </p>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={(e) => handleOpenLightbox(e, u)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={14} /> View Full Photo
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. Add User Modal */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Full Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Khan" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Email Address *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="sarah@stowave.com" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    {isMasterAdmin && <option value="master_admin">Master Admin</option>}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Title / Designation</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Lead Product Specialist" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Core Responsibilities (comma separated)</label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Product QA, Customer SMS, Catalog Updates" style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '9px 16px', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 20px', borderRadius: '10px', background: '#e11d48', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Leave Modal */}
      {showLeaveModal && (
        <div 
          onClick={() => setShowLeaveModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>Apply for Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Leave Type</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }}>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual / Emergency</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Start Date</label>
                  <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>End Date</label>
                  <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, marginBottom: '4px' }}>Reason</label>
                <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide short justification..." style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.84rem', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} style={{ padding: '9px 16px', borderRadius: '10px', background: '#f1f5f9', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 20px', borderRadius: '10px', background: '#e11d48', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Image Lightbox Modal */}
      {lightboxData && (
        <ImageLightboxModal
          isOpen={Boolean(lightboxData)}
          imageUrl={lightboxData.url}
          title={lightboxData.title}
          subtitle={lightboxData.subtitle}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}
