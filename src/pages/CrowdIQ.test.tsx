/**
 * @fileoverview CrowdIQ page tests — zone display, density bars, PA generation.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import CrowdIQ from '@/pages/CrowdIQ';

vi.mock('@/services/analytics', () => ({
  trackPAGenerated: vi.fn(),
}));

vi.mock('@/services/gemini', () => ({
  generatePAAnnouncement: vi.fn().mockResolvedValue(
    'Attention: Please use Gate C for alternate entry.'
  ),
  generateCompletion: vi.fn().mockResolvedValue(
    'Recommend rerouting Gate A traffic to Gate C — density at 91%.'
  ),
}));

function renderCrowdIQ() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <CrowdIQ />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('CrowdIQ', () => {
  it('renders the page heading', () => {
    renderCrowdIQ();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders all 6 crowd zones', () => {
    renderCrowdIQ();
    expect(screen.getAllByText(/Gate A Concourse/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Gate B Concourse/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Gate C Concourse/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Main Atrium/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Section 100 Block/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Food Court East/i)[0]).toBeInTheDocument();
  });

  it('shows critical alert banner for red zones', () => {
    renderCrowdIQ();
    // Gate A and Main Atrium are 'red'
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders the PA announcement section', () => {
    renderCrowdIQ();
    expect(screen.getByLabelText(/Select zone for announcement/i)).toBeInTheDocument();
  });

  it('renders Generate PA Announcement button', () => {
    renderCrowdIQ();
    expect(screen.getByRole('button', { name: /Generate PA Announcement/i })).toBeInTheDocument();
  });

  it('generates a PA announcement when button clicked', async () => {
    renderCrowdIQ();
    const btn = screen.getByRole('button', { name: /Generate PA Announcement/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText(/AI-Generated Announcement/i)).toBeInTheDocument();
    });
  });

  it('shows zone occupancy percentages', () => {
    renderCrowdIQ();
    // Gate A Concourse: 1820/2000 = 91%
    expect(screen.getByText(/91%/i)).toBeInTheDocument();
  });

  it('renders choke-point predictions for non-green zones', () => {
    renderCrowdIQ();
    expect(screen.getByText(/Choke Points/i)).toBeInTheDocument();
  });

  it('renders the AI crowd rerouting recommendation button', () => {
    renderCrowdIQ();
    expect(screen.getByRole('button', { name: /Generate AI crowd rerouting recommendation/i })).toBeInTheDocument();
  });

  it('shows AI recommendation after clicking rerouting button', async () => {
    renderCrowdIQ();
    const btn = screen.getByRole('button', { name: /Generate AI crowd rerouting recommendation/i });
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText(/AI Crowd Management Recommendation/i)).toBeInTheDocument();
    });
  });
});
