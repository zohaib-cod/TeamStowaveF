'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  Lock, 
  User, 
  Mail, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('No invitation token was provided in the link.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/auth/verify-invite?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        if (data.isExpired) {
          setIsExpired(true);
        }
        throw new Error(data.error || 'Invitation is invalid or has expired.');
      }

      setIsValid(true);
      setInviteData(data.invite);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStrongPassword = async () => {
    setIsGenerating(true);
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
      // fallback local generation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      let autoPwd = '';
      for (let i = 0; i < 16; i++) autoPwd += chars.charAt(Math.floor(Math.random() * chars.length));
      setPassword(autoPwd);
      setShowPassword(true);
      navigator.clipboard.writeText(autoPwd);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !password) {
      setErrorMessage('Please provide your name and a secure password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: name.trim(),
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete registration.');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save user session
      if (data.user) {
        localStorage.setItem('apex_current_user_id', data.user.id);
        localStorage.setItem('apex_current_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('stowave_auth_token', data.token);
        }
      }

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={36} color="#e11d48" className="spin-icon" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Verifying Your Invitation Token...</h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>Checking 30-minute security credentials</p>
      </div>
    );
  }

  if (isExpired || !isValid) {
    return (
      <div style={{ maxWidth: '520px', margin: '40px auto', padding: '36px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.94)', border: '1.5px solid rgba(225, 29, 72, 0.3)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(225, 29, 72, 0.12)',
          border: '2px solid #e11d48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px'
        }}>
          <Clock size={32} color="#e11d48" />
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0 }}>
          {isExpired ? 'Invitation Link Expired' : 'Invalid Invitation'}
        </h2>
        <p style={{ margin: '12px 0 24px', fontSize: '0.90rem', color: '#475569', lineHeight: 1.6 }}>
          {errorMessage || 'For maximum enterprise security, invitation links expire after exactly 30 minutes. Please reach out to your administrator to request a new invite link.'}
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 28px',
            fontSize: '0.90rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Return to Stowave Home
        </button>
      </div>
    );
  }

  const minsRemaining = Math.floor((inviteData?.remainingSeconds || 1800) / 60);

  return (
    <div style={{ maxWidth: '540px', margin: '30px auto', padding: '36px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.95)', border: '1.5px solid rgba(255, 255, 255, 0.95)', boxShadow: '0 24px 60px -10px rgba(15, 23, 42, 0.12)' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'rgba(225, 29, 72, 0.12)',
          border: '1px solid rgba(225, 29, 72, 0.35)',
          color: '#be123c',
          fontSize: '0.74rem',
          fontWeight: 850,
          marginBottom: '10px'
        }}>
          <Clock size={13} />
          <span>Security Token Valid — {minsRemaining}m Remaining</span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
          Activate Your Stowave Account
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
          Invited by <strong>{inviteData?.invitedByName || 'Stowave Leadership'}</strong> as{' '}
          <span style={{ textTransform: 'uppercase', color: '#e11d48', fontWeight: 800 }}>
            {inviteData?.role === 'master_admin' ? '👑 Master Admin (Executive Director)' : inviteData?.role}
          </span>
        </p>

        {inviteData?.department && (
          <div style={{
            background: 'rgba(225, 29, 72, 0.07)',
            border: '1px solid rgba(225, 29, 72, 0.25)',
            borderRadius: '12px',
            padding: '10px 14px',
            margin: '14px 0 0',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 850, color: '#be123c', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              📋 Assigned Responsibilities & Tasks:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {inviteData.department.split(',').map((task, idx) => (
                <span key={idx} style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  border: '1px solid rgba(203, 213, 225, 0.8)'
                }}>
                  {task.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(225, 29, 72, 0.1)',
          border: '1.5px solid rgba(225, 29, 72, 0.3)',
          color: '#be123c',
          fontSize: '0.86rem',
          fontWeight: 700,
          marginBottom: '18px'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Email Locked */}
        <div>
          <label className="input-label">Verified Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input
              type="email"
              disabled
              value={inviteData?.email || ''}
              className="input-field"
              style={{ paddingLeft: '38px', background: 'rgba(241, 245, 249, 0.9)', cursor: 'not-allowed', color: '#475569' }}
            />
          </div>
        </div>

        {/* Name / Username */}
        <div>
          <label className="input-label">Full Name / Username *</label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input
              type="text"
              required
              autoFocus
              className="input-field"
              placeholder="E.g., Ali Haider or Saif Waqar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>
        </div>

        {/* Password with Generator */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="input-label" style={{ margin: 0 }}>Create Password *</label>
            <button
              type="button"
              onClick={handleGenerateStrongPassword}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(225, 29, 72, 0.12)',
                border: '1px solid rgba(225, 29, 72, 0.35)',
                color: '#be123c',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={12} />
              <span>{copiedPassword ? '✓ Copied!' : 'Generate Strong Password'}</span>
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="input-field"
              placeholder="Enter password or click Generate above"
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

          {copiedPassword && (
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#059669', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} />
              <span>Strong password generated & copied to clipboard!</span>
            </p>
          )}
        </div>

        {/* Submit */}
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
          {isSubmitting ? <RefreshCw size={18} className="spin-icon" /> : <ShieldCheck size={18} />}
          <span>{isSubmitting ? 'Activating Account...' : 'Complete Registration & Enter Workspace'}</span>
        </button>
      </form>
    </div>
  );
}

export default function InvitePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748b' }}>Loading invitation...</div>}>
        <InviteContent />
      </Suspense>
    </div>
  );
}
