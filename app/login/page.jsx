'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Crown, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState(null);
  const [isFirstAdminMode, setIsFirstAdminMode] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // If already logged in, redirect to home
    const savedUser = localStorage.getItem('apex_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.id) {
          router.push('/');
          return;
        }
      } catch (e) {}
    }
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
        if (data.requiresFirstAdminSetup) {
          setIsFirstAdminMode(true);
        }
      }
    } catch (e) {
      console.warn('Auth status check error:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleGeneratePassword = async () => {
    try {
      const res = await fetch('/api/auth/generate-password');
      if (res.ok) {
        const data = await res.json();
        setPassword(data.password);
        setShowPassword(true);
        navigator.clipboard.writeText(data.password);
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2500);
      }
    } catch (e) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      let autoPwd = '';
      for (let i = 0; i < 16; i++) autoPwd += chars.charAt(Math.floor(Math.random() * chars.length));
      setPassword(autoPwd);
      setShowPassword(true);
      navigator.clipboard.writeText(autoPwd);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    }
  };

  const handleResetToFirstAdmin = async () => {
    if (!confirm('Are you sure you want to reset workspace accounts so you can become the first Primary Admin?')) return;
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-for-first-admin', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('✅ Workspace reset! You can now create the first Primary Admin account.');
        setIsFirstAdminMode(true);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      setError('Failed to reset accounts.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isFirstAdminMode) {
        // Register First Admin
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Please fill in your name, email, and password.');
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            department: 'Executive Leadership',
            title: 'Primary Administrator & Director'
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to initialize admin account.');

        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        setSuccessMsg('👑 Primary Admin Account Initialized Successfully!');

        localStorage.setItem('apex_current_user_id', data.user.id);
        localStorage.setItem('apex_current_user', JSON.stringify(data.user));
        localStorage.setItem('stowave_auth_token', data.token);

        setTimeout(() => router.push('/'), 1400);
      } else {
        // Regular Login
        if (!email.trim() || !password) {
          throw new Error('Please enter both your email and password.');
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        });

        const data = await res.json();
        if (!res.ok) {
          if (data.requiresFirstAdminSetup) {
            setIsFirstAdminMode(true);
          }
          throw new Error(data.error || 'Koi bhi bnda bina account bnaye login nahi kar sakta.');
        }

        setSuccessMsg(data.becameAdmin ? '👑 Mubarak ho! Aap sb sy pehly login huye hain aur Primary Admin ban gaye hain!' : `Welcome back, ${data.user.name.split(' ')[0]}!`);

        localStorage.setItem('apex_current_user_id', data.user.id);
        localStorage.setItem('apex_current_user', JSON.stringify(data.user));
        localStorage.setItem('stowave_auth_token', data.token);

        setTimeout(() => router.push('/'), 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambient Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(225, 29, 72, 0.45) 0%, transparent 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: '640px',
        height: '640px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.45) 0%, transparent 70%)',
        filter: 'blur(75px)',
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '38px 34px',
        borderRadius: '26px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(40px) saturate(210%)',
        WebkitBackdropFilter: 'blur(40px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 24px 65px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.95) inset',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <img 
              src="/stowave-logo-transparent.png" 
              alt="Stowave" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(241, 245, 249, 0.9)',
            padding: '4px',
            borderRadius: '9999px',
            margin: '12px 0 18px',
            border: '1.5px solid rgba(203, 213, 225, 0.8)'
          }}>
            <button
              type="button"
              onClick={() => {
                setIsFirstAdminMode(false);
                setError(null);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: !isFirstAdminMode ? '#ffffff' : 'transparent',
                color: !isFirstAdminMode ? '#0f172a' : '#64748b',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: !isFirstAdminMode ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              🔑 Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFirstAdminMode(true);
                setError(null);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: isFirstAdminMode ? '#e11d48' : 'transparent',
                color: isFirstAdminMode ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: isFirstAdminMode ? '0 2px 10px rgba(225, 29, 72, 0.3)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Crown size={14} />
              <span>Sign Up (Admin)</span>
            </button>
          </div>

          {isFirstAdminMode ? (
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.35)',
                color: '#be123c',
                fontSize: '0.74rem',
                fontWeight: 850,
                marginBottom: '8px'
              }}>
                <Crown size={14} />
                <span>Pehla Account Setup — You Will Become Admin</span>
              </div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
                Create Admin Account
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, fontWeight: 600 }}>
                Jo shakhs sb sy pehly account bnaye ga wo is workspace ka official <strong>Primary Admin & Director</strong> ban jaye ga.
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
                Sign In to Workspace
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                Apna email aur password darj karein. Agar pehla account nahi bana tou login krny par automatically Admin account create ho jaye ga.
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1.5px solid rgba(225, 29, 72, 0.3)',
            color: '#be123c',
            fontSize: '0.84rem',
            fontWeight: 700,
            marginBottom: '18px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(5, 150, 105, 0.1)',
            border: '1.5px solid rgba(5, 150, 105, 0.3)',
            color: '#047857',
            fontSize: '0.86rem',
            fontWeight: 800,
            marginBottom: '18px'
          }}>
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name Field (Only in First Admin Mode) */}
          {isFirstAdminMode && (
            <div>
              <label className="input-label">Full Name / Username *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  required
                  autoFocus
                  className="input-field"
                  placeholder="E.g., Ali Zohaib"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="input-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                required
                autoFocus={!isFirstAdminMode}
                className="input-field"
                placeholder={isFirstAdminMode ? "admin@stowave.com or personal email" : "Enter your email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password Field with Generator */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Password *</label>
              {isFirstAdminMode && (
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(225, 29, 72, 0.12)',
                    border: '1px solid rgba(225, 29, 72, 0.35)',
                    color: '#be123c',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={12} />
                  <span>{copiedPassword ? '✓ Copied' : 'Generate Strong Password'}</span>
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                placeholder={isFirstAdminMode ? "Create a strong password" : "••••••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px', fontFamily: showPassword ? 'monospace' : 'inherit' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '13px',
              fontSize: '0.96rem',
              fontWeight: 850,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.4)',
              marginTop: '8px'
            }}
          >
            {isSubmitting ? (
              <RefreshCw size={18} className="spin-icon" />
            ) : isFirstAdminMode ? (
              <Crown size={18} />
            ) : (
              <ArrowRight size={18} />
            )}
            <span>
              {isSubmitting
                ? 'Authenticating...'
                : isFirstAdminMode
                ? '👑 Initialize as Primary Admin & Enter'
                : 'Sign In to Workspace'}
            </span>
          </button>
        </form>

        {/* Footer Info & Invite Acceptance */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(203, 213, 225, 0.6)', textAlign: 'center' }}>
          {!isFirstAdminMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.80rem', color: '#64748b', fontWeight: 650 }}>
                Aapka abhi account nahi bana? (Don't have an account yet?)
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>
                  Aap bina account banaye login nahi kar saktay. Admin sy invitation link hasil karein.
                </span>
              </div>
              <div style={{ marginTop: '6px' }}>
                <Link
                  href="/invite"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    color: '#be123c',
                    fontWeight: 800,
                    textDecoration: 'none'
                  }}
                >
                  <UserPlus size={13} />
                  <span>Have an invite link/token? Click here to activate</span>
                </Link>
              </div>

              {/* Developer / Admin Reset Helper */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed rgba(203, 213, 225, 0.6)' }}>
                <button
                  type="button"
                  onClick={handleResetToFirstAdmin}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  title="Click to reset accounts so you can become the first Primary Admin"
                >
                  ⚙️ Developer Mode: Reset Workspace to First Admin Setup
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#be123c', fontWeight: 750 }}>
                👑 Jo bnda sb sy pehly account bnaye ga wo is workspace ka Primary Admin ban jaye ga!
              </p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                🛡️ Stowave Enterprise Authentication Engine
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
