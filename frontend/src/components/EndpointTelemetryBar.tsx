import React, { useEffect, useState } from 'react';
import { Laptop, Clock, Radio, Activity, X, RefreshCw, Cpu, Layers } from 'lucide-react';
import { chatApi } from '../api/chat';
import { SystemTelemetry } from '../types';

interface SocketItem {
  protocol: string;
  local_address: string;
  remote_address: string;
  status: string;
  pid: string;
}

const EndpointTelemetryBar: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sockets, setSockets] = useState<SocketItem[]>([]);
  const [loadingSockets, setLoadingSockets] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTelemetry = async () => {
    const data = await chatApi.getTelemetry();
    setTelemetry(data);
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = async () => {
    setShowModal(true);
    setLoadingSockets(true);
    const data = await chatApi.getActiveSockets();
    setSockets(data.sockets || []);
    setLoadingSockets(false);
  };

  if (!telemetry) return null;

  return (
    <>
      {/* ── Top Telemetry Pill Bar ───────────────────────────────── */}
      <div style={{
        background: 'rgba(10, 14, 26, 0.75)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
        padding: '0.45rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        zIndex: 10,
      }}>
        {/* Left: System Endpoint Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#00d4ff', fontWeight: 600 }}>
            <Laptop size={14} />
            <span>Target Host: <strong style={{ color: '#fff' }}>{telemetry.hostname}</strong></span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#e8eaf6' }}>
            <span style={{ color: '#7b61ff' }}>●</span>
            <span>OS: <strong>{telemetry.os_name}</strong></span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#e8eaf6' }}>
            <span style={{ color: '#2ed573' }}>●</span>
            <span>Local IP: <code style={{ color: '#2ed573', background: 'rgba(46,213,115,0.1)', padding: '1px 5px', borderRadius: '3px' }}>{telemetry.local_ip}</code></span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Radio size={13} style={{ color: '#ffa502' }} />
            <span>Active Sockets: <strong>{telemetry.active_sockets}</strong></span>
          </div>
        </div>

        {/* Right: Clock & Inspector Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ffa502' }}>
            <Clock size={13} />
            <span style={{ fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString()} ({telemetry.timezone || 'Local'})
            </span>
          </div>

          <button
            onClick={handleOpenModal}
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '11px',
              borderRadius: '6px',
              background: 'rgba(0, 212, 255, 0.12)',
              border: '1px solid rgba(0, 212, 255, 0.35)',
              color: '#00d4ff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Activity size={12} /> Inspect Endpoint
          </button>
        </div>
      </div>

      {/* ── Endpoint Telemetry Modal ─────────────────────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '1.75rem',
            borderRadius: '16px',
            border: '1px solid rgba(0,212,255,0.25)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Laptop size={22} style={{ color: '#00d4ff' }} />
                <div>
                  <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Endpoint Telemetry & Forensic Inspector</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live Host Architecture, Sockets, and Operating System State</div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Hardware & OS Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>TARGET HOSTNAME</div>
                <div style={{ fontWeight: 700, color: '#00d4ff', fontSize: '0.95rem' }}>{telemetry.hostname}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>OPERATING SYSTEM</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{telemetry.os_name}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>LOCAL NETWORK IP</div>
                <div style={{ fontWeight: 700, color: '#2ed573', fontSize: '0.95rem' }}>{telemetry.local_ip}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>CPU CORES</div>
                <div style={{ fontWeight: 700, color: '#ffa502', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Cpu size={15} /> {telemetry.cpu_cores} Cores
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>AI DETECTION MODEL</div>
                <div style={{ fontWeight: 600, color: '#7b61ff', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Layers size={14} /> 100-Tree Random Forest
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>LOCAL CLOCK & TIMEZONE</div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{telemetry.current_time_local}</div>
              </div>
            </div>

            {/* Active Sockets Section */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#00d4ff' }}>Active Established Network Sockets</h4>
                <button
                  onClick={async () => {
                    setLoadingSockets(true);
                    const data = await chatApi.getActiveSockets();
                    setSockets(data.sockets || []);
                    setLoadingSockets(false);
                  }}
                  style={{ fontSize: '11px', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RefreshCw size={11} className={loadingSockets ? 'animate-spin' : ''} /> Refresh Sockets
                </button>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {loadingSockets ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>Scanning network sockets...</div>
                ) : sockets.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '6px 10px' }}>Proto</th>
                        <th style={{ padding: '6px 10px' }}>Local Address</th>
                        <th style={{ padding: '6px 10px' }}>Remote Address</th>
                        <th style={{ padding: '6px 10px' }}>Status</th>
                        <th style={{ padding: '6px 10px' }}>PID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sockets.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '5px 10px', color: '#7b61ff' }}>{s.protocol}</td>
                          <td style={{ padding: '5px 10px', fontFamily: 'monospace' }}>{s.local_address}</td>
                          <td style={{ padding: '5px 10px', fontFamily: 'monospace', color: s.remote_address.startsWith('127.') ? '#aaa' : '#ffa502' }}>{s.remote_address}</td>
                          <td style={{ padding: '5px 10px', color: '#2ed573' }}>{s.status}</td>
                          <td style={{ padding: '5px 10px', color: 'var(--text-secondary)' }}>{s.pid}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                    No active external socket connections detected. Local loopback clean.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <button onClick={() => setShowModal(false)} className="primary" style={{ fontSize: '12px', padding: '0.4rem 1rem' }}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EndpointTelemetryBar;
