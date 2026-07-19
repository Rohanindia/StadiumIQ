/**
 * @fileoverview EcoScore page tests — carbon calculator, eco tips, leaderboard.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import EcoScore from '@/pages/EcoScore';

vi.mock('@/services/analytics', () => ({
  trackCarbonCalculated: vi.fn(),
}));

vi.mock('@/services/gemini', () => ({
  generateEcoTips: vi.fn().mockResolvedValue([
    'Take public transit to your next match.',
    'Choose plant-based meals.',
    'Recycle your cups in the green bins.',
  ]),
}));

function renderEcoScore() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <EcoScore />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('EcoScore', () => {
  it('renders the page heading', () => {
    renderEcoScore();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders transport mode selector', () => {
    renderEcoScore();
    expect(screen.getByLabelText(/How did you travel?/i)).toBeInTheDocument();
  });

  it('renders distance input', () => {
    renderEcoScore();
    expect(screen.getByLabelText(/Distance/i)).toBeInTheDocument();
  });

  it('renders meal type selector', () => {
    renderEcoScore();
    expect(screen.getByLabelText(/Meal type/i)).toBeInTheDocument();
  });

  it('renders number of meals input', () => {
    renderEcoScore();
    expect(screen.getByLabelText(/Number of meals/i)).toBeInTheDocument();
  });

  it('renders calculate button', () => {
    renderEcoScore();
    expect(screen.getByRole('button', { name: /Calculate My Impact/i })).toBeInTheDocument();
  });

  it('shows carbon result after calculation', async () => {
    renderEcoScore();
    fireEvent.click(screen.getByRole('button', { name: /Calculate My Impact/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/kg CO₂/i)[0]).toBeInTheDocument();
    });
  });

  it('shows AI eco tips after calculation', async () => {
    renderEcoScore();
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await waitFor(() => {
      expect(screen.getByText(/Take public transit/i)).toBeInTheDocument();
    });
  });

  it('renders waste leaderboard', () => {
    renderEcoScore();
    expect(screen.getByText(/Section 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Section 400/i)).toBeInTheDocument();
  });

  it('renders energy usage widget', () => {
    renderEcoScore();
    expect(screen.getByText(/4.2 MW/i)).toBeInTheDocument();
    expect(screen.getByText(/Renewable/i)).toBeInTheDocument();
  });

  it('changes transport mode when selector changes', () => {
    renderEcoScore();
    const select = screen.getByLabelText(/How did you travel?/i);
    fireEvent.change(select, { target: { value: 'metro' } });
    expect((select as HTMLSelectElement).value).toBe('metro');
  });
});
