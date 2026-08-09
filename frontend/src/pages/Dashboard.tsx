import React from 'react';
import { Activity, ShieldAlert, CheckCircle, Clock, Play, FileText, MessageSquare, ArrowRight, Cpu, Layers } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import RandomForestCard from '../components/RandomForestCard';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>SOC Security Operations</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Real-time threat monitoring, Random Forest ML analytics, and copilot orchestration</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/chat')} className="primary" style={{ gap: '0.5rem' }}>
              <MessageSquare size={18} /> Open Copilot Chat
            </button>
          </div>
        </div>
        
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Active Investigations', value: '4', icon: Activity, color: 'var(--accent-primary)', route: '/investigations' },
            { label: 'Critical Threats (24h)', value: '12', icon: ShieldAlert, color: 'var(--danger)', route: '/investigations' },
            { label: 'Random Forest Accuracy', value: '98.6%', icon: Cpu, color: 'var(--accent-secondary)', route: '/chat' },
            { label: 'Avg Triage Latency', value: '3.2ms', icon: Clock, color: 'var(--success)', route: '/chat' }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="glass-panel" 
              onClick={() => navigate(stat.route)}
              style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                <stat.icon size={32} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stat.value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time Random Forest ML Classifier Monitor */}
        <div style={{ marginBottom: '2.5rem' }}>
          <RandomForestCard />
        </div>

        {/* Quick Actions Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Ask Copilot</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Query SIEM with Natural Language</p>
            </div>
            <button className="primary" onClick={() => navigate('/chat')} style={{ padding: '0.5rem 1rem' }}>
              Chat <ArrowRight size={16} />
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Run Playbook</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Trigger DAG Threat Response</p>
            </div>
            <button onClick={() => navigate('/investigations')} style={{ padding: '0.5rem 1rem' }}>
              Run <Play size={16} />
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>Incident Reports</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Preview & Download Documentation</p>
            </div>
            <button onClick={() => navigate('/reports')} style={{ padding: '0.5rem 1rem' }}>
              Reports <FileText size={16} />
            </button>
          </div>
        </div>

        {/* Recent Investigations Table */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Security Investigations & ML Predictions</h3>
            <button onClick={() => navigate('/investigations')} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
              View All
            </button>
          </div>

          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Random Forest Malware Class</th>
                <th style={{ padding: '1rem' }}>Exploited Vulnerability</th>
                <th style={{ padding: '1rem' }}>Severity</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'INV-1043', title: 'Data Exfiltration via DNS Tunneling', malware: 'Ransomware.Ryuk', vuln: 'CVE-2024-30078', severity: 'critical', statusText: 'Pending Approval' },
                { id: 'INV-1042', title: 'Suspicious PowerShell Execution', malware: 'Trojan.AsyncRAT', vuln: 'CVE-2024-21412', severity: 'high', statusText: 'Running' },
                { id: 'INV-1041', title: 'Brute Force SSH Login Attack', malware: 'CobaltStrike.Beacon', vuln: 'CVE-2023-38831', severity: 'high', statusText: 'Completed' }
              ].map((row, i) => (
                <tr 
                  key={i} 
                  onClick={() => navigate('/investigations')}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                >
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{row.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{row.title}</td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--danger)' }}>{row.malware}</td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.vuln}</td>
                  <td style={{ padding: '1rem' }}><span className={`badge ${row.severity}`}>{row.severity.toUpperCase()}</span></td>
                  <td style={{ padding: '1rem' }}><span className="badge medium">{row.statusText}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
