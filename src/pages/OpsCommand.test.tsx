/**
 * @fileoverview OpsCommand page tests — incidents, resources, comms tabs.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import OpsCommand from '@/pages/OpsCommand';
import { AuthProvider } from '@/contexts/AuthContext';

vi.mock('@/services/analytics', () => ({
  trackIncidentLogged: vi.fn(),
  trackCommsMessageSent: vi.fn(),
}));

vi.mock('@/services/gemini', () => ({
  generateCompletion: vi.fn().mockResolvedValue(
    'Redeploy 4 officers from Gate B to Gate A — critical density requires immediate intervention.'
  ),
}));

function renderOpsCommand() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <OpsCommand />
        </AuthProvider>
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('OpsCommand', () => {
  it('renders the page heading', () => {
    renderOpsCommand();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows LIVE badge', () => {
    renderOpsCommand();
    expect(screen.getByText(/LIVE/i)).toBeInTheDocument();
  });

  it('renders three tabs', () => {
    renderOpsCommand();
    expect(screen.getByRole('button', { name: /incidents tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resources tab/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comms tab/i })).toBeInTheDocument();
  });

  it('shows incidents tab by default', () => {
    renderOpsCommand();
    // The active incidents section should be visible
    expect(screen.getByText(/Active Incidents/i)).toBeInTheDocument();
  });

  it('renders active incidents on incidents tab', () => {
    renderOpsCommand();
    expect(screen.getByText(/Fan requires medical attention/i)).toBeInTheDocument();
    expect(screen.getByText(/Severe congestion at entry point/i)).toBeInTheDocument();
  });

  it('does not show resolved incidents in active list', () => {
    renderOpsCommand();
    // Unauthorized area access is 'resolved', should not show
    expect(screen.queryByText(/Unauthorized area access attempt/i)).not.toBeInTheDocument();
  });

  it('switches to resources tab on click', () => {
    renderOpsCommand();
    fireEvent.click(screen.getByRole('button', { name: /resources tab/i }));
    expect(screen.getByText(/Resource Allocation by Zone/i)).toBeInTheDocument();
  });

  it('renders resource zones on resources tab', () => {
    renderOpsCommand();
    fireEvent.click(screen.getByRole('button', { name: /resources tab/i }));
    expect(screen.getByText(/Gate A/i)).toBeInTheDocument();
    expect(screen.getByText(/Food Court/i)).toBeInTheDocument();
  });

  it('switches to comms tab on click', () => {
    renderOpsCommand();
    fireEvent.click(screen.getByRole('button', { name: /comms tab/i }));
    expect(screen.getByText(/Real-time Communications Board/i)).toBeInTheDocument();
  });

  it('renders initial comms messages', () => {
    renderOpsCommand();
    fireEvent.click(screen.getByRole('button', { name: /comms tab/i }));
    expect(screen.getByText(/Gate A overflow protocol active/i)).toBeInTheDocument();
  });

  it('renders incident form on incidents tab', () => {
    renderOpsCommand();
    expect(screen.getByLabelText(/Incident location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('submit incident button disabled without location and description', () => {
    renderOpsCommand();
    expect(screen.getByRole('button', { name: /Submit incident report/i })).toBeDisabled();
  });

  it('submit incident button enabled when form filled', () => {
    renderOpsCommand();
    fireEvent.change(screen.getByLabelText(/Incident location/i), { target: { value: 'Gate B' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Fan requires assistance' } });
    expect(screen.getByRole('button', { name: /Submit incident report/i })).not.toBeDisabled();
  });

  it('comms send button disabled when message empty', () => {
    renderOpsCommand();
    fireEvent.click(screen.getByRole('button', { name: /comms tab/i }));
    expect(screen.getByRole('button', { name: /Send message/i })).toBeDisabled();
  });

  it('renders the AI operational intelligence recommendation section', () => {
    renderOpsCommand();
    expect(screen.getByText(/AI Operational Intelligence/i)).toBeInTheDocument();
  });

  it('renders the Get AI Recommendation button', () => {
    renderOpsCommand();
    expect(screen.getByRole('button', { name: /Generate AI operational recommendation/i })).toBeInTheDocument();
  });
});
