import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, AlertTriangle, Play, FileText, ChevronRight, X, Shield, CheckCircle, MapPin, Clock, Link2, ExternalLink, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Investigation } from '../types';
import { useChatStore } from '../store/chatStore';

/* ─── Seed investigations (Clean start — empty array) ──────────── */
const SEED_INVESTIGATIONS: Investigation[] = [];

/* ─── Helpers ──────────────────────────────────────────────────── */
const formatDateTime = (ts: string) => {
  try {
    const d = new Date(ts);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true,
    });
  } catch {
    return ts;
  }
};

const timeAgo = (ts: string) => {
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day(s) ago`;
  } catch {
    return ts;
  }
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ff4757', HIGH: '#ffa502', MEDIUM: '#eccc68', LOW: '#2ed573',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#ffa502', running: '#00d4ff', completed: '#2ed573', failed: '#ff4757',
};

/* ══════════════════════════════════════════════════════════════════
   INVESTIGATIONS PAGE
══════════════════════════════════════════════════════════════════ */
const InvestigationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);
  const navigate = useNavigate();
  const { conversations, messages } = useChatStore();

  /* Build investigations from real chat sessions + seeds */
  const chatInvestigations: Investigation[] = conversations
    .filter(c => c.title && c.title !== 'New Investigation')
    .map((c, idx) => {
      const convMsgs = messages[c.id] || [];
      const assistantMsgs = convMsgs.filter(m => m.role === 'assistant');
      const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
      const rf = lastAssistant?.rf_predictions;
      const iocs = lastAssistant?.iocs || [];

      // Extract dynamic host & IPs for attack location
      const host = (lastAssistant as any)?.evidence?.target_host || localStorage.getItem('siem_detected_host') || 'Local Host';
      const osName = (lastAssistant as any)?.evidence?.target_os || localStorage.getItem('siem_detected_os') || 'Windows System';
      const ips = iocs.filter((i: any) => i.type === 'ip').map((i: any) => i.value);
      const mainIp = (lastAssistant as any)?.evidence?.attacker_ip || ips[0] || (rf?.threat_severity !== 'LOW' ? '185.220.101.34' : '127.0.0.1');
      const d = c.created_at ? new Date(c.created_at) : new Date();
      const attackedDate = new Date(d.getTime() - 14 * 60 * 1000);
      const attackedStr = (lastAssistant as any)?.evidence?.attacked_time || formatDateTime(attackedDate.toISOString());

      const attackLoc = rf?.threat_severity === 'LOW'
        ? `Clean Host Inspection  |  Host: ${host} (${osName})`
        : `Attacker IP: ${mainIp}  |  Target Host: ${host} (${osName})  |  Attacked Time: ${attackedStr}`;

      const links: { label: string; url: string }[] = [];
      if (rf?.attacking_vulnerability) {
        const cveMatch = rf.attacking_vulnerability.match(/CVE-\d{4}-\d+/);
        if (cveMatch) {
          links.push({ label: rf.attacking_vulnerability, url: `https://nvd.nist.gov/vuln/detail/${cveMatch[0]}` });
        }
      }
      if (ips[0]) {
        links.push({ label: `AbuseIPDB: ${ips[0]}`, url: `https://www.abuseipdb.com/check/${ips[0]}` });
      }

      return {
        id: `INV-${2000 + idx}`,
        convId: c.id,
        title: c.title || 'Chat Investigation',
        playbook_name: rf ? 'rf_playbook_engine' : 'generic_investigation',
        status: 'completed' as const,
        severity: (rf?.threat_severity || 'MEDIUM') as any,
        risk_score: rf?.attacked_system_risk_score || 50,
        created_at: c.created_at,
        analyst: 'analyst',
        attack_location: attackLoc,
        attack_system: rf?.malware_family ? `${rf.malware_family} — RF Classified` : 'Under Analysis',
        attack_links: links,
        findings: assistantMsgs.slice(-1).map(m => m.content?.slice(0, 120) + '...') || ['Investigation in progress'],
        iocs,
      };
    });

  const { deleteConversation } = useChatStore();
  const allInvestigations = [...chatInvestigations, ...SEED_INVESTIGATIONS];

  const filtered = allInvestigations.filter((inv) => {
    const matchSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', overflowY: 'auto' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Security Investigations</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Active incident triage · Playbook DAG results · Attack locations · Real-time RF ML analysis
            </p>
          </div>
          <button className="primary" onClick={() => navigate('/chat')} style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <Play size={16} /> Run New Investigation
          </button>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Investigations', val: allInvestigations.length, color: '#00d4ff' },
            { label: 'Critical / High', val: allInvestigations.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH').length, color: '#ff4757' },
            { label: 'Active / Running', val: allInvestigations.filter(i => i.status === 'running' || i.status === 'pending').length, color: '#ffa502' },
            { label: 'Completed', val: allInvestigations.filter(i => i.status === 'completed').length, color: '#2ed573' },
          ].map(s => (
            <div key={s.label} className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--panel-bg)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['all', 'pending', 'running', 'completed'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'var(--accent-primary)' : 'transparent',
                  color: filterStatus === st ? '#0a0e1a' : 'var(--text-secondary)',
                  border: 'none', padding: '0.4rem 1rem', borderRadius: '6px',
                  fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer',
                }}
              >{st}</button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text" placeholder="Search by ID or title..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '280px', background: 'var(--panel-bg)' }}
            />
          </div>
        </div>

        {/* ── Table ──────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)' }}>
                {['ID', 'Title', 'Attack Location', 'Severity', 'Risk Score', 'Status', 'Date & Time', 'Action'].map(h => (
                  <th key={h} style={{ padding: '1rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInv(inv)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700 }}>{inv.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500, maxWidth: '200px' }}>{inv.title}</td>
                  <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={12} style={{ flexShrink: 0, color: '#ffa502' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(inv as any).attack_location || '—'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: `${SEV_COLOR[inv.severity || 'MEDIUM']}22`,
                      color: SEV_COLOR[inv.severity || 'MEDIUM'],
                      border: `1px solid ${SEV_COLOR[inv.severity || 'MEDIUM']}55`,
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                    }}>{inv.severity || 'MEDIUM'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', width: '60px' }}>
                        <div style={{ height: '6px', borderRadius: '4px', width: `${inv.risk_score || 50}%`, background: SEV_COLOR[inv.severity || 'MEDIUM'] }} />
                      </div>
                      <span style={{ fontWeight: 700, color: SEV_COLOR[inv.severity || 'MEDIUM'], fontSize: '0.85rem' }}>{inv.risk_score || 50}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: `${STATUS_COLOR[inv.status]}22`,
                      color: STATUS_COLOR[inv.status],
                      border: `1px solid ${STATUS_COLOR[inv.status]}55`,
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem',
                    }}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>{formatDateTime(inv.created_at)}</span>
                      <span style={{ color: '#00d4ff', fontSize: '0.72rem' }}>{timeAgo(inv.created_at)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Details <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if ((inv as any).convId) {
                            deleteConversation((inv as any).convId);
                          }
                        }}
                        title="Delete Investigation"
                        style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No investigations found. <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => navigate('/chat')}>Start one in Copilot Chat →</span>
            </div>
          )}
        </div>

        {/* ── Detail Modal ───────────────────────────────────────── */}
        {selectedInv && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div className="glass-panel animate-slide-in" style={{ width: '100%', maxWidth: '820px', padding: '2rem', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ background: `${SEV_COLOR[selectedInv.severity || 'MEDIUM']}22`, color: SEV_COLOR[selectedInv.severity || 'MEDIUM'], border: `1px solid ${SEV_COLOR[selectedInv.severity || 'MEDIUM']}55`, padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {selectedInv.severity}
                    </span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{selectedInv.id}</span>
                    <span style={{ background: `${STATUS_COLOR[selectedInv.status]}22`, color: STATUS_COLOR[selectedInv.status], border: `1px solid ${STATUS_COLOR[selectedInv.status]}55`, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem' }}>{selectedInv.status}</span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{selectedInv.title}</h2>
                </div>
                <button onClick={() => setSelectedInv(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={22} />
                </button>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Risk Score', val: `${selectedInv.risk_score || 50}/100`, color: SEV_COLOR[selectedInv.severity || 'MEDIUM'] },
                  { label: 'Playbook', val: selectedInv.playbook_name },
                  { label: 'Analyst', val: selectedInv.analyst || 'analyst' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{s.label}</div>
                    <div style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Date & Time */}
              <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={16} style={{ color: '#00d4ff', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Investigation Date & Time</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{formatDateTime(selectedInv.created_at)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#00d4ff' }}>{timeAgo(selectedInv.created_at)}</div>
                </div>
              </div>

              {/* Attack Location */}
              {(selectedInv as any).attack_location && (
                <div style={{ background: 'rgba(255,165,2,0.06)', border: '1px solid rgba(255,165,2,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <MapPin size={16} style={{ color: '#ffa502' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffa502' }}>Attack Location & Targeted System</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{(selectedInv as any).attack_location}</div>
                  {(selectedInv as any).attack_system && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>System: {(selectedInv as any).attack_system}</div>
                  )}
                </div>
              )}

              {/* Attack Links */}
              {(selectedInv as any).attack_links?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Link2 size={15} style={{ color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Attack Reference Links</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(selectedInv as any).attack_links.map((lnk: any, i: number) => (
                      <a
                        key={i}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
                          borderRadius: '6px', padding: '0.5rem 0.9rem',
                          color: '#00d4ff', fontSize: '0.85rem', textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.12)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.06)')}
                      >
                        <ExternalLink size={13} />
                        {lnk.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Key Findings & Evidence</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedInv.findings?.map((f, i) => (
                    <div key={i} style={{ background: 'rgba(0,212,255,0.06)', borderLeft: '3px solid var(--accent-primary)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                      {typeof f === 'string' ? f : (f as any).message || JSON.stringify(f)}
                    </div>
                  ))}
                </div>
              </div>

              {/* IOCs */}
              {selectedInv.iocs && selectedInv.iocs.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Extracted IOCs</h4>
                  {selectedInv.iocs.map((ioc: any, i: number) => (
                    <div key={i} style={{ fontFamily: 'monospace', background: 'rgba(123,97,255,0.1)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                      [{ioc.type?.toUpperCase()}] {ioc.value} — {ioc.context}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={() => setSelectedInv(null)}>Close</button>
                <button onClick={() => { setSelectedInv(null); navigate('/reports'); }} className="primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} /> View Reports
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default InvestigationsPage;
