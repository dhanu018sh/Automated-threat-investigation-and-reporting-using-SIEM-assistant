import React from 'react';
import { PlayCircle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { WSEvent } from '../types';

interface PlaybookProgressProps {
  event?: WSEvent;
  data?: any;
}

export const PlaybookProgress: React.FC<PlaybookProgressProps> = ({ event, data }) => {
  const playbookName = event?.playbook || data?.playbook || 'brute_force_investigation';
  const nodes = event?.node_name ? [
    { name: 'Extract attack IOCs & IPs', status: 'complete' },
    { name: event.node_name, status: event.type === 'playbook_complete' ? 'complete' : 'running' },
    { name: 'Assess severity & risk score', status: event.type === 'playbook_complete' ? 'complete' : 'pending' },
    { name: 'Generate MITRE ATT&CK mapping', status: event.type === 'playbook_complete' ? 'complete' : 'pending' }
  ] : [
    { name: 'Extract attack IOCs & IPs', status: 'complete' },
    { name: 'Check AbuseIPDB / VirusTotal intel', status: 'complete' },
    { name: 'Assess attack severity & risk score', status: 'complete' },
    { name: 'Generate MITRE ATT&CK mapping', status: 'complete' }
  ];

  const getIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle size={18} color="var(--success)" />;
      case 'running': return <Loader2 size={18} color="var(--accent-primary)" className="animate-spin" />;
      case 'failed': return <XCircle size={18} color="var(--danger)" />;
      default: return <Clock size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '0.75rem', padding: '1.25rem', border: '1px solid var(--accent-primary)', background: 'rgba(13,20,40,0.9)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <PlayCircle size={22} className="text-gradient glow-cyan" />
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', color: '#00d4ff' }}>Playbook Execution: {playbookName}</h4>
          {event?.severity && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Severity: {event.severity} | Risk Score: {event.risk_score}/100</span>}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {nodes.map((node, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', opacity: node.status === 'pending' ? 0.5 : 1 }}>
            {getIcon(node.status)}
            <span style={{ fontWeight: node.status === 'running' ? 'bold' : 'normal', color: node.status === 'running' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
              {node.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaybookProgress;
