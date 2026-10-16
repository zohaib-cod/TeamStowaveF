'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Database, 
  Plus, 
  CheckCircle, 
  Circle, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Server, 
  Cpu, 
  Key, 
  ArrowLeft,
  Sparkles,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface Todo {
  id: number | string;
  name: string;
  is_complete?: boolean;
  created_at?: string;
}

export default function SupabaseTodosClient({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos || []);
  const [newTodoName, setNewTodoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const supabase = createClient();

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        showStatus(`Fetch error: ${error.message}`, 'error');
      } else if (data) {
        setTodos(data);
      }
    } catch (err: any) {
      showStatus(`Unexpected error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoName.trim()) return;

    const name = newTodoName.trim();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ name, is_complete: false }])
        .select();

      if (error) {
        showStatus(`Failed to insert: ${error.message}`, 'error');
      } else if (data && data.length > 0) {
        setTodos(prev => [...prev, data[0]]);
        setNewTodoName('');
        showStatus('Todo saved directly to Supabase cloud!');
      }
    } catch (err: any) {
      showStatus(`Insert failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    const updatedStatus = !todo.is_complete;
    
    // Optimistic UI update
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_complete: updatedStatus } : t));

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: updatedStatus })
        .eq('id', todo.id);

      if (error) {
        showStatus(`Update failed: ${error.message}`, 'error');
        // Revert on error
        setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, is_complete: todo.is_complete } : t));
      } else {
        showStatus(`Status updated in Supabase!`);
      }
    } catch (err: any) {
      showStatus(`Update failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: number | string) => {
    // Optimistic UI delete
    const previous = [...todos];
    setTodos(prev => prev.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) {
        showStatus(`Delete failed: ${error.message}`, 'error');
        setTodos(previous);
      } else {
        showStatus('Deleted row from Supabase!');
      }
    } catch (err: any) {
      showStatus(`Delete failed: ${err.message}`, 'error');
      setTodos(previous);
    }
  };

  const handleSyncTeamTasks = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/tasks');
      const companyTasks = await res.json();
      
      if (Array.isArray(companyTasks) && companyTasks.length > 0) {
        const rowsToInsert = companyTasks.map(t => ({
          name: `[${t.priority.toUpperCase()}] ${t.title} (${t.status})`,
          is_complete: t.status === 'completed'
        }));

        const { data, error } = await supabase
          .from('todos')
          .insert(rowsToInsert)
          .select();

        if (error) {
          showStatus(`Sync error: ${error.message}`, 'error');
        } else {
          showStatus(`Successfully synced ${rowsToInsert.length} team tasks to Supabase!`);
          fetchTodos();
        }
      } else {
        showStatus('No company tasks available to sync.', 'error');
      }
    } catch (err: any) {
      showStatus(`Failed to sync team tasks: ${err.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.is_complete;
    if (filter === 'completed') return t.is_complete;
    return true;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'transparent',
      color: '#000000',
      padding: '40px 24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      zIndex: 1
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Status Toast */}
        {statusMsg && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '9999px',
            background: statusMsg.type === 'error' ? 'rgba(225, 29, 72, 0.96)' : 'rgba(5, 150, 105, 0.96)',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            fontSize: '0.88rem',
            fontWeight: 700,
            backdropFilter: 'blur(12px)'
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* Top Breadcrumb & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(203, 213, 225, 0.95)',
            color: '#000000',
            textDecoration: 'none',
            fontSize: '0.86rem',
            fontWeight: 750,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
          }}>
            <ArrowLeft size={16} />
            Back to Stowave Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(5, 150, 105, 0.12)',
              border: '1.5px solid rgba(5, 150, 105, 0.35)',
              color: '#047857',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
              PostgreSQL 17.11 Connected (ap-southeast-2)
            </span>
          </div>
        </div>

        {/* Header Hero */}
        <div className="glass-panel" style={{
          padding: '28px 32px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                }}>
                  <Database size={24} color="#ffffff" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.7rem', fontWeight: 850, color: '#000000', margin: 0 }}>
                    Supabase Live Data Feed & Sync
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                    Enterprise PostgreSQL Database • Project ID: <code style={{ color: '#0284c7', fontWeight: 800 }}>waokbbftfhjrhvgpigzm</code>
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={fetchTodos}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Refresh Feed
              </button>

              <button
                onClick={handleSyncTeamTasks}
                disabled={syncing}
                className="btn btn-primary"
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                <Layers size={15} />
                {syncing ? 'Syncing...' : 'Sync Team Tasks → Supabase'}
              </button>
            </div>
          </div>

          {/* Connection Details Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '24px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#000000', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                Supabase API Endpoint
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, fontFamily: 'monospace' }}>
                  waokbbftfhjrhvgpigzm.supabase.co
                </span>
                <button
                  onClick={() => copyToClipboard('https://waokbbftfhjrhvgpigzm.supabase.co', 'api')}
                  style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', padding: 2 }}
                >
                  {copiedKey === 'api' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#000000', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                Postgres Pooler (IPv4)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 700, fontFamily: 'monospace' }}>
                  aws-0-ap-southeast-2.pooler...:6543
                </span>
                <button
                  onClick={() => copyToClipboard('postgresql://postgres.waokbbftfhjrhvgpigzm:rtKvtuK.%23c%2BTWx7@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres', 'pooler')}
                  style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', padding: 2 }}
                >
                  {copiedKey === 'pooler' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.85)',
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.74rem', color: '#000000', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                Direct Connection (IPv6)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700, fontFamily: 'monospace' }}>
                  db.waokbbftfhjrhvgpigzm...:5432
                </span>
                <button
                  onClick={() => copyToClipboard('postgresql://postgres:rtKvtuK.%23c%2BTWx7@db.waokbbftfhjrhvgpigzm.supabase.co:5432/postgres', 'direct')}
                  style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', padding: 2 }}
                >
                  {copiedKey === 'direct' ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="glass-panel" style={{
          padding: '22px 28px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#000000', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#e11d48" />
            Add Live Item to Supabase
          </h2>

          <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g., Deploy production smart contracts or Schedule executive retro..."
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              disabled={loading}
              className="input-field"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !newTodoName.trim()}
              className="btn btn-emerald"
              style={{ padding: '12px 22px' }}
            >
              <Plus size={16} />
              Add to Supabase
            </button>
          </form>
        </div>

        {/* Filter Tabs & Count */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 750,
                  textTransform: 'capitalize',
                  background: filter === tab ? '#e11d48' : 'rgba(255, 255, 255, 0.8)',
                  color: filter === tab ? '#ffffff' : '#000000',
                  border: filter === tab ? 'none' : '1.5px solid var(--border-subtle)',
                  cursor: 'pointer',
                  boxShadow: filter === tab ? '0 4px 12px rgba(225, 29, 72, 0.3)' : 'none'
                }}
              >
                {tab} ({tab === 'all' ? todos.length : todos.filter(t => tab === 'active' ? !t.is_complete : t.is_complete).length})
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 750 }}>
            Total Live Rows: <strong style={{ color: '#000000', fontWeight: 900 }}>{todos.length}</strong>
          </span>
        </div>

        {/* Todos List */}
        <div className="glass-panel" style={{
          overflow: 'hidden',
          padding: '4px'
        }}>
          {filteredTodos.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div 
                    onClick={() => handleToggleComplete(todo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flex: 1,
                      cursor: 'pointer'
                    }}
                  >
                    {todo.is_complete ? (
                      <CheckCircle size={22} color="#059669" />
                    ) : (
                      <Circle size={22} color="#94a3b8" />
                    )}
                    <div>
                      <span style={{
                        fontSize: '0.94rem',
                        fontWeight: 700,
                        color: todo.is_complete ? '#64748b' : '#000000',
                        textDecoration: todo.is_complete ? 'line-through' : 'none'
                      }}>
                        {todo.name}
                      </span>
                      {todo.created_at && (
                        <div style={{ fontSize: '0.74rem', color: '#1e293b', fontWeight: 650, marginTop: '2px' }}>
                          ID: #{todo.id} • Created: {new Date(todo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${todo.is_complete ? 'badge-completed' : 'badge-progress'}`}>
                      {todo.is_complete ? 'Completed' : 'Pending'}
                    </span>

                    <button
                      onClick={() => handleDelete(todo.id)}
                      title="Delete from Supabase"
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#e11d48',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#000000' }}>
              <Database size={40} color="#059669" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#000000', margin: 0 }}>
                {filter === 'all' ? 'No items in Supabase table' : `No ${filter} items`}
              </p>
              <p style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600, marginTop: '4px' }}>
                Use the input field above to add records directly into your remote database.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
