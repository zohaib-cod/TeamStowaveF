'use client';
import React from 'react';
import { 
  ShieldCheck, 
  User, 
  Sparkles, 
  CheckSquare, 
  FileText, 
  Clock, 
  Award, 
  Users, 
  Globe, 
  Bot, 
  Gift, 
  Flame 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  users, 
  onSwitchUser, 
  onOpenAiDrawer,
  stats 
}) {
  return (
    <header className="navbar-container" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        gap: '20px'
      }}>
        {/* Brand & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Apex TeamHub
              </span>
              <span className="badge" style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                fontSize: '0.65rem'
              }}>
                2026 Enterprise
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Strategic Autonomy & Multi-Modal Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '5px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: stats?.activeTasks },
            { id: 'reports', label: 'Standups', icon: FileText, badge: stats?.pendingReports },
            { id: 'surveys', label: 'Surveys & Feedback', icon: Clock, badge: stats?.activeSurveysCount },
            { id: 'recognition', label: 'Kudos & Gifting', icon: Award },
            { id: 'team', label: 'Team', icon: Users },
            { id: 'apify', label: 'Apify & Trends', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(79, 70, 229, 0.85) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? '#ffffff' : 'rgba(99, 102, 241, 0.4)',
                    color: isActive ? '#4338ca' : '#e0e7ff',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: AI Button, Points, User Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* AI Trigger Button */}
          <button
            onClick={onOpenAiDrawer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Bot size={18} />
            <span>Apex AI</span>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 8px #ffffff'
            }} />
          </button>

          {/* User Role Switcher Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '5px 10px',
            borderRadius: '12px'
          }}>
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                objectFit: 'cover',
                border: currentUser?.role === 'admin' ? '2px solid #6366f1' : '2px solid #10b981'
              }}
            />
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser?.name?.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: currentUser?.role === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                  color: currentUser?.role === 'admin' ? '#a5b4fc' : '#6ee7b7',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {currentUser?.role}
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser?.points || 0} pts
              </span>
            </div>

            {/* Quick Profile Select */}
            <select
              value={currentUser?.id}
              onChange={(e) => {
                const selected = users.find(u => u.id === e.target.value);
                if (selected) onSwitchUser(selected);
              }}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: 'none',
                outline: 'none',
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
              title="Switch user role"
            >
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: '#0f172a', color: '#ffffff' }}>
                  {u.role === 'admin' ? '👑' : '👤'} {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
