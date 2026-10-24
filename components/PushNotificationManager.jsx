'use client';
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Register Service Worker
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // Check if existing push subscription exists
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true);
            syncSubscriptionToBackend(sub);
          } else if (Notification.permission === 'granted') {
            subscribeUserToPush(reg);
          } else if (Notification.permission === 'default') {
            const dismissed = sessionStorage.getItem('push_prompt_dismissed');
            if (!dismissed) {
              setTimeout(() => setShowPromptBanner(true), 2500);
            }
          }
        });
      }).catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }, []);

  const syncSubscriptionToBackend = async (sub) => {
    try {
      const activeUserId = localStorage.getItem('apex_current_user_id') || 'usr_anonymous';
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          userId: activeUserId,
          userAgent: navigator.userAgent
        })
      });
    } catch (e) {
      console.warn('Failed to sync push subscription to backend:', e);
    }
  };

  const subscribeUserToPush = async (swReg) => {
    try {
      const keyRes = await fetch('/api/push/public-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) return;

      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      const reg = swReg || (await navigator.serviceWorker.ready);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setIsSubscribed(true);
      setPermission(Notification.permission);
      setShowPromptBanner(false);
      await syncSubscriptionToBackend(sub);
      setStatusMessage('Device notifications enabled!');
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.warn('Push subscription failed:', err);
    }
  };

  const handleEnableClick = async () => {
    if (!isSupported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        await subscribeUserToPush(reg);
      } else {
        setShowPromptBanner(false);
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  const handleDismiss = () => {
    setShowPromptBanner(false);
    sessionStorage.setItem('push_prompt_dismissed', 'true');
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Toast Notification when Push is activated */}
      {statusMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.82rem',
          fontWeight: 800,
          boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(255,255,255,0.2)'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Floating Permission Request Banner for Active Team Members */}
      {showPromptBanner && permission === 'default' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          maxWidth: '420px',
          zIndex: 99998,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '18px 20px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.16)',
          border: '1.5px solid rgba(225, 29, 72, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(225, 29, 72, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48'
              }}>
                <Bell size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 850, fontSize: '0.88rem', color: '#0f172a' }}>
                  Enable Instant Device Push
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  (پورٹل بند ہونے پر بھی موبائل اور کمپیوٹر پر نوٹیفیکیشن حاصل کریں)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, fontWeight: 600 }}>
            Receive native background notifications whenever new tasks are assigned, announcements posted, or deliverables approved — even when this tab is closed.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 750,
                cursor: 'pointer'
              }}
            >
              Later
            </button>
            <button
              type="button"
              onClick={handleEnableClick}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 850,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
              }}
            >
              🔔 Enable Notifications
            </button>
          </div>
        </div>
      )}
    </>
  );
}
