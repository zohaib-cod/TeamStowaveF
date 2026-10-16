'use client';
import React, { useState, useEffect } from 'react';
import {
  Share2,
  TrendingUp,
  Search,
  Sparkles,
  Send,
  MessageSquare,
  BarChart3,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Heart,
  Repeat,
  Trash2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Target,
  Users,
  Zap,
  Shield,
  Layers,
  Flame,
  MessageCircle,
  HelpCircle,
  Compass,
  FileCheck,
  Check,
  RefreshCw,
  Plus,
  Play,
  Sliders,
  Award
} from 'lucide-react';

export default function SocialCommandCenter() {
  const [activeTab, setActiveTab] = useState('publisher'); // publisher | crawler | competitor | inbox | analytics | accounts
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Publisher State
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'tiktok', 'linkedin', 'facebook', 'twitter']);
  const [postContent, setPostContent] = useState('');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [previewPlatform, setPreviewPlatform] = useState('instagram');
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiGoal, setAiGoal] = useState('launch');
  const [aiGeneratedCopies, setAiGeneratedCopies] = useState(null);

  // Crawler State
  const [crawlUrl, setCrawlUrl] = useState('https://instagram.com/stowave.store');
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [crawlResult, setCrawlResult] = useState(null);

  // Competitor X-Ray State
  const [competitorUrl, setCompetitorUrl] = useState('https://tiktok.com/@competitor_brand');
  const [competitorName, setCompetitorName] = useState('Aura Luxe Apparel');
  const [xrayLoading, setXrayLoading] = useState(false);
  const [competitorResult, setCompetitorResult] = useState(null);

  // Inbox State
  const [inboxFilter, setInboxFilter] = useState('all'); // all | unread | lead | positive
  const [replyTextMap, setReplyTextMap] = useState({});

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [accRes, postsRes, inbRes, anaRes] = await Promise.all([
        fetch('/api/social/accounts').then(r => r.json()),
        fetch('/api/social/posts').then(r => r.json()),
        fetch('/api/social/inbox').then(r => r.json()),
        fetch('/api/social/analytics').then(r => r.json())
      ]);
      setAccounts(Array.isArray(accRes) ? accRes : []);
      setPosts(Array.isArray(postsRes) ? postsRes : []);
      setInbox(Array.isArray(inbRes) ? inbRes : []);
      setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load social center data:', err);
      showToast('Error loading social command center', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle platform selection for posting
  const togglePlatform = (plat) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== plat));
      } else {
        showToast('Please keep at least one platform selected', 'error');
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  // 1-Click Multi-Channel Publish
  const handlePublish = async () => {
    if (!postContent.trim()) {
      showToast('Please enter post content or generate with AI', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          mediaUrl: postMediaUrl,
          platforms: selectedPlatforms
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Broadcasted live across all selected channels!');
        setPostContent('');
        setPostMediaUrl('');
        setAiGeneratedCopies(null);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to publish', 'error');
      }
    } catch (err) {
      showToast('Publishing failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // AI Auto-Draft Multi-Platform Post
  const handleAiDraft = async () => {
    const topicToUse = aiTopic.trim() || 'Stowave Liquid Frosted Glass Drop & Autonomous Operations Launch';
    try {
      setIsAiDrafting(true);
      const res = await fetch('/api/social/ai-generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          goal: aiGoal,
          tone: 'viral'
        })
      });
      const data = await res.json();
      if (data.success && data.generated) {
        setAiGeneratedCopies(data.generated);
        const initialCopy = data.generated[previewPlatform]?.caption || data.generated.instagram?.caption;
        setPostContent(initialCopy || '');
        if (!postMediaUrl) {
          setPostMediaUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
        }
        showToast('AI multi-platform copies generated! Check previews.');
      }
    } catch (err) {
      showToast('AI drafting failed: ' + err.message, 'error');
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Run Social Profile Audit Crawler
  const handleRunCrawl = async () => {
    if (!crawlUrl.trim()) {
      showToast('Please provide a social media URL', 'error');
      return;
    }
    try {
      setCrawlLoading(true);
      const res = await fetch('/api/social/crawl-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: crawlUrl })
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setCrawlResult(data.audit);
        showToast(`Audit for ${data.audit.handle} completed! Score: ${data.audit.auditScore}/100`);
      } else {
        showToast(data.error || 'Crawling failed', 'error');
      }
    } catch (err) {
      showToast('Crawler error: ' + err.message, 'error');
    } finally {
      setCrawlLoading(false);
    }
  };

  // Run Competitor X-Ray
  const handleRunCompetitorXray = async () => {
    if (!competitorUrl.trim()) {
      showToast('Please enter competitor profile or video URL', 'error');
      return;
    }
    try {
      setXrayLoading(true);
      const res = await fetch('/api/social/competitor-xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: competitorUrl, competitorName })
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setCompetitorResult(data.analysis);
        showToast(`X-Ray complete for ${data.analysis.competitorName}! 3 vulnerabilities identified.`);
      } else {
        showToast(data.error || 'Competitor analysis failed', 'error');
      }
    } catch (err) {
      showToast('X-Ray error: ' + err.message, 'error');
    } finally {
      setXrayLoading(false);
    }
  };

  // Convert Counter Task to Team Task
  const handleConvertCounterTask = async (task) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority || 'high',
          assignedTo: 'usr_admin_1',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          tags: ['Competitor-CounterMove', 'Social-Strategy']
        })
      });
      if (res.ok) {
        showToast(`Assigned: "${task.title}" to team task board!`);
      }
    } catch (err) {
      showToast('Failed to assign task: ' + err.message, 'error');
    }
  };

  // Send Reply in Inbox
  const handleSendReply = async (inboxId) => {
    const text = replyTextMap[inboxId];
    if (!text || !text.trim()) {
      showToast('Please write a reply first', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/social/inbox/${inboxId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: text })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Reply sent successfully!');
        setReplyTextMap({ ...replyTextMap, [inboxId]: '' });
        loadAllData();
      }
    } catch (err) {
      showToast('Reply failed: ' + err.message, 'error');
    }
  };

  // Convert Inbox item to Task
  const handleConvertInboxToTask = async (inboxId) => {
    try {
      const res = await fetch(`/api/social/inbox/${inboxId}/convert-to-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 'urgent' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Social inquiry converted to team task with automated alerts!');
        loadAllData();
      }
    } catch (err) {
      showToast('Failed to convert: ' + err.message, 'error');
    }
  };

  // Delete Post
  const handleDeletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      await fetch(`/api/social/posts/${id}`, { method: 'DELETE' });
      showToast('Post removed');
      loadAllData();
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const filteredInbox = inbox.filter(item => {
    if (inboxFilter === 'all') return true;
    if (inboxFilter === 'unread') return item.status === 'unread';
    if (inboxFilter === 'lead') return item.sentiment === 'lead';
    if (inboxFilter === 'positive') return item.sentiment === 'positive';
    return true;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 20px 80px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2500,
          padding: '12px 22px',
          borderRadius: '9999px',
          background: toast.type === 'error' ? 'rgba(225, 29, 72, 0.98)' : 'rgba(9, 13, 22, 0.96)',
          color: '#ffffff',
          boxShadow: '0 14px 34px rgba(0, 0, 0, 0.28)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 700,
          backdropFilter: 'blur(20px)'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} color="#fca5a5" /> : <CheckCircle2 size={18} color="#4ade80" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner / Hero Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.74)',
        backdropFilter: 'blur(32px) saturate(210%)',
        WebkitBackdropFilter: 'blur(32px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '24px 28px',
        boxShadow: '0 16px 45px -8px rgba(15, 23, 42, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(0, 0, 0, 0.04)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e11d48, #9f1239)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.35)'
          }}>
            <Share2 size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#000000', letterSpacing: '-0.025em' }}>
                Stowave Omnichannel Social Command Center
              </h1>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 850,
                padding: '3px 10px',
                borderRadius: '9999px',
                background: 'rgba(225, 29, 72, 0.16)',
                color: '#9f1239',
                border: '1.5px solid rgba(225, 29, 72, 0.45)'
              }}>
                Live Hub
              </span>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '0.94rem', color: '#0f172a', fontWeight: 650, lineHeight: '1.55' }}>
              Publish across 6 platforms simultaneously, crawl competitor performance, automate unified inbox, and steer market dominance.
            </p>
          </div>
        </div>

        {/* Quick Strategy Health Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(203, 213, 225, 0.95)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
          }}>
            <Flame size={20} color="#e11d48" />
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 850, color: '#000000', textTransform: 'uppercase' }}>Strategy Health</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>
                {analytics?.strategyHealthScore || 88}/100 <span style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 800 }}>• Surging</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(203, 213, 225, 0.95)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
          }}>
            <Users size={20} color="#0284c7" />
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 850, color: '#000000', textTransform: 'uppercase' }}>Total Reach</div>
              <div style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>
                {(analytics?.totalAudience || 134550).toLocaleString()} <span style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 800 }}>Followers</span>
              </div>
            </div>
          </div>

          <button
            onClick={loadAllData}
            style={{
              padding: '10px 18px',
              borderRadius: '9999px',
              background: '#090d16',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(9, 13, 22, 0.25)'
            }}
            title="Refresh All Real-time Data"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Navigation Island Pill Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255, 255, 255, 0.76)',
        backdropFilter: 'blur(32px) saturate(210%)',
        padding: '6px',
        borderRadius: '9999px',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'publisher', label: 'Omnichannel Composer', icon: Share2 },
          { id: 'crawler', label: 'Profile Crawler & Audit', icon: Search },
          { id: 'competitor', label: 'Competitor X-Ray', icon: Target },
          { id: 'inbox', label: 'Unified Inbox', icon: MessageSquare, badge: inbox.filter(i => i.status === 'unread').length },
          { id: 'analytics', label: 'Strategy Graphs & AI Playbooks', icon: BarChart3 },
          { id: 'accounts', label: 'Connected Channels', icon: Sliders, badge: accounts.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: isActive ? '#e11d48' : 'transparent',
                color: isActive ? '#ffffff' : '#000000',
                fontSize: '0.88rem',
                fontWeight: isActive ? 850 : 750,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.16s ease',
                boxShadow: isActive ? '0 4px 14px rgba(225, 29, 72, 0.35)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 850,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isActive ? '#ffffff' : '#e11d48',
                  color: isActive ? '#e11d48' : '#ffffff'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OMNICHANNEL COMPOSER & PUBLISHER                  */}
      {/* ======================================================== */}
      {activeTab === 'publisher' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 430px', gap: '22px', alignItems: 'start' }}>
          {/* Left Column: Post Creator */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '26px',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
          }}>
            {/* Platform Selector Header */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#030712', textTransform: 'uppercase', marginBottom: '10px' }}>
                1. Target Broadcast Channels ({selectedPlatforms.length} Active)
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'instagram', name: 'Instagram', color: '#e11d48' },
                  { id: 'tiktok', name: 'TikTok', color: '#000000' },
                  { id: 'linkedin', name: 'LinkedIn', color: '#0284c7' },
                  { id: 'facebook', name: 'Facebook', color: '#2563eb' },
                  { id: 'twitter', name: 'X / Twitter', color: '#090d16' },
                  { id: 'youtube', name: 'YouTube Shorts', color: '#dc2626' }
                ].map(plat => {
                  const isSelected = selectedPlatforms.includes(plat.id);
                  return (
                    <button
                      key={plat.id}
                      onClick={() => togglePlatform(plat.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 15px',
                        borderRadius: '9999px',
                        border: isSelected ? `2px solid ${plat.color}` : '1.5px solid rgba(203, 213, 225, 0.9)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.98)' : 'rgba(248, 250, 252, 0.8)',
                        color: isSelected ? plat.color : '#1e293b',
                        fontWeight: isSelected ? 800 : 650,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 3px 10px rgba(0, 0, 0, 0.08)' : 'none'
                      }}
                    >
                      <span style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? plat.color : '#94a3b8'
                      }} />
                      <span>{plat.name}</span>
                      {isSelected && <Check size={13} color={plat.color} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Auto-Draft Prompt Bar */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(9, 13, 22, 0.04))',
              border: '1.5px solid rgba(225, 29, 72, 0.28)',
              borderRadius: '18px',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 800, color: '#be123c' }}>
                  <Sparkles size={17} />
                  <span>AI Multi-Platform Copywriter</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['launch', 'engagement', 'viral', 'promo'].map(g => (
                    <button
                      key={g}
                      onClick={() => setAiGoal(g)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 750,
                        border: aiGoal === g ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
                        background: aiGoal === g ? '#e11d48' : '#ffffff',
                        color: aiGoal === g ? '#ffffff' : '#1e293b',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. Announce 25% early access sale on new frosted accessories..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.9)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#030712',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleAiDraft}
                  disabled={isAiDrafting}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '12px',
                    background: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: isAiDrafting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                  }}
                >
                  <Sparkles size={15} className={isAiDrafting ? 'spin' : ''} />
                  <span>{isAiDrafting ? 'Writing...' : 'Generate with AI'}</span>
                </button>
              </div>

              {/* Quick AI Presets */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', color: '#1e293b', fontWeight: 700 }}>Quick Prompts:</span>
                {[
                  'Stowave Frosted Drop #2',
                  'Team Efficiency Milestone',
                  'Client Case Study: 4x ROI',
                  'Behind The Scenes ASMR Video'
                ].map(p => (
                  <button
                    key={p}
                    onClick={() => { setAiTopic(p); }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(203, 213, 225, 0.9)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 650,
                      color: '#030712',
                      cursor: 'pointer'
                    }}
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Content Area */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 800, color: '#030712' }}>
                  Post Caption & Content
                </label>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: postContent.length > 280 ? '#e11d48' : '#334155' }}>
                  {postContent.length} characters {postContent.length > 280 && '(Note: X/Twitter limit is 280)'}
                </span>
              </div>
              <textarea
                rows={6}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your announcement or paste tailored AI copy here... Mention tags, hooks, and call-to-actions."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid rgba(203, 213, 225, 0.95)',
                  fontSize: '0.92rem',
                  fontWeight: 550,
                  color: '#030712',
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  background: '#ffffff'
                }}
              />
            </div>

            {/* Media Attachment URL */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Media Attachment (Cloudinary Image/Video URL)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or Cloudinary secure URL"
                  value={postMediaUrl}
                  onChange={(e) => setPostMediaUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid rgba(203, 213, 225, 0.9)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#030712',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setPostMediaUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: '#090d16',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Load Sample
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 650 }}>
                Will broadcast simultaneously to: <strong style={{ color: '#030712' }}>{selectedPlatforms.join(', ')}</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '9999px',
                    background: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(225, 29, 72, 0.4)'
                  }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Broadcasting...' : `Publish to All ${selectedPlatforms.length} Channels`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#030712', textTransform: 'uppercase' }}>
                Live Mockup Preview
              </div>
              {/* Platform Switcher for preview */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {['instagram', 'linkedin', 'twitter', 'tiktok'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPreviewPlatform(p);
                      if (aiGeneratedCopies && aiGeneratedCopies[p]?.caption) {
                        setPostContent(aiGeneratedCopies[p].caption);
                      }
                    }}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 750,
                      border: previewPlatform === p ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
                      background: previewPlatform === p ? '#e11d48' : '#ffffff',
                      color: previewPlatform === p ? '#ffffff' : '#030712',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Device Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid rgba(203, 213, 225, 0.9)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
            }}>
              {/* Simulated Card Header */}
              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <img
                  src="/icon.png"
                  alt="Stowave"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e11d48' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#030712', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Stowave Official
                    <span style={{ width: '13px', height: '13px', borderRadius: '50%', background: '#e11d48', color: '#fff', fontSize: '9px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600 }}>
                    {previewPlatform === 'instagram' ? '@stowave.store' : previewPlatform === 'linkedin' ? 'Stowave Enterprise • 8.6k followers' : previewPlatform === 'twitter' ? '@stowavestore' : '@stowave_official'}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#090d16' }}>
                  Just now
                </span>
              </div>

              {/* Simulated Post Image */}
              {postMediaUrl && (
                <div style={{ width: '100%', height: '210px', background: '#090d16', overflow: 'hidden' }}>
                  <img
                    src={postMediaUrl}
                    alt="Post media"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Simulated Caption */}
              <div style={{ padding: '14px', fontSize: '0.86rem', color: '#030712', fontWeight: 550, lineHeight: '1.55', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }}>
                {postContent || 'Type your caption to see how it renders across Instagram, LinkedIn, and Twitter in real-time...'}
              </div>

              {/* Simulated Action Bar */}
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#030712', fontSize: '0.78rem', fontWeight: 700 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={14} color="#e11d48" /> 1,420
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MessageCircle size={14} /> 186
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Repeat size={14} /> 312
                </span>
              </div>
            </div>

            {/* Broadcast History Summary */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#030712', textTransform: 'uppercase', marginBottom: '8px' }}>
                Recent Broadcasts ({posts.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {posts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(241, 245, 249, 0.95)',
                      border: '1px solid rgba(203, 213, 225, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#030712', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title || p.content.slice(0, 32)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 600, display: 'flex', gap: '6px' }}>
                        <span>Reach: {p.stats?.reach?.toLocaleString() || '1.4k'}</span>
                        <span>•</span>
                        <span>{p.platforms?.join(', ')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                      title="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROFILE CRAWLER & REAL-TIME AUDIT                 */}
      {/* ======================================================== */}
      {activeTab === 'crawler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Crawler Search Input Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '24px 28px',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', marginBottom: '6px' }}>
              Apify & Direct Scraper Engine
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 900, color: '#030712' }}>
              Real-Time Social Media Link Crawler & Profile Audit
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 550 }}>
              Paste any Instagram, TikTok, LinkedIn, YouTube, X, or Facebook URL. The crawler decodes engagement rates, posting cadence, top performing videos, and provides an actionable SWOT audit.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
                <Search size={18} color="#030712" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Paste URL e.g. https://instagram.com/stowave.store or tiktok.com/@creator"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 16px 13px 44px',
                    borderRadius: '9999px',
                    border: '1.5px solid rgba(203, 213, 225, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#030712',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={handleRunCrawl}
                disabled={crawlLoading}
                style={{
                  padding: '13px 30px',
                  borderRadius: '9999px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: crawlLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(225, 29, 72, 0.35)'
                }}
              >
                <Search size={16} className={crawlLoading ? 'spin' : ''} />
                <span>{crawlLoading ? 'Crawling & Analyzing...' : 'Run Audit'}</span>
              </button>
            </div>
          </div>

          {/* Audit Results View */}
          {crawlResult && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
              {/* Main Analysis Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'Followers Base', value: crawlResult.followers?.toLocaleString(), sub: 'Verified count' },
                    { label: 'Engagement Rate', value: crawlResult.engagementRate, sub: `Industry Avg: ${crawlResult.industryBenchmark}` },
                    { label: 'Avg Likes / Post', value: crawlResult.avgLikesPerPost, sub: 'High retention' },
                    { label: 'Posting Cadence', value: '1.6x / day', sub: crawlResult.postingCadence }
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(30px)',
                        padding: '18px',
                        borderRadius: '18px',
                        border: '1.5px solid rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)'
                      }}
                    >
                      <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: '4px 0' }}>{m.value}</div>
                      <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Top Performing Posts Breakdown */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '22px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#030712', marginBottom: '14px' }}>
                    Top Performing Content & Viral Hooks
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {crawlResult.topPosts?.map((post, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '14px',
                          background: 'rgba(248, 250, 252, 0.95)',
                          border: '1.5px solid rgba(203, 213, 225, 0.9)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', background: '#e11d48', color: '#fff' }}>
                            {post.format}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 750 }}>{post.retentionRate}</span>
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#030712', marginBottom: '8px' }}>
                          "{post.hook}"
                        </div>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: '#1e293b', fontWeight: 650 }}>
                          <span>Views: <strong>{post.views}</strong></span>
                          <span>Likes: <strong>{post.likes}</strong></span>
                          <span>Comments: <strong>{post.comments}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SWOT Analysis Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '22px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#030712', marginBottom: '14px' }}>
                    Strategic SWOT Analysis
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1.5px solid rgba(16, 185, 129, 0.3)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857', marginBottom: '8px' }}>Strengths</div>
                      {crawlResult.swot?.strengths?.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: '#030712', fontWeight: 600, marginBottom: '6px' }}>• {s}</div>
                      ))}
                    </div>
                    <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1.5px solid rgba(239, 68, 68, 0.3)' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b91c1c', marginBottom: '8px' }}>Weaknesses</div>
                      {crawlResult.swot?.weaknesses?.map((w, i) => (
                        <div key={i} style={{ fontSize: '0.82rem', color: '#030712', fontWeight: 600, marginBottom: '6px' }}>• {w}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Health Score & Action Playbook */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                    Overall Profile Health Score
                  </div>
                  <div style={{
                    width: '105px',
                    height: '105px',
                    borderRadius: '50%',
                    margin: '16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(225, 29, 72, 0.15) 0%, rgba(225, 29, 72, 0.3) 100%)',
                    border: '5px solid #e11d48',
                    fontSize: '2.1rem',
                    fontWeight: 900,
                    color: '#e11d48'
                  }}>
                    {crawlResult.auditScore}
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 850, color: '#030712' }}>
                    {crawlResult.handle}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                    92% Favorable Sentiment
                  </div>
                </div>

                {/* Action Playbook */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '22px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 850, color: '#030712', marginBottom: '12px' }}>
                    Growth Action Playbook
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {crawlResult.actionPlaybook?.map((step, idx) => (
                      <div key={idx} style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600, display: 'flex', gap: '8px', lineHeight: '1.45' }}>
                        <span style={{ color: '#e11d48', fontWeight: 900 }}>{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COMPETITOR X-RAY & MARKET DOMINANCE               */}
      {/* ======================================================== */}
      {activeTab === 'competitor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Competitor Input Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '24px 28px',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase', marginBottom: '6px' }}>
              Strategic Intelligence Deep Dive
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.35rem', fontWeight: 900, color: '#030712' }}>
              Competitor X-Ray: Video Hooks, Posting Times & Target Audience Dissection
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#1e293b', fontWeight: 550 }}>
              Input any competitor profile link. Crawl their highest-performing videos, decode their posting time heatmap, analyze their buyer demographics, and generate concrete counter-strategies for Stowave to win market share.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Competitor Name (e.g. Aura Luxe)"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                style={{
                  width: '240px',
                  padding: '13px 16px',
                  borderRadius: '9999px',
                  border: '1.5px solid rgba(203, 213, 225, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#030712',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <input
                type="text"
                placeholder="Competitor Profile or Video URL (e.g. tiktok.com/@competitor or instagram.com/...)"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '280px',
                  padding: '13px 16px',
                  borderRadius: '9999px',
                  border: '1.5px solid rgba(203, 213, 225, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#030712',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <button
                onClick={handleRunCompetitorXray}
                disabled={xrayLoading}
                style={{
                  padding: '13px 30px',
                  borderRadius: '9999px',
                  background: '#090d16',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: xrayLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(9, 13, 22, 0.3)'
                }}
              >
                <Target size={16} className={xrayLoading ? 'spin' : ''} />
                <span>{xrayLoading ? 'Dissecting Competitor...' : 'Execute X-Ray'}</span>
              </button>
            </div>
          </div>

          {/* Competitor Intelligence Findings */}
          {competitorResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Row 1: High Level Metrics & Posting Heatmap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                {/* Competitor Overview Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#be123c', textTransform: 'uppercase' }}>
                    Profile Reach & Cadence
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#030712', margin: '4px 0 12px' }}>
                    {competitorResult.competitorName}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>Estimated Audience</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#030712' }}>{competitorResult.estimatedFollowers}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>Monthly Impressions</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#030712' }}>{competitorResult.estimatedMonthlyReach}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px', fontSize: '0.84rem', color: '#1e293b', fontWeight: 650 }}>
                    Posting Frequency: <strong>{competitorResult.postingFrequency}</strong>
                  </div>
                </div>

                {/* Optimal Posting Time Heatmap Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                    Posting Time Heatmap & Golden Hours
                  </div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#030712', margin: '4px 0 10px' }}>
                    {competitorResult.bestPostingTimes?.peakHoursPkt}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 650, marginBottom: '8px' }}>
                    Peak Engagement Days: <strong>{competitorResult.bestPostingTimes?.peakDays?.join(', ')}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>
                    Dead Zones to Avoid: {competitorResult.bestPostingTimes?.worstDays?.join(', ')}
                  </div>
                </div>

                {/* Target Audience Demographics Card */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                    Buyer Audience Demographics
                  </div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 900, color: '#030712', margin: '4px 0 10px' }}>
                    {competitorResult.targetAudience?.primaryAge}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {competitorResult.targetAudience?.ageDistribution?.map((a, i) => (
                      <div key={i} style={{ flex: 1, textAlign: 'center', background: '#f1f5f9', padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.7rem', color: '#334155', fontWeight: 700 }}>{a.bracket}</div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 850, color: '#030712' }}>{a.percentage}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 650 }}>
                    Top Geos: {competitorResult.targetAudience?.topGeos?.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>

              {/* Row 2: Viral Videos & Hook Breakdown */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(30px)',
                borderRadius: '20px',
                padding: '24px',
                border: '1.5px solid rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ fontSize: '0.98rem', fontWeight: 850, color: '#030712', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={18} color="#e11d48" />
                  <span>Top Performing Videos & Viral Hook Formulas</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {competitorResult.topVideosAndPosts?.map((vid, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '16px',
                        background: 'rgba(248, 250, 252, 0.95)',
                        border: '1.5px solid rgba(203, 213, 225, 0.9)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', background: '#090d16', color: '#fff' }}>
                          {vid.format}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>Duration: {vid.duration}</span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 850, color: '#030712', marginBottom: '6px' }}>
                        {vid.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#be123c', fontWeight: 750, marginBottom: '6px' }}>
                        Hook: {vid.hookType}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: '1.45', marginBottom: '10px', fontWeight: 550 }}>
                        Why it worked: {vid.whyItWorked}
                      </div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem', color: '#030712', fontWeight: 750, borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
                        <span>Views: {vid.views}</span>
                        <span>Likes: {vid.likes}</span>
                        <span>Shares: {vid.shares}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 3: Stowave Counter-Strategy Playbook (Convert to Task) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(9, 13, 22, 0.04))',
                border: '1.5px solid rgba(225, 29, 72, 0.35)',
                borderRadius: '24px',
                padding: '26px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#030712' }}>
                      Stowave Counter-Playbook: How to Outperform {competitorResult.competitorName}
                    </h3>
                    <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>
                      1-Click convert these strategic counter-moves into assigned Stowave team tasks.
                    </p>
                  </div>
                  <Award size={26} color="#e11d48" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {competitorResult.counterTasks?.map((task, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1.5px solid rgba(203, 213, 225, 0.9)',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', background: 'rgba(225, 29, 72, 0.12)', color: '#be123c' }}>
                            {task.priority?.toUpperCase()} PRIORITY
                          </span>
                          <span style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 700 }}>Assignee: {task.suggestedAssignee}</span>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 850, color: '#030712', marginBottom: '8px' }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: '1.5', marginBottom: '16px', fontWeight: 550 }}>
                          {task.description}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConvertCounterTask(task)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '9999px',
                          background: '#e11d48',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                        }}
                      >
                        <Plus size={15} />
                        <span>Add to Stowave Task Board</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: UNIFIED SOCIAL INBOX (COMMENTS & DMS)             */}
      {/* ======================================================== */}
      {activeTab === 'inbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header & Filter Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>
                Unified Multi-Platform Social Inbox ({inbox.length})
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#1e293b', fontWeight: 550 }}>
                All incoming customer DMs, inquiries, and comments across Instagram, TikTok, LinkedIn, and Facebook in one feed.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: 'All Inquiries' },
                { id: 'unread', label: 'Unread' },
                { id: 'lead', label: 'B2B Leads & Buyers' },
                { id: 'positive', label: 'Positive Praise' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setInboxFilter(f.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 750,
                    border: inboxFilter === f.id ? '1.5px solid #e11d48' : '1.5px solid rgba(203, 213, 225, 0.9)',
                    background: inboxFilter === f.id ? '#e11d48' : '#ffffff',
                    color: inboxFilter === f.id ? '#ffffff' : '#030712',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inbox Feed Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredInbox.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#334155', fontWeight: 600 }}>
                No messages matching this filter.
              </div>
            ) : (
              filteredInbox.map(item => {
                const sentimentColors = {
                  lead: { bg: 'rgba(16, 185, 129, 0.15)', text: '#047857', label: 'High-Value Lead' },
                  positive: { bg: 'rgba(2, 132, 199, 0.15)', text: '#0369a1', label: 'Customer Praise' },
                  urgent: { bg: 'rgba(239, 68, 68, 0.15)', text: '#b91c1c', label: 'Urgent Support' }
                };
                const sBadge = sentimentColors[item.sentiment] || { bg: '#f1f5f9', text: '#334155', label: 'Inquiry' };

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(30px)',
                      borderRadius: '18px',
                      padding: '22px',
                      border: '1.5px solid rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.senderAvatar || '/icon.png'}
                          alt={item.senderName}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.94rem', fontWeight: 850, color: '#030712' }}>
                            {item.senderName}{' '}
                            <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700 }}>
                              ({item.senderHandle})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 650 }}>
                            Platform: <strong style={{ color: '#030712' }}>{item.platform.toUpperCase()}</strong> • {item.postContext}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: sBadge.bg,
                          color: sBadge.text
                        }}>
                          {sBadge.label}
                        </span>
                        {item.status === 'replied' ? (
                          <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 750 }}>Replied</span>
                        ) : item.status === 'converted_to_task' ? (
                          <span style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 750 }}>Converted to Task</span>
                        ) : (
                          <span style={{ fontSize: '0.76rem', color: '#e11d48', fontWeight: 800 }}>Unread</span>
                        )}
                      </div>
                    </div>

                    {/* Customer Message Text */}
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'rgba(241, 245, 249, 0.95)',
                      fontSize: '0.92rem',
                      color: '#030712',
                      fontWeight: 600,
                      lineHeight: '1.55',
                      marginBottom: '14px',
                      border: '1px solid #cbd5e1'
                    }}>
                      "{item.message}"
                    </div>

                    {/* AI Smart Reply Suggestion */}
                    {item.aiSuggestedReply && item.status !== 'replied' && (
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(225, 29, 72, 0.06)',
                        border: '1.5px solid rgba(225, 29, 72, 0.25)',
                        marginBottom: '12px',
                        fontSize: '0.84rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, color: '#be123c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={14} />
                            Suggested AI Reply:
                          </span>
                          <button
                            onClick={() => setReplyTextMap({ ...replyTextMap, [item.id]: item.aiSuggestedReply })}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#be123c',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Use This Reply
                          </button>
                        </div>
                        <div style={{ color: '#090d16', fontWeight: 600, fontStyle: 'italic' }}>
                          "{item.aiSuggestedReply}"
                        </div>
                      </div>
                    )}

                    {/* Show already sent reply if replied */}
                    {item.status === 'replied' && item.replyContent && (
                      <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>
                        ✓ Replied: "{item.replyContent}"
                      </div>
                    )}

                    {/* Reply Input Bar */}
                    {item.status !== 'replied' && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Write reply to customer..."
                          value={replyTextMap[item.id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1.5px solid rgba(203, 213, 225, 0.95)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#030712',
                            outline: 'none',
                            background: '#ffffff'
                          }}
                        />
                        <button
                          onClick={() => handleSendReply(item.id)}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            background: '#090d16',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.84rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => handleConvertInboxToTask(item.id)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            background: 'rgba(225, 29, 72, 0.12)',
                            color: '#be123c',
                            border: '1.5px solid rgba(225, 29, 72, 0.35)',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Convert to high-priority team task"
                        >
                          <Plus size={14} />
                          <span>Convert to Task</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: STRATEGY GRAPHS & AI PLAYBOOKS                    */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily Reach & Impressions SVG Chart */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '26px 28px',
            boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#030712' }}>
                  7-Day Omnichannel Growth & Reach Performance
                </h2>
                <p style={{ margin: '5px 0 0', fontSize: '0.86rem', color: '#1e293b', fontWeight: 550 }}>
                  Aggregated weekly impressions, organic viral reach, and user engagement momentum.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem', fontWeight: 800 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e11d48' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e11d48' }} /> Reach
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#090d16' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#090d16' }} /> Impressions
                </span>
              </div>
            </div>

            {/* SVG Visual Graph */}
            <div style={{ width: '100%', height: '230px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="50" x2="700" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="0" y1="150" x2="700" y2="150" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />

                {/* Reach Area Fill */}
                <polygon
                  points="0,150 100,105 200,120 300,70 400,95 500,135 600,80 700,80 700,200 0,200"
                  fill="url(#reachGrad)"
                />

                {/* Reach Line */}
                <polyline
                  points="0,150 100,105 200,120 300,70 400,95 500,135 600,80 700,80"
                  fill="none"
                  stroke="#e11d48"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Impressions Line */}
                <polyline
                  points="0,120 100,60 200,75 300,30 400,50 500,95 600,45 700,45"
                  fill="none"
                  stroke="#090d16"
                  strokeWidth="3"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {[
                  { x: 0, y: 150 },
                  { x: 100, y: 105 },
                  { x: 200, y: 120 },
                  { x: 300, y: 70 },
                  { x: 400, y: 95 },
                  { x: 500, y: 135 },
                  { x: 600, y: 80 }
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="6" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" />
                ))}
              </svg>

              {/* Day Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.82rem', fontWeight: 800, color: '#030712' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Strategic Suggestions Cards */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(36px) saturate(210%)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '26px 28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={22} color="#e11d48" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#030712' }}>
                AI Strategic Growth Recommendations & Playbooks
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {analytics?.strategicSuggestions?.map(sug => (
                <div
                  key={sug.id}
                  style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'rgba(248, 250, 252, 0.95)',
                    border: '1.5px solid rgba(203, 213, 225, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: sug.level === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(225, 29, 72, 0.12)',
                      color: sug.level === 'urgent' ? '#b91c1c' : '#be123c',
                      marginBottom: '8px',
                      display: 'inline-block'
                    }}>
                      {sug.type}
                    </span>
                    <div style={{ fontSize: '0.94rem', fontWeight: 850, color: '#030712', margin: '4px 0 8px' }}>
                      {sug.title}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 550, lineHeight: '1.5', marginBottom: '16px' }}>
                      {sug.description}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (sug.actionLabel.includes('Inbox')) setActiveTab('inbox');
                      else setActiveTab('publisher');
                    }}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: '#090d16',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{sug.actionLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CONNECTED CHANNELS SETTINGS                       */}
      {/* ======================================================== */}
      {activeTab === 'accounts' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(36px) saturate(210%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '26px',
          boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.95) inset'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#030712' }}>
                Connected Social Profiles & Omnichannel Broadcasters
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#1e293b', fontWeight: 550 }}>
                Manage your enterprise brand presence across Instagram, TikTok, LinkedIn, Facebook, X/Twitter, and YouTube.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {accounts.map(acc => (
              <div
                key={acc.id}
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  background: 'rgba(248, 250, 252, 0.95)',
                  border: '1.5px solid rgba(203, 213, 225, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={acc.avatar || '/icon.png'}
                    alt={acc.name}
                    style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#030712' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 650 }}>{acc.handle}</div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 800, marginTop: '2px' }}>
                      {acc.followers?.toLocaleString()} Followers
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: acc.connected ? 'rgba(16, 185, 129, 0.16)' : 'rgba(148, 163, 184, 0.25)',
                    color: acc.connected ? '#047857' : '#334155'
                  }}>
                    {acc.connected ? 'Connected' : 'Paused'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
