'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  Trash2, 
  X, 
  Sparkles, 
  Send, 
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Square,
  Plus,
  Search,
  Tag,
  Layers
} from 'lucide-react';

const OPERATIONAL_TASKS = [
  {
    category: '📱 Social Media Operations',
    color: '#e11d48',
    tasks: [
      'Daily Social Media Posts Design & Scheduling',
      'Instagram, TikTok & FB Reels Video Editing',
      'Customer Comments & DM Replies Fast Turnaround',
      'Real-time Brand Engagement & Trend Monitoring'
    ]
  },
  {
    category: '🌐 Website & Infrastructure',
    color: '#0284c7',
    tasks: [
      'Website Daily Uptime & Speed Optimization',
      'Product Catalog Publishing & Banner Updates',
      'Server, Domain & Hosting Technical Health',
      'Cart & Checkout Funnel Error Monitoring'
    ]
  },
  {
    category: '💬 WhatsApp & Email Marketing',
    color: '#059669',
    tasks: [
      'Abandoned Cart WhatsApp Automated Recovery',
      'Promotional Broadcasts & Customer SMS Alerts',
      'Weekly Email Newsletter & Offer Dispatch',
      'Customer Retention & Re-engagement Campaigns'
    ]
  },
  {
    category: '📞 Helpline & Customer Support',
    color: '#d97706',
    tasks: [
      'Inbound Helpline Phone Calls & WhatsApp Queries',
      'Pending Orders Phone Verification & Address Check',
      'Order Status Inquiries & Real-time Courier Tracking',
      'Disputes, Returns & Refund Approvals Handling'
    ]
  },
  {
    category: '💳 Bank Accounts & Financial Management',
    color: '#7c3aed',
    tasks: [
      'Daily Bank Balances & Payment Reconciliation',
      'Courier COD (Cash on Delivery) Payout Audit',
      'Company Expense Invoices & Vendor Settlement',
      'Profit & Loss Margin Weekly Documentation'
    ]
  },
  {
    category: '🔍 Quality & Inspection Audit',
    color: '#db2777',
    tasks: [
      'Product Physical Inspection & Quality Standards',
      'Packaging Standards & Unboxing Quality Verification',
      'Warehouse Stock Physical Counting & Discrepancies',
      'Return Parcel (RTO) Inspection & Restocking'
    ]
  },
  {
    category: '📁 Records Maintenance (Ali Haider)',
    color: '#475569',
    tasks: [
      'Soft Records Google Drive & Cloud File Management',
      'Hard Copy Physical Invoices & Archival Filing',
      'Master Operations Audit Dossier Maintenance'
    ]
  },
  {
    category: '👑 Executive Approvals & Leadership (Saif Waqar)',
    color: '#b91c1c',
    tasks: [
      'Budget Authorizations & Major Expenditure Approvals',
      'Ad Campaigns, Creative Assets & Discount Sign-off',
      'Team Hiring, Contract Review & Leave Approvals'
    ]
  },
  {
    category: '🎨 Creative & Graphic Design',
    color: '#0891b2',
    tasks: [
      'Promotional Ad Banners & High-CTR Creatives',
      'Packaging Box Designs & 3D Product Renders',
      'Brand Styleguide, Fonts & Color Palette Maintenance'
    ]
  }
];

