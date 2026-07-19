import React from 'react';
import { Link } from 'react-router-dom';

function NotFound(): React.ReactElement {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: '5rem' }} aria-hidden="true">⚽</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360 }}>
        This page is out of bounds! Let's get you back on the pitch.
      </p>
      <Link to="/" className="btn btn-primary btn-lg" aria-label="Go to home page">
        🏠 Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
