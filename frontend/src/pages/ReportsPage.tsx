import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FileText, Download, Eye, X, Shield, CheckCircle, Plus } from 'lucide-react';
import { ReportItem } from '../types';

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'REP-2024-001',
    title: 'Incident Report: Brute Force Authentication Attack',
    investigation_id: 'INV-1041',
    date: '2024-05-12 14:32 UTC',
    format: 'TXT',
    size: '18 KB',
    severity: 'CRITICAL',
    risk_score: 95,
    analyst: 'analyst (Tier 2)',
    playbook: 'brute_force_investigation',
    summary: 'High-volume brute force attack detected from external IP 45.33.32.156 targeting SSH authentication. Attacker achieved successful authentication following 15 failed attempts.',
    mitre_techniques: [
      { technique_id: 'T1110', technique_name: 'Brute Force', tactic: 'Credential Access' },
      { technique_id: 'T1110.001', technique_name: 'Password Guessing', tactic: 'Credential Access' },
      { technique_id: 'T1078', technique_name: 'Valid Accounts', tactic: 'Defense Evasion' }
    ],
    iocs: [
      { type: 'ip', value: '45.33.32.156', context: 'Attacker Source IP (Abuse Score: 98/100)' },
      { type: 'user', value: 'admin', context: 'Targeted Compromised Account' },
      { type: 'host', value: 'SERVER-DC01', context: 'Destination Host' }
    ],
    recommended_actions: [
      'IMMEDIATELY reset password for compromised account: admin',
      'Force logout all active SSH/RDP sessions for admin',
      'Block attacker IP 45.33.32.156 at perimeter firewall',
      'Enable mandatory MFA for all privileged accounts'
    ]
  },
  {
    id: 'REP-2024-002',
    title: 'Phishing Campaign Investigation Report',
    investigation_id: 'INV-1040',
    date: '2024-05-10 09:15 UTC',
    format: 'TXT',
    size: '14 KB',
    severity: 'HIGH',
    risk_score: 75,
    analyst: 'manager',
    playbook: 'phishing_investigation',
    summary: 'Spearphishing campaign targeting finance team with spoofed sender domain paypa1.com. Malicious link embedded leading to credential harvesting site.',
    mitre_techniques: [
      { technique_id: 'T1566', technique_name: 'Phishing', tactic: 'Initial Access' },
      { technique_id: 'T1566.002', technique_name: 'Spearphishing Link', tactic: 'Initial Access' }
    ],
    iocs: [
      { type: 'domain', value: 'paypa1.com', context: 'Malicious Sender Domain' },
      { type: 'url', value: 'http://paypa1.com/login?token=xyz', context: 'Credential Harvesting Link' }
    ],
    recommended_actions: [
      'Block domain paypa1.com on mail gateway',
      'Quarantine 8 received phishing emails',
      'Notify affected finance department users'
    ]
  },
  {
    id: 'REP-2024-003',
    title: 'Malware Threat Analysis: AsyncRAT Executable',
    investigation_id: 'INV-1039',
    date: '2024-05-08 18:45 UTC',
    format: 'TXT',
    size: '22 KB',
    severity: 'CRITICAL',
    risk_score: 90,
    analyst: 'analyst',
    playbook: 'malware_analysis',
    summary: 'EDR alert triggered on WS-FINANCE-01 for suspicious executable update.exe matching AsyncRAT malware hash d41d8cd98f00b204e9800998ecf8427e.',
    mitre_techniques: [
      { technique_id: 'T1059', technique_name: 'Command & Scripting Interpreter', tactic: 'Execution' },
      { technique_id: 'T1071', technique_name: 'Application Layer Protocol', tactic: 'Command & Control' }
    ],
    iocs: [
      { type: 'hash', value: 'd41d8cd98f00b204e9800998ecf8427e', context: 'AsyncRAT Payload Hash (58/72 VirusTotal detections)' },
      { type: 'host', value: 'WS-FINANCE-01', context: 'Infected Endpoint Hostname' }
    ],
    recommended_actions: [
      'Isolate host WS-FINANCE-01 from network immediately',
      'Quarantine file update.exe in C:\\Temp',
      'Block outbound C2 IP 185.220.101.34'
    ]
  }
];

