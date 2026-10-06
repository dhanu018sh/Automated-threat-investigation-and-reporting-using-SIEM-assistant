import React from 'react';
import { Shield, LayoutDashboard, MessageSquare, AlertTriangle, FileText, User, PlusCircle, LogOut, RotateCcw, Trash2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import { useReportStore } from '../store/reportStore';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const { conversations, activeConversationId, setActiveConversation, newConversation, clearAllChats, deleteConversation } = useChatStore();
  const { clearAllReports } = useReportStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleNewChat = () => {
    const id = newConversation();
    setActiveConversation(id);
    navigate('/chat');
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all chat history, investigation reports, and start fresh?')) {
      clearAllChats();
      clearAllReports();
      localStorage.clear();
      window.location.href = '/chat';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="glass-panel" style={{ width: '280px', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', borderRadius: '0', flexShrink: 0 }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <Shield size={32} className="text-gradient glow-cyan" />
        <div>
          <h2 style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.2 }}>SIEM Assistant</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>v1.0.0 SOC Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <NavLink to="/" end style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
          background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
          fontWeight: isActive ? 600 : 400
        })}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        
        <NavLink to="/chat" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
          background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
          fontWeight: isActive ? 600 : 400
        })}>
          <MessageSquare size={20} /> Copilot Chat
        </NavLink>
        
        <NavLink to="/investigations" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
          background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
          fontWeight: isActive ? 600 : 400
        })}>
          <AlertTriangle size={20} /> Investigations
        </NavLink>
        
        <NavLink to="/reports" style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px',
          background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
          borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
          fontWeight: isActive ? 600 : 400
        })}>
          <FileText size={20} /> Reports
        </NavLink>
      </nav>

      {/* Recent Chats Section */}
      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Sessions</h4>
          <button 
            onClick={handleNewChat}
            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', gap: '0.3rem', borderRadius: '6px' }}
          >
            <PlusCircle size={14} /> New Chat
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {conversations.map((c) => (
            <div 
              key={c.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.85rem', 
                borderRadius: '6px', 
                background: activeConversationId === c.id ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                color: activeConversationId === c.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                borderLeft: activeConversationId === c.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              }}
            >
              <div 
                onClick={() => {
                  setActiveConversation(c.id);
                  navigate('/chat');
                }}
                style={{
                  cursor: 'pointer',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginRight: '0.5rem'
                }}
              >
                💬 {c.title}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
                title="Delete Session"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.7,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ff4757'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Fresh Start Button */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <button
          onClick={handleResetAll}
          style={{
            width: '100%', padding: '0.5rem', fontSize: '0.8rem',
            background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
            color: '#ff4757', borderRadius: '6px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          }}
        >
          <RotateCcw size={14} /> Reset All & Start Fresh
        </button>
      </div>

      {/* User Footer */}
      <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
          SIEM Live Inspector Active
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-secondary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user?.username || 'analyst'}</div>
              <div className="badge medium" style={{ fontSize: '0.65rem', display: 'inline-block', marginTop: '0.15rem' }}>
                {user?.role === 'soc_manager' ? 'SOC Manager' : 'Analyst'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            title="Logout" 
            style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.4rem', borderRadius: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
