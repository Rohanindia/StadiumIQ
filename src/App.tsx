import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ErrorBoundary from '@/components/Layout/ErrorBoundary';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('@/pages/Home'));
const AiAssist = lazy(() => import('@/pages/AiAssist'));
const FanHub = lazy(() => import('@/pages/FanHub'));
const CrowdIQ = lazy(() => import('@/pages/CrowdIQ'));
const OpsCommand = lazy(() => import('@/pages/OpsCommand'));
const AccessPath = lazy(() => import('@/pages/AccessPath'));
const MoveIQ = lazy(() => import('@/pages/MoveIQ'));
const EcoScore = lazy(() => import('@/pages/EcoScore'));
const LinguaAssist = lazy(() => import('@/pages/LinguaAssist'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader(): React.ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Loading…</p>
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ai-assist" element={<AiAssist />} />
            <Route path="/fan" element={<FanHub />} />
            <Route path="/crowd" element={<CrowdIQ />} />
            <Route path="/ops" element={<OpsCommand />} />
            <Route path="/accessibility" element={<AccessPath />} />
            <Route path="/transport" element={<MoveIQ />} />
            <Route path="/sustainability" element={<EcoScore />} />
            <Route path="/multilingual" element={<LinguaAssist />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