export default function InviteUserModal({ isOpen, onClose, currentUser }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member'); // 'member' | 'admin'
  const [selectedTasks, setSelectedTasks] = useState([
    'Daily Social Media Posts Design & Scheduling',
    'Customer Comments & DM Replies Fast Turnaround'
  ]);
  const [taskSearch, setTaskSearch] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [customTasksList, setCustomTasksList] = useState([]);
  const [customTaskInput, setCustomTaskInput] = useState('');

  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInvitations();
    }
  }, [isOpen]);

  const loadInvitations = async () => {
    try {
      const res = await fetch('/api/auth/invitations');
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (e) {
      console.warn('Failed to fetch invitations:', e);
    }
  };

  // Flattened tasks list with category and colors
  const allCategorizedTasks = useMemo(() => {
    const list = [];
    OPERATIONAL_TASKS.forEach(cat => {
      cat.tasks.forEach(task => {
        list.push({
          title: task,
          categoryName: cat.category,
          color: cat.color
        });
      });
    });
    customTasksList.forEach(task => {
      list.push({
        title: task,
        categoryName: '✨ Custom Tasks',
        color: '#0f172a'
      });
    });
    return list;
  }, [customTasksList]);

  // Filter tasks based on active category and search
  const visibleTasks = useMemo(() => {
    return allCategorizedTasks.filter(item => {
      const matchesCategory = 
        activeCategoryTab === 'all' 
          ? true 
          : (activeCategoryTab === 'custom' 
              ? item.categoryName === '✨ Custom Tasks'
              : item.categoryName === activeCategoryTab);

      const matchesSearch = 
        !taskSearch.trim() ||
        item.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(taskSearch.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allCategorizedTasks, activeCategoryTab, taskSearch]);

  const toggleTask = (taskTitle) => {
    setSelectedTasks(prev => 
      prev.includes(taskTitle) 
        ? prev.filter(t => t !== taskTitle) 
        : [...prev, taskTitle]
    );
  };

  const areAllInViewSelected = visibleTasks.length > 0 && visibleTasks.every(t => selectedTasks.includes(t.title));

  const toggleSelectAllInView = () => {
    const titlesInView = visibleTasks.map(t => t.title);
    if (areAllInViewSelected) {
      setSelectedTasks(prev => prev.filter(t => !titlesInView.includes(t)));
    } else {
      setSelectedTasks(prev => Array.from(new Set([...prev, ...titlesInView])));
    }
  };

  const clearAllTasks = () => {
    setSelectedTasks([]);
  };

  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!customTaskInput.trim()) return;
    const trimmed = customTaskInput.trim();
    if (!customTasksList.includes(trimmed)) {
      setCustomTasksList(prev => [...prev, trimmed]);
    }
    if (!selectedTasks.includes(trimmed)) {
      setSelectedTasks(prev => [...prev, trimmed]);
    }
    setCustomTaskInput('');
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    if (role !== 'master_admin' && selectedTasks.length === 0) {
      setError('Barah-e-karam kam az kam aik kaam ya department zaroor select karein.');
      return;
    }

    setError(null);
    setSuccessInfo(null);
    setIsLoading(true);

    const finalDepartment = selectedTasks.length > 0 ? selectedTasks.join(', ') : 'Executive Leadership & Final Sign-off';

    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role,
          department: finalDepartment,
          assignedTasks: selectedTasks,
          adminId: currentUser?.id,
          adminName: currentUser?.name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch invitation.');
      }

      setSuccessInfo(data);
      setEmail('');
      loadInvitations();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeInvite = async (id) => {
    try {
      const res = await fetch(`/api/auth/invitations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadInvitations();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '100%', padding: '26px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(225, 29, 72, 0.12)',
              border: '1.5px solid rgba(225, 29, 72, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={22} color="#e11d48" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>
                Invite New Team Member or Admin
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>
                Generates a secure access link that automatically <strong>expires in 30 minutes</strong>.
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1.5px solid rgba(225, 29, 72, 0.3)',
            color: '#be123c',
            fontSize: '0.86rem',
            fontWeight: 700,
            marginBottom: '18px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successInfo && (
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(5, 150, 105, 0.08)',
            border: '1.5px solid rgba(5, 150, 105, 0.3)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 800, fontSize: '0.90rem' }}>
              <ShieldCheck size={18} />
              <span>Invitation Dispatched to {successInfo.invitation?.email}!</span>
            </div>
            <p style={{ margin: '6px 0 10px', fontSize: '0.80rem', color: '#334155', fontWeight: 600 }}>
              An email was sent via Gmail SMTP. Link is valid for 30 minutes. You can also copy the link directly:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(203, 213, 225, 0.8)' }}>
              <span style={{ fontSize: '0.78rem', color: '#0284c7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontFamily: 'monospace' }}>
                {successInfo.inviteLink}
              </span>
              <button
                type="button"
                onClick={() => handleCopyLink(successInfo.inviteLink)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: copiedLink ? '#059669' : '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Invite Form */}
        <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="input-label">Recipient Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="colleague@stowave.com or user@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Access Level / Role *</label>
            <select
              className="select-field"
              value={role}
              onChange={(e) => {
                const newRole = e.target.value;
                setRole(newRole);
                if (newRole === 'master_admin') {
                  setSelectedTasks([
                    'Budget Authorizations & Major Expenditure Approvals',
                    'Ad Campaigns, Creative Assets & Discount Sign-off',
                    'Notebook Operational Procedure & Authorization'
                  ]);
                }
              }}
            >
              <option value="member">👤 Member (Team Contributor)</option>
              <option value="admin">🛡️ Admin (Operations Administrator)</option>
              <option value="master_admin">👑 Master Admin (Executive Director & Final Sign-off Authority)</option>
            </select>
            {role === 'master_admin' && (
              <div style={{
                marginTop: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(253, 230, 138, 0.9))',
                border: '1.5px solid rgba(217, 119, 6, 0.35)',
                fontSize: '0.78rem',
                color: '#92400e',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Sparkles size={16} color="#d97706" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Executive Master Admin:</strong> Is email py 30-minute secure link bheja jaye ga. Link click kr k account banany k baad unhein tamam tasks ki final review, approval, rejection aur bonus gifting k full powers milen gy.
                </span>
              </div>
            )}
          </div>

          {/* Multi-Task Responsibilities Selector (Hur Kaam Alug Alug) */}
          <div style={{
            background: 'rgba(248, 250, 252, 0.85)',
            padding: '16px 18px',
            borderRadius: '16px',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
          }}>
            {/* Top Bar: Title & Global Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label className="input-label" style={{ margin: 0, fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                  Assigned Tasks & Department Responsibilities (Hur Kaam Alug Alug) *
                </label>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Aap is member k liye aik ya multiple specific zimmedariyaan (responsibilities) alug alug select kar saktay hain.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={toggleSelectAllInView}
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {areAllInViewSelected ? 'Deselect View' : '+ Select View'}
                </button>
                <button
                  type="button"
                  onClick={clearAllTasks}
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.72rem',
                    fontWeight: 750,
                    color: '#e11d48',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ✕ Clear All
                </button>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 850,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: selectedTasks.length > 0 ? '#e11d48' : '#64748b',
                  color: '#ffffff',
                  boxShadow: selectedTasks.length > 0 ? '0 2px 6px rgba(225, 29, 72, 0.3)' : 'none'
                }}>
                  🎯 {selectedTasks.length} Selected
                </span>
              </div>
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '11px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search specific tasks (e.g. reels, bank, orders, return, speed, audit)..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(203, 213, 225, 0.9)',
                  fontSize: '0.80rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              />
              {taskSearch && (
                <button
                  type="button"
                  onClick={() => setTaskSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department / Category Filter Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '8px',
              scrollbarWidth: 'thin'
            }}>
              <button
                type="button"
                onClick={() => setActiveCategoryTab('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.73rem',
                  fontWeight: 750,
                  whiteSpace: 'nowrap',
                  border: activeCategoryTab === 'all' ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                  background: activeCategoryTab === 'all' ? '#0f172a' : '#ffffff',
                  color: activeCategoryTab === 'all' ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                🌟 All ({allCategorizedTasks.length})
              </button>
              {OPERATIONAL_TASKS.map(cat => {
                const catTasks = allCategorizedTasks.filter(t => t.categoryName === cat.category);
                const selectedInCat = catTasks.filter(t => selectedTasks.includes(t.title)).length;
                const isActive = activeCategoryTab === cat.category;

                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setActiveCategoryTab(cat.category)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '999px',
                      fontSize: '0.73rem',
                      fontWeight: 750,
                      whiteSpace: 'nowrap',
                      border: isActive ? `1.5px solid ${cat.color}` : '1px solid #cbd5e1',
                      background: isActive ? cat.color : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.category}</span>
                    {selectedInCat > 0 && (
                      <span style={{
                        fontSize: '0.64rem',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        background: isActive ? 'rgba(255,255,255,0.35)' : 'rgba(225,29,72,0.12)',
                        color: isActive ? '#ffffff' : '#be123c',
                        fontWeight: 800
                      }}>
                        {selectedInCat}
                      </span>
                    )}
                  </button>
                );
              })}
              {customTasksList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategoryTab('custom')}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '999px',
                    fontSize: '0.73rem',
                    fontWeight: 750,
                    whiteSpace: 'nowrap',
                    border: activeCategoryTab === 'custom' ? '1.5px solid #0f172a' : '1px solid #cbd5e1',
                    background: activeCategoryTab === 'custom' ? '#0f172a' : '#ffffff',
                    color: activeCategoryTab === 'custom' ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  ✨ Custom ({customTasksList.length})
                </button>
              )}
            </div>

            {/* Selected Tasks Badges (Compact Preview) */}
            {selectedTasks.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                padding: '8px 10px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.95)',
                marginBottom: '10px',
                maxHeight: '75px',
                overflowY: 'auto'
              }}>
                {selectedTasks.map(task => (
                  <span
                    key={task}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(225, 29, 72, 0.08)',
                      color: '#be123c',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      border: '1px solid rgba(225, 29, 72, 0.22)'
                    }}
                  >
                    <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(task)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#be123c',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Task Grid Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '8px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '2px'
            }}>
              {visibleTasks.length > 0 ? (
                visibleTasks.map(item => {
                  const isSelected = selectedTasks.includes(item.title);
                  return (
                    <div
                      key={item.title}
                      onClick={() => toggleTask(item.title)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(225, 29, 72, 0.05)' : '#ffffff',
                        border: isSelected ? '1.5px solid #e11d48' : '1px solid rgba(226, 232, 240, 0.95)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(225, 29, 72, 0.12)' : 'none',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ marginTop: '2px', color: isSelected ? '#e11d48' : '#94a3b8', flexShrink: 0 }}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          color: item.color || '#64748b',
                          letterSpacing: '0.02em',
                          marginBottom: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.categoryName}
                        </div>
                        <div style={{
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 750 : 600,
                          color: isSelected ? '#0f172a' : '#334155',
                          lineHeight: 1.35
                        }}>
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '24px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.80rem'
                }}>
                  Koi task nahi mila matching "{taskSearch}". Neechay custom task add karein.
                </div>
              )}
            </div>

            {/* Custom Task Addition */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="+ Add custom responsibility (e.g. Daraz Catalog / Influencer Outreach)..."
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomTask(e); }}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid rgba(203, 213, 225, 0.9)',
                  fontSize: '0.78rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '11px 26px',
                fontSize: '0.90rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(225, 29, 72, 0.35)'
              }}
            >
              {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <Send size={16} />}
              <span>{isLoading ? 'Dispatching...' : 'Dispatch 30-Min Invite Email'}</span>
            </button>
          </div>
        </form>

        {/* Existing Invitations List */}
        <div>
          <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', fontWeight: 850, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active & Recent Invitations ({invitations.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {invitations.length > 0 ? (
              invitations.map(inv => {
                const isAccepted = inv.status === 'accepted';
                const isExpired = inv.effectiveStatus === 'expired';
                const minsLeft = Math.floor((inv.remainingSeconds || 0) / 60);

                return (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: isAccepted ? 'rgba(5, 150, 105, 0.06)' : (isExpired ? 'rgba(100, 116, 139, 0.08)' : 'rgba(245, 158, 11, 0.08)'),
                      border: `1px solid ${isAccepted ? 'rgba(5, 150, 105, 0.25)' : (isExpired ? 'rgba(148, 163, 184, 0.4)' : 'rgba(245, 158, 11, 0.35)')}`
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                          {inv.email}
                        </span>
                        <span style={{
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: inv.role === 'admin' ? 'rgba(225, 29, 72, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                          color: inv.role === 'admin' ? '#be123c' : '#0284c7',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          {inv.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                        {inv.department} • {isAccepted ? '✅ Joined' : (isExpired ? '⏰ Expired' : `⏳ Valid for ${minsLeft}m`)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isAccepted && !isExpired && (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(`${window.location.origin}/invite?token=${inv.token}`)}
                          style={{
                            background: 'none',
                            border: '1px solid rgba(203, 213, 225, 0.9)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#0f172a'
                          }}
                          title="Copy link"
                        >
                          Copy
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(inv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Revoke / Delete invitation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.80rem', color: '#94a3b8', margin: '8px 0', textAlign: 'center' }}>
                No active invitations. Use the form above to invite team members.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
