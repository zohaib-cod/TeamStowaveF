'use client';
import React, { useState } from 'react';
import { 
  Award, 
  Gift, 
  Flame, 
  Heart, 
  ThumbsUp, 
  Star, 
  Send, 
  Trophy, 
  Coffee, 
  Sparkles, 
  Plus, 
  X, 
  UserCheck,
  Trash2,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RecognitionGifts({
  users = [],
  currentUser,
  shoutouts = [],
  gifts = [],
  peerRatings = [],
  leaderboard = [],
  onSendShoutout,
  onReactShoutout,
  onSendGift,
  onSubmitPeerRating,
  onDeleteShoutout,
  onDeleteGift,
  onDeletePeerRating
}) {
  const [activeSubTab, setActiveSubTab] = useState('kudos'); // 'kudos' | 'gifting' | 'rating' | 'leaderboard'

  // Modals state
  const [showShoutoutModal, setShowShoutoutModal] = useState(false);
  const [shoutoutTo, setShoutoutTo] = useState(users[1]?.id || users[0]?.id || '');
  const [shoutoutMessage, setShoutoutMessage] = useState('');
  const [shoutoutCategory, setShoutoutCategory] = useState('rockstar');

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftTo, setGiftTo] = useState(users[1]?.id || users[0]?.id || '');
  const [giftType, setGiftType] = useState('trophy');
  const [giftPoints, setGiftPoints] = useState(100);
  const [giftNote, setGiftNote] = useState('');

  const [showRateModal, setShowRateModal] = useState(false);
  const [rateTo, setRateTo] = useState(users[1]?.id || users[0]?.id || '');
  const [rateComment, setRateComment] = useState('');
  const [rateCriteria, setRateCriteria] = useState({
    collaboration: 5,
    skill: 5,
    communication: 5,
    reliability: 5
  });

  const availableGifts = [
    { id: 'trophy', title: 'Executive MVP Award', points: 250, desc: 'Highest leadership & performance honor', icon: Trophy, color: '#d97706' },
    { id: 'coffee', title: 'Artisan Coffee Voucher', points: 50, desc: 'Energize a colleague after deep work', icon: Coffee, color: '#b45309' },
    { id: 'gift_card', title: 'Amazon Rewards Voucher', points: 500, desc: 'Tangible gift voucher allocation', icon: Gift, color: '#e11d48' },
    { id: 'badge_mvp', title: 'Super Team Player Badge', points: 100, desc: 'Celebrate stellar peer collaboration', icon: Award, color: '#0284c7' }
  ];

  const handleConfirmShoutout = (e) => {
    e.preventDefault();
    if (!shoutoutTo || !shoutoutMessage) return;

    onSendShoutout({
      fromUserId: currentUser?.id,
      toUserId: shoutoutTo,
      message: shoutoutMessage,
      category: shoutoutCategory
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setShowShoutoutModal(false);
    setShoutoutMessage('');
  };

  const handleConfirmGift = (e) => {
    e.preventDefault();
    if (!giftTo) return;

    const selectedGift = availableGifts.find(g => g.id === giftType);
    onSendGift({
      fromUserId: currentUser?.id,
      toUserId: giftTo,
      giftType,
      title: selectedGift?.title || 'Gift',
      points: giftPoints,
      personalNote: giftNote
    });

    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    setShowGiftModal(false);
    setGiftNote('');
  };

  const handleConfirmRate = (e) => {
    e.preventDefault();
    if (!rateTo) return;

    onSubmitPeerRating({
      fromUserId: currentUser?.id,
      toUserId: rateTo,
      criteria: rateCriteria,
      comment: rateComment
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setShowRateModal(false);
    setRateComment('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header Hero Card with Liquid Glass */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.08)', color: '#e11d48' }}>
                <Sparkles size={13} /> Stowave Recognition
              </span>
              <span className="badge badge-completed">
                <Award size={13} /> Points & Rewards Live
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
              Kudos Wall, Peer Ratings & Corporate Gifting
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '650px' }}>
              Recognize peer excellence, send appreciation gifts with wallet points, evaluate collaboration across 4 criteria, and climb the company leaderboard.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowRateModal(true)} 
              className="btn btn-secondary"
              id="btn-rate-peer"
            >
              <Star size={15} color="#d97706" /> Rate a Colleague
            </button>
            <button 
              onClick={() => setShowGiftModal(true)} 
              className="btn btn-secondary"
              id="btn-send-gift"
            >
              <Gift size={15} color="#e11d48" /> Send a Gift
            </button>
            <button 
              onClick={() => setShowShoutoutModal(true)} 
              className="btn btn-primary"
              id="btn-post-kudos"
            >
              <Sparkles size={15} /> Post Kudos / Shout-Out
            </button>
          </div>
        </div>

        {/* Floating Sub Navigation Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'kudos', label: 'Public Kudos Wall', icon: Sparkles, count: shoutouts.length },
            { id: 'gifting', label: 'Gift Exchanges', icon: Gift, count: gifts.length },
            { id: 'rating', label: 'Peer Reviews & Ratings', icon: Star, count: peerRatings.length },
            { id: 'leaderboard', label: 'Company Leaderboard', icon: Trophy, count: leaderboard.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 850 : 750,
                  background: isActive ? '#e11d48' : 'rgba(255, 255, 255, 0.88)',
                  color: isActive ? '#ffffff' : '#000000',
                  border: isActive ? '1.5px solid #e11d48' : '1.5px solid #cbd5e1',
                  boxShadow: isActive ? '0 4px 14px rgba(225, 29, 72, 0.35)' : '0 2px 6px rgba(15, 23, 42, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease'
                }}
              >
                <Icon size={14} color={isActive ? '#ffffff' : '#000000'} />
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: isActive ? '#ffffff' : 'rgba(225, 29, 72, 0.15)',
                  color: isActive ? '#e11d48' : '#9f1239',
                  fontWeight: 850
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sub Tab Views */}
      {/* A. Kudos Wall */}
      {activeSubTab === 'kudos' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '18px'
        }}>
          {shoutouts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '56px 24px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(225, 29, 72, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#e11d48'
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#000000', marginBottom: '6px' }}>
                No Kudos Posted Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, maxWidth: '420px', margin: '0 auto 20px' }}>
                Celebrate peer accomplishments! Be the first to recognize a colleague for outstanding teamwork.
              </p>
              <button onClick={() => setShowShoutoutModal(true)} className="btn btn-primary">
                <Sparkles size={16} /> Post First Shout-Out
              </button>
            </div>
          ) : (
            shoutouts.map(sh => {
              const fromUser = users.find(u => u.id === sh.fromUserId);
              const toUser = users.find(u => u.id === sh.toUserId);
              const fromName = fromUser?.name || 'Admin';
              const toName = toUser?.name || 'Team Member';

              return (
                <div 
                  key={sh.id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Header: Avatars & Direction */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                          src={fromUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                          alt={fromName} 
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e11d48' }} 
                        />
                        <span style={{ margin: '0 6px', color: '#000000', fontWeight: 800, fontSize: '0.85rem' }}>→</span>
                        <img 
                          src={toUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'} 
                          alt={toName} 
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #059669' }} 
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 850, color: '#000000' }}>
                          {fromName.split(' ')[0]} to {toName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#1e293b', fontWeight: 700 }}>
                          {new Date(sh.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.12)', color: '#be123c', border: '1.5px solid rgba(225, 29, 72, 0.3)', fontSize: '0.72rem', fontWeight: 800 }}>
                        #{sh.category}
                      </span>
                      {onDeleteShoutout && (
                        <button
                          onClick={() => onDeleteShoutout(sh.id)}
                          title="Delete Kudos"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e11d48',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '6px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <p style={{
                    fontSize: '0.92rem',
                    color: '#1e293b',
                    lineHeight: 1.5,
                    padding: '12px 14px',
                    background: 'rgba(241, 245, 249, 0.7)',
                    borderRadius: '12px',
                    borderLeft: '3px solid #e11d48',
                    margin: 0
                  }}>
                    "{sh.message}"
                  </p>

                  {/* Soft Reaction Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '4px'
                  }}>
                    <button
                      onClick={() => onReactShoutout(sh.id, 'claps')}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '5px' }}
                    >
                      <ThumbsUp size={13} color="#0284c7" />
                      <span>{sh.reactions?.claps || 0}</span>
                    </button>
                    <button
                      onClick={() => onReactShoutout(sh.id, 'hearts')}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '5px' }}
                    >
                      <Heart size={13} color="#e11d48" />
                      <span>{sh.reactions?.hearts || 0}</span>
                    </button>
                    <button
                      onClick={() => onReactShoutout(sh.id, 'fire')}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '5px' }}
                    >
                      <Flame size={13} color="#d97706" />
                      <span>{sh.reactions?.fire || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* B. Gift Exchanges */}
      {activeSubTab === 'gifting' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '18px'
        }}>
          {gifts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '56px 24px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(225, 29, 72, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#e11d48'
              }}>
                <Gift size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#000000', marginBottom: '6px' }}>
                No Gifts Exchanged Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, maxWidth: '420px', margin: '0 auto 20px' }}>
                Reward your colleagues! Send coffee boosts, MVP badges, or points vouchers to celebrate outstanding deliverables.
              </p>
              <button onClick={() => setShowGiftModal(true)} className="btn btn-primary">
                <Gift size={16} /> Send First Gift
              </button>
            </div>
          ) : (
            gifts.map(g => {
              const fromUser = users.find(u => u.id === g.fromUserId);
              const toUser = users.find(u => u.id === g.toUserId);
              const fromName = fromUser?.name || 'Admin';
              const toName = toUser?.name || 'Team Member';

              return (
                <div 
                  key={g.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift size={18} color="#e11d48" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#000000', margin: 0 }}>
                        {g.title}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-completed">
                        +{g.points} pts
                      </span>
                      {onDeleteGift && (
                        <button
                          onClick={() => onDeleteGift(g.id)}
                          title="Delete Gift"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e11d48',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>
                    "{g.personalNote}"
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    fontWeight: 700
                  }}>
                    <span>From: <strong style={{ color: '#000000' }}>{fromName}</strong></span>
                    <span>Recipient: <strong style={{ color: '#000000' }}>{toName}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* C. Peer Reviews & Ratings */}
      {activeSubTab === 'rating' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '18px'
        }}>
          {peerRatings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '56px 24px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(217, 119, 6, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#d97706'
              }}>
                <Star size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#000000', marginBottom: '6px' }}>
                No Peer Reviews Yet
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, maxWidth: '420px', margin: '0 auto 20px' }}>
                Foster a continuous feedback culture! Evaluate colleagues across collaboration, technical skills, and communication.
              </p>
              <button onClick={() => setShowRateModal(true)} className="btn btn-secondary">
                <Star size={16} color="#d97706" /> Rate a Colleague
              </button>
            </div>
          ) : (
            peerRatings.map(r => {
              const fromUser = users.find(u => u.id === r.fromUserId);
              const toUser = users.find(u => u.id === r.toUserId);
              const fromName = fromUser?.name || 'Admin';
              const toName = toUser?.name || 'Team Member';

              return (
                <div 
                  key={r.id}
                  className="glass-panel"
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#000000' }}>
                      {fromName.split(' ')[0]} reviewed {toName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#b45309', border: '1.5px solid rgba(217, 119, 6, 0.35)', fontWeight: 800 }}>
                        ⭐ {r.overallScore} / 5
                      </span>
                      {onDeletePeerRating && (
                        <button
                          onClick={() => onDeletePeerRating(r.id)}
                          title="Delete Rating"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e11d48',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 600, margin: 0 }}>
                    "{r.comment}"
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: '#0f172a',
                    fontWeight: 700,
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}>
                    <span>Collaboration: {r.criteria?.collaboration || 5}/5</span>
                    <span>Technical Skill: {r.criteria?.skill || 5}/5</span>
                    <span>Communication: {r.criteria?.communication || 5}/5</span>
                    <span>Reliability: {r.criteria?.reliability || 5}/5</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* D. Leaderboard */}
      {activeSubTab === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#000000', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#d97706" /> Top Performers & Points Ranking
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboard.map((item, index) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: index === 0 ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                  border: index === 0 ? '1.5px solid rgba(225, 29, 72, 0.35)' : '1.5px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 850,
                    width: '24px',
                    color: index === 0 ? '#e11d48' : '#000000'
                  }}>
                    #{index + 1}
                  </span>
                  <img 
                    src={item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                    alt={item.name}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 850, color: '#000000' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 650 }}>
                      {item.title} • {item.department}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: 850, color: '#e11d48' }}>
                      {item.points} pts
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#0f172a', fontWeight: 700 }}>
                      {item.completedTasks} tasks • ⭐ {item.averageRating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals: Shoutout Modal */}
      {showShoutoutModal && (
        <div className="modal-overlay" onClick={() => setShowShoutoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Post Public Kudos / Shout-Out
              </h3>
              <button onClick={() => setShowShoutoutModal(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmShoutout} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Recipient</label>
                <select
                  value={shoutoutTo}
                  onChange={(e) => setShoutoutTo(e.target.value)}
                  className="select-field"
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Badge Category</label>
                <select
                  value={shoutoutCategory}
                  onChange={(e) => setShoutoutCategory(e.target.value)}
                  className="select-field"
                >
                  <option value="rockstar">Rockstar Delivery</option>
                  <option value="innovation">Breakthrough Innovation</option>
                  <option value="problem_solver">Problem Solver</option>
                  <option value="teamwork">Great Teamwork</option>
                </select>
              </div>

              <div>
                <label className="input-label">Your Message</label>
                <textarea
                  value={shoutoutMessage}
                  onChange={(e) => setShoutoutMessage(e.target.value)}
                  placeholder="e.g., Thank you for optimizing our checkout pipeline and delivering incredible work!"
                  className="textarea-field"
                  rows={4}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowShoutoutModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={16} /> Post Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals: Gift Modal */}
      {showGiftModal && (
        <div className="modal-overlay" onClick={() => setShowGiftModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Send Appreciation Gift
              </h3>
              <button onClick={() => setShowGiftModal(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmGift} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Colleague</label>
                <select
                  value={giftTo}
                  onChange={(e) => setGiftTo(e.target.value)}
                  className="select-field"
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Select Gift Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {availableGifts.map(g => {
                    const Icon = g.icon;
                    const isSel = giftType === g.id;
                    return (
                      <div
                        key={g.id}
                        onClick={() => { setGiftType(g.id); setGiftPoints(g.points); }}
                        style={{
                          padding: '12px',
                          borderRadius: '12px',
                          border: isSel ? '2px solid #e11d48' : '1px solid var(--border-subtle)',
                          background: isSel ? 'rgba(225, 29, 72, 0.05)' : 'rgba(241, 245, 249, 0.6)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Icon size={16} color={g.color} />
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{g.title}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#e11d48', fontWeight: 700 }}>
                          {g.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="input-label">Personal Note</label>
                <textarea
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Add a kind note of appreciation..."
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowGiftModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Gift size={16} /> Send Gift ({giftPoints} pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals: Rate Modal */}
      {showRateModal && (
        <div className="modal-overlay" onClick={() => setShowRateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Rate a Colleague
              </h3>
              <button onClick={() => setShowRateModal(false)} className="btn-icon">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmRate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Select Colleague</label>
                <select
                  value={rateTo}
                  onChange={(e) => setRateTo(e.target.value)}
                  className="select-field"
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {Object.keys(rateCriteria).map(k => (
                  <div key={k}>
                    <label className="input-label" style={{ textTransform: 'capitalize' }}>
                      {k}: {rateCriteria[k]} / 5
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={rateCriteria[k]}
                      onChange={(e) => setRateCriteria({ ...rateCriteria, [k]: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#e11d48' }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="input-label">Written Feedback / Commendation</label>
                <textarea
                  value={rateComment}
                  onChange={(e) => setRateComment(e.target.value)}
                  placeholder="Highlight key strengths and collaborative impact..."
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowRateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Star size={16} /> Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
