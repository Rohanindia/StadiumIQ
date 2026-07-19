import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/types';

const NAV_ITEMS = [
  { to: '/fan', emoji: '🏟️', key: 'fan' },
  { to: '/crowd', emoji: '📊', key: 'crowd' },
  { to: '/accessibility', emoji: '♿', key: 'accessibility' },
  { to: '/transport', emoji: '🚌', key: 'transport' },
  { to: '/sustainability', emoji: '🌱', key: 'sustainability' },
  { to: '/multilingual', emoji: '🌐', key: 'multilingual' },
  { to: '/ops', emoji: '⚙️', key: 'ops' },
  { to: '/ai-assist', emoji: '🤖', key: 'aiAssist' },
] as const;

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'EN' }, { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' }, { code: 'ar', label: 'AR' },
  { code: 'pt', label: 'PT' }, { code: 'zh', label: 'ZH' },
  { code: 'hi', label: 'HI' }, { code: 'ja', label: 'JA' },
];

/** Top navigation bar with desktop links and mobile hamburger menu. */
function Navigation(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleLangChange = (lang: SupportedLanguage): void => {
    void i18n.changeLanguage(lang);
  };

  const closeMenu = (): void => setMenuOpen(false);

  return (
    <>
      <nav className="nav-bar" aria-label="Main navigation">
        <Link to="/" className="nav-logo" aria-label="StadiumIQ Home">
          <div className="nav-logo-icon" aria-hidden="true">⚽</div>
          <span>StadiumIQ</span>
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          {NAV_ITEMS.map(({ to, emoji, key }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                aria-label={t(`nav.${key}`)}
                aria-current={location.pathname === to ? 'page' : undefined}
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{t(`nav.${key}`)}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language picker */}
          <select
            className="input"
            value={i18n.language.slice(0, 2)}
            onChange={(e) => handleLangChange(e.target.value as SupportedLanguage)}
            aria-label={t('common.language')}
            style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: '0.8rem' }}
          >
            {LANGUAGES.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className="mobile-menu"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onClick={closeMenu}
          onKeyDown={(e) => { if (e.key === 'Escape') closeMenu(); }}
        >
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="mobile-menu-panel"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>StadiumIQ</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={closeMenu}
                aria-label="Close menu"
              >✕</button>
            </div>
            {NAV_ITEMS.map(({ to, emoji, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                style={{ width: '100%', padding: '10px 12px' }}
                onClick={closeMenu}
                aria-label={t(`nav.${key}`)}
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{t(`nav.${key}`)}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav (shows 5 most-used routes) */}
      <nav className="bottom-nav" aria-label="Quick navigation">
        {NAV_ITEMS.slice(0, 4).map(({ to, emoji, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            aria-label={t(`nav.${key}`)}
            aria-current={location.pathname === to ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">{emoji}</span>
            <span>{t(`nav.${key}`)}</span>
          </NavLink>
        ))}
        <NavLink
          to="/ai-assist"
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          aria-label={t('nav.aiAssist')}
        >
          <span className="bottom-nav-icon" aria-hidden="true">🤖</span>
          <span>AI</span>
        </NavLink>
      </nav>
    </>
  );
}

export default Navigation;
