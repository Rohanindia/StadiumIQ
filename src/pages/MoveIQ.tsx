/**
 * @fileoverview MoveIQ — Real-time shuttle ETAs, parking occupancy, rideshare links, and departure wave recommendations.
 * Helps fans plan their post-match exit strategy with AI-informed wave timing.
 * Route: /transport
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatEta, formatPercent } from '@/utils/format';
import { usePageTitle } from '@/hooks/usePageTitle';

const SHUTTLES = [
  { id: 's1', name: 'MetLife ↔ Newark Penn Station', from: 'Newark Penn', to: 'Gate A Drop-off', eta: 8, nextDeparture: '3:45 PM', capacity: 60, occupancy: 45, running: true },
  { id: 's2', name: 'MetLife ↔ Secaucus Junction', from: 'Secaucus', to: 'Gate B Drop-off', eta: 12, nextDeparture: '3:52 PM', capacity: 60, occupancy: 60, running: true },
  { id: 's3', name: 'Overflow Parking Shuttle', from: 'Lot C', to: 'Main Gate', eta: 5, nextDeparture: '3:48 PM', capacity: 40, occupancy: 18, running: true },
  { id: 's4', name: 'Hotel Express — Meadowlands', from: 'Marriott Hotel', to: 'VIP Gate', eta: 20, nextDeparture: '4:00 PM', capacity: 30, occupancy: 12, running: false },
];

const PARKING = [
  { id: 'p1', name: 'Lot A — Blue', total: 800, available: 142, distance: 250 },
  { id: 'p2', name: 'Lot B — Yellow', total: 1200, available: 0, distance: 350 },
  { id: 'p3', name: 'Lot C — Red', total: 1000, available: 567, distance: 600 },
  { id: 'p4', name: 'VIP Lot — Gold', total: 200, available: 45, distance: 100 },
];

const WAVES = [
  { wave: 1 as const, desc: 'Leave immediately after final whistle', exit: 'Gate A & B', waitMins: 5, modes: ['Shuttle Express', 'Pre-booked Uber/Lyft'] },
  { wave: 2 as const, desc: '15–25 min after final whistle', exit: 'Gate C & D', waitMins: 15, modes: ['NJ Transit', 'Shuttle Standard', 'Metro'] },
  { wave: 3 as const, desc: '30+ min (watch post-match ceremony)', exit: 'Any gate', waitMins: 30, modes: ['All options — least crowded'] },
];

/**
 * MoveIQ: shuttle ETAs, parking occupancy, rideshare links, departure waves.
 *
 * Displays real-time ETAs for 4 shuttle routes, live parking lot occupancy for
 * 4 lots, Uber/Lyft deep links, and 3-wave departure recommendations to minimise
 * post-match congestion at MetLife Stadium.
 */
function MoveIQ(): React.ReactElement {
  const { t } = useTranslation();
  usePageTitle('MoveIQ — Transport');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚌 {t('transport.title')}</h1>
        <p className="page-subtitle">{t('transport.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Shuttle ETAs */}
        <section aria-labelledby="shuttle-heading">
          <div className="section-label" id="shuttle-heading">{t('transport.shuttleEta')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {SHUTTLES.map((shuttle) => {
              const occ = shuttle.occupancy / shuttle.capacity;
              return (
                <div key={shuttle.id} className="card" style={{ opacity: shuttle.running ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{shuttle.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{shuttle.from} → {shuttle.to}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {shuttle.running ? (
                        <>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-brand)', fontFamily: 'var(--font-display)' }}>{formatEta(shuttle.eta)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Next: {shuttle.nextDeparture}</div>
                        </>
                      ) : (
                        <span className="badge badge-red">Not Running</span>
                      )}
                    </div>
                  </div>
                  {shuttle.running && (
                    <div style={{ marginTop: 10 }}>
                      <div className="density-bar" aria-label={`Shuttle occupancy: ${formatPercent(occ)}`}>
                        <div className={`density-fill ${occ > 0.85 ? 'density-red' : occ > 0.6 ? 'density-amber' : 'density-green'}`} style={{ width: formatPercent(occ) }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{shuttle.occupancy}/{shuttle.capacity} seats • {formatPercent(occ)} full</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Parking */}
        <section aria-labelledby="parking-heading">
          <div className="section-label" id="parking-heading">{t('transport.parkingOccupancy')}</div>
          <div className="grid-2">
            {PARKING.map((lot) => {
              const avail = lot.available / lot.total;
              return (
                <div key={lot.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{lot.name}</span>
                    <span className={`badge ${lot.available === 0 ? 'badge-red' : avail > 0.3 ? 'badge-green' : 'badge-amber'}`}>
                      {lot.available === 0 ? 'Full' : `${lot.available} spots`}
                    </span>
                  </div>
                  <div className="density-bar">
                    <div className={`density-fill ${lot.available === 0 ? 'density-red' : avail > 0.3 ? 'density-green' : 'density-amber'}`} style={{ width: formatPercent(1 - avail) }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                    {lot.distance}m to main gate
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rideshare */}
        <section aria-labelledby="rideshare-heading">
          <div className="section-label" id="rideshare-heading">{t('transport.rideshare')}</div>
          <div className="grid-2">
            <a href="https://m.uber.com/looking" className="card" style={{ textDecoration: 'none', display: 'block', borderColor: 'rgba(0,0,0,0.5)', background: '#000', textAlign: 'center' }} aria-label="Open Uber app">
              <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">🚗</div>
              <div style={{ fontWeight: 700, color: 'white' }}>Uber</div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 4 }}>~12 min wait</div>
            </a>
            <a href="https://lyft.com/ride" className="card" style={{ textDecoration: 'none', display: 'block', borderColor: 'rgba(255,0,122,0.3)', background: 'rgba(255,0,122,0.05)', textAlign: 'center' }} aria-label="Open Lyft app">
              <div style={{ fontSize: '2rem', marginBottom: 8 }} aria-hidden="true">🚕</div>
              <div style={{ fontWeight: 700, color: '#ff007a' }}>Lyft</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>~8 min wait</div>
            </a>
          </div>
        </section>

        {/* Departure Waves */}
        <section aria-labelledby="waves-heading">
          <div className="section-label" id="waves-heading">{t('transport.departureWaves')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {WAVES.map((wave) => (
              <div key={wave.wave} className="card" style={{ borderLeft: `3px solid var(--color-brand)` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand), var(--color-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                    {wave.wave}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Wave {wave.wave}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>{wave.desc}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span className="badge badge-blue">Exit: {wave.exit}</span>
                      <span className="badge badge-green">~{wave.waitMins} min wait</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {wave.modes.map((m) => <span key={m} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{m}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default MoveIQ;
