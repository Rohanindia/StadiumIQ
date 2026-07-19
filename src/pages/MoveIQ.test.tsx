/**
 * @fileoverview MoveIQ page tests — shuttles, parking, rideshare, departure waves.
 */
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect } from 'vitest';
import i18n from '@/i18n';
import MoveIQ from '@/pages/MoveIQ';

function renderMoveIQ() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <MoveIQ />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('MoveIQ', () => {
  it('renders the page heading', () => {
    renderMoveIQ();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders shuttle routes', () => {
    renderMoveIQ();
    expect(screen.getByText(/MetLife ↔ Newark Penn Station/i)).toBeInTheDocument();
    expect(screen.getByText(/MetLife ↔ Secaucus Junction/i)).toBeInTheDocument();
    expect(screen.getByText(/Overflow Parking Shuttle/i)).toBeInTheDocument();
  });

  it('shows shuttle ETAs for running shuttles', () => {
    renderMoveIQ();
    // Newark Penn shuttle: 8 min
    expect(screen.getAllByText(/8 min/i)[0]).toBeInTheDocument();
  });

  it('shows Not Running badge for inactive shuttles', () => {
    renderMoveIQ();
    expect(screen.getByText(/Not Running/i)).toBeInTheDocument();
  });

  it('renders parking lots', () => {
    renderMoveIQ();
    expect(screen.getByText(/Lot A — Blue/i)).toBeInTheDocument();
    expect(screen.getByText(/Lot B — Yellow/i)).toBeInTheDocument();
    expect(screen.getByText(/VIP Lot — Gold/i)).toBeInTheDocument();
  });

  it('shows Full badge for Lot B (0 available)', () => {
    renderMoveIQ();
    expect(screen.getAllByText(/Full/i)[0]).toBeInTheDocument();
  });

  it('shows available spots for non-full lots', () => {
    renderMoveIQ();
    expect(screen.getByText(/142 spots/i)).toBeInTheDocument();
  });

  it('renders departure waves', () => {
    renderMoveIQ();
    expect(screen.getByText(/Wave 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Wave 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Wave 3/i)).toBeInTheDocument();
  });

  it('renders rideshare links', () => {
    renderMoveIQ();
    expect(screen.getByRole('link', { name: /Open Uber app/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Lyft app/i })).toBeInTheDocument();
  });

  it('Uber link points to correct URL', () => {
    renderMoveIQ();
    const uberLink = screen.getByRole('link', { name: /Open Uber app/i });
    expect(uberLink.getAttribute('href')).toContain('uber.com');
  });

  it('renders transport modes for waves', () => {
    renderMoveIQ();
    expect(screen.getByText(/NJ Transit/i)).toBeInTheDocument();
    expect(screen.getByText(/Shuttle Express/i)).toBeInTheDocument();
  });
});
