'use client';
import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Camera, 
  ShieldCheck, 
  X, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Phone,
  Briefcase,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileModal({ isOpen, onClose, currentUser, onUserUpdated }) {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
    title: currentUser?.title || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || ''
  });

  // Gallery File Upload
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessNote, setUploadSuccessNote] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Step 1: 'edit' | Step 2: 'otp_verification' | Step 3: 'success'
  const [step, setStep] = useState('edit');
  const [updateId, setUpdateId] = useState(null);
  const [otp, setOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    setUploadSuccessNote('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      // Instant local preview
      setFormData(prev => ({ ...prev, avatar: base64Data }));
      setUploadSuccessNote('Photo loaded from gallery!');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: base64Data, folder: 'stowave_avatars' })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setFormData(prev => ({ ...prev, avatar: data.url }));
          setUploadSuccessNote('Photo uploaded & synced to cloud!');
        }
      } catch (err) {
        console.warn('Fallback to local base64 preview:', err);
      } finally {
        setIsUploadingImage(false);
        setTimeout(() => setUploadSuccessNote(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/profile/request-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          ...formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request profile update OTP.');
      }

      setUpdateId(data.updateId);
      setTargetEmail(data.targetEmail);
      setStep('otp_verification');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/profile/verify-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateId,
          otp: otp.trim(),
          userId: currentUser?.id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired OTP code.');
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessMessage('Profile verified and updated successfully!');
      setStep('success');

      if (onUserUpdated && data.user) {
        onUserUpdated(data.user);
      }

      setTimeout(() => {
        onClose();
        setStep('edit');
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!updateId) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message || 'New OTP has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', padding: '26px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(225, 29, 72, 0.12)',
              border: '1.5px solid rgba(225, 29, 72, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={22} color="#e11d48" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>
                {step === 'otp_verification' ? 'Security OTP Verification' : 'Contributor Profile Settings'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>
                {step === 'otp_verification' ? `Enter code sent to ${targetEmail}` : 'Updates require email OTP verification.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
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

        {/* STEP 1: EDIT FORM */}
        {step === 'edit' && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar & Gallery Upload Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(241, 245, 249, 0.7)',
              border: '1.5px solid rgba(203, 213, 225, 0.85)'
            }}>
              {/* Hidden Gallery File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
              />

              {/* Avatar Circle with Camera Overlay */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Click to select photo from gallery / computer"
              >
                <img
                  src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt="Avatar"
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2.5px solid #e11d48',
                    display: 'block',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: '#e11d48',
                  color: '#ffffff',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  <Camera size={12} />
                </div>
              </div>

              {/* Upload Action & Alternate URL Input */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <label className="input-label" style={{ fontSize: '0.80rem', margin: 0, fontWeight: 800, color: '#0f172a' }}>
                    Profile Photo
                  </label>
                  {uploadSuccessNote && (
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={12} /> {uploadSuccessNote}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Gallery Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.80rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isUploadingImage ? (
                      <RefreshCw size={13} className="spin-icon" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span>{isUploadingImage ? 'Uploading Photo...' : '📁 Gallery Sy Photo Upload Karein'}</span>
                  </button>

                  {/* Toggle for manual URL */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 12px',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      border: '1.5px solid rgba(203, 213, 225, 0.9)',
                      color: '#475569',
                      fontSize: '0.76rem',
                      fontWeight: 750,
                      cursor: 'pointer'
                    }}
                  >
                    <LinkIcon size={12} />
                    <span>{showUrlInput ? 'Hide URL' : 'Or Paste URL'}</span>
                  </button>
                </div>

                {/* Collapsible Photo URL Field */}
                {showUrlInput && (
                  <div style={{ marginTop: '4px' }}>
                    <input
                      type="url"
                      className="input-field"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      style={{ fontSize: '0.80rem', padding: '7px 10px' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-grid-2">
              <div>
                <label className="input-label">Full Name / Username *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </div>

            {/* Title & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-grid-2">
              <div>
                <label className="input-label">Professional Role / Title</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <input
                    type="text"
                    className="input-field"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="E.g., Senior Operations Lead"
                    style={{ paddingLeft: '36px' }}
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
                    placeholder="+92 300 0000000"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="input-label">Bio & Focus Areas</label>
              <textarea
                className="textarea-field"
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Operational priorities, department focus..."
              />
            </div>

            {/* Security Notice Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontSize: '0.78rem',
              color: '#b45309',
              fontWeight: 700
            }}>
              <ShieldCheck size={16} color="#d97706" />
              <span>For security, submitting changes will dispatch a 6-digit OTP to your registered email.</span>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                style={{ padding: '10px 18px', borderRadius: '9999px', fontWeight: 700 }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '11px 26px',
                  fontSize: '0.90rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(225, 29, 72, 0.35)'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <KeyRound size={16} />}
                <span>{isLoading ? 'Sending OTP...' : 'Send OTP & Verify'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 'otp_verification' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{ padding: '16px 0' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(225, 29, 72, 0.12)',
                border: '2px solid rgba(225, 29, 72, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}>
                <KeyRound size={28} color="#e11d48" />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#030712' }}>
                Enter 6-Digit Verification Code
              </h4>
              <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#475569', fontWeight: 650 }}>
                We've sent a one-time password to <strong>{targetEmail}</strong>. Valid for 10 minutes.
              </p>
            </div>

            {/* OTP Input */}
            <div style={{ maxWidth: '320px', margin: '0 auto', width: '100%' }}>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '10px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  border: '2px solid #e11d48',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 0 0 4px rgba(225, 29, 72, 0.15)',
                  outline: 'none',
                  color: '#000000'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Didn't receive code? Resend OTP
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setStep('edit')}
                className="btn-ghost"
                style={{ padding: '10px 18px', borderRadius: '9999px', fontWeight: 700 }}
              >
                Back to Edit
              </button>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '11px 28px',
                  fontSize: '0.90rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(5, 150, 105, 0.35)'
                }}
              >
                {isLoading ? <RefreshCw size={16} className="spin-icon" /> : <CheckCircle2 size={16} />}
                <span>Verify & Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.15)',
              border: '2px solid #059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={36} color="#059669" />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>
              {successMessage}
            </h4>
            <p style={{ margin: '8px 0 0', fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
              All identity credentials have been updated securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
