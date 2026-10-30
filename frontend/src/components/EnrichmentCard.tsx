import React from 'react';
import { EnrichmentResult } from '../types';

interface EnrichmentCardProps {
  data?: EnrichmentResult;
}

export const EnrichmentCard: React.FC<EnrichmentCardProps> = ({ data }) => {
  const type = data?.type?.toUpperCase() || 'IP';
  const detectedIp = (typeof localStorage !== 'undefined' ? localStorage.getItem('siem_detected_ip') : null) || '10.167.239.5';
  const val = data?.value || detectedIp;
  const risk = data?.risk_score ?? 85;
  const isHighRisk = risk > 60;

  return (
    <div className="glass-panel" style={{ marginTop: '0.75rem', padding: '1.25rem', borderLeft: `4px solid ${isHighRisk ? 'var(--danger)' : 'var(--success)'}`, background: 'rgba(13,20,40,0.9)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{type} Threat Intelligence</div>
          <h3 style={{ margin: 0, fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{val}</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: isHighRisk ? 'var(--danger)' : 'var(--success)' }}>{risk}/100</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Threat Risk Score</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {data?.abuse_score !== undefined && <span className="badge critical">AbuseIPDB Score: {data.abuse_score}%</span>}
        {data?.country && <span className="badge medium">Country: {data.country}</span>}
        {data?.isp && <span className="badge medium">ISP: {data.isp}</span>}
        {data?.is_tor && <span className="badge critical">Tor Exit Node</span>}
      </div>

      {data?.summary && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 }}>{data.summary}</p>
      )}
    </div>
  );
};

export default EnrichmentCard;
