'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Trash2, 
  Sparkles,
  ExternalLink,
  Hourglass,
  Send
} from 'lucide-react';

export default function NotificationCenter({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const prevUnreadCountRef = useRef(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: Play gentle notification sound using Web Audio API synthesis
  const playNotificationChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio policy handled silently
    }
  };

  // Load notifications from API
  const loadNotifications = async (isInitial = false) => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (!res.ok) return;
      const data = await res.json();
      
      const unreadCount = data.filter(n => !n.read).length;
      if (!isInitial && unreadCount > prevUnreadCountRef.current) {
        playNotificationChime();
      }
      prevUnreadCountRef.current = unreadCount;
      setNotifications(data);
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications(true);
    // Poll every 8 seconds for real-time updates (like LinkedIn / WhatsApp)
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = async (id, link) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (link) {
        window.location.href = link;
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!currentUser?.id) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn(err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.warn(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  // Relative time helper
  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  // Get icon by notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return { icon: Bell, bg: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' };
      case 'extension_requested':
        return { icon: Hourglass, bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' };
      case 'extension_approved':
        return { icon: CheckCircle2, bg: 'rgba(5, 150, 105, 0.12)', color: '#059669' };
      case 'extension_declined':
        return { icon: AlertCircle, bg: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' };
      case 'task_submitted':
        return { icon: Send, bg: 'rgba(124, 58, 237, 0.12)', color: '#7c3aed' };
      case 'task_approved':
        return { icon: CheckCircle2, bg: 'rgba(5, 150, 105, 0.12)', color: '#059669' };
      case 'task_rejected':
        return { icon: AlertCircle, bg: 'rgba(225, 29, 72, 0.12)', color: '#e11d48' };
      default:
        return { icon: Sparkles, bg: 'rgba(241, 245, 249, 0.9)', color: '#475569' };
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Navbar Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: isOpen ? 'rgba(225, 29, 72, 0.1)' : 'rgba(255, 255, 255, 0.85)',
          border: '1.5px solid rgba(203, 213, 225, 0.8)',
          color: isOpen ? '#e11d48' : '#0f172a',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
        }}
        title="In-Portal Notifications"
      >
        <Bell size={17} strokeWidth={2.4} />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-3px',
            right: '-3px',
            background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
            color: '#ffffff',
            fontSize: '0.66rem',
            fontWeight: 850,
            borderRadius: '9999px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.5)',
            border: '2px solid #ffffff',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Dropdown (LinkedIn / WhatsApp style) */}
      {isOpen && (
        <div style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? '70px' : '46px',
          right: isMobile ? '12px' : '-10px',
          left: isMobile ? '12px' : 'auto',
          width: isMobile ? 'auto' : '380px',
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '92vw',
          maxHeight: isMobile ? '70vh' : '520px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(36px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.22)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={17} color="#e11d48" />
              <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span style={{
                  background: 'rgba(225, 29, 72, 0.1)',
                  color: '#e11d48',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px'
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(248, 250, 252, 0.8)',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 750,
                border: 'none',
                background: filter === 'all' ? '#0f172a' : 'transparent',
                color: filter === 'all' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: 750,
                border: 'none',
                background: filter === 'unread' ? '#e11d48' : 'transparent',
                color: filter === 'unread' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '380px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(241, 245, 249, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}>
                  <CheckCircle2 size={22} color="#059669" />
                </div>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  All Caught Up!
                </h5>
                <p style={{ fontSize: '0.74rem', margin: 0, fontWeight: 550 }}>
                  Koi new notification nahi hai.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const typeStyle = getTypeIcon(notif.type);
                const IconComponent = typeStyle.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      background: notif.read ? '#ffffff' : 'rgba(2, 132, 199, 0.04)',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(241, 245, 249, 0.7)'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.read ? '#ffffff' : 'rgba(2, 132, 199, 0.04)'}
                  >
                    {/* Icon Badge */}
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: typeStyle.bg,
                      color: typeStyle.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={17} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <h5 style={{
                          fontSize: '0.82rem',
                          fontWeight: notif.read ? 700 : 850,
                          color: '#0f172a',
                          margin: '0 0 2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {notif.title}
                          {!notif.read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
                          )}
                        </h5>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 600 }}>
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.76rem',
                        color: '#334155',
                        fontWeight: notif.read ? 500 : 600,
                        margin: '2px 0 0',
                        lineHeight: 1.4
                      }}>
                        {notif.message}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNotification(e, notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                      title="Dismiss"
                      onMouseEnter={e => e.currentTarget.style.color = '#e11d48'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 16px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.68rem',
            color: '#64748b',
            fontWeight: 650,
            textAlign: 'center'
          }}>
            Real-time Hub Notifications • Stowave Strategy
          </div>
        </div>
      )}
    </div>
  );
}
