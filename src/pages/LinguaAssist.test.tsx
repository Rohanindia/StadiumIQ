/**
 * @fileoverview LinguaAssist page tests — translation, phrase guide, language selector.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import LinguaAssist from '@/pages/LinguaAssist';

vi.mock('@/services/analytics', () => ({
  trackTranslationRequested: vi.fn(),
}));

vi.mock('@/services/gemini', () => ({
  translateText: vi.fn().mockResolvedValue('¡Hola! ¿Dónde está mi asiento?'),
}));

function renderLinguaAssist() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <LinguaAssist />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('LinguaAssist', () => {
  it('renders the page heading', () => {
    renderLinguaAssist();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the translation input', () => {
    renderLinguaAssist();
    expect(screen.getByLabelText(/Text to translate/i)).toBeInTheDocument();
  });

  it('renders language selector', () => {
    renderLinguaAssist();
    expect(screen.getByLabelText(/Target language/i)).toBeInTheDocument();
  });

  it('translate button is disabled when input is empty', () => {
    renderLinguaAssist();
    // The arrow button for translate
    const translateBtn = screen.getByRole('button', { name: /translate/i });
    expect(translateBtn).toBeDisabled();
  });

  it('translate button becomes enabled when text is entered', () => {
    renderLinguaAssist();
    const input = screen.getByLabelText(/Text to translate/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(screen.getByRole('button', { name: /translate/i })).not.toBeDisabled();
  });

  it('shows translation result after translate is clicked', async () => {
    renderLinguaAssist();
    const input = screen.getByLabelText(/Text to translate/i);
    fireEvent.change(input, { target: { value: 'Where is my seat?' } });
    fireEvent.click(screen.getByRole('button', { name: /translate/i }));
    await waitFor(() => {
      expect(screen.getByText(/¡Hola!/i)).toBeInTheDocument();
    });
  });

  it('renders phrase guide categories', () => {
    renderLinguaAssist();
    expect(screen.getByText(/Greetings/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency/i)).toBeInTheDocument();
    expect(screen.getByText(/Navigation/i)).toBeInTheDocument();
  });

  it('renders common phrases in multiple languages', () => {
    renderLinguaAssist();
    expect(screen.getByText(/Hello! Welcome to the World Cup!/i)).toBeInTheDocument();
    expect(screen.getByText(/I need medical help!/i)).toBeInTheDocument();
  });

  it('changes target language when selector is changed', () => {
    renderLinguaAssist();
    const select = screen.getByLabelText(/Target language/i);
    fireEvent.change(select, { target: { value: 'fr' } });
    expect((select as HTMLSelectElement).value).toBe('fr');
  });

  it('renders voice input button', () => {
    renderLinguaAssist();
    expect(screen.getByRole('button', { name: /voice/i })).toBeInTheDocument();
  });
});
