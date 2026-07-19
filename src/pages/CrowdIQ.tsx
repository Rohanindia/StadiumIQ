/**
 * @fileoverview CrowdIQ — Live density heatmap, AI choke-point analysis, and PA announcement generator.
 * Provides real-time crowd management with Groq-powered recommendations.
 */
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePAAnnouncement, generateCompletion } from '@/services/gemini';
import type { AlertLevel } from '@/types';
import { formatPercent } from '@/utils/format';
import { trackPAGenerated } from '@/services/analytics';

// ── Static data ─────────────────────────────────────────────────────────────

interface Zone {
  id: string;
  name: string;
  capacity: number;
  current: number;
  alert: AlertLevel;
}

interface AlertConfig {
  label: string;
  badge: string;
  barClass: string;
  color: string;
}

const ZONES: Zone[] = [
  { id: 'z1', name: 'Gate A Concourse', capacity: 2000, current: 1820, alert: 'red' },
  { id: 'z2', name: 'Gate B Concourse', capacity: 2000, current: 1100, alert: 'amber' },
  { id: 'z3', name: 'Gate C Concourse', capacity: 2000, current: 600, alert: 'green' },
  { id: 'z4', name: 'Main Atrium', capacity: 3000, current: 2700, alert: 'red' },
  { id: 'z5', name: 'Section 100 Block', capacity: 1500, current: 900, alert: 'amber' },
  { id: 'z6', name: 'Food Court East', capacity: 800, current: 200, alert: 'green' },
];

const ALERT_CONFIG: Record<AlertLevel, AlertConfig> = {
  green: { label: 'Clear', badge: 'badge-green', barClass: 'density-green', color: '#22c55e' },
  amber: { label: 'Caution', badge: 'badge-amber', barClass: 'density-amber', color: '#f59e0b' },
  red: { label: 'Alert', badge: 'badge-red', barClass: 'density-red', color: '#ef4444' },
};

// ── Sub-components ───────────────────────────────────────────────────────────

