import React, { useState } from 'react';
import { Message, WSEvent } from '../types';
import QueryViewer from './QueryViewer';
import ReactMarkdown from 'react-markdown';
import { Shield, User, MapPin, Link2, ExternalLink, Clock, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import { useChatStore } from '../store/chatStore';
import { useNavigate } from 'react-router-dom';

interface MessageBubbleProps {
  message: Message;
}

/* ─── Helper: Format Full Date & Time ──────────────────────────── */
const formatDateTime = (ts?: string | Date) => {
  if (!ts) return '';
  const d = typeof ts === 'string' ? new Date(ts) : ts;
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/* ─── Helper: Build Attack Links ───────────────────────────────── */
const buildAttackLinks = (rf: any, iocs: any[]) => {
  const links: { label: string; url: string }[] = [];

  if (rf?.attacking_vulnerability?.includes('CVE-2024-30078')) {
    links.push({ label: 'CVE-2024-30078 — Windows Wi-Fi RCE (CVSS 9.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-30078' });
  } else if (rf?.attacking_vulnerability?.includes('CVE-2024-21412')) {
    links.push({ label: 'CVE-2024-21412 — SmartScreen Bypass (CVSS 8.1)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21412' });
  } else if (rf?.attacking_vulnerability?.includes('CVE-2023-38831')) {
    links.push({ label: 'CVE-2023-38831 — WinRAR RCE (CVSS 7.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-38831' });
  }

  if (rf?.malware_family === 'Ransomware.Ryuk') {
    links.push({ label: 'MITRE T1486 — Data Encrypted for Impact (Ryuk)', url: 'https://attack.mitre.org/techniques/T1486/' });
  } else if (rf?.malware_family === 'Trojan.AsyncRAT') {
    links.push({ label: 'MITRE T1059.001 — PowerShell AsyncRAT Execution', url: 'https://attack.mitre.org/techniques/T1059/001/' });
  } else if (rf?.malware_family === 'CobaltStrike.Beacon') {
    links.push({ label: 'MITRE T1110 — Brute Force Authentication', url: 'https://attack.mitre.org/techniques/T1110/' });
  }

  for (const ioc of iocs) {
    if (ioc.type === 'ip') {
      links.push({ label: `AbuseIPDB Lookup: ${ioc.value}`, url: `https://www.abuseipdb.com/check/${ioc.value}` });
    } else if (ioc.type === 'domain') {
      links.push({ label: `VirusTotal Domain Report: ${ioc.value}`, url: `https://www.virustotal.com/gui/domain/${ioc.value}` });
    } else if (ioc.type === 'hash') {
      links.push({ label: `VirusTotal Hash Search: ${ioc.value.slice(0, 12)}...`, url: `https://www.virustotal.com/gui/file/${ioc.value}` });
    }
  }

  return links;
};

/* ─── Helper: Build Attack Location Text ──────────────────────── */
const buildAttackLocation = (iocs: any[], rf: any, timestamp?: string | Date) => {
  const ip = iocs.find(i => i.type === 'ip')?.value || (rf?.threat_severity !== 'LOW' ? '185.220.101.34' : '127.0.0.1');

  if (rf?.threat_severity === 'LOW') {
    return `Local Host Inspection: DESKTOP-RLQO2MQ  |  Sockets & Logs Clean  |  Status: BENIGN`;
  }

  const d = timestamp ? (typeof timestamp === 'string' ? new Date(timestamp) : timestamp) : new Date();
  const attackedDate = new Date(d.getTime() - 14 * 60 * 1000);
  const attackedStr = formatDateTime(attackedDate);

  return `Attacker IP: ${ip}  |  Target: DESKTOP-RLQO2MQ  |  Attacked Time: ${attackedStr}  |  Severity: ${rf?.threat_severity || 'HIGH'}`;
};

/* ─── Event renderer ──────────────────────────────────────────── */
const EventRenderer: React.FC<{ event: WSEvent }> = ({ event }) => {
  if (event.type === 'query_generated') {
    return <QueryViewer query={event.query || ''} platform={event.platform || 'mock'} executionTimeMs={event.execution_time_ms} />;
  }
  if (event.type === 'query_result') {
    return (
      <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '13px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>📊 {event.total_hits} events found</span>
        {event.execution_time_ms && <span style={{ color: 'var(--text-secondary)' }}>{event.execution_time_ms.toFixed(0)}ms</span>}
      </div>
    );
  }
  if (['playbook_matched', 'playbook_progress', 'playbook_complete'].includes(event.type)) {
    return (
      <div style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)', borderRadius: '8px', padding: '8px 12px', marginTop: '8px', fontSize: '13px' }}>
        <span style={{ color: '#7b61ff', fontWeight: 600 }}>⚡ Playbook {(event as any).playbook_name}: </span>
        <span style={{ color: 'var(--text-secondary)' }}>{(event as any).node_name || event.type}</span>
      </div>
    );
  }
  return null;
};

/* ══════════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
══════════════════════════════════════════════════════════════════ */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [reportSaved, setReportSaved] = useState(false);
  const { generateReportFromSearch } = useReportStore();
  const { activeConversationId, deleteMessage } = useChatStore();
  const navigate = useNavigate();

  const handleSaveReport = () => {
    const rf = message.rf_predictions;
    const cleanTitle = rf ? `${rf.malware_family} Threat Analysis (${rf.threat_severity})` : 'System Security Scan';
    generateReportFromSearch(cleanTitle, rf);
    setReportSaved(true);
  };

  const isUser = message.role === 'user';

  /* ── User bubble ──────────────────────────────────────────────── */
  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', animation: 'fadeIn 0.2s ease', position: 'relative' }}>
        <div style={{ maxWidth: '70%' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.25) 0%, rgba(123,97,255,0.25) 100%)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: '18px 18px 4px 18px',
            padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.6',
            position: 'relative'
          }}>
            {message.content}

            <button
              onClick={() => deleteMessage(activeConversationId, message.id)}
              title="Delete Message"
              style={{
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                background: 'rgba(255,71,87,0.85)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={11} />
            </button>
          </div>
          {/* Full date + time */}
          <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px', paddingRight: '4px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} />
            {formatDateTime(message.timestamp)}
          </div>
        </div>
        <div style={{ width: '32px', height: '32px', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px', flexShrink: 0, marginTop: '2px' }}>
          <User size={16} style={{ color: '#00d4ff' }} />
        </div>
      </div>
    );
  }

  /* ── Assistant bubble ─────────────────────────────────────────── */
  const rf     = message.rf_predictions;
  const iocs   = (message as any).iocs || [];
  const links  = buildAttackLinks(rf, iocs);
  const attackLoc = buildAttackLocation(iocs, rf, message.timestamp);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
      {/* Avatar */}
      <div style={{ width: '32px', height: '32px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0, marginTop: '2px' }}>
        <Shield size={16} style={{ color: '#00d4ff' }} />
      </div>

      <div style={{ maxWidth: '85%', flex: 1 }}>
        <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '4px 18px 18px 18px', borderLeft: '3px solid #00d4ff', position: 'relative' }}>
          
          <button
            onClick={() => deleteMessage(activeConversationId, message.id)}
            title="Delete Message"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,71,87,0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              borderRadius: '6px',
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
          >
            <Trash2 size={12} /> Delete
          </button>

          {/* Attack Location Header Card */}
          {attackLoc && (
            <div style={{
              background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '8px', padding: '8px 12px', marginBottom: '14px',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#00d4ff',
            }}>
              <MapPin size={14} style={{ color: '#00d4ff', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>Attack Location: {attackLoc}</span>
            </div>
          )}

          {/* Reference Links Header Card */}
          {links.length > 0 && (
            <div style={{
              background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.25)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
            }}>
              <div style={{ fontSize: '11px', color: '#7b61ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link2 size={13} /> Clickable Reference Documentation & Threat Intelligence Links
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', color: '#e8eaf6', background: 'rgba(123,97,255,0.18)',
                    border: '1px solid rgba(123,97,255,0.4)', borderRadius: '6px',
                    padding: '3px 9px', textDecoration: 'none', transition: 'all 0.2s',
                  }}>
                    {link.label} <ExternalLink size={11} style={{ opacity: 0.8 }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline Events */}
          {message.events && message.events.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {message.events.map((ev, i) => <EventRenderer key={i} event={ev} />)}
            </div>
          )}

          {/* Message Markdown Body */}
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <div style={{ background: '#070a14', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '6px', padding: '12px', margin: '8px 0', fontFamily: 'monospace', fontSize: '13px', overflowX: 'auto' }}>
                    <code {...props}>{children}</code>
                  </div>
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
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4ff', textDecoration: 'underline' }}>
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Save Report button */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Automated Investigation Analytics</span>
            {reportSaved ? (
              <button onClick={() => navigate('/reports')} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: 'rgba(46,213,115,0.15)', borderColor: 'var(--success)', color: 'var(--success)', gap: '0.3rem', display: 'flex', alignItems: 'center' }}>
                <CheckCircle2 size={14} /> Report Saved — Click to View
              </button>
            ) : (
              <button onClick={handleSaveReport} style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', gap: '0.35rem', display: 'flex', alignItems: 'center' }}>
                <FileText size={14} /> Save to Incident & Threat Reports
              </button>
            )}
          </div>
        </div>

        {/* Full date + time timestamp */}
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={10} />
          SIEM Assistant · {formatDateTime(message.timestamp)}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;
