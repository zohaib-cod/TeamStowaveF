'use client';
import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Megaphone, 
  ArrowUpRight, 
  Sparkles, 
  Plus, 
  Send, 
  Gift, 
  ThumbsUp, 
  Flame,
  ShieldCheck,
  CheckSquare,
  FileText,
  FolderKanban
} from 'lucide-react';

export default function DashboardOverview({
  stats,
  currentUser,
  users,
  tasks,
  reports,
  surveys,
  shoutouts,
  announcements,
  setCurrentTab,
  onOpenTaskModal,
  onOpenSurveyModal,
  onOpenGiftModal,
  onOpenAiDrawer
}) {
  const isAdmin = currentUser?.role === 'admin';
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
  const userTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const activeSurveys = surveys.filter(s => s.effectiveStatus === 'active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* 1. Hero Welcome Banner (Apple Liquid Frosted Glass) */}
      <div style={{
        padding: '32px 36px',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.74)',
        backdropFilter: 'blur(32px) saturate(210%)',
        WebkitBackdropFilter: 'blur(32px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 16px 45px -8px rgba(15, 23, 42, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(225, 29, 72, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: isAdmin ? 'rgba(225, 29, 72, 0.14)' : 'rgba(5, 150, 105, 0.14)',
                color: isAdmin ? '#9f1239' : '#064e3b',
                border: isAdmin ? '1.5px solid rgba(225, 29, 72, 0.45)' : '1.5px solid rgba(5, 150, 105, 0.45)',
                fontSize: '0.8rem',
                fontWeight: 850
              }}>
                <ShieldCheck size={15} />
                <span>{isAdmin ? 'Executive Command Center' : 'Contributor Mission Portal'}</span>
              </span>
              <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 750 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: '10px',
              color: '#000000',
              letterSpacing: '-0.03em'
            }}>
              Welcome back, {currentUser?.name}!
            </h1>
            <p style={{ fontSize: '0.98rem', color: '#0f172a', fontWeight: 650, lineHeight: 1.6 }}>
              {isAdmin 
                ? 'High-velocity strategic coordination: monitor real-time task pipelines, evaluate team reports, launch duration-bound leadership surveys, and reward top talent.'
                : 'Your dedicated execution suite: manage your active sprint deliverables, file daily reports, rate peer collaboration, and unlock recognition points.'}
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isAdmin ? (
              <>
                <button 
                  onClick={onOpenTaskModal} 
                  className="btn btn-primary"
                  id="btn-quick-new-task"
                  style={{
                    padding: '11px 22px',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: 850,
                    boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
                  }}
                >
                  <Plus size={16} /> Assign Task
                </button>
                <button 
                  onClick={onOpenSurveyModal} 
                  className="btn btn-secondary"
                  id="btn-quick-survey"
                  style={{
                    padding: '11px 20px',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#000000',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)'
                  }}
                >
                  <Clock size={16} /> New Feedback Survey
                </button>
                <a 
                  href="/operations"
                  className="btn btn-secondary"
                  id="btn-quick-department-tasks"
                  style={{
                    padding: '11px 20px',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: '#000000',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FolderKanban size={16} color="#e11d48" /> Ops Workflows
                </a>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentTab('tasks')} 
                  className="btn btn-primary"
                  id="btn-quick-my-tasks"
                >
                  <CheckCircle2 size={16} /> My Tasks ({userTasks.length})
                </button>
                <button 
                  onClick={() => setCurrentTab('reports')} 
                  className="btn btn-secondary"
                  id="btn-quick-report"
                  style={{ color: '#030712', fontWeight: 700 }}
                >
                  <Send size={16} /> Submit Standup
                </button>
              </>
            )}
            <button 
              onClick={() => {
                if (typeof onOpenAiDrawer === 'function') onOpenAiDrawer();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-ai-drawer'));
                }
              }} 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '9999px',
                background: '#090d16',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(9, 13, 22, 0.28)'
              }}
              id="btn-quick-ai"
            >
              <Sparkles size={16} color="#e11d48" /> AI Strategic Advisor
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '18px'
      }}>
        {[
          {
            title: 'Active Tasks Pipeline',
            value: stats?.activeTasks || 0,
            sub: `${stats?.pendingReviews || 0} awaiting review`,
            icon: CheckCircle2,
            color: '#e11d48',
            tab: 'tasks'
          },
          {
            title: 'Completion Velocity',
            value: `${stats?.completionRate || 0}%`,
            sub: `${stats?.completedTasks || 0} completed`,
            icon: TrendingUp,
            color: '#059669',
            tab: 'tasks'
          },
          {
            title: 'Active Feedback Surveys',
            value: stats?.activeSurveysCount || 0,
            sub: 'Timed leadership surveys',
            icon: Clock,
            color: '#d97706',
            tab: 'surveys'
          },
          {
            title: 'Pending Standup Reports',
            value: stats?.pendingReports || 0,
            sub: 'EOD achievements to review',
            icon: AlertTriangle,
            color: '#0284c7',
            tab: 'standups'
          },
          {
            title: 'Kudos & Gifting Pool',
            value: `${stats?.totalShoutouts || 0} Kudos`,
            sub: `${stats?.totalGifts || 0} gifts exchanged`,
            icon: Award,
            color: '#7c3aed',
            tab: 'recognition'
          }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={() => setCurrentTab(m.tab)}
              style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.76)',
                backdropFilter: 'blur(32px) saturate(210%)',
                WebkitBackdropFilter: 'blur(32px) saturate(210%)',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 12px 35px -6px rgba(15, 23, 42, 0.09), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 850, color: '#000000' }}>
                  {m.title}
                </span>
                <div style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: `${m.color}18`,
                  color: m.color
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.03em' }}>
                {m.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 750 }}>
                  {m.sub}
                </span>
                <ArrowUpRight size={16} color="#000000" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Operational Sections (Split 2-Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
        
        {/* Left Col: High-Priority Tasks Spotlight */}
        <div style={{
          padding: '28px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(32px) saturate(210%)',
          WebkitBackdropFilter: 'blur(32px) saturate(210%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e11d48', boxShadow: '0 0 10px #e11d48' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000000' }}>Critical Deliverables</h2>
            </div>
            <button 
              onClick={() => setCurrentTab('tasks')} 
              style={{ background: 'none', border: 'none', color: '#be123c', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 850 }}
            >
              View All ({tasks.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#0f172a' }}>
                <CheckSquare size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#000000' }}>No active tasks pending</div>
                <div style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 650, marginTop: '4px' }}>Click "+ Assign Task" above to add deliverables for your team.</div>
              </div>
            ) : (
              tasks.slice(0, 4).map(task => {
                const assignee = users.find(u => u.id === task.assignedTo);
                return (
                  <div 
                    key={task.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1.5px solid rgba(226, 232, 240, 0.95)',
                      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <span className={`badge badge-${task.priority}`} style={{ marginRight: '8px', fontSize: '0.74rem', fontWeight: 850 }}>
                          {task.priority?.toUpperCase()}
                        </span>
                        <span className={`badge badge-${task.status}`} style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                          {task.status?.replace('_', ' ')}
                        </span>
                        <h4 style={{ fontSize: '1.02rem', fontWeight: 850, color: '#000000', marginTop: '6px' }}>
                          {task.title}
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#000000', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        Due {task.dueDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={assignee?.avatar || '/icon.png'} 
                          alt={assignee?.name}
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                        />
                        <span style={{ fontSize: '0.84rem', color: '#000000', fontWeight: 800 }}>
                          {assignee?.name || 'Assigned'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 750 }}>
                        Est: {task.estimatedHours}h
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Active Feedback Survey & Timers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Survey Pulse Card */}
          <div style={{
            padding: '28px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.76)',
            backdropFilter: 'blur(32px) saturate(210%)',
            WebkitBackdropFilter: 'blur(32px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#d97706" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000000' }}>Active Feedback Survey</h3>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 850, padding: '3px 11px', borderRadius: '999px', background: 'rgba(217, 119, 6, 0.16)', color: '#92400e', border: '1.5px solid rgba(217, 119, 6, 0.4)' }}>
                Time-Bound Expiry
              </span>
            </div>

            {activeSurveys.length > 0 ? (
              <div>
                <h4 style={{ fontSize: '1.08rem', fontWeight: 850, color: '#000000', marginBottom: '8px' }}>
                  {activeSurveys[0].title}
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 650, marginBottom: '16px', lineHeight: 1.6 }}>
                  {activeSurveys[0].description}
                </p>

                <div style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(203, 213, 225, 0.95)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '0.86rem', color: '#000000', fontWeight: 800 }}>
                    {activeSurveys[0].isAnonymous ? '🔒 100% Anonymous Mode' : '👤 Identifiable Mode'}
                  </span>
                  <span style={{ fontSize: '0.86rem', color: '#92400e', fontWeight: 850 }}>
                    Expires: {new Date(activeSurveys[0].expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(activeSurveys[0].expiresAt).toLocaleDateString()})
                  </span>
                </div>

                <button 
                  onClick={() => setCurrentTab('surveys')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 850 }}
                >
                  Participate in Survey Now
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#0f172a' }}>
                <Clock size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#000000' }}>No active survey right now</div>
                <div style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 650, marginTop: '4px' }}>Create timed feedback surveys anytime to assess strategy & team health.</div>
                {isAdmin && (
                  <button
                    onClick={onOpenSurveyModal}
                    style={{
                      marginTop: '14px',
                      padding: '9px 20px',
                      borderRadius: '9999px',
                      background: '#090d16',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    + Create Survey
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div style={{
            padding: '28px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.76)',
            backdropFilter: 'blur(32px) saturate(210%)',
            WebkitBackdropFilter: 'blur(32px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Megaphone size={20} color="#e11d48" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000000', margin: 0 }}>
                Company Directives & Announcements
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(announcements || []).slice(0, 2).map(ann => (
                <div
                  key={ann.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.88)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(226, 232, 240, 0.95)'
                  }}
                >
                  <div style={{ fontSize: '0.94rem', fontWeight: 850, color: '#000000', marginBottom: '4px' }}>
                    {ann.title}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650, lineHeight: 1.5 }}>
                    {ann.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
