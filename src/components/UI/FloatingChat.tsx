import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createChatSession, sendChatMessage, buildChatMessage } from '@/services/gemini';
import type { ChatMessage } from '@/types';
import type { ChatSession } from '@google/generative-ai';

const WELCOME: ChatMessage = buildChatMessage(
  'model',
  "Hi! I'm GameDay AI 🤖 Your FIFA World Cup 2026 assistant. Ask me about navigation, transport, teams, or anything World Cup!",
  'welcome',
);

/** Persistent floating Gemini mini-chat visible on all routes. */
function FloatingChat(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<ChatSession | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !sessionRef.current) {
      sessionRef.current = createChatSession({ stadiumName: 'MetLife Stadium' });
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (): Promise<void> => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = buildChatMessage('user', text);
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const { text: reply, isOffline } = await sendChatMessage(sessionRef.current, text);
    const aiMsg: ChatMessage = { ...buildChatMessage('model', reply), isOfflineFallback: isOffline };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <>
      {open && (
        <div
          className="floating-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-label="GameDay AI mini chat"
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(29,158,117,0.1), transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>GameDay AI</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-brand)' }}>● Online</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to="/ai-assist"
                className="btn btn-ghost btn-sm"
                aria-label="Open full AI chat"
                onClick={() => setOpen(false)}
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              >
                Full view ↗
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{ padding: '4px 8px' }}
              >✕</button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble chat-bubble-${msg.role === 'user' ? 'user' : 'ai'}`}
                aria-label={`${msg.role === 'user' ? 'You' : 'GameDay AI'}: ${msg.content}`}
              >
                {msg.content}
                {msg.isOfflineFallback && (
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: 4 }}>⚡ Offline response</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-ai" aria-label="GameDay AI is thinking">
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Thinking…
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              aria-label="Chat message input"
              disabled={loading}
              style={{ flex: 1, fontSize: '0.85rem' }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => void handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <button
        className="floating-chat-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close GameDay AI chat' : 'Open GameDay AI chat'}
        aria-expanded={open}
        title="GameDay AI"
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}

export default FloatingChat;
