import React from 'react';
import Navigation from './Navigation';
import FloatingChat from '@/components/UI/FloatingChat';

interface LayoutProps {
  children: React.ReactNode;
}

/** App shell: sticky nav + scrollable main + persistent floating chat. */
function Layout({ children }: LayoutProps): React.ReactElement {
  return (
    <div className="app-shell">
      <Navigation />
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
      <FloatingChat />
    </div>
  );
}

export default Layout;