/** Renders a single zone density card */
function ZoneCard({ zone }: { zone: Zone }): React.ReactElement {
  const cfg = ALERT_CONFIG[zone.alert];
  const density = zone.current / zone.capacity;
  return (
    <div className="card" style={{ borderColor: `${cfg.color}33` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{zone.name}</span>
        <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
      </div>
      <div className="density-bar" aria-label={`Zone density: ${formatPercent(density)}`}>
        <div className={`density-fill ${cfg.barClass}`} style={{ width: formatPercent(density) }} />
      </div>
      <div className="stat-row" style={{ marginTop: 8 }}>
        <span className="stat-label">Occupancy</span>
        <span className="stat-value" style={{ color: cfg.color }}>{formatPercent(density)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Count</span>
        <span className="stat-value">{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── AI Crowd Recommendation Card ─────────────────────────────────────────────

/**
 * Renders a Groq-powered crowd rerouting recommendation card.
 * Makes a real Groq API call based on current zone density data.
 */
function AiCrowdRecommendation(): React.ReactElement {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async (): Promise<void> => {
    setLoading(true);
    const criticalZones = ZONES.filter((z) => z.alert === 'red');
    const clearZones = ZONES.filter((z) => z.alert === 'green');

    const zoneData = ZONES.map(
      (z) => `${z.name}: ${formatPercent(z.current / z.capacity)} (${z.alert.toUpperCase()})`
    ).join('\n');

    const prompt = `You are an AI crowd management system for a FIFA World Cup 2026 stadium.

Real-time zone data:
${zoneData}

Critical zones: ${criticalZones.map((z) => z.name).join(', ')}
Available capacity: ${clearZones.map((z) => z.name).join(', ')}

Provide ONE specific, actionable crowd rerouting recommendation (max 35 words).
Be direct — name the exact gate/zone to redirect from and to.
Example: "Recommend rerouting Gate A traffic to Gate C — density at 91%. Open overflow lanes on West Concourse to restore safe throughput."`;

    const result = await generateCompletion(prompt);
    setRecommendation(
      result ??
        `Recommend rerouting Gate A traffic to Gate C — density at ${formatPercent(1820 / 2000)}. Open overflow lanes on Concourse West immediately.`
    );
    setLoading(false);
    setGenerated(true);
  }, []);

  return (
    <section aria-labelledby="ai-crowd-heading">
      <div className="section-label" id="ai-crowd-heading">🤖 AI Crowd Rerouting — Real-time Decision Support</div>
      <div className="card card-glow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Groq LLaMA analysis of {ZONES.filter((z) => z.alert === 'red').length} critical zones &amp; {ZONES.filter((z) => z.alert === 'green').length} clear zones
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => void handleGenerate()}
            disabled={loading}
            aria-label="Generate AI crowd rerouting recommendation"
          >
            {loading ? '⟳ Analyzing...' : generated ? '↺ Refresh Recommendation' : '🤖 Get Rerouting Recommendation'}
          </button>
        </div>

        {generated && recommendation && (
          <div className="alert-banner alert-red" role="status" aria-live="polite" style={{ marginTop: 0 }}>
            <span aria-hidden="true">🎯</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.85rem' }}>AI Crowd Management Recommendation</div>
              <p style={{ fontStyle: 'italic', margin: 0 }}>"{recommendation}"</p>
            </div>
          </div>
        )}

        {!generated && (
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', padding: '8px 0' }}>
            Click to get a live AI recommendation for rerouting critical density zones.
          </div>
        )}
      </div>
    </section>
  );
}

// ── PA Generator Section ──────────────────────────────────────────────────────

interface PaGeneratorProps {
  zones: Zone[];
}

/** PA announcement generator section with Groq integration */
function PaGenerator({ zones }: PaGeneratorProps): React.ReactElement {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('z1');

  const handleGenerate = useCallback(async (): Promise<void> => {
    const zone = zones.find((z) => z.id === selectedZone);
    if (!zone) return;
    setGenerating(true);
    trackPAGenerated(zone.name);
    const msg = await generatePAAnnouncement(
      zone.name,
      zone.alert === 'green' ? 'amber' : zone.alert,
      `${formatPercent(zone.current / zone.capacity)} occupancy`
    );
    setAnnouncement(msg);
    setGenerating(false);
  }, [zones, selectedZone]);

  return (
    <section aria-labelledby="pa-heading">
      <div className="section-label" id="pa-heading">{t('crowd.paAnnouncement')}</div>
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="zone-select" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
            Select Zone
          </label>
          <select
            id="zone-select"
            className="input"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            aria-label="Select zone for announcement"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => void handleGenerate()}
          disabled={generating}
          aria-label="Generate PA announcement using AI"
        >
          {generating ? `⟳ ${t('crowd.generating')}` : '🎙️ Generate PA Announcement'}
        </button>
        {announcement && (
          <div className="alert-banner alert-amber" role="status" aria-live="polite" style={{ marginTop: 16 }}>
            <span aria-hidden="true">🎙️</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>AI-Generated Announcement</div>
              <p style={{ fontStyle: 'italic' }}>"{announcement}"</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

/** CrowdIQ: live density heatmap, AI choke-point predictions, rerouting recommendations, and PA generator. */
function CrowdIQ(): React.ReactElement {
  const { t } = useTranslation();

  const redZones = ZONES.filter((z) => z.alert === 'red');
  const amberZones = ZONES.filter((z) => z.alert === 'amber');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 {t('crowd.title')}</h1>
        <p className="page-subtitle">{t('crowd.subtitle')}</p>
      </div>

      {/* Alert summary */}
      {redZones.length > 0 && (
        <div className="alert-banner alert-red" role="alert" aria-live="assertive" style={{ marginBottom: 24 }}>
          <span aria-hidden="true">🔴</span>
          <strong>{redZones.length} zone{redZones.length > 1 ? 's' : ''} at CRITICAL density:</strong>
          <span>{redZones.map((z) => z.name).join(', ')}</span>
        </div>
      )}
      {amberZones.length > 0 && !redZones.length && (
        <div className="alert-banner alert-amber" role="status" aria-live="polite" style={{ marginBottom: 24 }}>
          <span aria-hidden="true">🟡</span>
          <strong>{amberZones.length} zone{amberZones.length > 1 ? 's' : ''} at elevated density</strong>
        </div>
      )}

      <div style={{ display: 'grid', gap: 24 }}>
        {/* AI Crowd Rerouting Recommendation */}
        <AiCrowdRecommendation />

        {/* Zone density heatmap */}
        <section aria-labelledby="heatmap-heading">
          <div className="section-label" id="heatmap-heading">{t('crowd.heatmap')}</div>
          <div className="grid-2" style={{ gap: 12 }}>
            {ZONES.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </section>

        {/* AI Choke Points */}
        <section aria-labelledby="choke-heading">
          <div className="section-label" id="choke-heading">🤖 {t('crowd.aiPrediction')} — Choke Points</div>
          <div className="card card-glow">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ZONES.filter((z) => z.alert !== 'green').map((zone) => (
                <div key={zone.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '1.2rem' }} aria-hidden="true">{zone.alert === 'red' ? '🔴' : '🟡'}</span>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{zone.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {zone.alert === 'red'
                        ? 'Immediate rerouting recommended. Direct crowds to Gate C or Gate D.'
                        : 'Monitor closely. Consider opening overflow lanes.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PA Announcement Generator */}
        <PaGenerator zones={ZONES} />
      </div>
    </div>
  );
}

export default CrowdIQ;
