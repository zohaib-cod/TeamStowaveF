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
  Bot, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Share2,
  ChevronDown
} from 'lucide-react';
import InteractiveTour from './InteractiveTour';
import AiAssistantDrawer from './AiAssistantDrawer';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [unreadSocialCount, setUnreadSocialCount] = useState(0);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Check if tour should be shown on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('apex_has_seen_tour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
      localStorage.setItem('apex_has_seen_tour', 'true');
    }
    loadSharedData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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

      // Restore saved active user or default to admin
      const savedUserId = localStorage.getItem('apex_current_user_id');
      if (savedUserId && usersRes.find(u => u.id === savedUserId)) {
        setCurrentUser(usersRes.find(u => u.id === savedUserId));
      } else if (usersRes.length > 0) {
        const admin = usersRes.find(u => u.role === 'admin') || usersRes[0];
        setCurrentUser(admin);
      }
    } catch (err) {
      console.error('Failed to load shared layout data:', err);
    }
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('apex_current_user_id', user.id);
    showToast(`Switched active view to ${user.name} (${user.role.toUpperCase()})`);
  };

  const navLinks = [
    { href: '/', label: 'Overview', icon: ShieldCheck },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare, badge: stats?.activeTasks },
    { href: '/social', label: 'Social Hub', icon: Share2, badge: unreadSocialCount },
    { href: '/standups', label: 'Standups', icon: FileText, badge: stats?.pendingReports },
    { href: '/surveys', label: 'Surveys', icon: Clock, badge: stats?.activeSurveysCount },
    { href: '/recognition', label: 'Kudos', icon: Award },
    { href: '/team', label: 'Team', icon: Users },
    { href: '/apify', label: 'Apify', icon: Globe },
    { href: '/todos', label: 'Supabase', icon: Database },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

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
        {/* Orb 3: Royal Violet */}
        <div style={{
          position: 'absolute',
          top: '48%',
          left: '12%',
          width: '740px',
          height: '740px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(124, 58, 237, 0) 70%)',
          filter: 'blur(70px)',
          animation: 'floatOrb 25s ease-in-out infinite alternate'
        }} />
        {/* Orb 4: Emerald Mint */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          right: '8%',
          width: '760px',
          height: '760px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.46) 0%, rgba(5, 150, 105, 0) 70%)',
          filter: 'blur(65px)',
          animation: 'floatOrbReverse 20s ease-in-out infinite alternate'
        }} />
        {/* Orb 5: Warm Amber */}
        <div style={{
          position: 'absolute',
          top: '36%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '680px',
          height: '680px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.40) 0%, rgba(245, 158, 11, 0) 70%)',
          filter: 'blur(60px)',
          animation: 'floatOrb 16s ease-in-out infinite alternate'
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
      <header style={{
        position: 'sticky',
        top: '10px',
        zIndex: 100,
        padding: '0 16px',
        pointerEvents: 'none'
      }}>
        <div style={{
          maxWidth: '1580px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '62px',
          padding: '0 20px 0 20px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(36px) saturate(210%) contrast(102%)',
          WebkitBackdropFilter: 'blur(36px) saturate(210%) contrast(102%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 14px 40px -5px rgba(15, 23, 42, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(0, 0, 0, 0.04)',
          gap: '10px',
          pointerEvents: 'auto',
          boxSizing: 'border-box'
        }}>
          {/* Stowave Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <img 
              src="/stowave-logo-transparent.png" 
              alt="Stowave" 
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              borderRadius: '9999px',
              background: 'rgba(225, 29, 72, 0.14)',
              border: '1.5px solid rgba(225, 29, 72, 0.45)',
              color: '#9f1239',
              fontSize: '0.68rem',
              fontWeight: 850
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48' }}></span>
              Live
            </span>
          </Link>

          {/* Navigation Route Links */}
          <nav style={{
            display: 'flex',
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
                    background: isActive ? '#e11d48' : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(225, 29, 72, 0.38)' : 'none',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.16s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#ffffff' : '#000000'} />
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

          {/* Right Section: Tour, AI, Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Quick Tour Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.90)',
                border: '1.5px solid rgba(203, 213, 225, 0.95)',
                color: '#000000',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Open Platform Onboarding Tour"
            >
              <HelpCircle size={14} color="#d97706" />
              <span>Tour</span>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
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
            >
              <Sparkles size={13} />
              <span>Stowave AI</span>
            </button>

            {/* Subtle Divider */}
            <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(203, 213, 225, 0.85)', margin: '0 2px' }} />

            {/* Role & Profile Switcher Pill */}
            <div 
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1.5px solid rgba(203, 213, 225, 0.95)',
                padding: '3px 10px 3px 4px',
                borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                cursor: 'pointer'
              }}
              title="Click to switch active profile"
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
              <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 850, color: '#000000', whiteSpace: 'nowrap' }}>
                  {currentUser?.name?.split(' ')[0] || 'Admin'}
                </div>
                <div style={{ fontSize: '0.62rem', color: '#9f1239', textTransform: 'uppercase', fontWeight: 850 }}>
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
              <ChevronDown size={12} color="#000000" />

              {/* Invisible native select covering the pill for instant profile switching */}
              <select
                value={currentUser?.id}
                onChange={(e) => {
                  const sel = users.find(u => u.id === e.target.value);
                  if (sel) handleSwitchUser(sel);
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                title="Switch Team Member Profile"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main style={{
        flex: 1,
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
        padding: '30px 24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}>
        {children}
      </main>

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
    </div>
  );
}
