'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  AlertTriangle,
  Award,
  Bell,
  FolderKanban,
  ExternalLink,
  Crown,
  RefreshCw,
  Send,
  Zap,
  Calendar
} from 'lucide-react';

export default function OperationsHistoryView() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHistory = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/history?limit=200');
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load operations history:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const handleUpdate = () => fetchHistory();
    window.addEventListener('stowave_data_updated', handleUpdate);
    window.addEventListener('tasks-updated', handleUpdate);

    return () => {
      window.removeEventListener('stowave_data_updated', handleUpdate);
      window.removeEventListener('tasks-updated', handleUpdate);
    };
  }, []);

  const openAiWithPrompt = (promptText) => {
    window.dispatchEvent(new CustomEvent('open-ai-drawer', { detail: { prompt: promptText } }));
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = [...history];

    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(q) ||
        item.urduTitle?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.actor?.name?.toLowerCase().includes(q) ||
        item.target?.name?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [history, activeCategory, searchQuery]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {};
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    filteredEntries.forEach(item => {
      let groupKey = item.formattedDate || 'Recent';
      if (groupKey === todayStr) {
        groupKey = 'Today (آج)';
      } else if (groupKey === yesterdayStr) {
        groupKey = 'Yesterday (گزشتہ کل)';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [filteredEntries]);

  const getCategoryMeta = (category, action) => {
    if (action === 'TASK_MASTER_APPROVED') {
      return {
        badgeBg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), rgba(253, 230, 138, 0.95))',
        badgeColor: '#b45309',
        border: '1.5px solid #d97706',
        icon: <Crown size={15} color="#b45309" />,
        label: 'Master Approval'
      };
    }
    if (category === 'task') {
      return {
        badgeBg: 'rgba(2, 132, 199, 0.12)',
        badgeColor: '#0284c7',
        border: '1.5px solid rgba(2, 132, 199, 0.25)',
        icon: <FolderKanban size={15} color="#0284c7" />,
        label: 'Task & Workflow'
      };
    }
    if (category === 'review') {
      return {
        badgeBg: 'rgba(5, 150, 105, 0.12)',
        badgeColor: '#059669',
        border: '1.5px solid rgba(5, 150, 105, 0.25)',
        icon: <CheckCircle2 size={15} color="#059669" />,
        label: 'Review & Sign-Off'
      };
    }
    if (category === 'announcement') {
      return {
        badgeBg: 'rgba(225, 29, 72, 0.12)',
        badgeColor: '#e11d48',
        border: '1.5px solid rgba(225, 29, 72, 0.25)',
        icon: <Bell size={15} color="#e11d48" />,
        label: 'Announcement'
      };
    }
    if (category === 'kudos') {
      return {
        badgeBg: 'rgba(217, 119, 6, 0.12)',
        badgeColor: '#d97706',
        border: '1.5px solid rgba(217, 119, 6, 0.25)',
        icon: <Award size={15} color="#d97706" />,
        label: 'Recognition & Kudos'
      };
    }
    return {
      badgeBg: 'rgba(100, 116, 139, 0.12)',
      badgeColor: '#475569',
      border: '1.5px solid rgba(100, 116, 139, 0.25)',
      icon: <History size={15} color="#475569" />,
      label: 'Operation'
    };
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 20px 60px' }}>
      {/* Header Banner - Liquid Frosted Glass Theme */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(36px) saturate(210%)',
        borderRadius: '24px',
        padding: '26px 30px',
        marginBottom: '24px',
        boxShadow: '0 16px 45px -8px rgba(15, 23, 42, 0.08), 0 0 0 1.5px rgba(255, 255, 255, 0.95) inset',
        border: '1.5px solid rgba(2, 132, 199, 0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(2, 132, 199, 0.32)'
              }}>
                <History size={26} color="#ffffff" />
              </div>
              <div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(2, 132, 199, 0.10)',
                  border: '1px solid rgba(2, 132, 199, 0.22)',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#0284c7',
                  fontWeight: 900
                }}>
                  <Zap size={12} />
                  Enterprise Audit Trail & Operations History
                </span>
                <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#000000' }}>
                  Full Operations History <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginLeft: '6px' }}>(مکمل آپریشنز ہسٹری اور تفصیلی سرگرمی لاگ)</span>
                </h1>
              </div>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 650, maxWidth: '860px', lineHeight: 1.6 }}>
              A complete, plain-language record of every operational event, task assignment, review, Master Admin sign-off, and company announcement. 
              Anyone can read and understand exactly what has happened across the organization.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openAiWithPrompt('Hmari company may aaj tak kya kya kaam hua hai? Poori history ka step-by-step executive summary batao.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.80rem',
                fontWeight: 850,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(225, 29, 72, 0.3)'
              }}
            >
              <Sparkles size={16} />
              Ask AI: "Summary Batao"
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '100%' }}>
          {[
            { id: 'all', label: `All History (${history.length})`, icon: History },
            { id: 'task', label: 'Tasks & Sprints', icon: FolderKanban },
            { id: 'review', label: 'Reviews & Approvals', icon: CheckCircle2 },
            { id: 'announcement', label: 'Announcements', icon: Bell },
            { id: 'kudos', label: 'Kudos & Gifting', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#0f172a' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#1e293b',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '360px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search history by keyword, person, or task..."
            style={{
              padding: '8px 12px 8px 34px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.78rem',
              outline: 'none',
              width: '100%',
              fontWeight: 650,
              color: '#0f172a',
              background: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Timeline Stream */}
      {isLoading ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '50px 20px',
          textAlign: 'center',
          border: '1.5px solid #e2e8f0'
        }}>
          <div className="pulse-dot-red" style={{ width: '16px', height: '16px', margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850, color: '#0f172a' }}>
            Loading Operations History Log...
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.80rem', color: '#64748b' }}>
            Retrieving chronological audit trail from local database
          </p>
        </div>
      ) : Object.keys(groupedEntries).length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '44px 24px',
          textAlign: 'center',
          border: '1.5px solid rgba(2, 132, 199, 0.25)',
          boxShadow: '0 8px 30px rgba(2, 132, 199, 0.06)'
        }}>
          <History size={42} color="#0284c7" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
            No History Events Found
          </h3>
          <p style={{ margin: '6px 0 16px', fontSize: '0.86rem', color: '#1e293b', fontWeight: 650, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            No activity matches the current category or search criteria. As new tasks are assigned, submitted, reviewed, and announcements posted, they will automatically be logged here.
          </p>
          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedEntries).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              {/* Date Group Heading */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.08)',
                color: '#0f172a',
                fontSize: '0.82rem',
                fontWeight: 900,
                marginBottom: '16px'
              }}>
                <Calendar size={14} />
                <span>{dateLabel}</span>
                <span style={{ fontSize: '0.72rem', background: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
                  {items.length} {items.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Event Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {items.map(item => {
                  const meta = getCategoryMeta(item.category, item.action);

                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        border: '1.5px solid #e2e8f0',
                        padding: '20px 24px',
                        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      {/* Top Row: Category Badge + Timestamp + Quick AI Prompt */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            background: meta.badgeBg,
                            color: meta.badgeColor,
                            border: meta.border,
                            fontSize: '0.74rem',
                            fontWeight: 850
                          }}>
                            {meta.icon}
                            {meta.label}
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            color: '#475569',
                            fontWeight: 750
                          }}>
                            <Clock size={13} />
                            {item.formattedTime || new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Ask AI about this step button */}
                        <button
                          type="button"
                          onClick={() => openAiWithPrompt(`Mujhe is event k baray may mazeed detail batao: "${item.title}" - ${item.description}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#0f172a',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          <Sparkles size={12} color="#e11d48" />
                          Ask AI About This
                        </button>
                      </div>

                      {/* Main Titles */}
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.08rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.015em' }}>
                          {item.title}
                        </h3>
                        {item.urduTitle && item.urduTitle !== item.title && (
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#be123c', marginBottom: '6px' }}>
                            {item.urduTitle}
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b', fontWeight: 650, lineHeight: 1.55 }}>
                          {item.description}
                        </p>
                      </div>

                      {/* Bottom Row: Actor & Target Badges */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '10px',
                        borderTop: '1px solid #f1f5f9',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Actor:</span>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#0f172a'
                          }}>
                            <img
                              src={item.actor?.avatar || '/icon.png'}
                              alt=""
                              style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <span>{item.actor?.name || 'System / Admin'}</span>
                          </div>
                        </div>

                        {item.target?.name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Target:</span>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: '#f1f5f9',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#334155'
                            }}>
                              {item.target.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
