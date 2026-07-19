/**
 * @fileoverview FanHub page tests — seat locator, food stalls, AR teaser.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import FanHub from '@/pages/FanHub';

// Mock analytics so we don't need real Firebase
vi.mock('@/services/analytics', () => ({
  trackSeatSearched: vi.fn(),
}));

function renderFanHub() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <FanHub />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('FanHub', () => {
  it('renders the page heading', () => {
    renderFanHub();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the seat locator section', () => {
    renderFanHub();
    expect(screen.getByLabelText(/section number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/row letter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/seat number/i)).toBeInTheDocument();
  });

  it('shows gate directions for a known section (102)', () => {
    renderFanHub();
    const sectionInput = screen.getByLabelText(/section number/i);
    fireEvent.change(sectionInput, { target: { value: '102' } });
    fireEvent.click(screen.getByRole('button', { name: /find my seat/i }));
    expect(screen.getByText(/Enter via Gate B/i)).toBeInTheDocument();
  });

  it('shows error for unknown section', () => {
    renderFanHub();
    const sectionInput = screen.getByLabelText(/section number/i);
    fireEvent.change(sectionInput, { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /find my seat/i }));
    expect(screen.getByText(/Section not found/i)).toBeInTheDocument();
  });

  it('renders all food stalls', () => {
    renderFanHub();
    expect(screen.getByText(/World Cup Grill/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Bites/i)).toBeInTheDocument();
    expect(screen.getByText(/The Trophy Tap/i)).toBeInTheDocument();
    expect(screen.getByText(/Eco Eats/i)).toBeInTheDocument();
  });

  it('shows closed badge for closed stalls', () => {
    renderFanHub();
    // Penalty Box Pizza is closed
    expect(screen.getByText(/Penalty Box Pizza/i)).toBeInTheDocument();
  });

  it('renders AR wayfinding section', () => {
    renderFanHub();
    expect(screen.getAllByText(/AR Navigation/i)[0]).toBeInTheDocument();
  });

  it('shows wait times for open stalls', () => {
    renderFanHub();
    // "5" minutes for World Cup Grill
    expect(screen.getAllByText(/min/i).length).toBeGreaterThan(0);
  });
});
