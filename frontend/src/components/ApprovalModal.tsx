import React from 'react';
import { AlertTriangle, Shield, Check } from 'lucide-react';

interface ApprovalModalProps {
  request?: any;
  action?: string;
  riskLevel?: string;
  onApprove?: () => void;
  onDeny?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ request, action, riskLevel, onApprove, onDeny }) => {
  const actionText = action || request?.action || 'Isolate host WS-FINANCE-01 from network';
  const level = riskLevel || request?.risk_level || 'HIGH';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-slide-in" style={{ width: '90%', maxWidth: '500px', overflow: 'hidden', border: '1px solid var(--danger)' }}>
        <div style={{ background: 'rgba(255, 71, 87, 0.2)', padding: '1.5rem', borderBottom: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertTriangle size={32} color="var(--danger)" />
          <div>
            <h3 style={{ color: 'var(--danger)', margin: 0 }}>High Impact Action Required</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SOC Manager / Senior Analyst Approval Gate ({level})</div>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Requested Action:</h4>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', color: '#ff4757', marginBottom: '1.5rem', border: '1px solid rgba(255,71,87,0.3)' }}>
            {actionText}
          </div>
          
          <h4 style={{ marginBottom: '0.75rem' }}>Impact Assessment:</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Shield size={16} color="var(--warning)" /> Drops network connectivity to affected host</li>
            <li style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}><Shield size={16} color="var(--warning)" /> Forces user credential password reset</li>
          </ul>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="danger" onClick={onApprove || (() => {})} style={{ flex: 1 }}><Check size={18} /> Approve Action</button>
            <button onClick={onDeny || (() => {})} style={{ flex: 1 }}>Deny Action</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
