'use client';
import React, { useEffect } from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ImageLightboxModal({ isOpen, onClose, imageUrl, title, subtitle }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Top Control Bar */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          padding: '0 4px'
        }}>
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 900, letterSpacing: '-0.01em' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '0.80rem', color: '#cbd5e1', fontWeight: 600 }}>
                {subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              title="Open full size image in new tab"
            >
              <ExternalLink size={17} />
            </a>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(225, 29, 72, 0.85)',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)'
              }}
              title="Close viewer (ESC)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* High-Resolution Photo Container */}
        <div style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65)',
          border: '2px solid rgba(255, 255, 255, 0.22)',
          background: '#090d16',
          maxHeight: '78vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={imageUrl}
            alt={title || 'Profile Photo'}
            style={{
              maxWidth: '100%',
              maxHeight: '78vh',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
}
