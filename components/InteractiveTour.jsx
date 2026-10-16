'use client';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  CheckSquare, 
  FileText, 
  Clock, 
  Award, 
  Users, 
  Globe, 
  Bot 
} from 'lucide-react';

export default function InteractiveTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: '🌟 Welcome to Stowave TeamHub!',
      subtitle: 'Your 100% Real-Time Team Management & E-Commerce Executive Workspace',
      icon: Sparkles,
      color: '#e11d48',
      description: 'This interactive platform is designed with zero unchangeable dummy clutter — every task, report, feedback survey, and user profile is completely live, real-time, and editable.',
      routeInfo: 'Home Route: /',
      highlights: [
        'Multi-role permissions: Executive Admin vs Team Member',
        'Real-time task workflows with review & grading',
        'Duration-bound feedback surveys with live countdown timers',
        'Groq Vision & Voice AI companion',
        'Apify Cloud scraping with your authenticated account'
      ]
    },
    {
      title: '👑 Multi-Role & Persona Switcher',
      subtitle: 'Located on the Top Right of the Header',
      icon: Users,
      color: '#10b981',
      description: 'Easily test both sides of the company! As Admin, you assign tasks, grade reports, and launch surveys. As a Member, you submit work, file daily standups, and gift colleagues.',
      routeInfo: 'Header User Dropdown',
      highlights: [
        'Switch with 1 click without logging out',
        'Personal Reward Points wallet dynamically tracks bonuses',
        'Live presence status indicator (Online, Busy, Remote)'
      ]
    },
    {
      title: '📋 Strategic Task Operations (Route: /tasks)',
      subtitle: 'Kanban Board & Detailed Table View',
      icon: CheckSquare,
      color: '#38bdf8',
      description: 'Manage the entire lifecycle of company deliverables. Tasks move fluidly through To Do ➔ In Progress ➔ In Review ➔ Completed.',
      routeInfo: 'Navigate to: /tasks',
      highlights: [
        '"+ Assign New Task": Set priority, deadlines, estimated hours, tags',
        '"Submit Work": Members attach GitHub/Figma URLs and log actual hours',
        '"Review Work": Admin approves deliverables with 1-5 star ratings and awards points'
      ]
    },
    {
      title: '📝 Asynchronous Standups & EOD Reports (Route: /standups)',
      subtitle: 'Eliminate Meeting Fatigue with Structured Digests',
      icon: FileText,
      color: '#06b6d4',
      description: 'Team members submit daily or weekly reports detailing their key achievements, next sprint deliverables, and any critical blockers.',
      routeInfo: 'Navigate to: /standups',
      highlights: [
        'Clear separation of Achievements, Planned Milestones & Blockers',
        'Admin grading with 1-5 performance score',
        'Search and filter reports by member and date'
      ]
    },
    {
      title: '⏳ Timed Feedback Surveys (Route: /surveys)',
      subtitle: 'Real-Time Ticking Countdown Timers & Psychological Safety',
      icon: Clock,
      color: '#fbbf24',
      description: 'Create feedback pages to evaluate leadership behaviour, sprint health, and team culture with a fixed duration (24h, 48h, 72h).',
      routeInfo: 'Navigate to: /surveys',
      highlights: [
        'Live ticking countdown timer shows remaining HH:MM:SS',
        '🔒 100% Anonymous Mode protects employee identities',
        'Custom questions builder supporting 1-5 star ratings and open reflections'
      ]
    },
    {
      title: '🔥 Kudos Wall, Gifting & Leaderboard (Route: /recognition)',
      subtitle: 'Peer-to-Peer Ratings Anytime & Corporate Gifting',
      icon: Award,
      color: '#a855f7',
      description: 'Any employee can rate colleagues anytime on Collaboration, Technical Skill, Communication, and Reliability. Send corporate gifts and post public kudos!',
      routeInfo: 'Navigate to: /recognition',
      highlights: [
        'Public Kudos feed with interactive reactions (👏, ❤️, 🔥)',
        'Virtual gifts (Trophies, Coffee boosts, Gift cards)',
        'Dynamic Leaderboard ranking top contributors'
      ]
    },
    {
      title: '🤖 Multi-Modal Stowave AI Advisor (Floating Trigger)',
      subtitle: 'Powered by Groq Llama 3 & Vision Models',
      icon: Bot,
      color: '#e11d48',
      description: 'Click "Stowave AI" on the top right anytime to open the slide-out assistant. It possesses full real-time context of all your company tasks, standups, and team metrics.',
      routeInfo: 'Available across all routes',
      highlights: [
        '🎙️ Voice Mode: Talk using your microphone + AI answers aloud (TTS)',
        '📷 Live Camera Vision: Show code, diagrams, or physical notes on webcam',
        '🌐 Real-time Web Search: Queries live trends with zero hallucinations'
      ]
    },
    {
      title: '🌐 Apify Web Scraping & Market Radar (Route: /apify)',
      subtitle: 'Automated Scraping & Intelligence',
      icon: Globe,
      color: '#06b6d4',
      description: 'Run cloud scrapers for competitor intelligence, B2B lead generation, and market benchmarking directly from your team hub.',
      routeInfo: 'Navigate to: /apify',
      highlights: [
        'Secure API token authentication & custom actors',
        '1-click Actor runs (Google Trends, Website Crawler, B2B Leads)',
        'Executive Trends & Strategy Radar'
      ]
    }
  ];

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{
          maxWidth: '680px',
          padding: '36px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(40px) saturate(210%)',
          WebkitBackdropFilter: 'blur(40px) saturate(210%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 30px 70px -15px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: `${step.color}15`,
              border: `1.5px solid ${step.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: step.color
            }}>
              <Icon size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: `${step.color}15`, color: step.color, fontSize: '0.72rem', fontWeight: 800 }}>
                  Step {currentStep + 1} of {tourSteps.length}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                  {step.routeInfo}
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: '#000000', marginTop: '4px' }}>
                {step.title}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              borderRadius: '50%',
              color: '#000000',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Tour"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtitle & Description */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 750, color: step.color, marginBottom: '8px' }}>
            {step.subtitle}
          </div>
          <p style={{ fontSize: '0.92rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.6 }}>
            {step.description}
          </p>
        </div>

        {/* Highlights List */}
        <div style={{
          padding: '18px 22px',
          borderRadius: '16px',
          background: 'rgba(241, 245, 249, 0.9)',
          border: '1.5px solid rgba(226, 232, 240, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '26px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 850, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Key Features & Action Points:
          </span>
          {step.highlights.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#000000', fontWeight: 650 }}>
              <CheckCircle2 size={17} color={step.color} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{h}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '5px',
          background: 'rgba(203, 213, 225, 0.7)',
          borderRadius: '999px',
          marginBottom: '22px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
            background: step.color,
            transition: 'width 0.25s ease'
          }} />
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#1e293b', fontSize: '0.85rem', fontWeight: 750, cursor: 'pointer' }}
          >
            Skip Tour
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isFirst && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={15} /> Previous
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="btn btn-primary"
                style={{ padding: '9px 22px', fontSize: '0.85rem' }}
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-emerald"
                style={{ padding: '9px 24px', fontSize: '0.85rem' }}
              >
                <CheckCircle2 size={16} /> Finish & Start Exploring!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
