'use client';
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import { 
  FolderKanban, 
  Plus, 
  Share2, 
  Globe, 
  MessageSquare, 
  PhoneCall, 
  CreditCard, 
  History, 
  CheckSquare, 
  Presentation, 
  FileText, 
  Palette, 
  Eye, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  X, 
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

const ICON_MAP = {
  Share2,
  Globe,
  MessageSquare,
  PhoneCall,
  CreditCard,
  History,
  CheckSquare,
  Presentation,
  FileText,
  Palette,
  Eye,
  ShieldAlert
};

export default function OperationsPage() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Create Task Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: 'social_media',
    assignedTo: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    documentUrl: '',
    checklistText: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, tasksRes, usersRes] = await Promise.all([
        fetch('/api/departments/categories').then(r => r.json()),
        fetch('/api/departments/tasks').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ]);

      setCategories(catsRes);
      setTasks(tasksRes);
      setUsers(usersRes);

      const savedUserId = localStorage.getItem('apex_current_user_id');
      const activeUser = usersRes.find(u => u.id === savedUserId) || null;
      setCurrentUser(activeUser);

      if (usersRes.length > 0 && !formData.assignedTo) {
        setFormData(prev => ({ ...prev, assignedTo: usersRes[0].id }));
      }
    } catch (err) {
      console.error('Error loading operations data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const checklistItems = formData.checklistText
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/departments/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assignedBy: currentUser?.id,
          checklist: checklistItems
        })
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setFormData({
          title: '',
          description: '',
          departmentId: 'social_media',
          assignedTo: users[0]?.id || '',
          priority: 'medium',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          documentUrl: '',
          checklistText: ''
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchTemplate = async (deptId, workflowId) => {
    try {
      const res = await fetch('/api/departments/launch-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: deptId,
          workflowId,
          assignedTo: currentUser?.id,
          assignedBy: currentUser?.id
        })
      });

      if (res.ok) {
        loadData();
        alert('Notebook operational procedure launched successfully as an active task!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleChecklist = async (taskId, checklistIndex, currentVal) => {
    try {
      const res = await fetch(`/api/departments/tasks/${taskId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistIndex,
          completed: !currentVal
        })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            const updatedChecklist = [...t.checklist];
            updatedChecklist[checklistIndex].completed = !currentVal;
            return { ...t, checklist: updatedChecklist };
          }
          return t;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesDept = selectedDept === 'all' || task.departmentId === selectedDept;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.departmentName && task.departmentName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
        {/* 1. Header Banner */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.90)',
          backdropFilter: 'blur(36px) saturate(210%)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 14px 40px -8px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(225, 29, 72, 0.35)'
              }}>
                <FolderKanban size={26} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#030712', margin: 0 }}>
                    Stowave Department Workflows & Tasks
                  </h1>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(225, 29, 72, 0.12)',
                    color: '#be123c',
                    fontWeight: 850
                  }}>
                    Notebook Operational Matrix
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: '#475569', fontWeight: 600, margin: '4px 0 0' }}>
                  Direct operational mapping: Social Media, Accounts (JazzCash/SadaPay), Record Keeping (Ali Haider), Approvals (Saif Waqar).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  fontSize: '0.88rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(225, 29, 72, 0.35)'
                }}
              >
                <Plus size={16} />
                <span>+ Upload Department Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Department Category Selector Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => setSelectedDept('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: selectedDept === 'all' ? 850 : 700,
              background: selectedDept === 'all' ? '#e11d48' : 'rgba(255, 255, 255, 0.85)',
              color: selectedDept === 'all' ? '#ffffff' : '#0f172a',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedDept === 'all' ? '0 4px 14px rgba(225, 29, 72, 0.35)' : 'none',
              transition: 'all 0.16s ease'
            }}
          >
            <span>All Departments</span>
            <span style={{
              fontSize: '0.70rem',
              padding: '1px 6px',
              borderRadius: '999px',
              background: selectedDept === 'all' ? '#ffffff' : 'rgba(203, 213, 225, 0.6)',
              color: selectedDept === 'all' ? '#e11d48' : '#0f172a'
            }}>
              {tasks.length}
            </span>
          </button>

          {categories.map(dept => {
            const Icon = ICON_MAP[dept.icon] || FolderKanban;
            const isSelected = selectedDept === dept.id;
            const deptTaskCount = tasks.filter(t => t.departmentId === dept.id).length;

            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 850 : 700,
                  background: isSelected ? dept.color : 'rgba(255, 255, 255, 0.85)',
                  color: isSelected ? '#ffffff' : '#0f172a',
                  border: '1.5px solid rgba(255, 255, 255, 0.95)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? `0 4px 14px ${dept.color}55` : 'none',
                  transition: 'all 0.16s ease'
                }}
              >
                <Icon size={14} color={isSelected ? '#ffffff' : dept.color} />
                <span>{dept.name}</span>
                {deptTaskCount > 0 && (
                  <span style={{
                    fontSize: '0.70rem',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isSelected ? '#ffffff' : dept.bg,
                    color: isSelected ? dept.color : dept.color,
                    fontWeight: 800
                  }}>
                    {deptTaskCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Operational Workflow Templates (Notebook Rapid Launchers) */}
        {selectedDept !== 'all' && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
          }}>
            {(() => {
              const activeCategory = categories.find(c => c.id === selectedDept);
              if (!activeCategory) return null;
              const Icon = ICON_MAP[activeCategory.icon] || FolderKanban;

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: activeCategory.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={activeCategory.color} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#030712' }}>
                          {activeCategory.name}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 650 }}>
                          Lead Point: <strong>{activeCategory.lead}</strong> • {activeCategory.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchTemplate(activeCategory.id, activeCategory.workflows[0]?.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: activeCategory.bg,
                        color: activeCategory.color,
                        border: `1.5px solid ${activeCategory.color}55`,
                        borderRadius: '9999px',
                        padding: '7px 16px',
                        fontSize: '0.80rem',
                        fontWeight: 850,
                        cursor: 'pointer'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>⚡ 1-Click Launch Notebook Workflow</span>
                    </button>
                  </div>

                  {/* Checklist preview */}
                  {activeCategory.workflows[0]?.checklist && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(241, 245, 249, 0.6)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(203, 213, 225, 0.6)' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569' }}>Workflow Micro-Steps:</span>
                      {activeCategory.workflows[0].checklist.map((step, idx) => (
                        <span key={idx} style={{
                          fontSize: '0.74rem',
                          background: '#ffffff',
                          border: '1px solid rgba(203, 213, 225, 0.8)',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          color: '#0f172a',
                          fontWeight: 650
                        }}>
                          {idx + 1}. {step}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* 4. Search and Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search department tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', padding: '9px 12px 9px 38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'todo', 'in_progress', 'review', 'completed', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.76rem',
                  fontWeight: filterStatus === st ? 850 : 650,
                  background: filterStatus === st ? '#0f172a' : 'rgba(255, 255, 255, 0.85)',
                  color: filterStatus === st ? '#ffffff' : '#475569',
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Department Task Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '18px'
        }} className="responsive-grid-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => {
              const deptDef = categories.find(c => c.id === task.departmentId);
              const assignee = users.find(u => u.id === task.assignedTo);
              const completedChecklistCount = (task.checklist || []).filter(c => c.completed).length;
              const totalChecklistCount = (task.checklist || []).length;

              return (
                <div
                  key={task.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.90)',
                    border: '1.5px solid rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.16s ease'
                  }}
                >
                  <div>
                    {/* Top Tag Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 850,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: deptDef ? deptDef.bg : 'rgba(225, 29, 72, 0.1)',
                        color: deptDef ? deptDef.color : '#e11d48'
                      }}>
                        {task.departmentName || deptDef?.name || 'Department Ops'}
                      </span>

                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '999px',
                        background: task.status === 'completed' ? 'rgba(5, 150, 105, 0.15)' :
                          task.status === 'review' ? 'rgba(124, 58, 237, 0.15)' :
                          task.status === 'rejected' ? 'rgba(225, 29, 72, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                        color: task.status === 'completed' ? '#059669' :
                          task.status === 'review' ? '#7c3aed' :
                          task.status === 'rejected' ? '#e11d48' : '#0284c7',
                        textTransform: 'uppercase'
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 850, color: '#030712', lineHeight: 1.35 }}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p style={{ margin: '0 0 12px', fontSize: '0.80rem', color: '#475569', lineHeight: 1.5 }}>
                        {task.description}
                      </p>
                    )}

                    {/* Document URL / Link if provided */}
                    {task.documentUrl && (
                      <div style={{ marginBottom: '12px' }}>
                        <a
                          href={task.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#0284c7',
                            fontSize: '0.76rem',
                            fontWeight: 750,
                            textDecoration: 'none'
                          }}
                        >
                          <LinkIcon size={12} />
                          <span>View Document Proof / File</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {/* Checklist Items */}
                    {totalChecklistCount > 0 && (
                      <div style={{ marginTop: '10px', background: 'rgba(241, 245, 249, 0.7)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(203, 213, 225, 0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}>
                            Operational Checklist ({completedChecklistCount}/{totalChecklistCount})
                          </span>
                          <span style={{ fontSize: '0.70rem', color: '#059669', fontWeight: 800 }}>
                            {Math.round((completedChecklistCount / totalChecklistCount) * 100)}%
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {task.checklist.map((item, cIdx) => (
                            <label
                              key={item.id || cIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.76rem',
                                color: item.completed ? '#64748b' : '#0f172a',
                                textDecoration: item.completed ? 'line-through' : 'none',
                                cursor: 'pointer',
                                fontWeight: 650
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={!!item.completed}
                                onChange={() => handleToggleChecklist(task.id, cIdx, item.completed)}
                                style={{ accentColor: '#e11d48', cursor: 'pointer' }}
                              />
                              <span>{item.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta */}
                  <div style={{ borderTop: '1px solid rgba(203, 213, 225, 0.6)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <img
                        src={assignee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                        alt={assignee?.name}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.76rem', fontWeight: 750, color: '#334155' }}>
                        {assignee?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      <Clock size={12} />
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 20px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '20px', border: '1.5px solid rgba(203, 213, 225, 0.7)' }}>
              <FolderKanban size={38} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>No Department Tasks Found</h3>
              <p style={{ margin: '6px 0 16px', fontSize: '0.84rem', color: '#64748b' }}>
                Use "+ Upload Department Task" or click "⚡ 1-Click Launch" above to instantiate notebook workflows.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 20px', borderRadius: '9999px', fontSize: '0.84rem' }}
              >
                + Create Task Now
              </button>
            </div>
          )}
        </div>

        {/* 6. Upload / Create Task Modal */}
        {isCreateModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '620px', padding: '26px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(225, 29, 72, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Plus size={22} color="#e11d48" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#030712' }}>
                      Upload & Assign Department Task
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>
                      Mappable to notebook workflows, document verification, and team assignees.
                    </p>
                  </div>
                </div>

                <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="input-label">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Ali Haider: Dual Format Hard & Soft Invoicing Synchronization"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-grid-2">
                  <div>
                    <label className="input-label">Department / Notebook Category</label>
                    <select
                      className="select-field"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Assigned Team Member</label>
                    <select
                      className="select-field"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-grid-2">
                  <div>
                    <label className="input-label">Priority Level</label>
                    <select
                      className="select-field"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent / Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="input-label">Deliverable Due Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Document Proof / Google Drive / File URL</label>
                  <div style={{ position: 'relative' }}>
                    <LinkIcon size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/... or cloud document link"
                      value={formData.documentUrl}
                      onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Operational Checklist (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Step 1: Check document accuracy&#10;Step 2: Dual 2-person verification&#10;Step 3: Executive sign-off"
                    value={formData.checklistText}
                    onChange={(e) => setFormData({ ...formData, checklistText: e.target.value })}
                    className="textarea-field"
                  />
                </div>

                <div>
                  <label className="input-label">Detailed Description & Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Specific execution notes, criteria, or constraints..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="textarea-field"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-ghost"
                    style={{ padding: '10px 20px', borderRadius: '9999px', fontWeight: 700 }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
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
                    {isSubmitting ? <RefreshCw size={16} className="spin-icon" /> : <Plus size={16} />}
                    <span>{isSubmitting ? 'Uploading...' : 'Save & Assign Task'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
