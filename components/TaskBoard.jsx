'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Star, 
  Check, 
  X, 
  Send, 
  Trash2, 
  LayoutGrid, 
  ListFilter,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  RotateCcw,
  Upload,
  Square,
  Sparkles,
  Download,
  Hourglass
} from 'lucide-react';
import RequestExtensionModal from './RequestExtensionModal';

export default function TaskBoard({
  tasks,
  users,
  currentUser,
  onOpenTaskModal,
  onSubmitWork,
  onUnsubmitWork,
  onReviewTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onRequestExtension,
  onReviewExtension
}) {
  const isAdmin = currentUser?.role === 'admin';
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Submit Work Modal state
  const [submittingTask, setSubmittingTask] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [actualHours, setActualHours] = useState(8);
  const [submissionImages, setSubmissionImages] = useState([]); // [{ url, name }]
  const [submissionPdfs, setSubmissionPdfs] = useState([]);     // [{ url, name, size }]
  const [submissionVoice, setSubmissionVoice] = useState(null); // { url, duration, name }
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Live Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Review Task Modal state
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('Outstanding deliverable! Approved.');
  const [reviewRating, setReviewRating] = useState(5);

  // Deadline Extension Request Modal state
  const [extendingTask, setExtendingTask] = useState(null);

  const handleRequestExtensionSubmit = async (taskId, extensionData) => {
    if (onRequestExtension) {
      await onRequestExtension(taskId, extensionData);
    } else {
      await fetch(`/api/tasks/${taskId}/request-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extensionData)
      });
      if (onUpdateTaskStatus) onUpdateTaskStatus();
    }
  };

  const handleReviewExtensionClick = async (taskId, approved) => {
    const adminNotes = approved 
      ? prompt('Extension approve karne k liye remarks (Optional):', 'Approved! Please complete deliverables on time.') 
      : prompt('Extension decline karne ki wajah:', 'Project deadline constraints.');
    if (adminNotes === null) return; // user cancelled prompt

    if (onReviewExtension) {
      await onReviewExtension(taskId, { approved, adminNotes, reviewerId: currentUser?.id });
    } else {
      await fetch(`/api/tasks/${taskId}/review-extension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved, adminNotes, reviewerId: currentUser?.id })
      });
      if (onUpdateTaskStatus) onUpdateTaskStatus();
    }
  };

  // Cleanup voice recording timer
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesMember = filterMember === 'all' || task.assignedTo === filterMember;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesMember && matchesPriority;
  });

  const columns = [
    { id: 'todo', label: 'To Do', color: '#0f172a', bgAccent: 'rgba(15, 23, 42, 0.08)' },
    { id: 'in_progress', label: 'In Progress', color: '#0284c7', bgAccent: 'rgba(2, 132, 199, 0.1)' },
    { id: 'review', label: 'In Review', color: '#7c3aed', bgAccent: 'rgba(124, 58, 237, 0.1)' },
    { id: 'completed', label: 'Completed', color: '#059669', bgAccent: 'rgba(5, 150, 105, 0.1)' }
  ];

  // Helper: Format readable timestamp (e.g. 18 Oct 2026, 04:15 PM)
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
        ' at ' + 
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Helper: Calculate turnaround difference between submit and approval
  const calculateTurnaround = (submittedAt, reviewedAt) => {
    if (!submittedAt || !reviewedAt) return null;
    try {
      const diffMs = new Date(reviewedAt).getTime() - new Date(submittedAt).getTime();
      if (diffMs <= 0) return null;
      const mins = Math.floor(diffMs / 60000);
      if (mins < 60) return `Reviewed in ${mins}m`;
      const hours = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `Reviewed in ${hours}h ${remMins}m`;
    } catch {
      return null;
    }
  };

  // Helper: Check 30-minute grace window for Delete for Everyone
  const get30MinGrace = (task) => {
    if (!task.submittedAt || task.status === 'completed') return null;
    const submittedTime = new Date(task.submittedAt).getTime();
    const elapsedMs = Date.now() - submittedTime;
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    const isWithin = elapsedMs <= THIRTY_MINUTES_MS;
    const remainingMins = Math.max(0, Math.ceil((THIRTY_MINUTES_MS - elapsedMs) / 60000));
    return { isWithin, remainingMins, elapsedMs };
  };

  // Helper: Resolve Assigner ➔ Assignee trail with avatars and full names
  const getTaskAssignment = (task) => {
    const assignee = users.find(u => u.id === task.assignedTo);

    let assigner = users.find(u => u.id === task.assignedBy);
    if (!assigner && task.assignedByName) {
      const userByName = users.find(u => u.name?.trim().toLowerCase() === task.assignedByName?.trim().toLowerCase());
      assigner = userByName || { name: task.assignedByName, avatar: '/icon.png', role: 'admin' };
    }
    if (!assigner) {
      const adminUser = users.find(u => u.role === 'admin' || u.isFirstAdmin);
      assigner = adminUser || { name: 'Admin', avatar: '/icon.png', role: 'admin' };
    }

    return {
      assigner,
      assignee: assignee || { name: 'Unassigned', avatar: '/icon.png' }
    };
  };

  const handleUnsubmitClick = (taskId, remainingMins) => {
    if (confirm(`Kya aap ye submission sab k liye delete karna chahtay hain? (${remainingMins} minute baaqi hain. Task wapis In Progress ho jaye ga.)`)) {
      if (onUnsubmitWork) {
        onUnsubmitWork(taskId);
      }
    }
  };

  const handleOpenSubmit = (task) => {
    setSubmittingTask(task);
    setSubmissionNotes(task.submissionNotes || '');
    setSubmissionLink(task.submissionLink || '');
    setActualHours(task.actualHours || task.estimatedHours || 8);
    setSubmissionImages((task.submissionImages || []).map(img => typeof img === 'string' ? { url: img, name: 'Attached Image' } : img));
    setSubmissionPdfs(task.submissionPdfs || []);
    setSubmissionVoice(task.submissionVoice ? { url: task.submissionVoice } : null);
    setUploadError(null);
  };

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
              body: JSON.stringify({ fileData: base64Audio, folder: 'task_voice_notes' })
            });
            const data = await res.json();
            setSubmissionVoice({ url: data.url || base64Audio, duration: recordingSeconds });
          } catch (err) {
            setSubmissionVoice({ url: base64Audio, duration: recordingSeconds });
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
          body: JSON.stringify({ fileData: base64, folder: 'task_images' })
        });
        const data = await res.json();
        setSubmissionImages(prev => [...prev, { url: data.url || base64, name: file.name }]);
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
          body: JSON.stringify({ fileData: base64, folder: 'task_documents' })
        });
        const data = await res.json();
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setSubmissionPdfs(prev => [...prev, { url: data.url || base64, name: file.name, size: `${sizeMb} MB` }]);
      } catch (err) {
        console.warn('PDF upload error:', err);
      }
    }
    setIsUploading(false);
    e.target.value = '';
  };

  // Audio File Fallback Handler
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
        body: JSON.stringify({ fileData: base64, folder: 'task_voice_notes' })
      });
      const data = await res.json();
      setSubmissionVoice({ url: data.url || base64, name: file.name });
    } catch (err) {
      console.warn('Audio upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!submittingTask) return;
    onSubmitWork(submittingTask.id, {
      submissionNotes,
      submissionLink,
      actualHours: Number(actualHours),
      images: submissionImages.map(img => img.url),
      pdfs: submissionPdfs,
      voiceUrl: submissionVoice?.url || '',
      submittedBy: currentUser?.id,
      submittedByName: currentUser?.name
    });
    setSubmittingTask(null);
    setSubmissionImages([]);
    setSubmissionPdfs([]);
    setSubmissionVoice(null);
  };

  const handleOpenReview = (task) => {
    setReviewingTask(task);
    setReviewFeedback(task.reviewFeedback || 'Outstanding deliverable! Approved.');
    setReviewRating(task.rating !== undefined && task.rating !== null ? task.rating : 5);
  };

  const handleConfirmReview = (status) => {
    if (!reviewingTask) return;
    onReviewTask(reviewingTask.id, {
      status, // 'completed' or 'rejected'
      reviewFeedback: reviewFeedback || (status === 'completed' ? 'Deliverable approved!' : 'Deliverable requires revision.'),
      rating: status === 'completed' ? reviewRating : null,
      reviewerId: currentUser?.id
    });
    setReviewingTask(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header & Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(36px) saturate(210%)',
        border: '1.5px solid rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '22px 28px',
        boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#030712', margin: 0, letterSpacing: '-0.02em' }}>
              Strategic Task Operations
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 550, margin: '4px 0 0' }}>
              Assign, track, submit deliverables, review, and reward completed sprint milestones.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(241, 245, 249, 0.95)', border: '1.5px solid rgba(203, 213, 225, 0.9)', borderRadius: '9999px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: viewMode === 'kanban' ? '#e11d48' : 'transparent',
                  color: viewMode === 'kanban' ? '#ffffff' : '#030712',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 750
                }}
              >
                <LayoutGrid size={15} /> Kanban
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: viewMode === 'list' ? '#e11d48' : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : '#030712',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 750
                }}
              >
                <ListFilter size={15} /> Table List
              </button>
            </div>

            {isAdmin && (
              <button 
                onClick={onOpenTaskModal} 
                style={{
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
                }}
                id="btn-assign-new-task"
              >
                <Plus size={16} /> Assign New Task
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(226, 232, 240, 0.9)',
          width: '100%'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#030712" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: '12px',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#030712',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Member Filter */}
          <div style={{ width: '100%' }}>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                fontSize: '0.86rem',
                fontWeight: 650,
                color: '#030712',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ width: '100%' }}>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid rgba(203, 213, 225, 0.9)',
                fontSize: '0.86rem',
                fontWeight: 650,
                color: '#030712',
                background: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Task View: Kanban vs Table List */}
      {viewMode === 'kanban' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '18px',
          alignItems: 'start'
        }}>
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id}
                style={{
                  padding: '20px',
                  borderRadius: '22px',
                  background: 'rgba(255, 255, 255, 0.76)',
                  backdropFilter: 'blur(32px) saturate(210%)',
                  WebkitBackdropFilter: 'blur(32px) saturate(210%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 12px 35px -6px rgba(15, 23, 42, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)',
                  minHeight: '480px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#000000' }}>
                      {col.label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.78rem',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: col.bgAccent,
                    color: col.color,
                    fontWeight: 850
                  }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards in Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colTasks.map(task => {
                    const { assigner, assignee } = getTaskAssignment(task);
                    const isMyTask = task.assignedTo === currentUser?.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.92)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          border: '1.5px solid rgba(226, 232, 240, 0.95)',
                          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Top: Priority & Due Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.72rem', fontWeight: 850 }}>
                            {task.priority?.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 800 }}>
                            Due {task.dueDate}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#000000', marginBottom: '4px' }}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 650, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Admin Task Briefing Attachments (Voice Note, Images, PDFs) */}
                        {(task.voiceUrl || (task.images && task.images.length > 0) || (task.pdfs && task.pdfs.length > 0)) && (
                          <div style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: 'rgba(241, 245, 249, 0.95)',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', fontWeight: 800, color: '#475569' }}>
                              <span>📌 Briefing & Reference Attachments:</span>
                            </div>

                            {/* Voice Briefing Audio Player */}
                            {task.voiceUrl && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(5, 150, 105, 0.08)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.25)' }}>
                                <Mic size={13} color="#059669" />
                                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#059669' }}>Voice Note:</span>
                                <audio controls src={task.voiceUrl} style={{ height: '26px', flex: 1, maxWidth: '200px' }} />
                              </div>
                            )}

                            {/* Reference Images Thumbnails */}
                            {task.images && task.images.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                {task.images.map((img, i) => {
                                  const imgUrl = typeof img === 'string' ? img : img.url;
                                  return (
                                    <a 
                                      key={i} 
                                      href={imgUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      onClick={e => e.stopPropagation()} 
                                      title="Open reference screenshot"
                                      style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                    >
                                      <img src={imgUrl} alt="Reference" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                    </a>
                                  );
                                })}
                              </div>
                            )}

                            {/* PDF Document Specs */}
                            {task.pdfs && task.pdfs.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {task.pdfs.map((pdf, i) => (
                                  <a
                                    key={i}
                                    href={pdf.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.72rem',
                                      color: '#0284c7',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      padding: '3px 6px',
                                      background: '#ffffff',
                                      borderRadius: '6px',
                                      border: '1px solid #cbd5e1'
                                    }}
                                  >
                                    <FileText size={12} color="#0284c7" />
                                    <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {pdf.name || 'Specification.pdf'}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamps, Turnaround & Attached Media Indicators */}
                        {(task.submittedAt || task.reviewedAt) && (
                          <div style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: task.status === 'completed' 
                              ? 'rgba(5, 150, 105, 0.06)' 
                              : (task.status === 'review' ? 'rgba(2, 132, 199, 0.06)' : 'rgba(241, 245, 249, 0.8)'),
                            border: '1px solid rgba(203, 213, 225, 0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            fontSize: '0.72rem'
                          }}>
                            {task.submittedAt && (
                              <div style={{ color: '#0369a1', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} />
                                <span>Submitted: {formatDateTime(task.submittedAt)}</span>
                              </div>
                            )}
                            {task.reviewedAt && task.status === 'completed' && (
                              <div style={{ color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={11} />
                                <span>Approved: {formatDateTime(task.reviewedAt)} by {task.reviewedByName || 'Admin'}</span>
                              </div>
                            )}
                            {task.reviewedAt && task.status === 'rejected' && (
                              <div style={{ color: '#b91c1c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={11} />
                                <span>Revision: {formatDateTime(task.reviewedAt)} by {task.reviewedByName || 'Admin'}</span>
                              </div>
                            )}
                            {calculateTurnaround(task.submittedAt, task.reviewedAt) && (
                              <div style={{ color: '#475569', fontWeight: 650, fontSize: '0.68rem' }}>
                                ⏱️ {calculateTurnaround(task.submittedAt, task.reviewedAt)}
                              </div>
                            )}

                            {/* Attached Media Count Badges */}
                            {(task.submissionImages?.length > 0 || task.submissionPdfs?.length > 0 || task.submissionVoice) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', paddingTop: '4px', borderTop: '1px dashed #cbd5e1' }}>
                                {task.submissionImages?.length > 0 && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#e11d48', fontWeight: 750 }}>
                                    <ImageIcon size={11} /> {task.submissionImages.length}
                                  </span>
                                )}
                                {task.submissionPdfs?.length > 0 && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#0284c7', fontWeight: 750 }}>
                                    <FileText size={11} /> {task.submissionPdfs.length} PDF
                                  </span>
                                )}
                                {task.submissionVoice && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#059669', fontWeight: 750 }}>
                                    <Mic size={11} /> Voice
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Extension Request Banner (if pending) */}
                        {task.extensionRequested && task.extensionStatus === 'pending' && (
                          <div style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1.5px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '0.74rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#b45309', fontWeight: 850, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Hourglass size={12} />
                                <span>Extra Time Requested</span>
                              </span>
                              <span style={{ color: '#0f172a', fontWeight: 850 }}>
                                New: {task.requestedDueDate} (+{task.requestedHours || 0}h)
                              </span>
                            </div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.72rem', fontStyle: 'italic' }}>
                              "{task.extensionReason || 'Need extra time'}"
                            </p>
                            {isAdmin && (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleReviewExtensionClick(task.id, true)}
                                  style={{ padding: '3px 9px', borderRadius: '6px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  ✅ Approve Ext
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewExtensionClick(task.id, false)}
                                  style={{ padding: '3px 9px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer' }}
                                >
                                  ❌ Decline
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Extension Approved indicator */}
                        {task.extensionStatus === 'approved' && (
                          <div style={{ fontSize: '0.70rem', color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} />
                            <span>Deadline extended to {task.dueDate}</span>
                          </div>
                        )}

                        {/* Assignee & Footer */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '8px',
                          borderTop: '1px solid #f1f5f9',
                          flexWrap: 'wrap',
                          gap: '6px'
                        }}>
                          {/* Assigner ➔ Assignee Flow */}
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(241, 245, 249, 0.95)',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.74rem'
                          }}>
                            {/* Assigner */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned by: ${assigner?.name || 'Admin'}`}>
                              <img
                                src={assigner?.avatar || '/icon.png'}
                                alt={assigner?.name}
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                              />
                              <span style={{ color: '#475569', fontWeight: 800 }}>
                                {assigner?.name || 'Admin'}
                              </span>
                            </div>

                            {/* Arrow */}
                            <span style={{ color: '#e11d48', fontWeight: 900, fontSize: '0.82rem', margin: '0 2px' }}>
                              ➔
                            </span>

                            {/* Assignee */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned to: ${assignee?.name || 'Member'}`}>
                              <img
                                src={assignee?.avatar || '/icon.png'}
                                alt={assignee?.name}
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                              />
                              <span style={{ color: '#0f172a', fontWeight: 850 }}>
                                {assignee?.name || 'Member'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Interactive Status / Submit Actions */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {/* Member can Request Extension */}
                            {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && task.extensionStatus !== 'pending' && (
                              <button
                                type="button"
                                onClick={() => setExtendingTask(task)}
                                style={{
                                  padding: '5px 9px',
                                  borderRadius: '999px',
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  border: '1px solid rgba(245, 158, 11, 0.35)',
                                  color: '#b45309',
                                  fontSize: '0.70rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                                title="Request extra time / deadline extension"
                              >
                                <Hourglass size={11} />
                                <span>Extra Time</span>
                              </button>
                            )}

                            {/* Member can Submit Work */}
                            {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && (
                              <button
                                onClick={() => handleOpenSubmit(task)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '999px',
                                  background: 'rgba(241, 245, 249, 0.95)',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  color: '#030712',
                                  cursor: 'pointer'
                                }}
                                title="Submit deliverables for review"
                              >
                                Submit Work
                              </button>
                            )}

                            {/* Delete for Everyone within 30 minutes */}
                            {task.status === 'review' && get30MinGrace(task)?.isWithin && (isMyTask || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleUnsubmitClick(task.id, get30MinGrace(task).remainingMins)}
                                style={{
                                  padding: '4px 9px',
                                  borderRadius: '999px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  color: '#dc2626',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Delete submission for everyone within 30 minutes"
                              >
                                <RotateCcw size={11} />
                                <span>Delete ({get30MinGrace(task).remainingMins}m left)</span>
                              </button>
                            )}

                            {/* Admin can Review work */}
                            {isAdmin && task.status === 'review' && (
                              <button
                                onClick={() => handleOpenReview(task)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '999px',
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.72rem',
                                  fontWeight: 750,
                                  cursor: 'pointer'
                                }}
                                title="Review, Grade, and Approve"
                              >
                                Review Work
                              </button>
                            )}

                            {/* Delete (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() => onDeleteTask(task.id)}
                                style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }}
                                title="Delete Task"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '36px 0', color: '#0f172a', fontSize: '0.86rem', fontWeight: 750 }}>
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table List View */
        <div style={{
          background: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(32px) saturate(210%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: '20px',
          boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.1), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.95)'
        }}>
          {/* A. Desktop Table View (visible on screen > 860px) */}
          <div className="desktop-task-table">
            <div className="task-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)', color: '#000000', fontWeight: 850 }}>
                    <th style={{ padding: '12px' }}>Task</th>
                    <th style={{ padding: '12px' }}>Priority</th>
                    <th style={{ padding: '12px' }}>Status & Timeline</th>
                    <th style={{ padding: '12px' }}>Assignment (Assigner ➔ Assignee)</th>
                    <th style={{ padding: '12px' }}>Due Date</th>
                    <th style={{ padding: '12px' }}>Est / Act</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => {
                    const { assigner, assignee } = getTaskAssignment(task);
                    const isMyTask = task.assignedTo === currentUser?.id;
                    const grace = get30MinGrace(task);

                    return (
                      <tr key={task.id} style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.85)' }}>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ fontWeight: 850, color: '#000000' }}>{task.title}</div>
                          {task.tags && task.tags.length > 0 && (
                            <div style={{ fontSize: '0.76rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                              {task.tags.join(', ')}
                            </div>
                          )}
                          {/* Attached media indicators in table */}
                          {(task.submissionImages?.length > 0 || task.submissionPdfs?.length > 0 || task.submissionVoice) && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', fontSize: '0.70rem' }}>
                              {task.submissionImages?.length > 0 && <span style={{ color: '#e11d48', fontWeight: 700 }}>📷 {task.submissionImages.length} Image(s)</span>}
                              {task.submissionPdfs?.length > 0 && <span style={{ color: '#0284c7', fontWeight: 700 }}>📄 {task.submissionPdfs.length} PDF(s)</span>}
                              {task.submissionVoice && <span style={{ color: '#059669', fontWeight: 700 }}>🎤 Voice Note</span>}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge badge-${task.priority}`} style={{ fontWeight: 850 }}>{task.priority?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`badge badge-${task.status}`} style={{ fontWeight: 800 }}>{task.status?.replace('_', ' ')}</span>
                          {task.submittedAt && (
                            <div style={{ fontSize: '0.70rem', color: '#0284c7', fontWeight: 700, marginTop: '3px' }}>
                              🕒 Sub: {formatDateTime(task.submittedAt)}
                            </div>
                          )}
                          {task.reviewedAt && (
                            <div style={{ fontSize: '0.70rem', color: task.status === 'completed' ? '#047857' : '#b91c1c', fontWeight: 700, marginTop: '2px' }}>
                              {task.status === 'completed' ? '✅' : '❌'} Rev: {formatDateTime(task.reviewedAt)}
                            </div>
                          )}
                          {task.extensionRequested && task.extensionStatus === 'pending' && (
                            <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 800, marginTop: '2px' }}>
                              ⏳ Extra Time Requested
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: 'rgba(241, 245, 249, 0.95)',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.76rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {/* Assigner */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned by: ${assigner?.name || 'Admin'}`}>
                              <img
                                src={assigner?.avatar || '/icon.png'}
                                alt={assigner?.name}
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span style={{ color: '#475569', fontWeight: 800 }}>{assigner?.name || 'Admin'}</span>
                            </div>

                            {/* Arrow */}
                            <span style={{ color: '#e11d48', fontWeight: 900, fontSize: '0.80rem', margin: '0 2px' }}>➔</span>

                            {/* Assignee */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned to: ${assignee?.name || 'Member'}`}>
                              <img
                                src={assignee?.avatar || '/icon.png'}
                                alt={assignee?.name}
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <span style={{ color: '#0f172a', fontWeight: 850 }}>{assignee?.name || 'Unassigned'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#000000', fontWeight: 800, whiteSpace: 'nowrap' }}>{task.dueDate}</td>
                        <td style={{ padding: '12px', color: '#0f172a', fontWeight: 750, whiteSpace: 'nowrap' }}>{task.estimatedHours}h / {task.actualHours || '-'}h</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                            {/* Request Extension button */}
                            {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && task.extensionStatus !== 'pending' && (
                              <button
                                type="button"
                                onClick={() => setExtendingTask(task)}
                                style={{ padding: '4px 8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#b45309', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                ⏳ Extra Time
                              </button>
                            )}
                            {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && (
                              <button onClick={() => handleOpenSubmit(task)} style={{ padding: '4px 9px', borderRadius: '8px', background: '#090d16', color: '#fff', border: 'none', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Submit
                              </button>
                            )}
                            {task.status === 'review' && grace?.isWithin && (isMyTask || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleUnsubmitClick(task.id, grace.remainingMins)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#dc2626',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  fontSize: '0.70rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Delete submission for everyone within 30 minutes"
                              >
                                Delete ({grace.remainingMins}m)
                              </button>
                            )}
                            {isAdmin && task.status === 'review' && (
                              <button onClick={() => handleOpenReview(task)} style={{ padding: '4px 9px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                Review
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => onDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }} title="Delete Task">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* B. Mobile Task Cards View (visible on screen <= 860px) */}
          <div className="mobile-task-card-list">
            {filteredTasks.map(task => {
              const { assigner, assignee } = getTaskAssignment(task);
              const isMyTask = task.assignedTo === currentUser?.id;
              const grace = get30MinGrace(task);

              return (
                <div
                  key={task.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#ffffff',
                    border: '1.5px solid rgba(226, 232, 240, 0.95)',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Top: Badges & Due Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span className={`badge badge-${task.priority}`} style={{ fontSize: '0.72rem', fontWeight: 850 }}>
                        {task.priority?.toUpperCase()}
                      </span>
                      <span className={`badge badge-${task.status}`} style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                        {task.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.80rem', color: '#000000', fontWeight: 800 }}>
                      Due {task.dueDate}
                    </span>
                  </div>

                  {/* Title & Tags */}
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#000000', margin: '0 0 3px 0' }}>
                      {task.title}
                    </h4>
                    {task.tags && task.tags.length > 0 && (
                      <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                        🏷️ {task.tags.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Assigner ➔ Assignee Trail */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 9px',
                    borderRadius: '8px',
                    background: 'rgba(241, 245, 249, 0.95)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.76rem',
                    width: 'fit-content',
                    maxWidth: '100%',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned by: ${assigner?.name || 'Admin'}`}>
                      <img
                        src={assigner?.avatar || '/icon.png'}
                        alt={assigner?.name}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ color: '#475569', fontWeight: 800 }}>{assigner?.name || 'Admin'}</span>
                    </div>
                    <span style={{ color: '#e11d48', fontWeight: 900, fontSize: '0.82rem', margin: '0 2px' }}>➔</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} title={`Assigned to: ${assignee?.name || 'Member'}`}>
                      <img
                        src={assignee?.avatar || '/icon.png'}
                        alt={assignee?.name}
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ color: '#0f172a', fontWeight: 850 }}>{assignee?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  {/* Status / Timeline Details */}
                  {(task.submittedAt || task.reviewedAt) && (
                    <div style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(241, 245, 249, 0.85)',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.72rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}>
                      {task.submittedAt && (
                        <div style={{ color: '#0369a1', fontWeight: 750 }}>
                          🕒 Submitted: {formatDateTime(task.submittedAt)}
                        </div>
                      )}
                      {task.reviewedAt && (
                        <div style={{ color: task.status === 'completed' ? '#047857' : '#b91c1c', fontWeight: 800 }}>
                          {task.status === 'completed' ? '✅ Approved' : '❌ Revision'}: {formatDateTime(task.reviewedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extension requested banner on mobile card */}
                  {task.extensionRequested && task.extensionStatus === 'pending' && (
                    <div style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.72rem', color: '#b45309', fontWeight: 800 }}>
                      ⏳ Extra Time Requested: New Due {task.requestedDueDate} (+{task.requestedHours || 0}h)
                    </div>
                  )}

                  {/* Attached media indicators */}
                  {(task.submissionImages?.length > 0 || task.submissionPdfs?.length > 0 || task.submissionVoice) && (
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.70rem' }}>
                      {task.submissionImages?.length > 0 && <span style={{ color: '#e11d48', fontWeight: 750 }}>📷 {task.submissionImages.length} Image(s)</span>}
                      {task.submissionPdfs?.length > 0 && <span style={{ color: '#0284c7', fontWeight: 750 }}>📄 {task.submissionPdfs.length} PDF(s)</span>}
                      {task.submissionVoice && <span style={{ color: '#059669', fontWeight: 750 }}>🎤 Voice Note</span>}
                    </div>
                  )}

                  {/* Footer: Hours & Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 750 }}>
                      ⏱️ {task.estimatedHours}h est / {task.actualHours || '-'}h act
                    </span>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && task.extensionStatus !== 'pending' && (
                        <button
                          type="button"
                          onClick={() => setExtendingTask(task)}
                          style={{ padding: '5px 9px', borderRadius: '999px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#b45309', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          ⏳ Extra Time
                        </button>
                      )}
                      {(isMyTask || isAdmin) && task.status !== 'completed' && task.status !== 'review' && (
                        <button
                          type="button"
                          onClick={() => handleOpenSubmit(task)}
                          style={{ padding: '5px 12px', borderRadius: '999px', background: '#090d16', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Submit Work
                        </button>
                      )}
                      {task.status === 'review' && grace?.isWithin && (isMyTask || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleUnsubmitClick(task.id, grace.remainingMins)}
                          style={{ padding: '5px 9px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.35)', fontSize: '0.70rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          <RotateCcw size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          Delete ({grace.remainingMins}m)
                        </button>
                      )}
                      {isAdmin && task.status === 'review' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(task)}
                          style={{ padding: '5px 12px', borderRadius: '999px', background: '#059669', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Review
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#0f172a', fontSize: '0.88rem', fontWeight: 750 }}>
              No tasks found matching your filters.
            </div>
          )}
        </div>
      )}

      {/* 3. Modal: Member Submits Work (Image, PDF, Voice Note, Details) */}
      {submittingTask && (
        <div className="modal-overlay" onClick={() => setSubmittingTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                  Submit Deliverables for Review
                </h3>
              </div>
              <button onClick={() => setSubmittingTask(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Task Name Box */}
            <div style={{ padding: '12px 16px', background: 'rgba(241, 245, 249, 0.95)', borderRadius: '12px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Task Deliverable</span>
              <h4 style={{ fontSize: '1.02rem', fontWeight: 850, color: '#0f172a', margin: '2px 0 0' }}>{submittingTask.title}</h4>
            </div>

            {/* Admin Briefing Attachments & Audio Instructions */}
            {(submittingTask.voiceUrl || (submittingTask.images && submittingTask.images.length > 0) || (submittingTask.pdfs && submittingTask.pdfs.length > 0)) && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(225, 29, 72, 0.04)',
                border: '1.5px solid rgba(225, 29, 72, 0.18)',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 850, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                  📋 Admin Briefing & Reference Attachments:
                </span>

                {submittingTask.voiceUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Mic size={15} color="#e11d48" />
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#e11d48' }}>Admin Voice Note:</span>
                    <audio controls src={submittingTask.voiceUrl} style={{ height: '30px', flex: 1, maxWidth: '280px' }} />
                  </div>
                )}

                {submittingTask.images && submittingTask.images.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>Reference Images:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {submittingTask.images.map((img, i) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer">
                            <img src={imgUrl} alt="Reference" style={{ width: '54px', height: '54px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {submittingTask.pdfs && submittingTask.pdfs.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>Reference Documents:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {submittingTask.pdfs.map((pdf, i) => (
                        <a key={i} href={pdf.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#0284c7', textDecoration: 'none', fontWeight: 750 }}>
                          <FileText size={14} />
                          <span>{pdf.name} {pdf.size ? `(${pdf.size})` : ''}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Submission Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Submission Notes & Summary of Work *
                </label>
                <textarea
                  required
                  rows={3}
                  value={submissionNotes}
                  onChange={e => setSubmissionNotes(e.target.value)}
                  placeholder="Kaam ki mukammal tafseelat likhein (milestones, decisions, updates)..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.86rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Multimedia Attachments Bar: Image, PDF, Voice Note */}
              <div style={{
                background: 'rgba(248, 250, 252, 0.9)',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1.5px solid rgba(226, 232, 240, 0.95)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                    📎 Attach Media (Image, PDF, Voice Note)
                  </label>
                  {isUploading && (
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800 }}>
                      ⏳ Uploading media...
                    </span>
                  )}
                </div>

                {/* Buttons Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {/* Image Attachment Button */}
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
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}>
                    <ImageIcon size={14} color="#e11d48" />
                    <span>Attach Image / Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* PDF Attachment Button */}
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
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}>
                    <FileText size={14} color="#0284c7" />
                    <span>Attach PDF Document</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={handlePdfFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Voice Note Button */}
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
                      <span>Record Voice Note</span>
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
                        cursor: 'pointer'
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

                {uploadError && (
                  <p style={{ margin: '4px 0 8px', fontSize: '0.75rem', color: '#dc2626', fontWeight: 650 }}>
                    ⚠️ {uploadError}
                  </p>
                )}

                {/* Attached Images Preview Grid */}
                {submissionImages.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>
                      Attached Images ({submissionImages.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {submissionImages.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '64px',
                            height: '64px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1.5px solid #cbd5e1'
                          }}
                        >
                          <img src={img.url} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setSubmissionImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(0,0,0,0.65)',
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
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached PDFs Preview List */}
                {submissionPdfs.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 750, color: '#64748b', marginBottom: '4px' }}>
                      Attached PDFs ({submissionPdfs.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {submissionPdfs.map((pdf, idx) => (
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} color="#0284c7" />
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{pdf.name}</span>
                            <span style={{ color: '#64748b', fontSize: '0.68rem' }}>({pdf.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubmissionPdfs(prev => prev.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '2px' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Voice Note Preview */}
                {submissionVoice && (
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
                      <audio controls src={submissionVoice.url} style={{ height: '32px', flex: 1, maxWidth: '280px' }} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubmissionVoice(null)}
                      style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '4px' }}
                      title="Remove voice note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Deliverable URL & Actual Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, color: '#030712', marginBottom: '4px' }}>
                    Deliverable URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={e => setSubmissionLink(e.target.value)}
                    placeholder="https://drive.google.com/... or Figma link"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(203, 213, 225, 0.95)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 800, color: '#030712', marginBottom: '4px' }}>
                    Actual Hours Spent
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={actualHours}
                    onChange={e => setActualHours(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(203, 213, 225, 0.95)',
                      fontSize: '0.82rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* 30-Minute Grace Reminder Alert */}
              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                fontSize: '0.74rem',
                color: '#1d4ed8',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={13} color="#2563eb" />
                <span>Submit karne k baad aap k paas <strong>30 minutes</strong> honge isay 'Delete for Everyone' karne k liye agar koi ghalti ho.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  style={{ padding: '9px 18px', borderRadius: '9999px', background: 'none', border: '1.5px solid #cbd5e1', color: '#030712', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '9999px',
                    background: '#e11d48',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
                  }}
                >
                  <Send size={15} /> {isUploading ? 'Uploading Media...' : 'Send to Admin for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Admin Reviews and Grades Work */}
      {reviewingTask && (
        <div className="modal-overlay" onClick={() => setReviewingTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(36px)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                  Admin Deliverable Review
                </h3>
              </div>
              <button onClick={() => setReviewingTask(null)} style={{ background: 'none', border: 'none', color: '#030712', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Submission Detail Card */}
            <div style={{ padding: '16px', background: 'rgba(241, 245, 249, 0.95)', borderRadius: '14px', marginBottom: '16px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#030712', marginBottom: '6px' }}>
                {reviewingTask.title}
              </h4>

              {/* Exact Submission Timestamp & Submitter */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                {reviewingTask.submittedAt && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', padding: '3px 8px', borderRadius: '6px' }}>
                    <Clock size={12} />
                    <span>Submitted: {formatDateTime(reviewingTask.submittedAt)}</span>
                  </span>
                )}
                {get30MinGrace(reviewingTask)?.isWithin && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.12)', color: '#b45309', padding: '3px 8px', borderRadius: '6px' }}>
                    <span>⏳ 30m Grace Window: {get30MinGrace(reviewingTask).remainingMins}m left</span>
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 550, marginBottom: '8px', lineHeight: 1.45 }}>
                <strong>Member Notes:</strong> {reviewingTask.submissionNotes || 'No notes attached.'}
              </p>

              {reviewingTask.submissionLink && (
                <div style={{ marginBottom: '8px' }}>
                  <a href={reviewingTask.submissionLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.84rem', color: '#be123c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>🔗 Open Deliverable URL</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Attached Images */}
              {reviewingTask.submissionImages && reviewingTask.submissionImages.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>Attached Images ({reviewingTask.submissionImages.length}):</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                    {reviewingTask.submissionImages.map((imgUrl, i) => (
                      <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                        <img
                          src={imgUrl}
                          alt={`Submission ${i + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached PDFs */}
              {reviewingTask.submissionPdfs && reviewingTask.submissionPdfs.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>Attached PDFs ({reviewingTask.submissionPdfs.length}):</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {reviewingTask.submissionPdfs.map((pdf, i) => (
                      <a
                        key={i}
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0284c7',
                          fontSize: '0.76rem',
                          fontWeight: 750,
                          textDecoration: 'none'
                        }}
                      >
                        <FileText size={13} color="#0284c7" />
                        <span>{pdf.name || 'PDF Document'}</span>
                        <Download size={11} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Voice Note */}
              {reviewingTask.submissionVoice && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>🎤 Member Voice Note:</span>
                  <div style={{ marginTop: '4px' }}>
                    <audio controls src={reviewingTask.submissionVoice} style={{ width: '100%', height: '36px' }} />
                  </div>
                </div>
              )}

              {/* Original Task Briefing & Voice Instructions from Admin */}
              {(reviewingTask.voiceUrl || (reviewingTask.images && reviewingTask.images.length > 0) || (reviewingTask.pdfs && reviewingTask.pdfs.length > 0)) && (
                <div style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(225, 29, 72, 0.04)',
                  border: '1.5px solid rgba(225, 29, 72, 0.18)'
                }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 850, color: '#e11d48', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    📌 Original Task Briefing & Reference Assets:
                  </span>
                  {reviewingTask.voiceUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Mic size={14} color="#e11d48" />
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#e11d48' }}>Admin Voice:</span>
                      <audio controls src={reviewingTask.voiceUrl} style={{ height: '28px', flex: 1, maxWidth: '260px' }} />
                    </div>
                  )}
                  {reviewingTask.images && reviewingTask.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      {reviewingTask.images.map((img, i) => {
                        const imgUrl = typeof img === 'string' ? img : img.url;
                        return (
                          <a key={i} href={imgUrl} target="_blank" rel="noopener noreferrer">
                            <img src={imgUrl} alt="Ref" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                  {reviewingTask.pdfs && reviewingTask.pdfs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {reviewingTask.pdfs.map((pdf, i) => (
                        <a key={i} href={pdf.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>
                          <FileText size={13} />
                          <span>{pdf.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Rating & Review Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#030712', margin: 0 }}>
                    Deliverable Rating (Optional)
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>
                    {reviewRating ? `⭐ ${reviewRating} / 5 Stars (+${reviewRating * 20} pts)` : 'No rating selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setReviewRating(null)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '10px',
                      background: reviewRating === null ? 'rgba(15, 23, 42, 0.1)' : 'rgba(241, 245, 249, 0.9)',
                      border: reviewRating === null ? '1.5px solid #0f172a' : '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 750
                    }}
                  >
                    No Rating
                  </button>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '10px',
                        background: star === reviewRating ? 'rgba(251, 191, 36, 0.25)' : 'rgba(241, 245, 249, 0.9)',
                        border: star === reviewRating ? '1.5px solid #d97706' : '1.5px solid #cbd5e1',
                        color: star === reviewRating ? '#b45309' : '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 800
                      }}
                    >
                      <Star size={15} fill={star <= (reviewRating || 0) ? '#d97706' : 'none'} color="#d97706" />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#030712', marginBottom: '6px' }}>
                  Review Notes / Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  placeholder="State the reason for rejection/revision or write praise for approval (dispatched via email)..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(203, 213, 225, 0.95)',
                    fontSize: '0.88rem',
                    color: '#030712',
                    fontWeight: 550,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Notice */}
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.74rem', color: '#b45309', fontWeight: 650 }}>
                ✉️ An automated email notification will be dispatched to the contributor informing them of your decision and comments.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleConfirmReview('rejected')}
                  style={{ padding: '10px 18px', borderRadius: '9999px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Reject and send email with rejection reason"
                >
                  <X size={15} /> Reject / Request Revision
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmReview('completed')}
                  style={{ padding: '10px 22px', borderRadius: '9999px', background: '#059669', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Approve and send approval email"
                >
                  <Check size={15} /> Approve Task {reviewRating ? `(+${reviewRating * 20} pts)` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Member Requests Deadline Extension */}
      <RequestExtensionModal
        isOpen={Boolean(extendingTask)}
        onClose={() => setExtendingTask(null)}
        task={extendingTask}
        currentUser={currentUser}
        onRequestExtension={handleRequestExtensionSubmit}
      />
    </div>
  );
}
