import React from 'react';
import { Cpu, ShieldAlert, AlertCircle, Layers, Zap } from 'lucide-react';
import { RFPrediction } from '../types';

interface RandomForestCardProps {
  rf?: RFPrediction;
}

const DEFAULT_RF: RFPrediction = {
  random_forest_active: true,
  trees_in_ensemble: 100,
  trees_voted_malicious: 98,
  malware_family: "Ransomware.Ryuk",
  malware_confidence_pct: 96.4,
  threat_severity: "CRITICAL",
  attacked_system_risk_score: 94.5,
  attacking_vulnerability: "CVE-2024-30078 (Windows Wi-Fi RCE, CVSS 9.8)",
  top_feature_importances: {
    "is_outbound_c2": 34.2,
    "file_entropy": 28.5,
    "failed_logins": 21.0,
    "has_encoded_cmd": 16.3
  },
  model_metadata: {
    algorithm: "RandomForestClassifier & RandomForestRegressor",
    n_trees: 100,
    criterion: "gini / squared_error",
    realtime_latency_ms: 3.2
  }
};

export const RandomForestCard: React.FC<RandomForestCardProps> = ({ rf }) => {
  const data = rf || DEFAULT_RF;
  const isHighSeverity = data.threat_severity === 'CRITICAL' || data.threat_severity === 'HIGH';

  return (
    <div className="glass-panel" style={{ marginTop: '1rem', padding: '1.5rem', border: `1px solid ${isHighSeverity ? 'var(--danger)' : 'var(--accent-primary)'}`, background: 'rgba(10, 14, 26, 0.95)', borderRadius: '14px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          <Cpu size={24} className="text-gradient glow-cyan" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#00d4ff' }}>Random Forest ML Threat Analyzer</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Real-Time Inference Latency: {data.model_metadata.realtime_latency_ms}ms | 100 Decision Trees</span>
          </div>
        </div>
        <span className={`badge ${data.threat_severity.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          {data.threat_severity} SEVERITY
        </span>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Malware Family */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,212,255,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Malware Classifier</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--danger)', fontFamily: 'monospace' }}>{data.malware_family}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>Confidence: {data.malware_confidence_pct}%</div>
        </div>

        {/* Attacked System Risk */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,71,87,0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Attacked System Risk</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: isHighSeverity ? 'var(--danger)' : 'var(--warning)' }}>
            {data.attacked_system_risk_score} <span style={{ fontSize: '0.8rem' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Ensemble Regressor Output</div>
        </div>

        {/* Ensemble Voting */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(123,97,255,0.3)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Ensemble Tree Voting</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
            {data.trees_voted_malicious} / {data.trees_in_ensemble} Trees
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Voted Threat Active</div>
        </div>

      </div>

      {/* Attacking Vulnerability */}
      <div style={{ background: 'rgba(255,71,87,0.08)', borderLeft: '4px solid var(--danger)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <ShieldAlert size={18} color="var(--danger)" />
          <strong style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>Exploited Attacking Vulnerability:</strong>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-primary)', paddingLeft: '1.6rem' }}>
          {data.attacking_vulnerability}
        </div>
      </div>

      {/* Feature Importances Bar Chart */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Random Forest Feature Importance Weights</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>Gini Impurity Metric</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {Object.entries(data.top_feature_importances).map(([feat, pct], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{feat}</span>
                <span style={{ color: '#00d4ff', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${pct}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '3px',
                    transition: 'width 0.8s ease'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RandomForestCard;
