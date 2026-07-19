import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePAAnnouncement } from '@/services/gemini';
import type { AlertLevel } from '@/types';
import { formatPercent } from '@/utils/format';

const ZONES = [
  { id: 'z1', name: 'Gate A Concourse', capacity: 2000, current: 1820, alert: 'red' as AlertLevel },
  { id: 'z2', name: 'Gate B Concourse', capacity: 2000, current: 1100, alert: 'amber' as AlertLevel },
  { id: 'z3', name: 'Gate C Concourse', capacity: 2000, current: 600, alert: 'green' as AlertLevel },
  { id: 'z4', name: 'Main Atrium', capacity: 3000, current: 2700, alert: 'red' as AlertLevel },
  { id: 'z5', name: 'Section 100 Block', capacity: 1500, current: 900, alert: 'amber' as AlertLevel },
  { id: 'z6', name: 'Food Court East', capacity: 800, current: 200, alert: 'green' as AlertLevel },
];

const ALERT_CONFIG: Record<AlertLevel, { label: string; badge: string; barClass: string; color: string }> = {
  green: { label: 'Clear', badge: 'badge-green', barClass: 'density-green', color: '#22c55e' },
  amber: { label: 'Caution', badge: 'badge-amber', barClass: 'density-amber', color: '#f59e0b' },
  red: { label: 'Alert', badge: 'badge-red', barClass: 'density-red', color: '#ef4444' },
};

/** CrowdIQ: live density heatmap, AI choke-point predictions, PA announcement generator. */
function CrowdIQ(): React.ReactElement {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('z1');

  const handleGenerate = async (): Promise<void> => {
    const zone = ZONES.find((z) => z.id === selectedZone);
    if (!zone) return;
    setGenerating(true);
    const msg = await generatePAAnnouncement(zone.name, zone.alert === 'green' ? 'amber' : zone.alert, `${formatPercent(zone.current / zone.capacity)} occupancy`);
    setAnnouncement(msg);
    setGenerating(false);
  };

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
        {/* Zone grid */}
        <section aria-labelledby="heatmap-heading">
          <div className="section-label" id="heatmap-heading">{t('crowd.heatmap')}</div>
          <div className="grid-2" style={{ gap: 12 }}>
            {ZONES.map((zone) => {
              const cfg = ALERT_CONFIG[zone.alert];
              const density = zone.current / zone.capacity;
              return (
                <div key={zone.id} className="card" style={{ borderColor: `${cfg.color}33` }}>
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
            })}
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
        <section aria-labelledby="pa-heading">
          <div className="section-label" id="pa-heading">{t('crowd.paAnnouncement')}</div>
          <div className="card">
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="zone-select" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Select Zone</label>
              <select id="zone-select" className="input" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} aria-label="Select zone for announcement">
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => void handleGenerate()} disabled={generating} aria-label="Generate PA announcement using AI">
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
      </div>
    </div>
  );
}

export default CrowdIQ;
