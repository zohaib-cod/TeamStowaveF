'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import { 
  Settings as SettingsIcon, 
  Key, 
  Trash2, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Database, 
  Globe 
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Stowave Global Enterprises',
    companyTagline: 'Empowering Teams with Strategic Precision & Omnichannel Social Intelligence',
    timezone: 'UTC+5 (PKT)',
    apifyUserId: '',
    apifyApiKey: '',
    groqModel: 'openai/gpt-oss-120b',
    visionModel: 'qwen/qwen3.8-27b'
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(err => console.error(err));
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetWorkspace = async () => {
    if (!confirm('Are you sure you want to reset workspace to a clean real-time slate? All tasks, standups, and surveys will be cleared so you can start 100% fresh.')) {
      return;
    }
    setIsResetting(true);
    try {
      const resp = await fetch('/api/settings/reset-workspace', { method: 'POST' });
      const data = await resp.json();
      setResetMessage('Workspace successfully reset to a clean real-time slate!');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
        {/* Header */}
        <div className="glass-panel" style={{ padding: '26px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#be123c', border: '1.5px solid rgba(225, 29, 72, 0.35)', fontWeight: 800 }}>
              System Configuration
            </span>
            <span className="badge badge-completed">Full CRUD & Real-Time</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#000000', margin: '4px 0 6px 0' }}>
            Workspace Settings & Integrations
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, margin: 0 }}>
            Manage company profile, API tokens (Apify, WhatsApp, Supabase, Groq), and reset workspace to clean real-time state.
          </p>
        </div>

        {/* 1. Company Profile Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#000000', marginBottom: '18px' }}>
            Company Profile & Timezone
          </h3>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label className="input-label">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Company Tagline / Vision</label>
              <input
                type="text"
                value={settings.companyTagline}
                onChange={e => setSettings({ ...settings, companyTagline: e.target.value })}
                className="input-field"
              />
            </div>

            {/* API Credentials */}
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#000000', marginTop: '14px' }}>
              Active AI & Automation Credentials
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label className="input-label">Apify User ID</label>
                <input
                  type="text"
                  value={settings.apifyUserId}
                  onChange={e => setSettings({ ...settings, apifyUserId: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Apify Personal API Token</label>
                <input
                  type="password"
                  value={settings.apifyApiKey}
                  onChange={e => setSettings({ ...settings, apifyApiKey: e.target.value })}
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label className="input-label">Active Groq Chat Model</label>
                <input
                  type="text"
                  disabled
                  value={settings.groqModel || 'openai/gpt-oss-120b'}
                  className="input-field"
                  style={{ opacity: 0.9, background: 'rgba(241, 245, 249, 0.9)' }}
                />
              </div>

              <div>
                <label className="input-label">Active Vision Model</label>
                <input
                  type="text"
                  disabled
                  value={settings.visionModel || 'qwen/qwen3.8-27b'}
                  className="input-field"
                  style={{ opacity: 0.9, background: 'rgba(241, 245, 249, 0.9)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {isSaved ? <Check size={16} /> : <Key size={16} />}
                <span>{isSaved ? 'Settings Saved!' : 'Save System Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. Clean Slate & Reset Workspace Section */}
        <div className="glass-panel" style={{
          padding: '28px',
          border: '1.5px solid rgba(225, 29, 72, 0.4)',
          background: 'rgba(255, 255, 255, 0.78)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldAlert size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.18rem', fontWeight: 850, color: '#000000', margin: 0 }}>
                  Clean Real-Time Slate (Remove Sample Data)
                </h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600, maxWidth: '750px', lineHeight: 1.5, margin: 0 }}>
                Click below to wipe out all sample tasks, reports, and surveys so your team can start with a 100% clean, live canvas. Your Admin account and Apify credentials will be preserved.
              </p>
              {resetMessage && (
                <div style={{ marginTop: '10px', color: '#059669', fontWeight: 800, fontSize: '0.88rem' }}>
                  ✅ {resetMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleResetWorkspace}
              disabled={isResetting}
              className="btn btn-rose"
              style={{ padding: '10px 22px' }}
            >
              <Trash2 size={16} />
              <span>{isResetting ? 'Resetting...' : 'Reset to Clean Slate'}</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
