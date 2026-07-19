import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createChatSession, sendChatMessage, buildChatMessage } from '@/services/gemini';
import type { ChatMessage, GameDayContext } from '@/types';
import type { ChatSession } from '@google/generative-ai';

const SUGGESTED = [
  'Where is Gate B at MetLife Stadium?',
  'Which teams are in Group A?',
  'How do I get from parking to Section 118?',
  'Tell me about the host cities',
  'What are the wheelchair accessible entrances?',
  'When is the World Cup Final?',
];

const CONTEXT: GameDayContext = {
  stadiumName: 'MetLife Stadium',
  currentMatch: {
    id: 'final-2026',
    homeTeam: 'TBD', awayTeam: 'TBD',
    venue: 'MetLife Stadium', city: 'New York/New Jersey',
    kickoffTime: 'July 19, 2026 — 18:00 ET',
    status: 'upcoming',
  },
  userRole: 'fan',
  currentRoute: '/ai-assist',
};

/** Full-page GameDay AI chat with Gemini 2.0 Flash, context panel, and history. */
function AiAssist(): React.ReactElement {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    buildChatMessage('model', t('aiAssist.welcomeMessage'), 'welcome'),
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const sessionRef = useRef<ChatSession | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    sessionRef.current = createChatSession(CONTEXT);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string): Promise<void> => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, buildChatMessage('user', msg)]);
    setLoading(true);
    const { text: reply, isOffline: offline } = await sendChatMessage(sessionRef.current, msg);
    setIsOffline(offline);
    setMessages((prev) => [...prev, { ...buildChatMessage('model', reply), isOfflineFallback: offline }]);
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">🤖 {t('aiAssist.title')}</h1>
        <p className="page-subtitle">{t('aiAssist.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 20 }}>
        {/* Offline banner */}
        {isOffline && (
          <div className="alert-banner alert-amber" role="status" aria-live="polite">
            <span aria-hidden="true">⚡</span>
            <span>{t('aiAssist.offline')}</span>
          </div>
        )}

        {/* Chat area */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 0 }}>
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'min(580px, 65vh)' }}>
            {/* Context ribbon */}
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem',
              background: 'linear-gradient(90deg, rgba(29,158,117,0.08), transparent)',
            }}>
              <span aria-hidden="true">📍</span>
              <span style={{ color: 'var(--color-text-muted)' }}>Context:</span>
              <span style={{ color: 'var(--color-brand)' }}>{CONTEXT.stadiumName}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>·</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Final: {CONTEXT.currentMatch?.kickoffTime}</span>
            </div>

            {/* Messages */}
            <div
              style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
              aria-live="polite"
              aria-label="Chat conversation"
              role="log"
            >
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4, paddingLeft: 4, paddingRight: 4 }}>
                    {msg.role === 'user' ? 'You' : '🤖 GameDay AI'}
                  </div>
                  <div className={`chat-bubble chat-bubble-${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.content}
                    {msg.isOfflineFallback && <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>⚡ Offline mode</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4, paddingLeft: 4 }}>🤖 GameDay AI</div>
                  <div className="chat-bubble chat-bubble-ai" aria-label="AI is generating a response">
                    <span aria-hidden="true">⟳</span> {t('aiAssist.thinking')}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <textarea
                ref={inputRef}
                className="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('aiAssist.placeholder')}
                aria-label="Message input"
                disabled={loading}
                rows={2}
                style={{ flex: 1, resize: 'none', fontSize: '0.9rem' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => void handleSend()}
                disabled={loading || !input.trim()}
                aria-label={t('aiAssist.send')}
                style={{ alignSelf: 'flex-end' }}
              >
                ↑ {t('aiAssist.send')}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested questions */}
        <div>
          <div className="section-label">Suggested Questions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED.map((q) => (
              <button
                key={q}
                className="btn btn-ghost btn-sm"
                onClick={() => void handleSend(q)}
                disabled={loading}
                aria-label={`Ask: ${q}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div className="grid-3">
          {[
            { icon: '🏆', title: 'Tournament', body: '48 teams · 104 matches · June 11 – July 19, 2026' },
            { icon: '🌎', title: 'Host Countries', body: 'USA (11 venues) · Canada (1) · Mexico (3)' },
            { icon: '🏟️', title: 'Final Venue', body: 'MetLife Stadium · East Rutherford, New Jersey' },
          ].map(({ icon, title, body }) => (
            <div key={title} className="card">
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }} aria-hidden="true">{icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AiAssist;
