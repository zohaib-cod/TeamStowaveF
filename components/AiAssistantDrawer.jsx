'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  Sparkles, 
  Globe, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Upload, 
  Image as ImageIcon 
} from 'lucide-react';

export default function AiAssistantDrawer({
  isOpen,
  onClose,
  currentUser,
  stats,
  tasks,
  users
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Salam **${currentUser?.name?.split(' ')[0] || 'Executive'}**! I am your Stowave AI Strategic Advisor.\n\nI have complete real-time access to our company's team metrics, ${tasks.length} active tasks, standup reports, social command center, and feedback pulses.\n\nHow can I empower your leadership today? You can **speak to me via voice**, **turn on your live camera to show documents/code**, or **ask for real-time market trends**!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTrends, setSearchTrends] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Voice recording state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Camera / Vision state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Text-To-Speech function
  const speakText = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Voice Listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Toggle Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setCapturedImage(null);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Could not access camera. Please check camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Snapshot from Camera
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Send message or vision request
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !capturedImage) || isLoading) return;

    const userMsg = inputText.trim() || (capturedImage ? 'Please analyze this live visual snapshot.' : '');
    const currentImage = capturedImage;

    // Reset inputs
    setInputText('');
    setCapturedImage(null);

    // Append to message stream
    const newMessages = [...messages, {
      role: 'user',
      content: userMsg,
      image: currentImage
    }];
    setMessages(newMessages);
    setIsLoading(true);
    stopSpeaking();

    try {
      if (currentImage) {
        // Send to Vision API
        const response = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImage,
            prompt: userMsg
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const reply = data.reply;
        setMessages([...newMessages, { role: 'assistant', content: reply, model: data.model }]);
        speakText(reply);
      } else {
        // Send to Chat API with Live context & Trends
        const history = newMessages.slice(-5).map(m => ({ role: m.role, content: m.content }));
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMsg,
            history,
            searchTrends
          })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const reply = data.reply;
        setMessages([...newMessages, { role: 'assistant', content: reply, model: data.model }]);
        speakText(reply);
      }
    } catch (err) {
      console.error('AI Request error:', err);
      setMessages([...newMessages, {
        role: 'assistant',
        content: `⚠️ **Advisory Notice:** Encountered connection error: ${err.message}. Please check API network status.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle local file upload (e.g. diagram/screenshot)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '560px',
      backgroundColor: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(40px) saturate(210%)',
      WebkitBackdropFilter: 'blur(40px) saturate(210%)',
      borderLeft: '1.5px solid rgba(255, 255, 255, 0.95)',
      boxShadow: '-15px 0 50px rgba(15, 23, 42, 0.15)',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* 1. Drawer Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1.5px solid rgba(226, 232, 240, 0.95)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 850, color: '#000000', margin: 0 }}>Stowave AI Strategic Advisor</h3>
              <span className="badge badge-completed" style={{ fontSize: '0.64rem' }}>Online & Multi-Modal</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#1e293b', fontWeight: 650, margin: '2px 0 0' }}>
              Live Company Context • Voice Recognition • Vision Inspection • Trends Radar
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* TTS Mute Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setTtsEnabled(!ttsEnabled);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: ttsEnabled ? '#059669' : '#64748b',
              cursor: 'pointer',
              padding: '6px'
            }}
            title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Close Drawer */}
          <button
            onClick={() => {
              stopCamera();
              stopSpeaking();
              onClose();
            }}
            style={{
              background: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              borderRadius: '50%',
              color: '#000000',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Top Controls & Mode Toggles */}
      <div style={{
        padding: '11px 22px',
        background: 'rgba(241, 245, 249, 0.85)',
        borderBottom: '1.5px solid rgba(226, 232, 240, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Real-time Trend Search Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: searchTrends ? '#0284c7' : '#000000', fontWeight: 750, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={searchTrends}
            onChange={e => setSearchTrends(e.target.checked)}
            style={{ accentColor: '#0284c7' }}
          />
          <Globe size={14} />
          <span>Real-time Live Trends Search</span>
        </label>

        {/* Camera Toggle */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              <Camera size={13} /> Show on Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="btn btn-rose"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              <CameraOff size={13} /> Close Camera
            </button>
          )}
        </div>
      </div>

      {/* 3. Live Camera Viewport (When active) */}
      {isCameraActive && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '12px',
              border: '2px solid #059669',
              boxShadow: '0 0 20px rgba(5, 150, 105, 0.4)'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <button
            onClick={captureSnapshot}
            className="btn btn-emerald"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            📸 Capture & Send to AI Vision
          </button>
        </div>
      )}

      {/* 4. Captured Image Preview (if pending send) */}
      {capturedImage && (
        <div style={{
          padding: '12px 20px',
          background: 'rgba(5, 150, 105, 0.08)',
          borderBottom: '1.5px solid rgba(5, 150, 105, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={capturedImage} alt="Captured preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#047857' }}>Snapshot Ready</span>
              <p style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 600, margin: 0 }}>Will be analyzed by AI Vision models</p>
            </div>
          </div>
          <button onClick={() => setCapturedImage(null)} style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 5. Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{
                padding: '14px 18px',
                borderRadius: '16px',
                background: isUser ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' : '#ffffff',
                color: isUser ? '#ffffff' : '#000000',
                fontWeight: isUser ? 650 : 600,
                border: isUser ? 'none' : '1.5px solid rgba(226, 232, 240, 0.95)',
                boxShadow: isUser ? '0 4px 16px rgba(225, 29, 72, 0.3)' : '0 4px 16px rgba(15, 23, 42, 0.05)',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {m.image && (
                  <img
                    src={m.image}
                    alt="User snapshot"
                    style={{
                      width: '100%',
                      maxHeight: '220px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      border: '1px solid rgba(226, 232, 240, 0.9)'
                    }}
                  />
                )}
                {m.content}
              </div>

              {!isUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#1e293b', fontWeight: 650 }}>
                    Powered by {m.model || 'Groq Multi-Modal'}
                  </span>
                  <button
                    onClick={() => speakText(m.content)}
                    style={{ background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 750 }}
                    title="Speak answer"
                  >
                    🔊 Read Aloud
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '14px', background: '#ffffff', border: '1.5px solid rgba(226, 232, 240, 0.95)', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
            <RefreshCw size={16} className="spin" color="#e11d48" />
            <span style={{ fontSize: '0.84rem', color: '#000000', fontWeight: 700 }}>
              Formulating strategic advice...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 6. Input Form with Voice & Attachments */}
      <form onSubmit={handleSend} style={{
        padding: '16px 20px',
        borderTop: '1.5px solid rgba(226, 232, 240, 0.95)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {isListening && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#be123c',
            fontWeight: 750
          }}>
            <span className="pulse-dot" style={{ background: '#e11d48', boxShadow: '0 0 8px #e11d48' }} />
            Listening to your voice... Speak now!
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* File upload hidden input */}
          <label style={{ cursor: 'pointer', padding: '8px', color: '#000000', display: 'flex', alignItems: 'center' }} title="Attach screenshot or diagram">
            <Upload size={18} />
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1.5px solid rgba(203, 213, 225, 0.9)',
              background: isListening ? '#e11d48' : 'rgba(241, 245, 249, 0.9)',
              color: isListening ? '#ffffff' : '#000000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isListening ? '0 0 14px rgba(225, 29, 72, 0.5)' : 'none'
            }}
            title={isListening ? 'Stop listening' : 'Speak to AI'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={capturedImage ? 'Type prompt for this snapshot...' : 'Ask about tasks, strategy, or 2026 trends...'}
            className="input-field"
            style={{ flex: 1, color: '#000000', fontWeight: 600 }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !capturedImage)}
            className="btn btn-primary"
            style={{ padding: '10px 16px', borderRadius: '12px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
