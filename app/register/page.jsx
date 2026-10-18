'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Briefcase,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Executive Leadership',
    title: 'Primary Administrator & Director',
    phone: '+92 329 0010909'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePassword = async () => {
    try {
      const res = await fetch('/api/auth/generate-password');
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, password: data.password }));
        setShowPassword(true);
        navigator.clipboard.writeText(data.password);
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2500);
      }
    } catch (e) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
      let autoPwd = '';
      for (let i = 0; i < 16; i++) autoPwd += chars.charAt(Math.floor(Math.random() * chars.length));
      setFormData(prev => ({ ...prev, password: autoPwd }));
      setShowPassword(true);
      navigator.clipboard.writeText(autoPwd);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize account.');
      }

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        padding: '38px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 24px 60px -10px rgba(15, 23, 42, 0.12)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.35)'
          }}>
            <Crown size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
            Initialize Real Admin Account
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
            Create your primary administrative profile with full operational command.
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label className="input-label">Full Name / Username *</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                required
                className="input-field"
                placeholder="E.g., Ali Zohaib"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="input-label">Admin Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="alizohaib.web@gmail.com or your official email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Password with Generator */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Password *</label>
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
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  cursor: 'pointer'
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
                placeholder="Choose password or click Generate above"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '38px', paddingRight: '40px', fontFamily: showPassword ? 'monospace' : 'inherit' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Title & Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-grid-2">
            <div>
              <label className="input-label">Executive Title</label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label className="input-label">Contact Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
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
              marginTop: '10px'
            }}
          >
            {isLoading ? <RefreshCw size={18} className="spin-icon" /> : <ShieldCheck size={18} />}
            <span>{isLoading ? 'Creating Admin Account...' : 'Register as Primary Admin & Enter'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
