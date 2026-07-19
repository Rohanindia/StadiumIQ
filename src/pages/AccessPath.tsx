import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeAndTruncate } from '@/utils/sanitize';

const ROUTES = [
  { id: 'r1', from: 'Gate A', to: 'Section 100 (Wheelchair)', steps: ['Enter Gate A — accessible entrance on the right', 'Take the dedicated elevator to Level 1', 'Follow blue accessibility signs to Section 100'], mins: 6, elevator: true, status: 'operational' as const },
  { id: 'r2', from: 'Gate C', to: 'Sensory Suite', steps: ['Enter Gate C — wide accessible entrance', 'Proceed straight 40m to the elevator bank', 'Level 2 — Sensory Suite is on the left'], mins: 8, elevator: true, status: 'operational' as const },
  { id: 'r3', from: 'Parking Lot B', to: 'Section 300 (Accessible)', steps: ['Use the dedicated accessible parking exit', 'Follow the blue path to Gate D ramp', 'Take the elevator to Level 3', 'Section 300 accessible entrance is straight ahead'], mins: 12, elevator: true, status: 'maintenance' as const },
];

const SENSORY_ZONES = [
  { id: 'sz1', name: 'Sensory Suite A', location: 'Level 2, behind Section 210', features: ['Reduced lighting', 'Noise-cancelling', 'Quiet seating', 'Staff on call'] },
  { id: 'sz2', name: 'Quiet Room', location: 'Level 1, near Gate B', features: ['Completely quiet', 'Dim lighting', 'Comfortable seating'] },
];

const ELEVATORS = [
  { id: 'e1', location: 'Gate A — South Tower', status: 'operational' as const },
  { id: 'e2', location: 'Gate B — Main Atrium', status: 'maintenance' as const },
  { id: 'e3', location: 'Gate C — West Wing', status: 'operational' as const },
  { id: 'e4', location: 'Gate D — East Entrance', status: 'out-of-order' as const },
];

const ELEVATOR_BADGE: Record<string, string> = {
  operational: 'badge-green',
  maintenance: 'badge-amber',
  'out-of-order': 'badge-red',
};

/** AccessPath: wheelchair routes, sensory zones, elevator status, assistance requests. */
function AccessPath(): React.ReactElement {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [needType, setNeedType] = useState('mobility');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const clean = sanitizeAndTruncate(notes, 500);
    if (import.meta.env['VITE_IS_DEV'] === 'true') {
      console.warn('Assistance request:', { location: sanitizeAndTruncate(location, 100), needType, notes: clean });
    }
    setSubmitted(true);
    setLocation(''); setNotes('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">♿ {t('accessibility.title')}</h1>
        <p className="page-subtitle">{t('accessibility.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Wheelchair Routes */}
        <section aria-labelledby="routes-heading">
          <div className="section-label" id="routes-heading">{t('accessibility.wheelchairRoutes')}</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {ROUTES.map((route) => (
              <div key={route.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontWeight: 700 }}>{route.from} → {route.to}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge badge-blue">~{route.mins} min</span>
                    {route.elevator && (
                      <span className={`badge ${ELEVATOR_BADGE[route.status]}`}>
                        🛗 {t(`accessibility.${route.status}` as `accessibility.${typeof route.status}`)}
                      </span>
                    )}
                  </div>
                </div>
                <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {route.steps.map((step, i) => (
                    <li key={i} style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Sensory Zones */}
        <section aria-labelledby="sensory-heading">
          <div className="section-label" id="sensory-heading">{t('accessibility.sensoryZones')}</div>
          <div className="grid-2">
            {SENSORY_ZONES.map((zone) => (
              <div key={zone.id} className="card" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }} aria-hidden="true">🧠</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{zone.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>{zone.location}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {zone.features.map((f) => <span key={f} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{f}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Elevator Status */}
        <section aria-labelledby="elevator-heading">
          <div className="section-label" id="elevator-heading">{t('accessibility.elevatorStatus')}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {ELEVATORS.map((el) => (
              <div key={el.id} className="card" style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.3rem' }} aria-hidden="true">🛗</span>
                  <span style={{ fontSize: '0.9rem' }}>{el.location}</span>
                </div>
                <span className={`badge ${ELEVATOR_BADGE[el.status]}`}>{t(`accessibility.${el.status}` as `accessibility.${typeof el.status}`)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Assistance Request */}
        <section aria-labelledby="assist-heading">
          <div className="section-label" id="assist-heading">{t('accessibility.requestAssistance')}</div>
          <div className="card card-glow">
            {submitted ? (
              <div className="alert-banner alert-green" role="status" aria-live="polite">
                <span aria-hidden="true">✅</span>
                <span>{t('accessibility.requestSubmitted')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <label htmlFor="location-input" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('accessibility.yourLocation')}</label>
                    <input id="location-input" className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Gate A, near elevator" required aria-required="true" aria-label={t('accessibility.yourLocation')} />
                  </div>
                  <div>
                    <label htmlFor="need-type" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('accessibility.assistanceType')}</label>
                    <select id="need-type" className="input" value={needType} onChange={(e) => setNeedType(e.target.value)} aria-label={t('accessibility.assistanceType')}>
                      <option value="mobility">{t('accessibility.mobility')}</option>
                      <option value="visual">{t('accessibility.visual')}</option>
                      <option value="hearing">{t('accessibility.hearing')}</option>
                      <option value="medical">{t('accessibility.medical')}</option>
                      <option value="other">{t('accessibility.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notes-input" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('accessibility.notes')}</label>
                    <textarea id="notes-input" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Any additional details..." aria-label={t('accessibility.notes')} style={{ resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" aria-label={t('accessibility.submitRequest')} disabled={!location}>
                    🆘 {t('accessibility.submitRequest')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AccessPath;
