import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeAndTruncate } from '@/utils/sanitize';
import { trackIncidentLogged, trackCommsMessageSent } from '@/services/analytics';
import { useAuth } from '@/contexts/AuthContext';

const INCIDENTS = [
  { id: 'i1', type: 'medical', location: 'Section 102, Row G', desc: 'Fan requires medical attention', severity: 'high', status: 'in-progress', time: '15:42' },
  { id: 'i2', type: 'crowd', location: 'Gate A Concourse', desc: 'Severe congestion at entry point', severity: 'critical', status: 'open', time: '15:51' },
  { id: 'i3', type: 'technical', location: 'Screen East', desc: 'Scoreboard display malfunction', severity: 'low', status: 'open', time: '15:55' },
  { id: 'i4', type: 'security', location: 'Gate B', desc: 'Unauthorized area access attempt', severity: 'medium', status: 'resolved', time: '15:30' },
];

const RESOURCES = [
  { zone: 'Gate A', role: 'Crowd Control', assigned: 8, needed: 12 },
  { zone: 'Gate B', role: 'Medical', assigned: 3, needed: 3 },
  { zone: 'Section 100', role: 'Usher', assigned: 5, needed: 6 },
  { zone: 'Food Court', role: 'Logistics', assigned: 10, needed: 10 },
];

const SEVERITY_BADGE: Record<string, string> = { low: 'badge-blue', medium: 'badge-amber', high: 'badge-red', critical: 'badge-red' };
const STATUS_BADGE: Record<string, string> = { open: 'badge-amber', 'in-progress': 'badge-blue', resolved: 'badge-green' };

function OpsCommand(): React.ReactElement {
  const { t } = useTranslation();
  useAuth();
  const [tab, setTab] = useState<'incidents' | 'resources' | 'comms'>('incidents');
  const [newIncident, setNewIncident] = useState({ type: 'medical', location: '', desc: '', severity: 'medium' });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [commsLog, setCommsLog] = useState([
    { id: 'c1', from: 'Control', text: 'All units — Gate A overflow protocol active', time: '15:50' },
    { id: 'c2', from: 'Medical Team', text: 'Medical unit en route to Section 102', time: '15:43' },
  ]);

  const handleSubmitIncident = (e: React.FormEvent): void => {
    e.preventDefault();
    const clean = { ...newIncident, location: sanitizeAndTruncate(newIncident.location, 100), desc: sanitizeAndTruncate(newIncident.desc, 500) };
    if (import.meta.env['VITE_IS_DEV'] === 'true') console.warn('New incident:', clean);
    trackIncidentLogged(newIncident.severity, newIncident.type);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleSendMessage = (): void => {
    if (!message.trim()) return;
    setCommsLog((prev) => [...prev, { id: `c${Date.now().toString()}`, from: 'You', text: sanitizeAndTruncate(message, 300), time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }]);
    trackCommsMessageSent();
    setMessage('');
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ margin: 0 }}>⚙️ {t('ops.title')}</h1>
          <span className="badge badge-red">● LIVE</span>
          <span className="badge badge-purple">Staff View</span>
        </div>
        <p className="page-subtitle">{t('ops.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {(['incidents', 'resources', 'comms'] as const).map((tabName) => (
          <button key={tabName} onClick={() => setTab(tabName)} className="btn btn-ghost btn-sm"
            style={{ borderRadius: '8px 8px 0 0', borderBottom: 'none', background: tab === tabName ? 'rgba(29,158,117,0.1)' : 'none', color: tab === tabName ? 'var(--color-brand)' : 'var(--color-text-muted)', borderColor: tab === tabName ? 'var(--color-border)' : 'transparent' }}
            aria-pressed={tab === tabName} aria-label={`${tabName} tab`}>
            {tabName === 'incidents' ? '🚨 Incidents' : tabName === 'resources' ? '👥 Resources' : '📡 Comms'}
          </button>
        ))}
      </div>

      {tab === 'incidents' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Active incidents */}
          <section aria-labelledby="incidents-heading">
            <div className="section-label" id="incidents-heading">Active Incidents</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {INCIDENTS.filter(i => i.status !== 'resolved').map((inc) => (
                <div key={inc.id} className="card" style={{ borderLeft: `3px solid ${inc.severity === 'critical' || inc.severity === 'high' ? '#ef4444' : inc.severity === 'medium' ? '#f59e0b' : '#3b82f6'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        <span className={`badge ${SEVERITY_BADGE[inc.severity]}`}>{inc.severity.toUpperCase()}</span>
                        <span className={`badge ${STATUS_BADGE[inc.status]}`}>{inc.status}</span>
                        <span className="badge badge-blue">{inc.type}</span>
                      </div>
                      <div style={{ fontWeight: 600 }}>{inc.desc}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>📍 {inc.location}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{inc.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New incident form */}
          <section aria-labelledby="new-incident-heading">
            <div className="section-label" id="new-incident-heading">{t('ops.newIncident')}</div>
            <div className="card">
              {submitted ? (
                <div className="alert-banner alert-green" role="status" aria-live="polite"><span>✅</span> Incident logged and dispatched to response team.</div>
              ) : (
                <form onSubmit={handleSubmitIncident}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label htmlFor="inc-type" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                      <select id="inc-type" className="input" value={newIncident.type} onChange={(e) => setNewIncident(p => ({ ...p, type: e.target.value }))} aria-label="Incident type">
                        {['medical','security','crowd','technical','other'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="inc-sev" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Severity</label>
                      <select id="inc-sev" className="input" value={newIncident.severity} onChange={(e) => setNewIncident(p => ({ ...p, severity: e.target.value }))} aria-label="Severity">
                        {['low','medium','high','critical'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="inc-loc" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Location</label>
                      <input id="inc-loc" className="input" value={newIncident.location} onChange={(e) => setNewIncident(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Gate B, Section 205" required aria-required="true" aria-label="Incident location" />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="inc-desc" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
                      <textarea id="inc-desc" className="input" value={newIncident.desc} onChange={(e) => setNewIncident(p => ({ ...p, desc: e.target.value }))} rows={3} required aria-required="true" aria-label="Description" style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={!newIncident.location || !newIncident.desc} aria-label="Submit incident report">
                    🚨 Log Incident
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'resources' && (
        <section aria-labelledby="resources-heading">
          <div className="section-label" id="resources-heading">Resource Allocation by Zone</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {RESOURCES.map((r) => {
              const ratio = r.assigned / r.needed;
              return (
                <div key={r.zone} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.zone}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{r.role}</div>
                    </div>
                    <span className={`badge ${ratio >= 1 ? 'badge-green' : ratio >= 0.7 ? 'badge-amber' : 'badge-red'}`}>{r.assigned}/{r.needed} assigned</span>
                  </div>
                  <div className="density-bar"><div className={`density-fill ${ratio >= 1 ? 'density-green' : ratio >= 0.7 ? 'density-amber' : 'density-red'}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'comms' && (
        <section aria-labelledby="comms-heading">
          <div className="section-label" id="comms-heading">Real-time Communications Board</div>
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 420 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} role="log" aria-live="polite" aria-label="Communications log">
              {commsLog.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-brand),var(--color-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{msg.from[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{msg.from} · {msg.time}</div>
                    <div style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 10 }}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <input className="input" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} placeholder="Broadcast message to all staff..." aria-label="Broadcast message" style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={handleSendMessage} disabled={!message.trim()} aria-label="Send message">Send</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default OpsCommand;
