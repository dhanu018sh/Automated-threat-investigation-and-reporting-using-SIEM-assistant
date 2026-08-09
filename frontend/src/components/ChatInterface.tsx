import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Zap, ShieldAlert, Cpu, Loader2 } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChatStore } from '../store/chatStore';
import MessageBubble from './MessageBubble';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const { activeConversationId, messages, isLoading } = useChatStore();
  const { sendMessage } = useWebSocket(activeConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = messages[activeConversationId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;
    sendMessage(text);
    if (!textToSend) setInput('');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface-color)', position: 'relative' }}>
      
      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {currentMessages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80%', opacity: 0.9 }} className="animate-fade-in">
            <Cpu size={64} className="text-gradient glow-cyan" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>How can I help you investigate?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', textAlign: 'center', maxWidth: '600px' }}>
              Ask natural language questions to query SIEM logs, correlate events across platforms, or trigger automated DAG playbooks.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '850px' }}>
              {[
                { icon: Terminal, text: "Investigate brute force from 192.168.1.100" },
                { icon: ShieldAlert, text: "Show phishing attempts last 24h" },
                { icon: Zap, text: "Run malware playbook for hash d41d8cd98f00b204e9800998ecf8427e" },
                { icon: Terminal, text: "Analyze lateral movement from WS-FINANCE-01" }
              ].map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(q.text)} 
                  style={{ 
                    background: 'var(--panel-bg)', 
                    color: 'var(--text-primary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '24px',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <q.icon size={16} className="text-gradient" /> {q.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {currentMessages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)', padding: '1rem', background: 'var(--panel-bg)', borderRadius: '12px', width: 'fit-content' }}>
                <Loader2 size={20} className="animate-spin" />
                <span>SIEM Assistant is analyzing logs & running playbooks...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Bar */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--panel-bg)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a query (e.g. 'Investigate brute force from IP 10.0.0.5')..."
            style={{ flex: 1, padding: '1rem 1.5rem', fontSize: '1rem', borderRadius: '30px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}
          />
          <button 
            className="primary" 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()} 
            style={{ borderRadius: '50%', width: '54px', height: '54px', padding: 0, flexShrink: 0 }}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
