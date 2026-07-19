/**
 * @fileoverview AccessPath page tests — routes, elevators, sensory zones, assistance form.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import AccessPath from '@/pages/AccessPath';

vi.mock('@/services/analytics', () => ({
  trackAssistanceRequested: vi.fn(),
}));

function renderAccessPath() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <AccessPath />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('AccessPath', () => {
  it('renders the page heading', () => {
    renderAccessPath();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders wheelchair routes', () => {
    renderAccessPath();
    expect(screen.getByText(/Gate A → Section 100/i)).toBeInTheDocument();
    expect(screen.getByText(/Gate C → Sensory Suite/i)).toBeInTheDocument();
  });

  it('shows elevator status badges', () => {
    renderAccessPath();
    // Gate A South Tower is operational
    expect(screen.getByText(/Gate A — South Tower/i)).toBeInTheDocument();
  });

  it('renders sensory zones', () => {
    renderAccessPath();
    expect(screen.getByText(/Sensory Suite A/i)).toBeInTheDocument();
    expect(screen.getByText(/Quiet Room/i)).toBeInTheDocument();
  });

  it('renders the assistance request form', () => {
    renderAccessPath();
    expect(screen.getByLabelText(/current location/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submit button is disabled when location is empty', () => {
    renderAccessPath();
    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button becomes enabled when location is filled', () => {
    renderAccessPath();
    const locationInput = screen.getByLabelText(/current location/i);
    fireEvent.change(locationInput, { target: { value: 'Gate A, near elevator' } });
    expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled();
  });

  it('shows success message after form submission', async () => {
    renderAccessPath();
    const locationInput = screen.getByLabelText(/current location/i);
    fireEvent.change(locationInput, { target: { value: 'Gate A' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  it('renders route step lists', () => {
    renderAccessPath();
    expect(screen.getByText(/Enter Gate A — accessible entrance on the right/i)).toBeInTheDocument();
  });

  it('shows estimated minutes for routes', () => {
    renderAccessPath();
    expect(screen.getByText(/~6 min/i)).toBeInTheDocument();
    expect(screen.getByText(/~8 min/i)).toBeInTheDocument();
  });
});
