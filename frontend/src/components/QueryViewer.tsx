import React from 'react';
import { Terminal, Copy } from 'lucide-react';

interface QueryViewerProps {
  query: string;
  platform?: string;
  executionTimeMs?: number;
}

export const QueryViewer: React.FC<QueryViewerProps> = ({ query, platform = 'Splunk', executionTimeMs }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#0d1117' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Terminal size={14} color="var(--accent-primary)" /> 
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Generated {platform.toUpperCase()} Query</span>
          {executionTimeMs && <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({executionTimeMs.toFixed(0)}ms)</span>}
        </div>
        <button onClick={handleCopy} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
          <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '1rem', background: '#0a0e1a', color: '#00d4ff', fontSize: '0.85rem', fontFamily: 'monospace', overflowX: 'auto' }}>
        <code>{query}</code>
      </pre>
    </div>
  );
};

export default QueryViewer;
