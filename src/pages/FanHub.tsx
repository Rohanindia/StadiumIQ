import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trackSeatSearched } from '@/services/analytics';

const SECTIONS = [
  { id: '100', gate: 'Gate A', capacity: 450, occupied: 390 },
  { id: '101', gate: 'Gate A', capacity: 450, occupied: 210 },
  { id: '102', gate: 'Gate B', capacity: 450, occupied: 430 },
  { id: '103', gate: 'Gate B', capacity: 450, occupied: 150 },
  { id: '104', gate: 'Gate C', capacity: 450, occupied: 350 },
];

const FOOD_STALLS = [
  { id: 'f1', name: 'World Cup Grill', section: '100-102', gate: 'Gate A', wait: 5, status: 'short' as const, isOpen: true, items: ['Burgers', 'Hot Dogs', 'Fries'] },
  { id: 'f2', name: 'Global Bites', section: '103-106', gate: 'Gate B', wait: 18, status: 'long' as const, isOpen: true, items: ['Tacos', 'Empanadas', 'Sushi Rolls'] },
  { id: 'f3', name: 'The Trophy Tap', section: '200-204', gate: 'Gate C', wait: 8, status: 'medium' as const, isOpen: true, items: ['Beer', 'Cocktails', 'Soft Drinks'] },
  { id: 'f4', name: 'Eco Eats', section: '300+', gate: 'Gate D', wait: 3, status: 'short' as const, isOpen: true, items: ['Salads', 'Wraps', 'Smoothies'] },
  { id: 'f5', name: 'Penalty Box Pizza', section: '105-110', gate: 'Gate A', wait: 22, status: 'long' as const, isOpen: false, items: ['Pizza', 'Calzone'] },
];

const QUEUE_COLOR: Record<string, string> = { short: 'badge-green', medium: 'badge-amber', long: 'badge-red' };

/** Fan Hub: seat locator, gate routing, food map with queue times. */
function FanHub(): React.ReactElement {
  const { t } = useTranslation();
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');
  const [result, setResult] = useState<{ gate: string; steps: string[] } | null>(null);

  const findSeat = (): void => {
    const sec = SECTIONS.find((s) => s.id === section);
    if (!sec) {
      trackSeatSearched(section, false);
      setResult({ gate: 'Unknown', steps: ['Section not found. Please check your ticket and try again.'] });
      return;
    }
    trackSeatSearched(section, true);
    setResult({
      gate: sec.gate,
      steps: [
        `Enter through ${sec.gate} (look for the ${sec.gate.replace('Gate ', '')} signs)`,
        `Follow the concourse signs to Section ${section}`,
        `Take the escalator or stairs to your level`,
        `Find Row ${row || '—'}, Seat ${seat || '—'}`,
        `Enjoy the match! ⚽`,
      ],
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏟️ {t('fan.title')}</h1>
        <p className="page-subtitle">{t('fan.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Seat Locator */}
        <section aria-labelledby="seat-locator-heading">
          <div className="section-label" id="seat-locator-heading">{t('fan.seatLocator')}</div>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div>
                <label htmlFor="section-input" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Section</label>
                <input id="section-input" className="input" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. 102" aria-label="Section number" />
              </div>
              <div>
                <label htmlFor="row-input" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Row</label>
                <input id="row-input" className="input" value={row} onChange={(e) => setRow(e.target.value)} placeholder="e.g. G" aria-label="Row letter" />
              </div>
              <div>
                <label htmlFor="seat-input" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Seat</label>
                <input id="seat-input" className="input" value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="e.g. 14" aria-label="Seat number" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={findSeat} aria-label="Find my seat">
              🔍 {t('fan.findSeat')}
            </button>
            {result && (
              <div className="alert-banner alert-green" role="status" aria-live="polite" style={{ marginTop: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Enter via {result.gate}</div>
                  <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {result.steps.map((step, i) => <li key={i} style={{ fontSize: '0.9rem' }}>{step}</li>)}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Food & Beverage Map */}
        <section aria-labelledby="food-map-heading">
          <div className="section-label" id="food-map-heading">{t('fan.foodMap')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {FOOD_STALLS.map((stall) => (
              <div key={stall.id} className="card" style={{ opacity: stall.isOpen ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700 }}>{stall.name}</span>
                      <span className={`badge ${stall.isOpen ? 'badge-green' : 'badge-red'}`}>
                        {stall.isOpen ? t('fan.open') : t('fan.closed')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                      {stall.gate} · Sections {stall.section}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {stall.items.map((item) => (
                        <span key={item} className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                  {stall.isOpen && (
                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${QUEUE_COLOR[stall.status]}`}>
                        {stall.wait} {t('fan.minutes')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AR Wayfinding teaser */}
        <section aria-labelledby="ar-heading">
          <div className="section-label" id="ar-heading">{t('fan.arWayfinding')}</div>
          <div className="card card-glow" style={{ background: 'linear-gradient(135deg, rgba(29,158,117,0.1), rgba(59,130,246,0.05))', textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">📱</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, fontFamily: 'var(--font-display)' }}>AR Navigation</div>
            <div style={{ color: 'var(--color-text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
              Point your camera and follow the augmented reality arrows to your seat, food stalls, or exits.
            </div>
            <button className="btn btn-primary" aria-label="Open AR navigation (requires camera)">
              📷 {t('fan.openAR')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FanHub;
