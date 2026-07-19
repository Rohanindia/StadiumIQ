/**
 * @fileoverview AiAssist page tests — welcome message, input, send.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { describe, it, expect, vi } from 'vitest';
import i18n from '@/i18n';
import AiAssist from '@/pages/AiAssist';

vi.mock('@/services/analytics', () => ({
  trackAiChatSent: vi.fn(),
  trackAiChatResponseReceived: vi.fn(),
}));

vi.mock('@/services/gemini', () => ({
  createChatSession: vi.fn(() => ({})),
  sendChatMessage: vi.fn().mockResolvedValue({ text: 'This is a mock AI response.', isOffline: false }),
  buildChatMessage: vi.fn((role: string, content: string, id?: string) => ({
    id: id ?? `${role}-${Date.now()}`,
    role,
    content,
    timestamp: Date.now(),
  })),
}));

function renderAiAssist() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <I18nextProvider i18n={i18n}>
        <AiAssist />
      </I18nextProvider>
    </BrowserRouter>
  );
}

describe('AiAssist', () => {
  it('renders the page heading', () => {
    renderAiAssist();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the message input textarea', () => {
    renderAiAssist();
    expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    renderAiAssist();
    const sendBtn = screen.getByRole('button', { name: /send/i });
    expect(sendBtn).toBeDisabled();
  });

  it('send button becomes enabled when text is typed', () => {
    renderAiAssist();
    const input = screen.getByLabelText(/Message input/i);
    fireEvent.change(input, { target: { value: 'Where is Gate B?' } });
    const sendBtn = screen.getByRole('button', { name: /send/i });
    expect(sendBtn).not.toBeDisabled();
  });

  it('renders suggested questions', () => {
    renderAiAssist();
    expect(screen.getByText(/Where is Gate B at MetLife Stadium/i)).toBeInTheDocument();
    expect(screen.getByText(/When is the World Cup Final/i)).toBeInTheDocument();
  });

  it('renders context ribbon', () => {
    renderAiAssist();
    expect(screen.getAllByText(/MetLife Stadium/i)[0]).toBeInTheDocument();
  });

  it('renders info cards about the tournament', () => {
    renderAiAssist();
    expect(screen.getAllByText(/Tournament/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Host Countries/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Venue/i)).toBeInTheDocument();
  });

  it('clears input after sending', async () => {
    renderAiAssist();
    const input = screen.getByLabelText(/Message input/i) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
