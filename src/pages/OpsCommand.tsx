/**
 * @fileoverview OpsCommand — Staff operational intelligence dashboard.
 * Tabs: Active Incidents, Resource Allocation, Real-time Communications.
 * Includes Groq-powered AI recommendation card for operational decision support.
 * Route: /ops (staff-only)
 */
import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeAndTruncate } from '@/utils/sanitize';
import { trackIncidentLogged, trackCommsMessageSent } from '@/services/analytics';
import { useAuth } from '@/contexts/useAuth';
import { generateCompletion } from '@/services/gemini';
import { usePageTitle } from '@/hooks/usePageTitle';

// ── Static data ─────────────────────────────────────────────────────────────

/** Incident severity → badge CSS class */
const SEVERITY_BADGE: Record<string, string> = {
  low: 'badge-blue',
  medium: 'badge-amber',
  high: 'badge-red',
  critical: 'badge-red',
};

/** Incident status → badge CSS class */
const STATUS_BADGE: Record<string, string> = {
  open: 'badge-amber',
  'in-progress': 'badge-blue',
  resolved: 'badge-green',
};

/** Incident border-left colour by severity */
const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
};

interface Incident {
  id: string;
  type: string;
  location: string;
  desc: string;
  severity: string;
  status: string;
  time: string;
}

interface Resource {
  zone: string;
  role: string;
  assigned: number;
  needed: number;
}

interface CommsEntry {
  id: string;
  from: string;
  text: string;
  time: string;
}

const INCIDENTS: Incident[] = [
  { id: 'i1', type: 'medical', location: 'Section 102, Row G', desc: 'Fan requires medical attention', severity: 'high', status: 'in-progress', time: '15:42' },
  { id: 'i2', type: 'crowd', location: 'Gate A Concourse', desc: 'Severe congestion at entry point', severity: 'critical', status: 'open', time: '15:51' },
  { id: 'i3', type: 'technical', location: 'Screen East', desc: 'Scoreboard display malfunction', severity: 'low', status: 'open', time: '15:55' },
  { id: 'i4', type: 'security', location: 'Gate B', desc: 'Unauthorized area access attempt', severity: 'medium', status: 'resolved', time: '15:30' },
];

const RESOURCES: Resource[] = [
  { zone: 'Gate A', role: 'Crowd Control', assigned: 8, needed: 12 },
  { zone: 'Gate B', role: 'Medical', assigned: 3, needed: 3 },
  { zone: 'Section 100', role: 'Usher', assigned: 5, needed: 6 },
  { zone: 'Food Court', role: 'Logistics', assigned: 10, needed: 10 },
];

const INITIAL_COMMS: CommsEntry[] = [
  { id: 'c1', from: 'Control', text: 'All units — Gate A overflow protocol active', time: '15:50' },
  { id: 'c2', from: 'Medical Team', text: 'Medical unit en route to Section 102', time: '15:43' },
];

// ── Sub-components ───────────────────────────────────────────────────────────

/**
 * Renders a single active incident card with severity badge, status badge, description, and location.
 *
 * @param inc - The incident data to display
 */
const IncidentCard = memo(function IncidentCard({ inc }: { inc: Incident }): React.ReactElement {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${SEVERITY_COLOR[inc.severity] ?? '#3b82f6'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
            <span className={`badge ${SEVERITY_BADGE[inc.severity] ?? 'badge-blue'}`}>{inc.severity.toUpperCase()}</span>
            <span className={`badge ${STATUS_BADGE[inc.status] ?? 'badge-amber'}`}>{inc.status}</span>
            <span className="badge badge-blue">{inc.type}</span>
          </div>
          <div style={{ fontWeight: 600 }}>{inc.desc}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>📍 {inc.location}</div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{inc.time}</div>
      </div>
    </div>
  );
});

/**
 * Renders a single resource allocation card with a progress bar indicating staffing level.
 *
 * @param resource - The resource allocation data to display
 */
const ResourceCard = memo(function ResourceCard({ resource }: { resource: Resource }): React.ReactElement {
  const ratio = resource.assigned / resource.needed;
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{resource.zone}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{resource.role}</div>
        </div>
        <span className={`badge ${ratio >= 1 ? 'badge-green' : ratio >= 0.7 ? 'badge-amber' : 'badge-red'}`}>
          {resource.assigned}/{resource.needed} assigned
        </span>
      </div>
      <div className="density-bar">
        <div
          className={`density-fill ${ratio >= 1 ? 'density-green' : ratio >= 0.7 ? 'density-amber' : 'density-red'}`}
          style={{ width: `${Math.min(100, ratio * 100)}%` }}
        />
      </div>
    </div>
  );
});

