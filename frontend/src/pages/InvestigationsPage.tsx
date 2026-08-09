import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, AlertTriangle, Play, FileText, ChevronRight, X, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Investigation } from '../types';

const INITIAL_INVESTIGATIONS: Investigation[] = [
  {
    id: 'INV-1043',
    title: 'Data Exfiltration via DNS Tunneling',
    playbook_name: 'data_exfiltration_triage',
    status: 'pending',
    severity: 'CRITICAL',
    risk_score: 98,
    created_at: '2 mins ago',
    analyst: 'analyst (Tier 2)',
    findings: [
      'High volume DNS query traffic detected to suspicious domain dns-tunnelling.xyz',
      'Target endpoint WS-FINANCE-01 transferred 450MB via encoded TXT queries',
      'Requires approval for network host isolation'
    ],
    iocs: [
      { type: 'domain', value: 'dns-tunnelling.xyz', context: 'C2 DNS Domain' },
      { type: 'ip', value: '10.0.1.100', context: 'Exfiltrating Endpoint' }
    ]
  },
  {
    id: 'INV-1042',
    title: 'Suspicious PowerShell Script Execution',
    playbook_name: 'malware_analysis',
    status: 'running',
    severity: 'HIGH',
    risk_score: 82,
    created_at: '1 hour ago',
    analyst: 'analyst',
    findings: [
      'Encoded PowerShell execution spawned by explorer.exe',
      'Script downloaded obfuscated payload from external IP 185.220.101.34',
      'VirusTotal detected payload hash as AsyncRAT Trojan'
    ],
    iocs: [
      { type: 'hash', value: 'd41d8cd98f00b204e9800998ecf8427e', context: 'Payload Hash' }
    ]
  },
  {
    id: 'INV-1041',
    title: 'Brute Force SSH Login Attack',
    playbook_name: 'brute_force_investigation',
    status: 'completed',
    severity: 'HIGH',
    risk_score: 95,
    created_at: '2 hours ago',
    analyst: 'manager',
    findings: [
      'Over 25 failed SSH login attempts from external IP 45.33.32.156',
      'Attacker achieved 1 successful login for account admin',
      'Source IP abuse confidence score: 98/100 (AbuseIPDB)'
    ],
    iocs: [
      { type: 'ip', value: '45.33.32.156', context: 'Attacker IP' },
      { type: 'user', value: 'admin', context: 'Targeted User' }
    ]
  },
  {
    id: 'INV-1040',
    title: 'Spearphishing Email Detection',
    playbook_name: 'phishing_investigation',
    status: 'completed',
    severity: 'MEDIUM',
    risk_score: 65,
    created_at: '1 day ago',
    analyst: 'analyst',
    findings: [
      '8 phishing emails received from domain paypa1.com',
      'Link led to credential harvesting landing page',
      'No users clicked embedded links'
    ],
    iocs: [
      { type: 'domain', value: 'paypa1.com', context: 'Sender Domain' }
    ]
  }
];

const InvestigationsPage = () => {
  const [investigations] = useState<Investigation[]>(INITIAL_INVESTIGATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);
  const navigate = useNavigate();

  const filtered = investigations.filter((inv) => {
    const matchesSearch = inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Security Investigations</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Active incident triage, DAG playbooks, and mitigation traces</p>
          </div>
          <button className="primary" onClick={() => navigate('/chat')} style={{ gap: '0.5rem' }}>
            <Play size={16} /> Run New Playbook
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--panel-bg)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['all', 'pending', 'running', 'completed'].map((st) => (
              <button 
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  background: filterStatus === st ? 'var(--accent-primary)' : 'transparent',
                  color: filterStatus === st ? '#0a0e1a' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by ID or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '280px', background: 'var(--panel-bg)' }} 
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ padding: '1.25rem 1rem' }}>Investigation ID</th>
                <th style={{ padding: '1.25rem 1rem' }}>Title</th>
                <th style={{ padding: '1.25rem 1rem' }}>Playbook</th>
                <th style={{ padding: '1.25rem 1rem' }}>Severity</th>
                <th style={{ padding: '1.25rem 1rem' }}>Status</th>
                <th style={{ padding: '1.25rem 1rem' }}>Analyst</th>
                <th style={{ padding: '1.25rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setSelectedInv(inv)}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{inv.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{inv.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{inv.playbook_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${inv.severity?.toLowerCase() || 'medium'}`}>{inv.severity || 'MEDIUM'}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${inv.status}`}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{inv.analyst}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.3rem' }}>
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INVESTIGATION DETAIL MODAL */}
        {selectedInv && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div className="glass-panel animate-slide-in" style={{ width: '100%', maxWidth: '750px', padding: '2rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className={`badge ${selectedInv.severity?.toLowerCase() || 'medium'}`}>{selectedInv.severity}</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>{selectedInv.id}</span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{selectedInv.title}</h2>
                </div>
                <button onClick={() => setSelectedInv(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                  <X size={22} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Playbook Engine</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>{selectedInv.playbook_name}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk Assessment</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>Risk Score: {selectedInv.risk_score || 85} / 100</div>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Key Findings & Evidence</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedInv.findings?.map((f, i) => (
                      <div key={i} style={{ background: 'rgba(0,212,255,0.08)', borderLeft: '3px solid var(--accent-primary)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedInv.iocs && selectedInv.iocs.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.75rem' }}>Extracted IOCs</h4>
                    {selectedInv.iocs.map((ioc, i) => (
                      <div key={i} style={{ fontFamily: 'monospace', background: 'rgba(123,97,255,0.1)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>
                        [{ioc.type.toUpperCase()}] {ioc.value} — {ioc.context}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={() => setSelectedInv(null)}>Close</button>
                <button onClick={() => { setSelectedInv(null); navigate('/reports'); }} className="primary">
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
