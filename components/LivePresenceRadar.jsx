'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Activity, 
  Eye, 
  Clock, 
  ShieldCheck, 
  X, 
  Radio, 
  RefreshCw, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export default function LivePresenceRadar({ currentUser }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [presenceData, setPresenceData] = useState({
    onlineCount: 0,
    offlineCount: 0,
    onlineUsers: [],
    offlineUsers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const heartbeatTimerRef = useRef(null);
  const supabaseRef = useRef(null);
  const radarRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (radarRef.current && !radarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Initialize Supabase realtime channel
  useEffect(() => {
    try {
      const supabase = createClient();
      supabaseRef.current = supabase;
      const channel = supabase.channel('stowave-presence', {
        config: { presence: { key: currentUser?.id || 'anon' } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          // Presence sync event triggered from another client
          fetchActivePresences();
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED' && currentUser?.id) {
            await channel.track({
              userId: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              role: currentUser.role,
              currentPage: pathname,
              onlineAt: new Date().toISOString()
            });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    } catch (err) {
      // Supabase fallback gracefully handled by HTTP heartbeat
    }
  }, [currentUser?.id, pathname]);

  // Periodic HTTP Heartbeat & Active Crawlers Polling
  const sendHeartbeat = async () => {
    if (!currentUser?.id) return;
    try {
      await fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
          currentPage: pathname || '/',
          pageTitle: document.title || 'Stowave TeamHub'
        })
      });
    } catch (e) {
      // silent
    }
  };

  const fetchActivePresences = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/presence/active');
      if (res.ok) {
        const data = await res.json();
        setPresenceData(data);
      }
    } catch (e) {
      console.warn('Error fetching presence:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Heartbeat loop
  useEffect(() => {
    sendHeartbeat();
    fetchActivePresences();

    heartbeatTimerRef.current = setInterval(() => {
      sendHeartbeat();
      fetchActivePresences();
    }, 15000); // every 15s

    const handleBeforeUnload = () => {
      if (currentUser?.id) {
        const payload = JSON.stringify({ userId: currentUser.id });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/presence/leave', blob);
        } else {
          fetch('/api/presence/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatTimerRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser?.id, pathname]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onlineCount = Math.max(presenceData.onlineCount || 0, currentUser ? 1 : 0);

  return (
    <div ref={radarRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* 1. Header Trigger Pill */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          if (!isOpen) fetchActivePresences();
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '9999px',
          background: isOpen ? '#059669' : 'rgba(255, 255, 255, 0.95)',
          border: isOpen ? '1.5px solid #059669' : '1.5px solid rgba(203, 213, 225, 0.95)',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.16s ease',
          flexShrink: 0
        }}
        title="View live active users crawling the platform"
      >
        <span className="pulse-dot" style={{ width: '7px', height: '7px', background: isOpen ? '#ffffff' : undefined }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 850, color: isOpen ? '#ffffff' : '#0f172a' }}>
          {onlineCount} Live
        </span>
        <Eye size={13} color={isOpen ? '#ffffff' : '#059669'} />
      </button>

      {/* 2. Anchored Popover Dropdown (Clamped to viewport on mobile) */}
      {isOpen && (
        <div
          style={{
            position: isMobile ? 'fixed' : 'absolute',
            top: isMobile ? '70px' : 'calc(100% + 10px)',
            left: isMobile ? '12px' : 0,
            right: isMobile ? '12px' : 'auto',
            width: isMobile ? 'auto' : '400px',
            maxWidth: isMobile ? 'calc(100vw - 24px)' : 'calc(100vw - 32px)',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            borderRadius: '16px',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            padding: '16px 18px',
            zIndex: 9999,
            maxHeight: isMobile ? '70vh' : '440px',
            overflowY: 'auto'
          }}
        >
          {/* Popover Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            paddingBottom: '10px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(5, 150, 105, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Radio size={16} color="#059669" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 850, color: '#0f172a' }}>
                  Live Team Radar
                </h4>
                <p style={{ margin: 0, fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                  Active platform crawlers & presence
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={fetchActivePresences}
                disabled={isLoading}
                style={{
                  background: 'rgba(241, 245, 249, 0.9)',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.70rem',
                  fontWeight: 750
                }}
                title="Refresh radar"
              >
                <RefreshCw size={12} className={isLoading ? 'spin-icon' : ''} />
                <span>Sync</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(241, 245, 249, 0.9)',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: '4px 7px',
                  borderRadius: '6px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

            {/* Online Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="pulse-dot" />
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 850, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Actively Browsing & Crawling ({presenceData.onlineUsers.length || (currentUser ? 1 : 0)})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {presenceData.onlineUsers.length > 0 ? (
                  presenceData.onlineUsers.map(user => (
                    <div
                      key={user.userId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(5, 150, 105, 0.06)',
                        border: '1.5px solid rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span
                            className="pulse-dot"
                            style={{ position: 'absolute', bottom: '-1px', right: '-1px', border: '2px solid #ffffff' }}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                              {user.name}
                            </span>
                            <span style={{
                              fontSize: '0.62rem',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: user.role === 'admin' ? 'rgba(225, 29, 72, 0.15)' : 'rgba(5, 150, 105, 0.15)',
                              color: user.role === 'admin' ? '#be123c' : '#059669',
                              fontWeight: 800
                            }}>
                              {user.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Laptop size={12} />
                            <span>Crawling <strong>{user.currentPage}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 650 }}>
                          Active {user.activeFor || '< 1m'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(5, 150, 105, 0.06)',
                    border: '1.5px solid rgba(5, 150, 105, 0.25)'
                  }}>
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt="You"
                      style={{ width: '34px', height: '34px', borderRadius: '50%' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                        {currentUser?.name || 'You'} (You)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700 }}>
                        Currently crawling {pathname}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Offline Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 850, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recent Team Activity ({presenceData.offlineUsers.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {presenceData.offlineUsers.length > 0 ? (
                  presenceData.offlineUsers.map(user => (
                    <div
                      key={user.userId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: 'rgba(241, 245, 249, 0.7)',
                        border: '1px solid rgba(203, 213, 225, 0.8)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', filter: 'grayscale(60%)', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#334155' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                            Last seen on {user.lastPage || '/'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#94a3b8', fontWeight: 700 }}>
                        <Clock size={12} />
                        <span>{user.leftAgo || 'Offline'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.80rem', color: '#94a3b8', textAlign: 'center', margin: '14px 0' }}>
                    All registered members are currently live or no offline logs recorded.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
