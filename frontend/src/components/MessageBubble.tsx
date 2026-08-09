import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, WSEvent } from '../types';
import QueryViewer from './QueryViewer';
import PlaybookProgress from './PlaybookProgress';
import ApprovalModal from './ApprovalModal';
import EnrichmentCard from './EnrichmentCard';
import RandomForestCard from './RandomForestCard';
import { Shield, User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const formatTime = (ts: string | Date) => {
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
};

const EventRenderer: React.FC<{ event: WSEvent }> = ({ event }) => {
  if (event.type === 'query_generated') {
    return (
      <QueryViewer
        query={event.query || ''}
        platform={event.platform || 'mock'}
        executionTimeMs={event.execution_time_ms}
      />
    );
  }

  if (event.type === 'query_result') {
    return (
      <div style={{
        background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: '8px',
        padding: '8px 12px',
        marginTop: '8px',
        fontSize: '13px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}>
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>📊 {event.total_hits} events found</span>
        {event.execution_time_ms && (
          <span style={{ color: 'var(--text-secondary)' }}>{event.execution_time_ms.toFixed(0)}ms</span>
        )}
      </div>
    );
  }

  if (event.type === 'playbook_matched' || event.type === 'playbook_progress' || event.type === 'playbook_complete') {
    return <PlaybookProgress event={event} />;
  }

  if (event.type === 'approval_required') {
    return (
      <ApprovalModal
        action={event.action || 'Isolate infected host'}
        riskLevel={event.risk_level || 'HIGH'}
      />
    );
  }

  if (event.type === 'enrichment_result' && event.data) {
    return <EnrichmentCard data={event.data} />;
  }

  return null;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
        animation: 'fadeIn 0.2s ease',
      }}>
        <div style={{ maxWidth: '70%' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(123,97,255,0.25) 100%)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '18px 18px 4px 18px',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: '1.6',
          }}>
            {message.content}
          </div>
          <div style={{
            textAlign: 'right',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginTop: '4px',
            paddingRight: '4px',
          }}>
            {formatTime(message.timestamp)}
          </div>
        </div>
        <div style={{
          width: '32px', height: '32px',
          background: 'rgba(0,212,255,0.15)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: '10px', flexShrink: 0, marginTop: '2px',
        }}>
          <User size={16} style={{ color: '#00d4ff' }} />
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '20px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: '32px', height: '32px',
        background: 'rgba(0,212,255,0.1)',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '10px', flexShrink: 0, marginTop: '2px',
      }}>
        <Shield size={16} style={{ color: '#00d4ff' }} />
      </div>
      <div style={{ maxWidth: '85%' }}>
        {/* Events Cards */}
        {message.events && message.events.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            {message.events.map((event, idx) => (
              <EventRenderer key={idx} event={event} />
            ))}
          </div>
        )}

        {/* Real-time Random Forest ML Threat Analytics Card */}
        <RandomForestCard rf={message.rf_predictions} />

        {/* Markdown Text Body */}
        <div style={{
          marginTop: '0.75rem',
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color)',
          borderLeft: '3px solid rgba(0,212,255,0.5)',
          borderRadius: '4px 18px 18px 4px',
          padding: '14px 18px',
          color: 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: '1.7',
        }}>
          <ReactMarkdown
            components={{
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                return isBlock ? (
                  <pre style={{ background: '#0d1117', padding: '12px', borderRadius: '6px', overflow: 'auto', fontSize: '12px', color: '#00d4ff', margin: '8px 0' }}>
                    <code>{children}</code>
                  </pre>
                ) : (
                  <code style={{ background: 'rgba(0,212,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#00d4ff', fontFamily: 'monospace' }}>
                    {children}
                  </code>
                );
              },
              strong: ({ children }) => <strong style={{ color: '#00d4ff' }}>{children}</strong>,
              p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
              ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>,
              li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '4px' }}>
          SIEM Assistant · {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