const generatePlainTextReport = (report: ReportItem): string => {
  return `================================================================================
SIEM ASSISTANT — SECURITY THREAT INCIDENT REPORT (PLAIN TEXT FORMAT)
================================================================================
Report ID      : ${report.id}
Investigation  : ${report.title}
Date / Time    : ${report.date}
Severity Level : ${report.severity} (Risk Score: ${report.risk_score} / 100)
Assigned Analyst: ${report.analyst}
Playbook Engine: ${report.playbook}
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${report.summary}

2. KEY INCIDENT FINDINGS & EVIDENCE
--------------------------------------------------------------------------------
* Investigation ID: ${report.investigation_id}
* Threat Risk Level: ${report.severity} (${report.risk_score}/100)
* Automated DAG Playbook: ${report.playbook}
* Decision Trees Classification: Real-Time Random Forest ML Classifier Evaluated

3. MITRE ATT&CK FRAMEWORK MAPPING
--------------------------------------------------------------------------------
${report.mitre_techniques.map(t => `* [${t.technique_id}] ${t.technique_name} (Tactic: ${t.tactic})`).join('\n')}

4. EXTRACTED INDICATORS OF COMPROMISE (IOCs)
--------------------------------------------------------------------------------
${report.iocs.map(i => `* [${i.type.toUpperCase()}] ${i.value} — ${i.context}`).join('\n')}

5. RECOMMENDED REMEDIATION ACTIONS
--------------------------------------------------------------------------------
${report.recommended_actions.map((a, idx) => `[${idx + 1}] ${a}`).join('\n')}

================================================================================
END OF REPORT — SIEM ASSISTANT SOC PLATFORM
================================================================================`;
};

