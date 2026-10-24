'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Timer,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Search,
  Filter,
  ArrowUpRight,
  MessageCircle,
  Trophy,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Flame,
  Award,
  FileText,
  X,
  Sparkles,
  PhoneCall
} from 'lucide-react';

/**
 * Evaluates task timeliness against its dueDate and completion timestamps.
 */
export function evaluateTaskTimeliness(task) {
  if (!task.dueDate) {
    return {
      category: 'unknown',
      status: 'no_due_date',
      label: 'No Due Date',
      badgeColor: '#64748b',
      badgeBg: 'rgba(100, 116, 139, 0.1)',
      durationStr: 'Unscheduled',
      durationMs: 0
    };
  }

  // Parse YYYY-MM-DD to end of day local time
  const [y, m, d] = task.dueDate.split('-').map(Number);
  const deadline = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();

  let finishTime = null;
  if (task.submittedAt) {
    finishTime = new Date(task.submittedAt).getTime();
  } else if (task.status === 'completed') {
    finishTime = new Date(task.reviewedAt || task.updatedAt || task.createdAt).getTime();
  }

  const now = Date.now();

  if (finishTime) {
    const diff = finishTime - deadline;
    if (diff > 0) {
      // Delivered late
      const diffHrs = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diffHrs / 24);
      const hours = diffHrs % 24;
      const durationStr = days > 0 ? `${days}d ${hours}h late` : `${hours}h late`;
      return {
        category: 'late',
        status: 'completed_late',
        label: '⚠️ Submitted Late',
        subLabel: 'Finished past deadline',
        badgeColor: '#e11d48',
        badgeBg: 'rgba(225, 29, 72, 0.12)',
        durationMs: diff,
        durationStr,
        finishTime,
        deadline
      };
    } else {
      const aheadMs = deadline - finishTime;
      const aheadHrs = Math.floor(aheadMs / (1000 * 60 * 60));
      const days = Math.floor(aheadHrs / 24);
      const hours = aheadHrs % 24;

      if (aheadHrs >= 12) {
        // Delivered early (Zyada Jaldi)
        const durationStr = days > 0 ? `${days}d ${hours}h early` : `${hours}h early`;
        return {
          category: 'early',
          status: 'completed_early',
          label: '⚡ Delivered Early',
          subLabel: 'Fast-track turnaround',
          badgeColor: '#0284c7',
          badgeBg: 'rgba(2, 132, 199, 0.12)',
          durationMs: aheadMs,
          durationStr,
          finishTime,
          deadline
        };
      } else {
        // Delivered on time
        return {
          category: 'ontime',
          status: 'completed_ontime',
          label: '🟢 On-Time Delivery',
          subLabel: 'Delivered right on schedule',
          badgeColor: '#059669',
          badgeBg: 'rgba(5, 150, 105, 0.12)',
          durationMs: aheadMs,
          durationStr: 'On Schedule',
          finishTime,
          deadline
        };
      }
    }
  } else {
    // Task still in progress or pending review
    if (now > deadline) {
      // Currently overdue!
      const overdueMs = now - deadline;
      const overdueHrs = Math.floor(overdueMs / (1000 * 60 * 60));
      const days = Math.floor(overdueHrs / 24);
      const hours = overdueHrs % 24;
      const durationStr = days > 0 ? `${days}d ${hours}h overdue` : `${hours}h overdue`;
      return {
        category: 'late',
        status: 'overdue_active',
        label: '🚨 Overdue (Pending)',
        subLabel: 'Deadline breached, work incomplete',
        badgeColor: '#b91c1c',
        badgeBg: 'rgba(185, 28, 28, 0.14)',
        durationMs: overdueMs,
        durationStr,
        deadline
      };
    } else {
      // On track
      const remainingMs = deadline - now;
      const remHrs = Math.floor(remainingMs / (1000 * 60 * 60));
      const days = Math.floor(remHrs / 24);
      const hours = remHrs % 24;
      const durationStr = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
      return {
        category: 'ontrack',
        status: 'active_ontrack',
        label: '⏳ In-Progress (On-Track)',
        subLabel: 'Within scheduled timeline',
        badgeColor: '#d97706',
        badgeBg: 'rgba(217, 119, 6, 0.12)',
        durationMs: remainingMs,
        durationStr,
        deadline
      };
    }
  }
}

