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
  Globe,
  MessageSquare,
  Mail,
  Send,
  Phone,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Stowave Global Enterprises',
    companyTagline: 'Empowering Teams with Strategic Precision & Omnichannel Social Intelligence',
    timezone: 'UTC+5 (PKT)',
    apifyUserId: '',
    apifyApiKey: '',
    groqModel: 'openai/gpt-oss-120b',
    visionModel: 'qwen/qwen3.8-27b',
    adminWhatsappNumbers: '923290010909, 923184360458',
    whatsappPhoneNumberId: '1291620604045427',
    whatsappToken: ''
  });
  const [showToken, setShowToken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  // Notification testing states
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);
  const [whatsappTestResult, setWhatsappTestResult] = useState(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [whatsappHealth, setWhatsappHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(prev => ({ ...prev, ...data })))
      .catch(err => console.error(err));

    // Initial check for WhatsApp API health
    fetch('/api/notifications/whatsapp-health')
      .then(res => res.json())
      .then(data => setWhatsappHealth(data))
      .catch(() => {});
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

  const handleTestWhatsapp = async () => {
    setIsTestingWhatsapp(true);
    setWhatsappTestResult(null);
    try {
      const resp = await fetch('/api/notifications/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '🚀 Stowave Live WhatsApp Test Alert: Real-time automated notifications active!' })
      });
      const data = await resp.json();
      setWhatsappTestResult(data);
    } catch (err) {
      setWhatsappTestResult({ error: err.message });
    } finally {
      setIsTestingWhatsapp(false);
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);
    try {
      const resp = await fetch('/api/notifications/test-email', { method: 'POST' });
      const data = await resp.json();
      setEmailTestResult(data);
    } catch (err) {
      setEmailTestResult({ error: err.message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleCheckWhatsappHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const resp = await fetch('/api/notifications/whatsapp-health');
      const data = await resp.json();
      setWhatsappHealth(data);
    } catch (err) {
      setWhatsappHealth({ status: 'Error', errorMessage: err.message });
    } finally {
      setIsCheckingHealth(false);
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
            Manage company profile, API tokens (WhatsApp, Email, Apify, Groq), and verify real-time notification dispatchers.
          </p>
        </div>

        {/* 1. Automated Notification Channels (WhatsApp & Email) */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <MessageSquare size={20} color="#25D366" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#000000', margin: 0 }}>
                  Automated Notification Channels (WhatsApp & Email)
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', fontWeight: 600, margin: 0 }}>
                Every workspace event (Task Assigned, Deliverables Submitted, Approvals, Rejections, Deadline Extensions) dispatches instant alerts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleTestWhatsapp}
                disabled={isTestingWhatsapp}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Phone size={14} color="#25D366" />
                <span>{isTestingWhatsapp ? 'Testing WhatsApp...' : 'Test WhatsApp Alert'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={14} color="#e11d48" />
                <span>{isTestingEmail ? 'Sending Email...' : 'Test Gmail Dispatch'}</span>
              </button>

              <button
                type="button"
                onClick={handleCheckWhatsappHealth}
                disabled={isCheckingHealth}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={isCheckingHealth ? 'spin' : ''} />
                <span>Check Meta Health</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Credentials Editor */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '16px',
            border: '1.5px solid rgba(226, 232, 240, 0.95)',
            marginBottom: '18px'
          }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 850, color: '#0f172a' }}>
              WhatsApp Cloud API Configuration & Live Credentials
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>
              Update Meta Access Token, Phone Number ID, or target alert recipients anytime. Changes take effect instantly without restarting.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Meta Access Token (System User / Permanent)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="Paste Meta Access Token (starts with EAA...)"
                    value={settings.whatsappToken || ''}
                    onChange={e => setSettings({ ...settings, whatsappToken: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 52px 10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.86rem',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: 750,
                      color: '#64748b'
                    }}
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Meta Business Suite ➔ System Users ➔ Token with <code>whatsapp_business_messaging</code>.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  WhatsApp Phone Number ID
                </label>
                <input
                  type="text"
                  placeholder="1291620604045427"
                  value={settings.whatsappPhoneNumberId || ''}
                  onChange={e => setSettings({ ...settings, whatsappPhoneNumberId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  Found under Meta WhatsApp Manager ➔ API Setup.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Admin WhatsApp Recipients (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="923290010909, 923184360458"
                  value={settings.adminWhatsappNumbers || ''}
                  onChange={e => setSettings({ ...settings, adminWhatsappNumbers: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                  International format without + sign (e.g. 923290010909).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={async () => {
                  await handleSaveSettings({ preventDefault: () => {} });
                  handleCheckWhatsappHealth();
                }}
                style={{
                  fontSize: '0.84rem',
                  padding: '9px 18px',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                }}
              >
                <Check size={15} /> Save & Apply WhatsApp Credentials
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Active WhatsApp Numbers</label>
              <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#25D366" />
                <span>{settings.adminWhatsappNumbers || '923290010909, 923184360458'}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Phone Number ID</label>
              <div style={{ fontSize: '0.92rem', fontWeight: 750, color: '#0f172a', marginTop: '4px', fontFamily: 'monospace' }}>
                {settings.whatsappPhoneNumberId || '1291620604045427'}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Meta Connection Health</label>
              <div style={{ marginTop: '4px' }}>
                {whatsappHealth ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 750,
                    background: whatsappHealth.valid ? '#dcfce7' : '#fee2e2',
                    color: whatsappHealth.valid ? '#166534' : '#991b1b',
                    border: `1px solid ${whatsappHealth.valid ? '#86efac' : '#fca5a5'}`
                  }}>
                    {whatsappHealth.valid ? <Check size={12} /> : <AlertCircle size={12} />}
                    {whatsappHealth.valid ? 'Verified & Active' : (whatsappHealth.status || 'Auth Required')}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Checking status...</span>
                )}
              </div>
              {whatsappHealth && !whatsappHealth.valid && whatsappHealth.errorMessage && (
                <p style={{ fontSize: '0.72rem', color: '#dc2626', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                  ⚠️ {whatsappHealth.errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Test results banner */}
          {whatsappTestResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              <div style={{ fontWeight: 750, marginBottom: '4px', color: '#38bdf8' }}>📱 WhatsApp Test Dispatch Results:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(whatsappTestResult, null, 2)}
              </pre>
            </div>
          )}

          {emailTestResult && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              <div style={{ fontWeight: 750, marginBottom: '4px', color: '#4ade80' }}>✉️ Gmail SMTP Test Dispatch Results:</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(emailTestResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 2. Company Profile Form */}
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

        {/* 3. Clean Slate & Reset Workspace Section */}
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
                Click below to wipe out all tasks, reports, and surveys so your team can start fresh. <strong>All registered team member accounts and login credentials are 100% preserved</strong>, so nobody ever needs to sign up again.
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
