import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AlertItem {
  time: string;
  msg: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  { time: '16:21:04', msg: 'System integrity nominal. All services operational.' },
  { time: '16:22:15', msg: 'Shuttles from Sector B running with 4m headway.' },
  { time: '16:23:01', msg: 'Energy efficiency optimization active in Zone E.' },
];

const MODULE_LINKS = [
  { to: '/fan', emoji: '🏟️', key: 'fan', color: '#10b981', desc: 'Seat finder, gate routing & AR wayfinding' },
  { to: '/crowd', emoji: '📊', key: 'crowd', color: '#3b82f6', desc: 'Density heatmap & AI choke-point predictions' },
  { to: '/accessibility', emoji: '♿', key: 'accessibility', color: '#8b5cf6', desc: 'Wheelchair routes & one-tap assistance' },
  { to: '/transport', emoji: '🚌', key: 'transport', color: '#f59e0b', desc: 'Shuttle ETAs & departure wave tips' },
  { to: '/sustainability', emoji: '🌱', key: 'sustainability', color: '#22c55e', desc: 'Carbon footprint & sustainability scorecard' },
  { to: '/multilingual', emoji: '🌐', key: 'multilingual', color: '#06b6d4', desc: 'Real-time AI voice translation chat' },
  { to: '/ops', emoji: '⚙️', key: 'ops', color: '#ef4444', desc: 'Staff dashboard: incident logger & resource dispatcher' },
  { to: '/ai-assist', emoji: '🤖', key: 'aiAssist', color: '#a78bfa', desc: 'Gemini-powered GameDay tournament assistant' },
];

