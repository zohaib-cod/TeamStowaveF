'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import RecognitionGifts from '../../components/RecognitionGifts';

export default function RecognitionPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [shoutouts, setShoutouts] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [peerRatings, setPeerRatings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const loadRecognitionData = async () => {
    try {
      const [usersRes, shoutoutsRes, giftsRes, ratingsRes, leaderRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()),
        fetch('/api/shoutouts').then(r => r.json()),
        fetch('/api/gifts').then(r => r.json()),
        fetch('/api/peer-ratings').then(r => r.json()),
        fetch('/api/leaderboard').then(r => r.json())
      ]);

      setUsers(usersRes);
      setShoutouts(shoutoutsRes);
      setGifts(giftsRes);
      setPeerRatings(ratingsRes);
      setLeaderboard(leaderRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || usersRes.find(u => u.role === 'admin') || usersRes[0];
      setCurrentUser(activeUser);
    } catch (err) {
      console.error('Error loading recognition data:', err);
    }
  };

  useEffect(() => {
    loadRecognitionData();
  }, []);

  const handleSendShoutout = async (shoutoutData) => {
    try {
      await fetch('/api/shoutouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shoutoutData)
      });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactShoutout = async (shoutoutId, reaction) => {
    try {
      await fetch(`/api/shoutouts/${shoutoutId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction })
      });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendGift = async (giftData) => {
    try {
      await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftData)
      });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPeerRating = async (ratingData) => {
    try {
      await fetch('/api/peer-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteShoutout = async (id) => {
    try {
      await fetch(`/api/shoutouts/${id}`, { method: 'DELETE' });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGift = async (id) => {
    try {
      await fetch(`/api/gifts/${id}`, { method: 'DELETE' });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePeerRating = async (id) => {
    try {
      await fetch(`/api/peer-ratings/${id}`, { method: 'DELETE' });
      loadRecognitionData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <RecognitionGifts
        users={users}
        currentUser={currentUser}
        shoutouts={shoutouts}
        gifts={gifts}
        peerRatings={peerRatings}
        leaderboard={leaderboard}
        onSendShoutout={handleSendShoutout}
        onReactShoutout={handleReactShoutout}
        onSendGift={handleSendGift}
        onSubmitPeerRating={handleSubmitPeerRating}
        onDeleteShoutout={handleDeleteShoutout}
        onDeleteGift={handleDeleteGift}
        onDeletePeerRating={handleDeletePeerRating}
      />
    </MainLayout>
  );
}