const ReportsPage = () => {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [previewTab, setPreviewTab] = useState<'text' | 'summary' | 'mitre' | 'iocs'>('text');
  const [showGenModal, setShowGenModal] = useState(false);
  const [genFormat, setGenFormat] = useState('TXT');
  const [genTitle, setGenTitle] = useState('');

  // DOWNLOAD PLAIN TEXT OR SELECTED FORMAT
  const handleDownload = (report: ReportItem) => {
    const textContent = generatePlainTextReport(report);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateNew = () => {
    if (!genTitle.trim()) return;
    const newRep: ReportItem = {
      id: `REP-2024-00${reports.length + 1}`,
      title: genTitle,
      investigation_id: `INV-104${reports.length + 4}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      format: genFormat,
      size: '16 KB',
      severity: 'HIGH',
      risk_score: 80,
      analyst: 'analyst',
      playbook: 'generic_investigation',
      summary: `Automated incident investigation report generated for: ${genTitle}. Evaluated real-time event logs and threat intelligence metrics.`,
      mitre_techniques: [
        { technique_id: 'T1110', technique_name: 'Brute Force', tactic: 'Credential Access' },
        { technique_id: 'T1059', technique_name: 'Execution', tactic: 'Execution' }
      ],
      iocs: [
        { type: 'ip', value: '192.168.1.100', context: 'Attacker Source IP' },
        { type: 'user', value: 'admin', context: 'Target Account' }
      ],
      recommended_actions: [
        'Review findings with SOC lead',
        'Apply perimeter firewall rule',
        'Update incident ticket status'
      ]
    };

    setReports([newRep, ...reports]);
    setGenTitle('');
    setShowGenModal(false);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1>Incident & Threat Reports</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Automated Plain Text (.txt), PDF, HTML, and Markdown investigation reports</p>
          </div>
          <button className="primary" onClick={() => setShowGenModal(true)} style={{ gap: '0.5rem' }}>
            <Plus size={18} /> Generate New Report
          </button>
        </div>

        {/* Reports Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {reports.map((rep) => (
            <div key={rep.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge ${rep.severity.toLowerCase()}`}>{rep.severity}</span>
                  <span className="badge medium" style={{ background: 'rgba(0,212,255,0.15)', color: 'var(--accent-primary)' }}>{rep.format} FORMAT</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.6rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{rep.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rep.summary}
                </p>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  <span>📅 {rep.date}</span>
                  <span>⚖️ Risk: {rep.risk_score}/100</span>
                </div>
              </div>

              {/* TWO OPTIONS: 1. PREVIEW and 2. DOWNLOAD */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  onClick={() => { setSelectedReport(rep); setPreviewTab('text'); }} 
                  style={{ background: 'rgba(0, 212, 255, 0.12)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)', fontSize: '0.9rem' }}
                >
                  <Eye size={16} /> Preview
                </button>
                
                <button 
                  onClick={() => handleDownload(rep)} 
                  className="primary"
                  style={{ fontSize: '0.9rem' }}
                >
                  <Download size={16} /> Download .TXT
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 1. REPORT PREVIEW MODAL */}
        {selectedReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div className="glass-panel animate-slide-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--accent-primary)' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Shield size={28} className="text-gradient glow-cyan" />
                  <div>
                    <h2 style={{ fontSize: '1.3rem', margin: 0, color: '#00d4ff' }}>{selectedReport.title}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {selectedReport.id} | Date: {selectedReport.date}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedReport(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Modal Tabs Header */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
                {[
                  { id: 'text', label: '📄 Plain Text (.txt) Report' },
                  { id: 'summary', label: '📋 Summary & Remediation' },
                  { id: 'mitre', label: '🛡️ MITRE ATT&CK Matrix' },
                  { id: 'iocs', label: '🔍 IOCs' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setPreviewTab(tab.id as any)}
                    style={{
                      background: previewTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                      color: previewTab === tab.id ? '#0a0e1a' : 'var(--text-primary)',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Tab Content */}
              <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', background: 'var(--surface-color)' }}>
                {previewTab === 'text' && (
                  <div style={{ background: '#0a0e1a', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: '#00d4ff', lineHeight: 1.6 }}>
                    {generatePlainTextReport(selectedReport)}
                  </div>
                )}

                {previewTab === 'summary' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity</div>
                        <span className={`badge ${selectedReport.severity.toLowerCase()}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{selectedReport.severity}</span>
                      </div>
                      <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Risk Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>{selectedReport.risk_score} / 100</div>
                      </div>
                      <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Analyst</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem' }}>{selectedReport.analyst}</div>
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>Primary Finding Summary</h3>
                      <p style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>{selectedReport.summary}</p>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Recommended Remediation Actions</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedReport.recommended_actions.map((act, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === 'mitre' && (
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Mapped MITRE ATT&CK Framework Techniques</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Technique ID</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Technique Name</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Tactic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.mitre_techniques.map((tech, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid var(--accent-primary)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                                {tech.technique_id}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{tech.technique_name}</td>
                            <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{tech.tactic}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewTab === 'iocs' && (
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Indicators of Compromise (IOCs)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedReport.iocs.map((ioc, idx) => (
                        <div key={idx} style={{ background: 'rgba(123,97,255,0.1)', borderLeft: '4px solid var(--accent-secondary)', padding: '1rem', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span className="badge medium">{ioc.type}</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{ioc.value}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Context: {ioc.context}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1.25rem 2rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Format: Plain Text (.txt)</span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setSelectedReport(null)}>Close Preview</button>
                  <button onClick={() => handleDownload(selectedReport)} className="primary">
                    <Download size={16} /> Download .TXT Report
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* GENERATE NEW REPORT MODAL */}
        {showGenModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div className="glass-panel animate-slide-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Generate New Incident Report</h2>
                <button onClick={() => setShowGenModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Report Title</label>
                  <input 
                    type="text"
                    value={genTitle}
                    onChange={(e) => setGenTitle(e.target.value)}
                    placeholder="e.g. Brute Force Attack Investigation Report"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Report Format</label>
                  <select 
                    value={genFormat} 
                    onChange={(e) => setGenFormat(e.target.value)}
                    style={{ width: '100%', background: '#0d1117' }}
                  >
                    <option value="TXT">Plain Text Document (.txt)</option>
                    <option value="PDF">PDF Document (.pdf)</option>
                    <option value="HTML">HTML Web Report (.html)</option>
                    <option value="Markdown">Markdown (.md)</option>
                    <option value="JSON">SOAR JSON (.json)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => setShowGenModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleGenerateNew} className="primary" style={{ flex: 1 }}>Generate</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ReportsPage;