export default function LateWorksHub({ tasks = [], users = [], currentUser, onRefresh }) {
  const [activeTab, setActiveTab] = useState('late'); // 'late' | 'early' | 'ontime' | 'leaderboard' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [inspectTask, setInspectTask] = useState(null);

  const isMasterAdmin = currentUser?.role === 'master_admin' || currentUser?.isFirstAdmin || currentUser?.email === 'alizohaib.web@gmail.com';
  const isAdmin = currentUser?.role === 'admin' || isMasterAdmin;

  // Enrich tasks with timeliness metrics and user objects
  const enrichedTasks = useMemo(() => {
    return tasks.map(t => {
      const timeliness = evaluateTaskTimeliness(t);
      const assignee = users.find(u => u.id === t.assignedTo) || { name: 'Unassigned', role: 'member' };
      const assigner = users.find(u => u.id === t.assignedBy) || { name: t.assignedByName || 'Admin', role: 'admin' };
      return {
        ...t,
        timeliness,
        assignee,
        assigner
      };
    });
  }, [tasks, users]);

  // High-level KPI aggregations
  const stats = useMemo(() => {
    let lateCount = 0;
    let activeOverdueCount = 0;
    let completedLateCount = 0;
    let earlyCount = 0;
    let onTimeCount = 0;
    let onTrackCount = 0;

    enrichedTasks.forEach(t => {
      if (t.timeliness.category === 'late') {
        lateCount++;
        if (t.timeliness.status === 'overdue_active') activeOverdueCount++;
        else completedLateCount++;
      } else if (t.timeliness.category === 'early') {
        earlyCount++;
      } else if (t.timeliness.category === 'ontime') {
        onTimeCount++;
      } else if (t.timeliness.category === 'ontrack') {
        onTrackCount++;
      }
    });

    const evaluatedTotal = lateCount + earlyCount + onTimeCount;
    const punctualityScore = evaluatedTotal > 0 ? Math.round(((earlyCount + onTimeCount) / evaluatedTotal) * 100) : 100;

    return {
      lateCount,
      activeOverdueCount,
      completedLateCount,
      earlyCount,
      onTimeCount,
      onTrackCount,
      totalTasks: tasks.length,
      punctualityScore
    };
  }, [enrichedTasks, tasks.length]);

  // Filter tasks according to tab, search query, assignee, priority
  const filteredTasks = useMemo(() => {
    return enrichedTasks.filter(t => {
      // Tab filter
      if (activeTab === 'late' && t.timeliness.category !== 'late') return false;
      if (activeTab === 'early' && t.timeliness.category !== 'early') return false;
      if (activeTab === 'ontime' && t.timeliness.category !== 'ontime') return false;

      // Assignee filter
      if (selectedAssignee !== 'all' && t.assignedTo !== selectedAssignee) return false;

      // Priority filter
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const descMatch = t.description?.toLowerCase().includes(q);
        const assigneeMatch = t.assignee?.name?.toLowerCase().includes(q);
        const tagMatch = t.tags?.some(tag => tag.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !assigneeMatch && !tagMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort priority: overdue active first, then highest delay
      if (a.timeliness.status === 'overdue_active' && b.timeliness.status !== 'overdue_active') return -1;
      if (b.timeliness.status === 'overdue_active' && a.timeliness.status !== 'overdue_active') return 1;
      return (b.timeliness.durationMs || 0) - (a.timeliness.durationMs || 0);
    });
  }, [enrichedTasks, activeTab, selectedAssignee, selectedPriority, searchQuery]);

  // Member Leaderboard & Punctuality Breakdown
  const memberLeaderboard = useMemo(() => {
    const memberMap = {};

    users.forEach(u => {
      memberMap[u.id] = {
        user: u,
        totalAssigned: 0,
        completed: 0,
        early: 0,
        onTime: 0,
        late: 0,
        activeOverdue: 0
      };
    });

    enrichedTasks.forEach(t => {
      const uId = t.assignedTo;
      if (!memberMap[uId]) return;
      memberMap[uId].totalAssigned++;
      if (t.status === 'completed') memberMap[uId].completed++;

      if (t.timeliness.category === 'late') {
        memberMap[uId].late++;
        if (t.timeliness.status === 'overdue_active') memberMap[uId].activeOverdue++;
      } else if (t.timeliness.category === 'early') {
        memberMap[uId].early++;
      } else if (t.timeliness.category === 'ontime') {
        memberMap[uId].onTime++;
      }
    });

    return Object.values(memberMap)
      .map(m => {
        const totalEvaluated = m.early + m.onTime + m.late;
        const score = totalEvaluated > 0 ? Math.round(((m.early + m.onTime) / totalEvaluated) * 100) : 100;
        return {
          ...m,
          score,
          totalEvaluated
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.completed - a.completed;
      });
  }, [users, enrichedTasks]);

  // Build polite WhatsApp message for overdue follow-up
  const openWhatsAppPing = (task) => {
    const phone = task.assignee?.phone ? task.assignee.phone.replace(/[^0-9]/g, '') : '';
    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${task.assignee?.name || 'Brother'},\n\n` +
      `Reminder regarding task: *"${task.title}"*.\n` +
      `Due Date: *${task.dueDate}* (${task.timeliness.durationStr}).\n` +
      `Current Status: *${task.status.toUpperCase()}*.\n\n` +
      `Please provide an update or submit your deliverables on the Stowave portal. If you need extra time, you can also request an extension.\n\n` +
      `Stowave Operations Management`
    );

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 20px 48px' }}>
      {/* Header Banner - Liquid Frosted Glass Theme */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(36px) saturate(210%)',
        borderRadius: '24px',
        padding: '26px 30px',
        marginBottom: '24px',
        boxShadow: '0 16px 45px -8px rgba(15, 23, 42, 0.08), 0 0 0 1.5px rgba(255, 255, 255, 0.95) inset',
        border: '1.5px solid rgba(225, 29, 72, 0.16)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(225, 29, 72, 0.32)'
            }}>
              <Timer size={26} color="#ffffff" />
            </div>
            <div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(225, 29, 72, 0.10)',
                border: '1px solid rgba(225, 29, 72, 0.22)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#be123c',
                fontWeight: 900
              }}>
                <Flame size={12} />
                Operations Timeliness & Punctuality Intelligence
              </span>
              <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#000000' }}>
                Late Works & Delivery Hub <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginLeft: '6px' }}>(کام کی پابندی اور تاخیر کنٹرول سنٹر)</span>
              </h1>
            </div>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: '#0f172a', fontWeight: 650, maxWidth: '860px', lineHeight: 1.6 }}>
            Real-time tracking of delayed deliverables, fast-track early completions, and scheduled sprint accuracy. 
            Review breach durations, follow up via WhatsApp, or celebrate high-speed turnarounds.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* 1. Late / Overdue Card */}
        <div 
          onClick={() => setActiveTab('late')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'late' ? 'linear-gradient(135deg, rgba(254, 242, 242, 0.98), rgba(255, 228, 230, 0.95))' : '#ffffff',
            border: activeTab === 'late' ? '2px solid #e11d48' : '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: activeTab === 'late' ? '0 12px 28px rgba(225, 29, 72, 0.16)' : '0 4px 16px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(225, 29, 72, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e11d48'
            }}>
              <AlertTriangle size={22} />
            </div>
            {stats.activeOverdueCount > 0 && (
              <span style={{
                background: '#e11d48',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '0.04em'
              }}>
                {stats.activeOverdueCount} CRITICAL
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#9f1239', lineHeight: 1.1 }}>
            {stats.lateCount}
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#0f172a', marginTop: '4px' }}>
            Late / Overdue Works
          </div>
          <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 750, marginTop: '2px' }}>
            {stats.activeOverdueCount} pending overdue • {stats.completedLateCount} finished late
          </div>
        </div>

        {/* 2. Early Deliverables Card */}
        <div 
          onClick={() => setActiveTab('early')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'early' ? 'linear-gradient(135deg, rgba(240, 249, 255, 0.98), rgba(224, 242, 254, 0.95))' : '#ffffff',
            border: activeTab === 'early' ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: activeTab === 'early' ? '0 12px 28px rgba(2, 132, 199, 0.16)' : '0 4px 16px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(2, 132, 199, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284c7'
            }}>
              <Zap size={22} />
            </div>
            <span style={{
              background: 'rgba(2, 132, 199, 0.15)',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 850
            }}>
              FAST TRACK
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0369a1', lineHeight: 1.1 }}>
            {stats.earlyCount}
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#0f172a', marginTop: '4px' }}>
            Early Deliverables (زیادہ جلدی)
          </div>
          <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 750, marginTop: '2px' }}>
            Completed well ahead of target deadline
          </div>
        </div>

        {/* 3. On-Time Deliverables Card */}
        <div 
          onClick={() => setActiveTab('ontime')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'ontime' ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.98), rgba(209, 250, 229, 0.95))' : '#ffffff',
            border: activeTab === 'ontime' ? '2px solid #059669' : '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: activeTab === 'ontime' ? '0 12px 28px rgba(5, 150, 105, 0.16)' : '0 4px 16px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(5, 150, 105, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{
              background: 'rgba(5, 150, 105, 0.15)',
              color: '#047857',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 850
            }}>
              100% TARGET
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#047857', lineHeight: 1.1 }}>
            {stats.onTimeCount}
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#0f172a', marginTop: '4px' }}>
            On-Time Deliveries (پورے وقت پر)
          </div>
          <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 750, marginTop: '2px' }}>
            Strict execution within deadline schedule
          </div>
        </div>

        {/* 4. Team Punctuality Rate Card */}
        <div 
          onClick={() => setActiveTab('leaderboard')}
          style={{
            cursor: 'pointer',
            background: activeTab === 'leaderboard' ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.98), rgba(253, 230, 138, 0.95))' : '#ffffff',
            border: activeTab === 'leaderboard' ? '2px solid #d97706' : '1.5px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: activeTab === 'leaderboard' ? '0 12px 28px rgba(217, 119, 6, 0.16)' : '0 4px 16px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(217, 119, 6, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706'
            }}>
              <Trophy size={22} />
            </div>
            <span style={{
              background: 'rgba(217, 119, 6, 0.15)',
              color: '#b45309',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 850
            }}>
              LEADERBOARD
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#b45309', lineHeight: 1.1 }}>
            {stats.punctualityScore}%
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 850, color: '#0f172a', marginTop: '4px' }}>
            Overall Punctuality Score
          </div>
          <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 750, marginTop: '2px' }}>
            {stats.earlyCount + stats.onTimeCount} on-time vs {stats.lateCount} delayed
          </div>
        </div>
      </div>

      {/* Filter and Tab Navigation Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '100%' }}>
          <button
            type="button"
            onClick={() => setActiveTab('late')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'late' ? '#e11d48' : '#f1f5f9',
              color: activeTab === 'late' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <AlertTriangle size={14} />
            🚨 Late Works ({stats.lateCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('early')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'early' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'early' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Zap size={14} />
            ⚡ Early Deliveries ({stats.earlyCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ontime')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'ontime' ? '#059669' : '#f1f5f9',
              color: activeTab === 'ontime' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <CheckCircle2 size={14} />
            🟢 On-Time ({stats.onTimeCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'leaderboard' ? '#d97706' : '#f1f5f9',
              color: activeTab === 'leaderboard' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Trophy size={14} />
            🏆 Member Scorecard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'all' ? '#ffffff' : '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            All Work ({enrichedTasks.length})
          </button>
        </div>

        {/* Search & Secondary Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deliverables..."
              style={{
                padding: '7px 10px 7px 30px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.76rem',
                outline: 'none',
                width: '100%',
                fontWeight: 600,
                color: '#0f172a'
              }}
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={e => setSelectedAssignee(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.76rem',
              outline: 'none',
              fontWeight: 700,
              color: '#0f172a',
              background: '#ffffff'
            }}
          >
            <option value="all">All Members</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.76rem',
              outline: 'none',
              fontWeight: 700,
              color: '#0f172a',
              background: '#ffffff'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'leaderboard' ? (
        /* ================= MEMBER LEADERBOARD VIEW ================= */
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '1.5px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                Team Delivery Punctuality Leaderboard
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Ranking of team members based on deadlines met, early submissions, and low late infractions.
              </p>
            </div>
            <Link
              href="/recognition"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.76rem',
                fontWeight: 850
              }}
            >
              <Award size={14} />
              Award Kudos & Bonus
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 10px' }}>Rank</th>
                  <th style={{ padding: '12px 10px' }}>Team Member</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Total Tasks</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>⚡ Early</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>🟢 On-Time</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>🚨 Late</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Punctuality Score</th>
                </tr>
              </thead>
              <tbody>
                {memberLeaderboard.map((m, idx) => {
                  const isTop = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;

                  return (
                    <tr
                      key={m.user.id}
                      style={{
                        borderBottom: '1px solid #f8fafc',
                        background: isTop ? 'rgba(254, 243, 199, 0.35)' : '#ffffff',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isTop ? '#fbbf24' : isSecond ? '#94a3b8' : isThird ? '#d97706' : '#f1f5f9',
                          color: isTop || isSecond || isThird ? '#ffffff' : '#64748b',
                          fontWeight: 900,
                          fontSize: '0.76rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={m.user.avatar || '/icon.png'}
                            alt={m.user.name}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 850, fontSize: '0.88rem', color: '#0f172a' }}>
                              {m.user.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {m.user.title || m.user.role} • {m.user.department || 'Operations'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 750, color: '#0f172a' }}>
                        {m.totalAssigned}
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(2, 132, 199, 0.1)',
                          color: '#0284c7',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.76rem'
                        }}>
                          {m.early}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(5, 150, 105, 0.1)',
                          color: '#059669',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.76rem'
                        }}>
                          {m.onTime}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                        <span style={{
                          background: m.late > 0 ? 'rgba(225, 29, 72, 0.12)' : 'rgba(100, 116, 139, 0.08)',
                          color: m.late > 0 ? '#e11d48' : '#64748b',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.76rem'
                        }}>
                          {m.late} {m.activeOverdue > 0 && `(${m.activeOverdue} active)`}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          <span style={{
                            fontSize: '0.92rem',
                            fontWeight: 900,
                            color: m.score >= 90 ? '#059669' : m.score >= 75 ? '#0284c7' : '#e11d48'
                          }}>
                            {m.score}%
                          </span>
                          <div style={{
                            width: '90px',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '999px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${m.score}%`,
                              height: '100%',
                              background: m.score >= 90 ? '#059669' : m.score >= 75 ? '#0284c7' : '#e11d48'
                            }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= DELIVERABLES LIST VIEW ================= */
        <div>
          {filteredTasks.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '38px 24px',
              textAlign: 'center',
              border: '1.5px solid rgba(5, 150, 105, 0.25)',
              boxShadow: '0 8px 30px rgba(5, 150, 105, 0.06)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(5, 150, 105, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: '#059669',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.18)'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                {activeTab === 'late' ? 'No Late Works Detected!' : 'No Tasks Found in this Category'}
              </h3>
              <p style={{ margin: '6px 0 16px', fontSize: '0.86rem', color: '#1e293b', fontWeight: 650, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                {activeTab === 'late'
                  ? 'All tasks are either completely on schedule or delivered early. (الحمدللہ تمام کام وقت پر یا وقت سے پہلے مکمل ہیں)'
                  : 'Adjust your search queries or filter dropdowns to view other operational deliverables.'}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  View All Deliverables ({enrichedTasks.length})
                </button>
                <Link
                  href="/tasks"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}
                >
                  Go to Task Kanban Board
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredTasks.map(task => {
                const isLate = task.timeliness.category === 'late';
                const isEarly = task.timeliness.category === 'early';
                const isOntime = task.timeliness.category === 'ontime';
                const isOverdueActive = task.timeliness.status === 'overdue_active';

                return (
                  <div
                    key={task.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: isOverdueActive 
                        ? '2px solid rgba(225, 29, 72, 0.4)' 
                        : isLate 
                        ? '1.5px solid rgba(225, 29, 72, 0.25)' 
                        : isEarly 
                        ? '1.5px solid rgba(2, 132, 199, 0.25)' 
                        : '1.5px solid #e2e8f0',
                      padding: '18px 22px',
                      boxShadow: isOverdueActive 
                        ? '0 10px 24px rgba(225, 29, 72, 0.1)' 
                        : '0 4px 16px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Top Row: Timeliness Badge + Status + Priority */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Timeliness Badge */}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '999px',
                          background: task.timeliness.badgeBg,
                          color: task.timeliness.badgeColor,
                          fontSize: '0.76rem',
                          fontWeight: 900
                        }}>
                          {isLate && <AlertTriangle size={13} />}
                          {isEarly && <Zap size={13} />}
                          {isOntime && <CheckCircle2 size={13} />}
                          <span>{task.timeliness.label}: {task.timeliness.durationStr}</span>
                        </div>

                        {/* Status Badge */}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase'
                        }}>
                          Status: {task.status}
                        </span>

                        {/* Priority Badge */}
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: task.priority === 'urgent' ? 'rgba(225, 29, 72, 0.1)' : '#f8fafc',
                          color: task.priority === 'urgent' ? '#e11d48' : '#64748b',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {task.priority === 'urgent' ? '🔴 Urgent' : task.priority === 'high' ? '🟠 High' : '🟡 Normal'}
                        </span>
                      </div>

                      {/* Due Date Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: isLate ? '#e11d48' : '#475569', fontWeight: 800 }}>
                        <Calendar size={14} />
                        <span>Deadline: {task.dueDate}</span>
                      </div>
                    </div>

                    {/* Middle Row: Title, Description, and Tags */}
                    <div>
                      <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 850, color: '#0f172a' }}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, maxHeight: '42px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.description}
                        </p>
                      )}
                      {task.tags?.length > 0 && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {task.tags.map((tag, idx) => (
                            <span key={idx} style={{ padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: People (Assigner -> Assignee) + Quick Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '10px',
                      borderTop: '1px solid #f1f5f9',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      {/* Assigner -> Assignee Pill */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.76rem'
                      }}>
                        {/* Assigner */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <img
                            src={task.assigner?.avatar || '/icon.png'}
                            alt={task.assigner?.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ color: '#64748b', fontWeight: 750 }}>By: {task.assigner?.name || 'Admin'}</span>
                        </div>

                        <span style={{ color: '#e11d48', fontWeight: 900 }}>➔</span>

                        {/* Assignee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <img
                            src={task.assignee?.avatar || '/icon.png'}
                            alt={task.assignee?.name}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ color: '#0f172a', fontWeight: 850 }}>To: {task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* WhatsApp Follow-up Ping */}
                        {isLate && (
                          <button
                            type="button"
                            onClick={() => openWhatsAppPing(task)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '10px',
                              background: '#25D366',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.28)'
                            }}
                            title="Ping assignee on WhatsApp with task reminder"
                          >
                            <MessageCircle size={14} />
                            WhatsApp Ping
                          </button>
                        )}

                        {/* Inspect Details */}
                        <button
                          type="button"
                          onClick={() => setInspectTask(task)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FileText size={13} />
                          Inspect Details
                        </button>

                        {/* Jump to TaskBoard */}
                        <Link
                          href="/tasks"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            background: '#0f172a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Open in Kanban
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inspect Task Modal */}
      {inspectTask && (
        <div 
          onClick={() => setInspectTask(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
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
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '1.5px solid rgba(255,255,255,0.8)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: inspectTask.timeliness.badgeBg,
                  color: inspectTask.timeliness.badgeColor,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  marginBottom: '6px'
                }}>
                  {inspectTask.timeliness.label}: {inspectTask.timeliness.durationStr}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  {inspectTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectTask(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Timeliness Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              background: '#f8fafc',
              padding: '14px',
              borderRadius: '16px',
              marginBottom: '16px',
              fontSize: '0.78rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Deadline Due Date</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{inspectTask.dueDate}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Current Status</span>
                <span style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{inspectTask.status}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Assigned To</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{inspectTask.assignee?.name}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Assigned By</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{inspectTask.assigner?.name}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                Deliverable Briefing & Requirements
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                {inspectTask.description || 'No detailed instructions provided.'}
              </p>
            </div>

            {/* Submission Notes & Attachments if submitted */}
            {inspectTask.submittedAt && (
              <div style={{ marginBottom: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 800, color: '#0369a1' }}>
                  Member Deliverable Submission (Submitted on: {new Date(inspectTask.submittedAt).toLocaleString()})
                </h4>
                {inspectTask.submissionNotes && (
                  <p style={{ margin: '0 0 8px', fontSize: '0.80rem', color: '#334155', background: 'rgba(2, 132, 199, 0.05)', padding: '10px', borderRadius: '10px' }}>
                    {inspectTask.submissionNotes}
                  </p>
                )}
                {inspectTask.submissionImages?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {inspectTask.submissionImages.map((img, i) => (
                      <a key={i} href={img.url || img} target="_blank" rel="noreferrer">
                        <img src={img.url || img} alt="Submission" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              {inspectTask.timeliness.category === 'late' && (
                <button
                  type="button"
                  onClick={() => openWhatsAppPing(inspectTask)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: '#25D366',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={15} />
                  Ping on WhatsApp
                </button>
              )}
              <Link
                href="/tasks"
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: '#0f172a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Manage in TaskBoard
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
