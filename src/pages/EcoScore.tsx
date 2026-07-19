import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { computeCarbonFootprint, getCarbonLabel, getCarbonColor } from '@/utils/carbon';
import { generateEcoTips } from '@/services/gemini';
import { formatCarbon, formatPercent } from '@/utils/format';
import type { CarbonInputs } from '@/types';

const LEADERBOARD = [
  { section: 'Section 100', recycled: 42, composted: 18, landfill: 8, rate: 0.88 },
  { section: 'Section 200', recycled: 35, composted: 12, landfill: 15, rate: 0.76 },
  { section: 'Section 300', recycled: 28, composted: 8, landfill: 22, rate: 0.62 },
  { section: 'Section 400', recycled: 50, composted: 22, landfill: 5, rate: 0.94 },
];

const SORTED_LB = [...LEADERBOARD].sort((a, b) => b.rate - a.rate);

/** EcoScore: carbon footprint calculator, AI eco tips, energy widget, waste leaderboard. */
function EcoScore(): React.ReactElement {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<CarbonInputs>({ transportMode: 'car', distanceKm: 30, mealType: 'meat', numberOfMeals: 2 });
  const [result, setResult] = useState<ReturnType<typeof computeCarbonFootprint> | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [loadingTips, setLoadingTips] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = async (): Promise<void> => {
    const footprint = computeCarbonFootprint(inputs);
    setResult(footprint);
    setCalculated(true);
    setLoadingTips(true);
    const ecoTips = await generateEcoTips(inputs.transportMode, inputs.mealType, footprint.totalKgCO2);
    setTips(ecoTips);
    setLoadingTips(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌱 {t('sustainability.title')}</h1>
        <p className="page-subtitle">{t('sustainability.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Carbon Calculator */}
        <section aria-labelledby="carbon-heading">
          <div className="section-label" id="carbon-heading">{t('sustainability.carbonFootprint')}</div>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <label htmlFor="transport-mode" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('sustainability.transportMode')}</label>
                <select id="transport-mode" className="input" value={inputs.transportMode} onChange={(e) => setInputs((p) => ({ ...p, transportMode: e.target.value as CarbonInputs['transportMode'] }))} aria-label={t('sustainability.transportMode')}>
                  {(['car', 'bus', 'metro', 'walk', 'bike', 'flight'] as const).map((m) => (
                    <option key={m} value={m}>{t(`sustainability.${m}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="distance" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('sustainability.distanceKm')}</label>
                <input id="distance" type="number" min={0} max={20000} className="input" value={inputs.distanceKm} onChange={(e) => setInputs((p) => ({ ...p, distanceKm: Math.max(0, Number(e.target.value)) }))} aria-label={t('sustainability.distanceKm')} />
              </div>
              <div>
                <label htmlFor="meal-type" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('sustainability.mealType')}</label>
                <select id="meal-type" className="input" value={inputs.mealType} onChange={(e) => setInputs((p) => ({ ...p, mealType: e.target.value as CarbonInputs['mealType'] }))} aria-label={t('sustainability.mealType')}>
                  {(['meat', 'vegetarian', 'vegan'] as const).map((m) => (
                    <option key={m} value={m}>{t(`sustainability.${m}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="num-meals" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{t('sustainability.numberOfMeals')}</label>
                <input id="num-meals" type="number" min={0} max={10} className="input" value={inputs.numberOfMeals} onChange={(e) => setInputs((p) => ({ ...p, numberOfMeals: Math.max(0, Number(e.target.value)) }))} aria-label={t('sustainability.numberOfMeals')} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => void handleCalculate()} aria-label={t('sustainability.calculate')}>
              🌍 {t('sustainability.calculate')}
            </button>
          </div>

          {/* Results */}
          {result && calculated && (
            <div className="card card-glow" style={{ marginTop: 16 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: getCarbonColor(result.totalKgCO2).replace('text-', '#').replace('green-400', '4ade80').replace('yellow-400', 'fbbf24').replace('orange-400', 'fb923c').replace('red-400', 'f87171') }}>
                  {formatCarbon(result.totalKgCO2)}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Total Carbon Footprint · {getCarbonLabel(result.totalKgCO2)} impact
                </div>
              </div>
              <div className="stat-row"><span className="stat-label">✈️ Travel</span><span className="stat-value">{formatCarbon(result.travelKgCO2)}</span></div>
              <div className="stat-row"><span className="stat-label">🍽️ Food</span><span className="stat-value">{formatCarbon(result.foodKgCO2)}</span></div>
              <div className="stat-row"><span className="stat-label">🚗 Equivalent to</span><span className="stat-value">{result.equivalentKm} km by car</span></div>

              {result.offsetOptions.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>OFFSET OPTIONS</div>
                  {result.offsetOptions.map((opt) => (
                    <div key={opt} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', padding: '4px 0', display: 'flex', gap: 8 }}>
                      <span aria-hidden="true">🌿</span> {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* AI Eco Tips */}
        {calculated && (
          <section aria-labelledby="tips-heading" aria-live="polite">
            <div className="section-label" id="tips-heading">🤖 {t('sustainability.ecoTips')}</div>
            <div className="card">
              {loadingTips ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'var(--color-text-muted)' }}>
                  <div className="spinner" style={{ width: 20, height: 20 }} />
                  {t('sustainability.generatingTips')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < tips.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <span style={{ color: 'var(--color-brand)', fontWeight: 700 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stadium Energy Widget */}
        <section aria-labelledby="energy-heading">
          <div className="section-label" id="energy-heading">{t('sustainability.energyUsage')}</div>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(59,130,246,0.05))' }}>
            <div className="grid-3">
              {[
                { label: 'Current Load', value: '4.2 MW', icon: '⚡' },
                { label: 'Peak Today', value: '6.8 MW', icon: '📈' },
                { label: 'Renewable', value: '67%', icon: '☀️' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: '1.6rem' }} aria-hidden="true">{icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-brand-light)', marginTop: 4 }}>{value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Waste Leaderboard */}
        <section aria-labelledby="waste-heading">
          <div className="section-label" id="waste-heading">{t('sustainability.wasteLeaderboard')}</div>
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {SORTED_LB.map((entry, i) => (
                <div key={entry.section} className="stat-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--color-text-muted)', width: 20 }}>{i + 1}</span>
                    <span style={{ fontWeight: 600 }}>{entry.section}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 80 }}>
                      <div className="density-bar"><div className="density-fill density-green" style={{ width: formatPercent(entry.rate) }} /></div>
                    </div>
                    <span className={`badge ${entry.rate > 0.85 ? 'badge-green' : entry.rate > 0.7 ? 'badge-amber' : 'badge-red'}`}>{formatPercent(entry.rate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EcoScore;
