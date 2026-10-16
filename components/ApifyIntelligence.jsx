'use client';
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Key, 
  Check, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  Database, 
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  Activity,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ApifyIntelligence() {
  const [profile, setProfile] = useState(null);
  const [activeMode, setActiveMode] = useState('competitor'); // 'competitor' | 'leads' | 'audit' | 'brand'
  const [targetInput, setTargetInput] = useState('stowave.store');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    loadProfile();
    loadHistory();
  }, []);

  const showNotice = (msg, type = 'success') => {
    setActionNotice({ msg, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const loadProfile = async () => {
    try {
      const resp = await fetch('/api/apify/profile');
      const data = await resp.json();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load Apify profile:', err);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const resp = await fetch('/api/apify/history');
      const data = await resp.json();
      setTrackingHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tracking history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRunAutomation = async (e) => {
    e.preventDefault();
    if (!targetInput.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const resp = await fetch('/api/apify/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: activeMode, target: targetInput.trim() })
      });
      const data = await resp.json();
      setExecutionResult(data);
      showNotice(`Automated scan completed! Recorded to Supabase.`);
      loadHistory();
    } catch (err) {
      console.error('Automation execution failed:', err);
      showNotice('Failed to execute scan: ' + err.message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleConvertToTask = async (finding) => {
    try {
      const title = finding.title || finding.businessName || `Action on ${targetInput}`;
      const description = finding.opportunity || finding.recentFeedback || `Follow up on Apify tracking alert for ${targetInput}`;
      const priority = finding.recommendedPriority || 'high';

      const resp = await fetch('/api/apify/convert-to-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Radar Insight] ${title}`,
          description,
          priority
        })
      });
      const data = await resp.json();
      showNotice(`Task created! WhatsApp alert sent to admins & team notified.`);
    } catch (err) {
      showNotice('Failed to convert to task: ' + err.message, 'error');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await fetch(`/api/apify/history/${id}`, { method: 'DELETE' });
      setTrackingHistory(prev => prev.filter(item => item.id !== id));
      showNotice('Deleted record from Supabase table.');
    } catch (err) {
      showNotice('Failed to delete history: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '9999px',
          background: actionNotice.type === 'error' ? 'rgba(225, 29, 72, 0.95)' : 'rgba(5, 150, 105, 0.95)',
          color: '#ffffff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          fontSize: '0.86rem',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {actionNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* 1. Header Hero Card with Liquid Glass */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.08)', color: '#e11d48' }}>
                <Globe size={13} /> Apify Cloud Intelligence
              </span>
              <span className="badge badge-completed">
                <Check size={13} /> Token Authenticated (Free $5.00/mo)
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              Stowave Automation & Market Radar
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '680px' }}>
              Run automated web-scrapers, audit competitor catalogs, extract commercial B2B leads, track brand sentiment, and convert intelligence directly into assigned team tasks synced to Supabase.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(241, 245, 249, 0.85)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: '#334155',
              fontWeight: 600
            }}>
              User ID: <code style={{ color: '#e11d48', fontWeight: 700 }}>{profile?.userId || 'Connected'}</code>
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          {[
            { id: 'competitor', title: 'Competitor Radar', desc: 'Price drop & product catalog scraper', placeholder: 'e.g. competitor-store.com' },
            { id: 'leads', title: 'B2B Lead Extractor', desc: 'Find verified supplier & business emails', placeholder: 'e.g. apparel manufacturers' },
            { id: 'audit', title: 'Website Health & SEO', desc: 'Live response latency & status code audit', placeholder: 'e.g. stowave.store' },
            { id: 'brand', title: 'Sentiment Watchdog', desc: 'Social mention & review tracker', placeholder: 'e.g. Stowave brand keywords' }
          ].map(m => {
            const isSel = activeMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => { setActiveMode(m.id); setTargetInput(m.placeholder.replace('e.g. ', '')); }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: isSel ? 'rgba(225, 29, 72, 0.06)' : 'rgba(255, 255, 255, 0.6)',
                  border: isSel ? '2px solid #e11d48' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease'
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 850, color: isSel ? '#be123c' : '#000000', marginBottom: '3px' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.35 }}>
                  {m.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Automation Run Bar */}
      <div className="glass-panel" style={{ padding: '22px 28px' }}>
        <form onSubmit={handleRunAutomation} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="input-label" style={{ marginBottom: '6px' }}>
              Target Domain, Store URL or Keyword to Track:
            </label>
            <input
              type="text"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Enter domain or niche..."
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isExecuting}
            className="btn btn-primary"
            style={{ padding: '12px 24px', alignSelf: 'flex-end', minWidth: '180px' }}
          >
            {isExecuting ? <RefreshCw size={15} className="spin" /> : <Play size={15} />}
            <span>{isExecuting ? 'Scanning Web...' : 'Run Live Radar'}</span>
          </button>
        </form>

        {/* Scan Results Card */}
        {executionResult && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(241, 245, 249, 0.75)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#059669" />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  Radar Scan Findings ({executionResult.findings?.length || 0} items)
                </span>
              </div>
              <span className="badge badge-completed">
                Supabase Synced ({executionResult.executionTimeMs}ms)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {executionResult.findings?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                        {item.title || item.businessName || item.platform}
                      </strong>
                      {item.priceRange && (
                        <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.08)', color: '#e11d48' }}>
                          {item.priceRange}
                        </span>
                      )}
                      {item.latencyMs && (
                        <span className="badge badge-completed">
                          Latency: {item.latencyMs}
                        </span>
                      )}
                      {item.sentimentScore && (
                        <span className="badge badge-completed">
                          {item.sentimentScore}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#000000', fontWeight: 600, margin: '4px 0 0', lineHeight: 1.45 }}>
                      {item.opportunity || item.recentFeedback || item.metaTags || item.flaggedIssues}
                    </p>

                    {(item.contactPerson || item.email) && (
                      <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700, marginTop: '6px' }}>
                        Contact: {item.contactPerson} • {item.email} • {item.phone}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleConvertToTask(item)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      <Sparkles size={13} />
                      <span>Convert to Team Task</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Live Supabase Tracking Feed */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#e11d48" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#000000', margin: 0 }}>
              Live Supabase Tracking Log (PostgreSQL 17.11)
            </h3>
          </div>

          <button
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} className={isLoadingHistory ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {trackingHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trackingHistory.map((run) => (
              <div
                key={run.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.86rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: run.status === 'completed' ? '#059669' : '#d97706'
                  }} />
                  <div>
                    <strong style={{ color: '#000000', fontWeight: 850 }}>{run.actor_name}</strong>
                    <span style={{ color: '#1e293b', fontWeight: 700, marginLeft: '8px' }}>Target: {run.target}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 700 }}>
                    {run.summary}
                  </span>
                  <span className="badge badge-completed">
                    {run.items_found} items
                  </span>
                  <button
                    onClick={() => handleDeleteHistory(run.id)}
                    title="Delete Record"
                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#000000' }}>
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 850, color: '#000000' }}>
              No automation runs logged yet.
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#1e293b', fontWeight: 650 }}>
              Use the radar above to trigger a scan and it will be recorded into Supabase automatically.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
