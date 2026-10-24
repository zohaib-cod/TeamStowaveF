'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckSquare, 
  FileText, 
  Clock, 
  Award, 
  Users, 
  Globe, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Share2,
  ChevronDown,
  FolderKanban,
  UserPlus,
  Menu,
  X,
  User,
  LogOut,
  Crown,
  Timer,
  History
} from 'lucide-react';
import InteractiveTour from './InteractiveTour';
import AiAssistantDrawer from './AiAssistantDrawer';
import LivePresenceRadar from './LivePresenceRadar';
import ProfileModal from './ProfileModal';
import InviteUserModal from './InviteUserModal';
import NotificationCenter from './NotificationCenter';
import PushNotificationManager from './PushNotificationManager';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [unreadSocialCount, setUnreadSocialCount] = useState(0);

  // Modals & Drawers
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [toast, setToast] = useState(null);

  // Check if tour should be shown on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('apex_has_seen_tour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
      localStorage.setItem('apex_has_seen_tour', 'true');
    }
    loadSharedData();

    const handleOpenAi = () => setIsAiDrawerOpen(true);
    const handleDataUpdate = () => loadSharedData();

    window.addEventListener('open-ai-drawer', handleOpenAi);
    window.addEventListener('stowave_data_updated', handleDataUpdate);
    window.addEventListener('tasks-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('open-ai-drawer', handleOpenAi);
      window.removeEventListener('stowave_data_updated', handleDataUpdate);
      window.removeEventListener('tasks-updated', handleDataUpdate);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    if (currentUser?.id && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/presence/leave', JSON.stringify({ userId: currentUser.id }));
    }
    localStorage.removeItem('apex_current_user_id');
    localStorage.removeItem('apex_current_user');
    localStorage.removeItem('stowave_auth_token');
    window.location.href = '/login';
  };

  const loadSharedData = async () => {
    try {
      const [usersRes, statsRes, tasksRes, inboxRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/social/inbox').then(r => r.json()).catch(() => [])
      ]);

      setUsers(usersRes);
      setStats(statsRes);
      setTasks(tasksRes);
      if (Array.isArray(inboxRes)) {
        setUnreadSocialCount(inboxRes.filter(i => i.status === 'unread').length);
      }

      // Strict Authentication Verification
      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId);

      if (activeUser) {
        setCurrentUser(activeUser);
        setIsAuthChecking(false);
      } else {
        // User has not logged in or account not found! Redirect to /login
        window.location.href = '/login';
        return;
      }
    } catch (err) {
      console.error('Failed to load shared layout data:', err);
      window.location.href = '/login';
    }
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('apex_current_user_id', user.id);
    showToast(`Switched active view to ${user.name} (${user.role.toUpperCase()})`);
  };

  const handleUserUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('apex_current_user', JSON.stringify(updatedUser));
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showToast('Profile credentials updated successfully!');
  };

  const navLinks = [
    { href: '/', label: 'Overview', icon: ShieldCheck },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare, badge: stats?.activeTasks },
    { href: '/late-works', label: 'Late Works', icon: Timer, badge: stats?.lateTasksCount },
    { href: '/operations', label: 'Ops Workflows', icon: FolderKanban, highlight: true },
    { href: '/history', label: 'History', icon: History },
    { href: '/social', label: 'Social Hub', icon: Share2, badge: unreadSocialCount },
    { href: '/standups', label: 'Standups', icon: FileText, badge: stats?.pendingReports },
    { href: '/surveys', label: 'Surveys', icon: Clock, badge: stats?.activeSurveysCount },
    { href: '/recognition', label: 'Kudos', icon: Award },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/apify', label: 'Apify', icon: Globe },
    { href: '/todos', label: 'Supabase', icon: Database },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  const isAdmin = currentUser?.role === 'admin';

  if (isAuthChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e6ecf4',
        padding: '20px'
      }}>
        <div style={{
          padding: '28px 36px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(36px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img src="/stowave-logo-transparent.png" alt="Stowave" style={{ height: '32px', width: 'auto' }} />
          <div className="pulse-dot-red" style={{ width: '12px', height: '12px' }} />
          <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 750, color: '#334155' }}>
            Verifying Workspace Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Ambient Floating Glowing Orbs for Apple Liquid Frosted Glass Blur Refraction */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {/* Orb 1: Stowave Rose Crimson */}
        <div style={{
          position: 'absolute',
          top: '-6%',
          left: '4%',
          width: '780px',
          height: '780px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(225, 29, 72, 0.52) 0%, rgba(225, 29, 72, 0) 70%)',
          filter: 'blur(65px)',
          animation: 'floatOrb 18s ease-in-out infinite alternate'
        }} />
        {/* Orb 2: Ocean Azure / Cyan */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '2%',
          width: '820px',
          height: '820px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.54) 0%, rgba(2, 132, 199, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'floatOrbReverse 22s ease-in-out infinite alternate'
        }} />
      </div>

      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2500,
          padding: '12px 20px',
          borderRadius: '9999px',
          background: toast.type === 'error' ? 'rgba(225, 29, 72, 0.96)' : 'rgba(5, 150, 105, 0.96)',
          color: '#ffffff',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.86rem',
          fontWeight: 700,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Floating Apple Liquid Glass Navbar */}
      <header className="navbar-floating-header" style={{
        position: 'sticky',
        top: '10px',
        zIndex: 100,
        padding: '0 16px',
        pointerEvents: 'none',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100vw'
      }}>
        <div className="navbar-inner-container" style={{
          maxWidth: '1620px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          padding: '0 16px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(36px) saturate(210%) contrast(102%)',
          WebkitBackdropFilter: 'blur(36px) saturate(210%) contrast(102%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 14px 40px -5px rgba(15, 23, 42, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
          gap: '10px',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {/* Stowave Logo & Live Radar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, minWidth: 0 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src="/stowave-logo-transparent.png" 
                alt="Stowave" 
                className="navbar-brand-logo"
                style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            {/* Live Presence Crawler Radar Trigger */}
            <div className="navbar-radar-wrap">
              <LivePresenceRadar currentUser={currentUser} />
            </div>
          </div>

          {/* Desktop Navigation Route Links */}
          <nav className="desktop-nav-only" style={{
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(255, 255, 255, 0.70)',
            backdropFilter: 'blur(20px)',
            padding: '3px 4px',
            borderRadius: '9999px',
            border: '1.5px solid rgba(203, 213, 225, 0.95)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            maxWidth: '100%',
            minWidth: 0,
            flexShrink: 1
          }}>
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 9px',
                    borderRadius: '9999px',
                    fontSize: '0.80rem',
                    fontWeight: isActive ? 850 : 750,
                    color: isActive ? '#ffffff' : '#000000',
                    background: isActive ? '#e11d48' : (link.highlight ? 'rgba(225, 29, 72, 0.08)' : 'transparent'),
                    boxShadow: isActive ? '0 4px 14px rgba(225, 29, 72, 0.38)' : 'none',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.16s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#ffffff' : (link.highlight ? '#be123c' : '#000000')} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span style={{
                      fontSize: '0.66rem',
                      padding: '1px 5px',
                      borderRadius: '999px',
                      background: isActive ? '#ffffff' : 'rgba(225, 29, 72, 0.16)',
                      color: isActive ? '#e11d48' : '#9f1239',
                      fontWeight: 850
                    }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Admin Invite, Tour, AI, Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Admin Invite Button (Desktop only, present in mobile drawer for phones) */}
            {isAdmin && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="desktop-nav-only"
                style={{
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '9999px',
                  background: 'rgba(225, 29, 72, 0.12)',
                  border: '1.5px solid rgba(225, 29, 72, 0.4)',
                  color: '#be123c',
                  fontSize: '0.78rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Admin: Send 30-Minute Expiring Invite Email"
              >
                <UserPlus size={14} />
                <span>+ Invite</span>
              </button>
            )}

            {/* In-Portal Real-Time Notification Center (LinkedIn/WhatsApp style) */}
            <NotificationCenter currentUser={currentUser} />

            {/* AI Advisor Button */}
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="navbar-ai-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#ffffff',
                fontWeight: 850,
                fontSize: '0.78rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              title="Open Stowave AI Assistant"
            >
              <Sparkles size={13} />
              <span className="desktop-nav-only">Stowave AI</span>
            </button>

            {/* Profile Avatar Pill (Desktop only - accessible via mobile bottom bar and drawer on phones) */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="navbar-profile-pill desktop-nav-only"
              style={{
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1.5px solid rgba(203, 213, 225, 0.95)',
                padding: '3px',
                borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                cursor: 'pointer'
              }}
              title="Click to manage profile & credentials (OTP Secured)"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser?.name}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #e11d48'
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.1, paddingRight: '6px' }} className="desktop-nav-only">
                <div style={{ fontSize: '0.76rem', fontWeight: 850, color: '#000000', whiteSpace: 'nowrap' }}>
                  {currentUser?.name?.split(' ')[0] || 'Admin'}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 850 }}>
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
            </button>

            {/* Logout Button (Desktop only, present in mobile drawer for phones) */}
            <button
              onClick={handleLogout}
              className="desktop-nav-only"
              style={{
                alignItems: 'center',
                gap: '5px',
                padding: '6px 11px',
                borderRadius: '9999px',
                background: 'rgba(241, 245, 249, 0.95)',
                border: '1.5px solid rgba(203, 213, 225, 0.95)',
                color: '#64748b',
                fontSize: '0.76rem',
                fontWeight: 750,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Sign Out of Workspace"
            >
              <LogOut size={13} color="#e11d48" />
              <span>Logout</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="mobile-menu-btn"
              style={{
                background: 'rgba(241, 245, 249, 0.9)',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                borderRadius: '10px',
                padding: '7px',
                cursor: 'pointer',
                color: '#0f172a'
              }}
              aria-label="Open mobile navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{ justifyContent: 'flex-end', padding: 0 }}
        >
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '84%',
              maxWidth: '340px',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(36px) saturate(210%)',
              borderLeft: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 18px',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Top */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src="/stowave-logo-transparent.png" 
                  alt="Stowave" 
                  style={{ height: '24px', width: 'auto' }}
                />
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              marginBottom: '16px'
            }}>
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={currentUser?.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e11d48' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 850, color: '#0f172a' }}>
                  {currentUser?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.70rem', color: '#be123c', fontWeight: 800, textTransform: 'uppercase' }}>
                  {currentUser?.role} • {currentUser?.points || 0} pts
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsProfileModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'rgba(225, 29, 72, 0.1)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  color: '#be123c',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <User size={15} />
                <span>Edit Profile (OTP Secured)</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsInviteModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.1)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    color: '#0284c7',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={15} />
                  <span>+ Invite Member / Admin (30m Link)</span>
                </button>
              )}
            </div>

            {/* Navigation Links in Mobile Drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 850, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                Platform Navigation
              </div>
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      fontWeight: isActive ? 850 : 700,
                      color: isActive ? '#ffffff' : '#0f172a',
                      background: isActive ? '#e11d48' : 'transparent',
                      textDecoration: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} color={isActive ? '#ffffff' : '#475569'} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: isActive ? '#ffffff' : 'rgba(225, 29, 72, 0.15)',
                        color: isActive ? '#e11d48' : '#be123c',
                        fontWeight: 800
                      }}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Switch Active User Selector */}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(203, 213, 225, 0.7)' }}>
              <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Switch Active User Profile
              </label>
              <select
                className="select-field"
                value={currentUser?.id}
                onChange={(e) => {
                  const sel = users.find(u => u.id === e.target.value);
                  if (sel) handleSwitchUser(sel);
                }}
                style={{ fontSize: '0.82rem', padding: '8px 10px' }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Sign Out Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '12px',
                background: 'rgba(225, 29, 72, 0.1)',
                border: '1.5px solid rgba(225, 29, 72, 0.35)',
                color: '#be123c',
                fontSize: '0.86rem',
                fontWeight: 850,
                cursor: 'pointer',
                marginTop: '14px'
              }}
            >
              <LogOut size={16} />
              <span>Log Out of Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main style={{
        flex: 1,
        maxWidth: '1620px',
        width: '100%',
        margin: '0 auto',
        padding: '30px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Smartphones) */}
      <div className="mobile-bottom-bar">
        <Link href="/" className={`mobile-bottom-link ${pathname === '/' ? 'active' : ''}`}>
          <ShieldCheck size={20} />
          <span>Home</span>
        </Link>
        <Link href="/tasks" className={`mobile-bottom-link ${pathname === '/tasks' ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Tasks</span>
        </Link>
        <Link href="/operations" className={`mobile-bottom-link ${pathname === '/operations' ? 'active' : ''}`}>
          <FolderKanban size={20} />
          <span>Ops</span>
        </Link>
        <Link href="/team" className={`mobile-bottom-link ${pathname === '/team' ? 'active' : ''}`}>
          <Users size={20} />
          <span>Team</span>
        </Link>
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="mobile-bottom-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>

      {/* Background Device Push Notifications Manager */}
      <PushNotificationManager />

      {/* Onboarding Interactive Tour */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Stowave AI Floating Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        currentUser={currentUser}
        stats={stats}
        tasks={tasks}
        users={users}
      />

      {/* OTP Secured Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={handleUserUpdated}
      />

      {/* Admin 30-Minute Expiring Invite Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