function Home(): React.ReactElement {
  const { t } = useTranslation();

  // Dashboard state
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [alertCount, setAlertCount] = useState(0);
  const [selectedFeed, setSelectedFeed] = useState<'security' | 'transit' | 'pitch'>('pitch');
  const [matchMinutes, setMatchMinutes] = useState(78);
  const [matchSeconds, setMatchSeconds] = useState(42);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Match Time counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setMatchSeconds((prevSec) => {
        if (prevSec >= 59) {
          setMatchMinutes((prevMin) => (prevMin >= 90 ? 0 : prevMin + 1));
          return 0;
        }
        return prevSec + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate adding a live alert
  const triggerMockAlert = (): void => {
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0] ?? '16:24:00';
    const mockMessages = [
      'Gate 4 ingress queue exceeds standard wait times (+5m).',
      'Heavy pedestrian flow reported near Accessibility Ramp East.',
      'Shuttle Bus #12 dispatching to overflow Parking Lot C.',
      'Gemini AI: Predicted choke-point at Concourse Sector D in 10m.',
    ];
    const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)] ?? 'Incident alert registered.';
    
    setAlerts((prev) => [{ time: timeString, msg: randomMsg }, ...prev.slice(0, 4)]);
    setAlertCount((prev) => prev + 1);
  };

  const clearAlerts = (): void => {
    setAlerts([{ time: 'System', msg: 'Alert history cleared.' }]);
    setAlertCount(0);
  };

  const formatTime = (min: number, sec: number): string => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Smart Operations Dashboard container */}
      <section className="dashboard-root" aria-label="Smart Stadium Operations Dashboard">
        {/* Banner header */}
        <div className="dashboard-banner">
          <div className="dashboard-banner-title">
            <span style={{ fontSize: '1.4rem' }}>⚽</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
          <div className="dashboard-banner-subtitle">
            SMART STADIUM OPERATIONS DASHBOARD
          </div>
        </div>

        {/* Dashboard 3-column layout */}
        <div className="dashboard-grid">
          
          {/* COLUMN 1: LEFT PANELS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* System Overview */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">
                <span className="cyber-panel-title-text">SYSTEM OVERVIEW</span>
                <span className="pulsing-status"></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>STATUS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>ACTIVE</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ALERTS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: alertCount > 0 ? '#ef4444' : '#fff', marginTop: 2 }}>
                    {alertCount}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '0.7rem', padding: '6px' }} onClick={triggerMockAlert}>
                  ⚠️ Trigger Alert
                </button>
                {alertCount > 0 && (
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '0.7rem', padding: '6px', color: '#ef4444' }} onClick={clearAlerts}>
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Zones */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">
                <span className="cyber-panel-title-text">ZONES MONITOR</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-brand-light)' }}>LIVE FEED</span>
              </div>
              <div className="zones-list">
                {[
                  { name: 'ZONE A', count: '14,820', max: '15,000', rate: 98, status: 'NORMAL' },
                  { name: 'ZONE B', count: '10,120', max: '12,500', rate: 80, status: 'NORMAL' },
                  { name: 'ZONE C', count: '14,940', max: '15,000', rate: 99, status: 'HEAVY' },
                  { name: 'ZONE D', count: '8,450', max: '10,000', rate: 84, status: 'NORMAL' },
                  { name: 'ZONE E', count: '15,450', max: '15,000', rate: 103, status: 'CRITICAL' },
                  { name: 'ZONE G', count: '17,670', max: '17,500', rate: 100, status: 'HEAVY' },
                ].map((zone) => (
                  <button 
                    key={zone.name} 
                    className="zone-row"
                    style={{ 
                      cursor: 'pointer',
                      borderColor: selectedZone === zone.name ? '#10b981' : 'rgba(255,255,255,0.03)',
                      background: selectedZone === zone.name ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                    }}
                    onClick={() => setSelectedZone(selectedZone === zone.name ? null : zone.name)}
                  >
                    <div className="zone-badge">{zone.name.split(' ')[1]}</div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span>{zone.count}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>/ {zone.max}</span>
                      </div>
                      <div className="zone-capacity-fill">
                        <div 
                          className="zone-capacity-bar" 
                          style={{ 
                            width: `${Math.min(zone.rate, 100)}%`,
                            background: zone.status === 'CRITICAL' ? '#ef4444' : zone.status === 'HEAVY' ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'right', 
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      color: zone.status === 'CRITICAL' ? '#ef4444' : zone.status === 'HEAVY' ? '#f59e0b' : '#10b981'
                    }}>
                      {zone.status}
                    </div>
                  </button>
                ))}
              </div>
              {selectedZone && (
                <div style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: 8, borderRadius: 6, color: '#a7f3d0' }}>
                  <strong>{selectedZone} Diagnostics:</strong> Access ramp flows clear. High density detected around exit gates. Recommending exit wave direction adjustments.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: CENTER PANEL (VISUAL PORT) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stadium Visualizer */}
            <div className="stadium-viewport">
              <div className="live-feed-watermark" style={{ fontSize: '0.8rem', top: 16, left: 16 }}>
                🎥 LIVE VISUAL TELEMETRY · LUZ GLOBAL STADIUM
              </div>
              
              <div className="stadium-image-wrapper" style={{ marginTop: 24 }}>
                <img 
                  src="/stadium_dashboard_hero.png" 
                  alt="Futuristic Smart Stadium operations visualization" 
                  className="stadium-image"
                />
                <div className="scanner-overlay"></div>
              </div>

              {/* Grid overlays for visual dashboards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginTop: 16 }}>
                {/* Crowd Density widget */}
                <div className="cyber-panel" style={{ padding: 12, background: 'rgba(5, 8, 17, 0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                    <span>CROWD DENSITY METRICS</span>
                    <span style={{ color: '#10b981' }}>STABLE</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                    <div style={{ flex: 1.2 }}>
                      <div className="heatmap-simulation">
                        <div className="heatmap-glow-center"></div>
                      </div>
                    </div>
                    <div style={{ flex: 0.8, textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff' }}>94%</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Avg Density</div>
                    </div>
                  </div>
                </div>

                {/* Fan Engagement widget */}
                <div className="cyber-panel" style={{ padding: 12, background: 'rgba(5, 8, 17, 0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                    <span>FAN ENGAGEMENT</span>
                    <span style={{ color: '#06b6d4' }}>HIGH</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>Attendance:</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>81,450 / 85,000</span>
                    </div>
                    <div className="density-bar" style={{ height: 6, marginTop: 4 }}>
                      <div className="density-fill density-green" style={{ width: '95.8%', background: 'linear-gradient(90deg, #06b6d4, #10b981)' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      <span>Capacity: 95.8%</span>
                      <span>16 Exit Waves Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: RIGHT PANELS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Event Insights */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">
                <span className="cyber-panel-title-text">EVENT INSIGHTS</span>
                <span className="badge badge-green" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>G-17</span>
              </div>
              <div className="match-scoresheet">
                <div className="match-team-row">
                  <div className="match-team-info">
                    <span style={{ fontSize: '1.25rem' }}>🇧🇷</span>
                    <span>BRAZIL</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>2</div>
                </div>
                <div className="match-team-row">
                  <div className="match-team-info">
                    <span style={{ fontSize: '1.25rem' }}>🇩🇪</span>
                    <span>GERMANY</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>1</div>
                </div>
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>MATCH TIMER</span>
                  <span className="match-time-ticker">{formatTime(matchMinutes, matchSeconds)}</span>
                </div>
              </div>
            </div>

            {/* Fan Services */}
            <div className="cyber-panel">
              <div className="cyber-panel-header">
                <span className="cyber-panel-title-text">FAN SERVICES</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>METERED</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Merch */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>👕 Merch Stands</span>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>92% Stocked</span>
                  </div>
                  <div className="density-bar" style={{ height: 4 }}>
                    <div className="density-fill density-green" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Food */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🍔 Concessions</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>78% Capacity</span>
                  </div>
                  <div className="density-bar" style={{ height: 4 }}>
                    <div className="density-fill density-amber" style={{ width: '78%' }}></div>
                  </div>
                </div>

                {/* Parking */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>🚗 Parking Lots</span>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>95% Occupied</span>
                  </div>
                  <div className="density-bar" style={{ height: 4 }}>
                    <div className="density-fill density-red" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM METRICS & CHANNELS */}
        <div className="bottom-dashboard-row">
          {/* Live camera feed monitor */}
          <div className="cyber-panel">
            <div className="cyber-panel-header">
              <span className="cyber-panel-title-text">SIMULATED FEED: {selectedFeed.toUpperCase()} MONITOR</span>
              <div className="live-feed-rec-dot">REC</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 15, alignItems: 'center' }}>
              <div className="live-feed-monitor" style={{ flex: 1 }}>
                <div className="live-feed-grid-effect"></div>
                <div className="live-feed-watermark">
                  CAM_0{selectedFeed === 'pitch' ? '4' : selectedFeed === 'transit' ? '2' : '9'} · OVERLAY TELEMETRY ACTIVE
                </div>
                
                {selectedFeed === 'pitch' && (
                  <div style={{ textAlign: 'center', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', zIndex: 1, padding: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>MATCH PROGRESS STREAM</div>
                    <div style={{ marginTop: 4 }}>Active Tracking: 22 Players + Ball</div>
                    <div style={{ color: '#0ea5e9', fontSize: '0.7rem' }}>FPS: 60.0 · Resol: 4K 120Hz</div>
                  </div>
                )}

                {selectedFeed === 'transit' && (
                  <div style={{ textAlign: 'center', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.8rem', zIndex: 1, padding: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>TRANSIT GATEWAY EAST</div>
                    <div style={{ marginTop: 4 }}>Headway: Shuttles running every 4 min</div>
                    <div style={{ color: '#10b981', fontSize: '0.7rem' }}>Bus occupancy: 64% avg</div>
                  </div>
                )}

                {selectedFeed === 'security' && (
                  <div style={{ textAlign: 'center', color: '#ef4444', fontFamily: 'monospace', fontSize: '0.8rem', zIndex: 1, padding: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>SECURITY PORTAL 3-A</div>
                    <div style={{ marginTop: 4 }}>Status: Flowing steady. Bags screen OK.</div>
                    <div style={{ color: '#10b981', fontSize: '0.7rem' }}>Throughput: 85 fans/min</div>
                  </div>
                )}
              </div>

              <div className="feed-btn-group" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '120px' }}>
                <button 
                  className={`feed-btn ${selectedFeed === 'security' ? 'active' : ''}`}
                  onClick={() => setSelectedFeed('security')}
                >
                  👮 Security Feed
                </button>
                <button 
                  className={`feed-btn ${selectedFeed === 'transit' ? 'active' : ''}`}
                  onClick={() => setSelectedFeed('transit')}
                >
                  🚌 Transit Hub
                </button>
                <button 
                  className={`feed-btn ${selectedFeed === 'pitch' ? 'active' : ''}`}
                  onClick={() => setSelectedFeed('pitch')}
                >
                  🏟️ Pitch Stream
                </button>
              </div>
            </div>
          </div>

          {/* Alert Terminal */}
          <div className="cyber-panel">
            <div className="cyber-panel-header">
              <span className="cyber-panel-title-text">DIAGNOSTICS & ALERTS</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#10b981' }}>SYS_LOG.DAT</span>
            </div>
            
            <div className="alert-terminal">
              {alerts.map((al, idx) => (
                <div key={idx} className="alert-terminal-line">
                  <span className="alert-terminal-timestamp">[{al.time}]</span>
                  <span>{al.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry stats circles */}
        <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.15)', paddingTop: 16, marginTop: 10 }}>
          <div className="circle-telemetry-container">
            <div className="circle-telemetry-item">
              <div className="circle-progress" style={{ '--p': '100%' } as React.CSSProperties}>
                <div className="circle-progress-value" style={{ color: '#10b981' }}>OK</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Security</span>
            </div>

            <div className="circle-telemetry-item">
              <div className="circle-progress" style={{ '--p': '98%' } as React.CSSProperties}>
                <div className="circle-progress-value">98%</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Power</span>
            </div>

            <div className="circle-telemetry-item">
              <div className="circle-progress" style={{ '--p': '88%' } as React.CSSProperties}>
                <div className="circle-progress-value" style={{ color: '#06b6d4' }}>HIGH</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Network</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINK NAVIGATION TO MODULES */}
      <section className="quick-links-section" aria-labelledby="modules-title">
        <div className="section-label" id="modules-title" style={{ marginBottom: 4 }}>
          OPERATIONAL APP MODULES
        </div>
        <div className="quick-links-grid">
          {MODULE_LINKS.map(({ to, emoji, key, color, desc }) => (
            <Link key={to} to={to} className="quick-link-btn" style={{ '--fc-color': color } as React.CSSProperties}>
              <span className="quick-link-icon" aria-hidden="true">{emoji}</span>
              <div className="quick-link-info">
                <span className="quick-link-title">{t(`nav.${key}`)}</span>
                <span className="quick-link-desc">{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