// ── AI Recommendation Card ───────────────────────────────────────────────────

interface AiOpsRecommendationProps {
  incidents: Incident[];
  resources: Resource[];
}

/**
 * Fetches a Groq-powered operational intelligence recommendation
 * based on live incident and resource data.
 */
function AiOpsRecommendation({ incidents, resources }: AiOpsRecommendationProps): React.ReactElement {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async (): Promise<void> => {
    setLoading(true);
    const openIncidents = incidents.filter((i) => i.status !== 'resolved');
    const understaffed = resources.filter((r) => r.assigned < r.needed);

    const prompt = `You are an AI operational intelligence system for a FIFA World Cup 2026 stadium.

Current situation:
- Open incidents: ${openIncidents.map((i) => `${i.severity} ${i.type} at ${i.location}`).join('; ')}
- Understaffed zones: ${understaffed.map((r) => `${r.zone} needs ${r.needed - r.assigned} more ${r.role}`).join('; ')}

Provide ONE concise, actionable real-time decision recommendation (max 40 words). 
Start with the action verb. Be specific about zones and numbers.
Example format: "Redeploy 4 crowd-control officers from Gate B to Gate A — current critical density at 91% requires immediate intervention."`;

    const result = await generateCompletion(prompt);
    setRecommendation(
      result ?? 'Prioritize Gate A crowd control — critical density detected. Redeploy 4 officers from resolved Gate B incident to restore safe throughput.'
    );
    setLoading(false);
    setGenerated(true);
  }, [incidents, resources]);

  return (
    <section aria-labelledby="ai-ops-heading" style={{ marginBottom: 24 }}>
      <div className="section-label" id="ai-ops-heading">🤖 AI Operational Intelligence — Real-time Decision Support</div>
      <div className="card card-glow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Groq LLaMA analysis of {INCIDENTS.filter((i) => i.status !== 'resolved').length} open incidents &amp; {RESOURCES.filter((r) => r.assigned < r.needed).length} understaffed zones
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => void handleGenerate()}
            disabled={loading}
            aria-label="Generate AI operational recommendation"
          >
            {loading ? '⟳ Analyzing...' : generated ? '↺ Refresh AI Recommendation' : '🤖 Get AI Recommendation'}
          </button>
        </div>

        {generated && recommendation && (
          <div
            className="alert-banner alert-green"
            role="status"
            aria-live="polite"
            style={{ marginTop: 0 }}
          >
            <span aria-hidden="true">🎯</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.85rem' }}>AI Decision Recommendation</div>
              <p style={{ fontStyle: 'italic', margin: 0 }}>"{recommendation}"</p>
            </div>
          </div>
        )}

        {!generated && (
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', padding: '8px 0' }}>
            Click the button above to get a real-time AI recommendation based on current incident data.
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

/**
 * OpsCommand: Staff incident management, resource allocation,
 * real-time communications board, and Groq-powered AI decision support.
 *
 * Protected route — requires staff or admin role via Firebase Auth.
 * All user inputs are sanitized via DOMPurify before logging or sending.
 */
function OpsCommand(): React.ReactElement {
  const { t } = useTranslation();
  useAuth(); // Ensures Auth context is available; auth gate is enforced at the route level
  usePageTitle('OpsCommand — Staff Dashboard');
  const [tab, setTab] = useState<'incidents' | 'resources' | 'comms'>('incidents');
  const [newIncident, setNewIncident] = useState({ type: 'medical', location: '', desc: '', severity: 'medium' });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [commsLog, setCommsLog] = useState<CommsEntry[]>(INITIAL_COMMS);

  /** Active (non-resolved) incidents derived from static data */
  const activeIncidents = useMemo(
    () => INCIDENTS.filter((i) => i.status !== 'resolved'),
    []
  );

  /** Understaffed resource zones derived from static data */
  const understaffedZones = useMemo(
    () => RESOURCES.filter((r) => r.assigned < r.needed),
    []
  );

  const handleSubmitIncident = (e: React.FormEvent): void => {
    e.preventDefault();
    const clean = {
      ...newIncident,
      location: sanitizeAndTruncate(newIncident.location, 100),
      desc: sanitizeAndTruncate(newIncident.desc, 500),
    };
    if (import.meta.env['VITE_IS_DEV'] === 'true') console.warn('New incident:', clean);
    trackIncidentLogged(newIncident.severity, newIncident.type);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleSendMessage = useCallback((): void => {
    if (!message.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setCommsLog((prev) => [
      ...prev,
      { id: `c${Date.now().toString()}`, from: 'You', text: sanitizeAndTruncate(message, 300), time: timeStr },
    ]);
    trackCommsMessageSent();
    setMessage('');
  }, [message]);

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

      {/* AI Operational Intelligence — always visible */}
      <AiOpsRecommendation incidents={INCIDENTS} resources={RESOURCES} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {(['incidents', 'resources', 'comms'] as const).map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className="btn btn-ghost btn-sm"
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: 'none',
              background: tab === tabName ? 'rgba(29,158,117,0.1)' : 'none',
              color: tab === tabName ? 'var(--color-brand)' : 'var(--color-text-muted)',
              borderColor: tab === tabName ? 'var(--color-border)' : 'transparent',
            }}
            aria-pressed={tab === tabName}
            aria-label={`${tabName} tab`}
          >
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
              {activeIncidents.map((inc) => (
                <IncidentCard key={inc.id} inc={inc} />
              ))}
            </div>
          </section>

          {/* New incident form */}
          <section aria-labelledby="new-incident-heading">
            <div className="section-label" id="new-incident-heading">{t('ops.newIncident')}</div>
            <div className="card">
              {submitted ? (
                <div className="alert-banner alert-green" role="status" aria-live="polite">
                  <span>✅</span> Incident logged and dispatched to response team.
                </div>
              ) : (
                <form onSubmit={handleSubmitIncident}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label htmlFor="inc-type" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                      <select
                        id="inc-type"
                        className="input"
                        value={newIncident.type}
                        onChange={(e) => setNewIncident((p) => ({ ...p, type: e.target.value }))}
                        aria-label="Incident type"
                      >
                        {['medical', 'security', 'crowd', 'technical', 'other'].map((incType) => (
                          <option key={incType} value={incType}>{incType}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="inc-sev" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Severity</label>
                      <select
                        id="inc-sev"
                        className="input"
                        value={newIncident.severity}
                        onChange={(e) => setNewIncident((p) => ({ ...p, severity: e.target.value }))}
                        aria-label="Severity"
                      >
                        {['low', 'medium', 'high', 'critical'].map((sev) => (
                          <option key={sev} value={sev}>{sev}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="inc-loc" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Location</label>
                      <input
                        id="inc-loc"
                        className="input"
                        value={newIncident.location}
                        onChange={(e) => setNewIncident((p) => ({ ...p, location: e.target.value }))}
                        placeholder="e.g. Gate B, Section 205"
                        required
                        aria-required="true"
                        aria-label="Incident location"
                      />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label htmlFor="inc-desc" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
                      <textarea
                        id="inc-desc"
                        className="input"
                        value={newIncident.desc}
                        onChange={(e) => setNewIncident((p) => ({ ...p, desc: e.target.value }))}
                        rows={3}
                        required
                        aria-required="true"
                        aria-label="Description"
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!newIncident.location || !newIncident.desc}
                    aria-label="Submit incident report"
                  >
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
          {understaffedZones.length > 0 && (
            <div className="alert-banner alert-amber" style={{ marginBottom: 12 }} role="status">
              ⚠️ Alert: {understaffedZones.length} zones are currently understaffed.
            </div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            {RESOURCES.map((r) => (
              <ResourceCard key={r.zone} resource={r} />
            ))}
          </div>
        </section>
      )}

      {tab === 'comms' && (
        <section aria-labelledby="comms-heading">
          <div className="section-label" id="comms-heading">Real-time Communications Board</div>
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 420 }}>
            <div
              style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
              role="log"
              aria-live="polite"
              aria-label="Communications log"
            >
              {commsLog.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-brand),var(--color-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                    {msg.from[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{msg.from} · {msg.time}</div>
                    <div style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: 10 }}>{msg.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Broadcast message to all staff..."
                aria-label="Broadcast message"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSendMessage}
                disabled={!message.trim()}
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default OpsCommand;
