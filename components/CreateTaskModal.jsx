'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Mic, 
  Square, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function CreateTaskModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onCreateTask
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(users?.[0]?.id || '');
  const [priority, setPriority] = useState('urgent');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [tags, setTags] = useState('Strategic, Q4-Milestone');

  // Media attachments state
  const [taskImages, setTaskImages] = useState([]); // [{ url, name }]
  const [taskPdfs, setTaskPdfs] = useState([]);     // [{ url, name, size }]
  const [taskVoice, setTaskVoice] = useState(null); // { url, duration, name }
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Live Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Synchronize initial assignedTo if users change
  useEffect(() => {
    if (!assignedTo && users?.length > 0) {
      setAssignedTo(users[0].id);
    }
  }, [users, assignedTo]);

  // Cleanup voice recording timer and stream on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  // Live Voice Recording Handlers
  const startVoiceRecording = async () => {
    try {
      setUploadError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          setIsUploading(true);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileData: base64Audio, folder: 'task_briefing_voice' })
            });
            const data = await res.json();
            setTaskVoice({ url: data.url || base64Audio, duration: recordingSeconds });
          } catch (err) {
            setTaskVoice({ url: base64Audio, duration: recordingSeconds });
          } finally {
            setIsUploading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      setUploadError('Microphone permission darkar hai voice note record karne k liye.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  // Audio File Upload Fallback
  const handleAudioFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64, folder: 'task_briefing_voice' })
      });
      const data = await res.json();
      setTaskVoice({ url: data.url || base64, duration: null, name: file.name });
    } catch (err) {
      console.warn('Audio upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    for (const file of files) {
      try {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: base64, folder: 'task_briefing_images' })
        });
        const data = await res.json();
        setTaskImages(prev => [...prev, { url: data.url || base64, name: file.name }]);
      } catch (err) {
        console.warn('Image upload error:', err);
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };

  // PDF Upload Handler
  const handlePdfFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    for (const file of files) {
      try {
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData: base64, folder: 'task_briefing_documents' })
        });
        const data = await res.json();
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setTaskPdfs(prev => [...prev, { url: data.url || base64, name: file.name, size: `${sizeMb} MB` }]);
      } catch (err) {
        console.warn('PDF upload error:', err);
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const handleClose = () => {
    if (isRecording) stopVoiceRecording();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUploading) return;
    if (isRecording) stopVoiceRecording();

    onCreateTask({
      title,
      description,
      assignedTo: assignedTo || users?.[0]?.id,
      assignedBy: currentUser?.id || 'usr_admin_1',
      assignedByName: currentUser?.name || 'Administrator',
      priority,
      dueDate,
      estimatedHours: Number(estimatedHours),
      tags: tags ? tags.split(',').map(t => t.trim()) : ['General'],
      images: taskImages.map(img => img.url),
      pdfs: taskPdfs,
      voiceUrl: taskVoice?.url || '',
      attachments: [
        ...taskImages, 
        ...taskPdfs, 
        ...(taskVoice ? [{ type: 'voice', url: taskVoice.url }] : [])
      ]
    });

    onClose();
    setTitle('');
    setDescription('');
    setTags('Strategic, Q4-Milestone');
    setTaskImages([]);
    setTaskPdfs([]);
    setTaskVoice(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(36px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}>
              <Plus size={18} strokeWidth={2.8} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
                Assign Strategic Task
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>
                Brief team members with deliverables, reference docs & voice notes
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleClose} 
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              color: '#475569', 
              cursor: 'pointer',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Task Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
              Task Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Deploy High-Conversion Product Landing Page"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                borderRadius: '12px', 
                border: '1.5px solid #cbd5e1', 
                fontSize: '0.88rem', 
                color: '#030712', 
                fontWeight: 600, 
                outline: 'none', 
                boxSizing: 'border-box' 
              }}
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
              Detailed Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State exact deliverables, target metrics, and expected quality standards..."
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                borderRadius: '12px', 
                border: '1.5px solid #cbd5e1', 
                fontSize: '0.88rem', 
                color: '#030712', 
                fontWeight: 550, 
                outline: 'none', 
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* MULTIMEDIA ATTACHMENTS (Images, PDFs, Live Voice Recording) */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9))',
            borderRadius: '16px',
            padding: '14px 16px',
            border: '1.5px dashed rgba(203, 213, 225, 0.95)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  📎 Attach Task Briefing Media (Images, PDFs & Voice Note)
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  Assignee ko reference screenshots, PDF briefs ya voice recording provide karein
                </span>
              </div>
              {isUploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#e11d48', fontWeight: 700 }}>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Uploading media...</span>
                </div>
              )}
            </div>

            {/* Action Buttons for Media */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {/* Image Upload Button */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 750,
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <ImageIcon size={14} color="#e11d48" />
                <span>Add Images / Screenshots</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {/* PDF Document Upload Button */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 750,
                color: '#1e293b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                <FileText size={14} color="#0284c7" />
                <span>Add PDF Briefs</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handlePdfFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Voice Note Recording Controls */}
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 750,
                    color: '#059669',
                    cursor: 'pointer'
                  }}
                >
                  <Mic size={14} color="#059669" />
                  <span>Record Voice Briefing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    background: '#ef4444',
                    border: 'none',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: 'pointer',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  <Square size={13} fill="#ffffff" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              {/* Audio File Upload Fallback */}
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.76rem',
                fontWeight: 750,
                color: '#475569',
                cursor: 'pointer'
              }}>
                <Paperclip size={13} />
                <span>Upload Audio File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 8px', fontSize: '0.75rem', color: '#dc2626', fontWeight: 650 }}>
                <AlertCircle size={13} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Attached Images Preview Grid */}
            {taskImages.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>
                  Attached Reference Images ({taskImages.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {taskImages.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1.5px solid #cbd5e1',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}
                    >
                      <img src={img.url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => setTaskImages(prev => prev.filter((_, i) => i !== idx))}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Remove image"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached PDFs Preview List */}
            {taskPdfs.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>
                  Attached PDF Documents ({taskPdfs.length}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {taskPdfs.map((pdf, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.76rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <FileText size={14} color="#0284c7" />
                        <span style={{ fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                          {pdf.name}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.68rem' }}>({pdf.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTaskPdfs(prev => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }}
                        title="Remove PDF"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Voice Note Preview */}
            {taskVoice && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(5, 150, 105, 0.08)',
                border: '1.5px solid rgba(5, 150, 105, 0.3)',
                marginTop: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <Mic size={16} color="#059669" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#059669' }}>Voice Briefing:</span>
                  <audio controls src={taskVoice.url} style={{ height: '32px', flex: 1, maxWidth: '280px' }} />
                </div>
                <button
                  type="button"
                  onClick={() => setTaskVoice(null)}
                  style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                  title="Remove voice note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Assignee & Priority Level */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Assignee *
              </label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '11px 14px', 
                  borderRadius: '12px', 
                  border: '1.5px solid #cbd5e1', 
                  fontSize: '0.88rem', 
                  color: '#030712', 
                  fontWeight: 650, 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }}
              >
                {users?.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title || u.role})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '11px 14px', 
                  borderRadius: '12px', 
                  border: '1.5px solid #cbd5e1', 
                  fontSize: '0.88rem', 
                  color: '#030712', 
                  fontWeight: 650, 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Hours */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Deadline Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '11px 14px', 
                  borderRadius: '12px', 
                  border: '1.5px solid #cbd5e1', 
                  fontSize: '0.88rem', 
                  color: '#030712', 
                  fontWeight: 600, 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '11px 14px', 
                  borderRadius: '12px', 
                  border: '1.5px solid #cbd5e1', 
                  fontSize: '0.88rem', 
                  color: '#030712', 
                  fontWeight: 600, 
                  outline: 'none', 
                  boxSizing: 'border-box' 
                }}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Design, Sprint, High-ROI"
              style={{ 
                width: '100%', 
                padding: '11px 14px', 
                borderRadius: '12px', 
                border: '1.5px solid #cbd5e1', 
                fontSize: '0.88rem', 
                color: '#030712', 
                fontWeight: 600, 
                outline: 'none', 
                boxSizing: 'border-box' 
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button 
              type="button" 
              onClick={handleClose} 
              style={{ 
                padding: '10px 22px', 
                borderRadius: '9999px', 
                background: 'none', 
                border: '1.5px solid #cbd5e1', 
                color: '#030712', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              style={{ 
                padding: '10px 26px', 
                borderRadius: '9999px', 
                background: isUploading ? '#94a3b8' : '#e11d48', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 800, 
                cursor: isUploading ? 'not-allowed' : 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: isUploading ? 'none' : '0 4px 14px rgba(225, 29, 72, 0.35)',
                transition: 'all 0.2s'
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading Media...</span>
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Assign Deliverable</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
