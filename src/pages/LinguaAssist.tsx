/**
 * @fileoverview LinguaAssist — Real-time AI translation, FIFA World Cup phrase guide, and voice input.
 * Translates text into 7 languages using Groq LLaMA. Supports Web Speech API voice input.
 * Route: /multilingual
 */
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { translateText } from '@/services/gemini';
import { trackTranslationRequested } from '@/services/analytics';
import { usePageTitle } from '@/hooks/usePageTitle';

/** Minimal SpeechRecognition result interface for the Web Speech API. */
interface SpeechRecognitionResult {
  readonly results: { [index: number]: { [index: number]: { transcript: string } | undefined } | undefined };
}

/** Minimal SpeechRecognition instance interface for the Web Speech API. */
interface SpeechRecognitionInstance {
  lang: string;
  onresult: ((event: SpeechRecognitionResult) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

/** SpeechRecognition constructor type from the Web Speech API. */
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const PHRASES = [
  { category: 'Greetings', items: [
    { en: 'Hello! Welcome to the World Cup!', es: '¡Hola! ¡Bienvenido al Mundial!', fr: 'Bonjour! Bienvenue à la Coupe du Monde!', ar: 'مرحباً! مرحباً بكم في كأس العالم!', pt: 'Olá! Bem-vindo à Copa do Mundo!', zh: '你好！欢迎来到世界杯！' },
    { en: 'Where is my seat?', es: '¿Dónde está mi asiento?', fr: 'Où est mon siège?', ar: 'أين مقعدي؟', pt: 'Onde fica meu assento?', zh: '我的座位在哪里？' },
  ]},
  { category: 'Emergency', items: [
    { en: 'I need medical help!', es: '¡Necesito ayuda médica!', fr: "J'ai besoin d'aide médicale!", ar: 'أحتاج مساعدة طبية!', pt: 'Preciso de ajuda médica!', zh: '我需要医疗帮助！' },
    { en: 'Please call security', es: 'Por favor llame a seguridad', fr: 'Appelez la sécurité', ar: 'من فضلك اتصل بالأمن', pt: 'Por favor chame a segurança', zh: '请叫保安' },
  ]},
  { category: 'Navigation', items: [
    { en: 'Where is the nearest exit?', es: '¿Dónde está la salida más cercana?', fr: 'Où est la sortie la plus proche?', ar: 'أين أقرب مخرج؟', pt: 'Onde fica a saída mais próxima?', zh: '最近的出口在哪里？' },
    { en: 'How do I get to Gate B?', es: '¿Cómo llego a la Puerta B?', fr: 'Comment puis-je aller à la Porte B?', ar: 'كيف أصل إلى البوابة ب؟', pt: 'Como chego ao Portão B?', zh: '怎么去B门？' },
  ]},
];

const LANG_NAMES: Record<string, string> = { en: 'English', es: 'Español', fr: 'Français', ar: 'العربية', pt: 'Português', zh: '中文', hi: 'हिन्दी', ja: '日本語' };

/**
 * LinguaAssist: Groq real-time translation chat, phrase guide, voice input.
 *
 * Translates user text into 7 target languages via Groq LLaMA 3.3-70B.
 * Includes a ready-made FIFA World Cup phrase guide for common stadium
 * scenarios (greetings, emergency, navigation) and optional Web Speech API
 * voice input for hands-free translation.
 */
function LinguaAssist(): React.ReactElement {
  const { t, i18n } = useTranslation();
  usePageTitle('LinguaAssist — Translation');
  const [message, setMessage] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const [translated, setTranslated] = useState('');
  const [translating, setTranslating] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const handleTranslate = useCallback(async (): Promise<void> => {
    if (!message.trim()) return;
    setTranslating(true);
    trackTranslationRequested(LANG_NAMES[targetLang] ?? targetLang);
    const result = await translateText(message, LANG_NAMES[targetLang] ?? 'Spanish');
    setTranslated(result);
    setTranslating(false);
  }, [message, targetLang]);

  const handleVoice = (): void => {
    const win = window as unknown as Record<string, unknown>;
    const SpeechRecognitionAPI = (win['SpeechRecognition'] ?? win['webkitSpeechRecognition']) as SpeechRecognitionConstructor | undefined;
    if (!SpeechRecognitionAPI) { alert('Voice input not supported in this browser.'); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SpeechRecognitionAPI();
    rec.lang = i18n.language;
    rec.onresult = (e: SpeechRecognitionResult) => { setMessage(e.results[0]?.[0]?.transcript ?? ''); };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌐 {t('multilingual.title')}</h1>
        <p className="page-subtitle">{t('multilingual.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Translation chat */}
        <section aria-labelledby="translate-heading">
          <div className="section-label" id="translate-heading">{t('multilingual.aiPowered')}</div>
          <div className="card card-glow">
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="target-lang" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Translate to:</label>
              <select id="target-lang" className="input" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} aria-label="Target language" style={{ width: 'auto' }}>
                {Object.entries(LANG_NAMES).filter(([k]) => k !== 'en').map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleTranslate(); }}
                placeholder={t('multilingual.typeMessage')}
                aria-label="Text to translate"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleVoice}
                aria-label={listening ? t('multilingual.stopVoice') : t('multilingual.startVoice')}
                style={{ background: listening ? 'rgba(239,68,68,0.15)' : undefined, borderColor: listening ? 'rgba(239,68,68,0.4)' : undefined }}
              >
                {listening ? '⏹ Stop' : '🎙️'}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => void handleTranslate()}
                disabled={translating || !message.trim()}
                aria-label={t('multilingual.translate')}
              >
                {translating ? '⟳' : '→'}
              </button>
            </div>
            {listening && <div className="badge badge-red" style={{ marginBottom: 8 }} aria-live="polite">● {t('multilingual.listening')}</div>}
            {translated && (
              <div aria-live="polite" aria-label={`Translation: ${translated}`} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic', color: 'var(--color-text-primary)' }}>
                {translated}
              </div>
            )}
          </div>
        </section>

        {/* Phrase guide */}
        <section aria-labelledby="phrase-heading">
          <div className="section-label" id="phrase-heading">{t('multilingual.phraseGuide')} — FIFA WC 2026</div>
          <div style={{ display: 'grid', gap: 16 }}>
            {PHRASES.map((cat) => (
              <div key={cat.category} className="card">
                <div style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden="true">{cat.category === 'Emergency' ? '🆘' : cat.category === 'Navigation' ? '🗺️' : '👋'}</span>
                  {cat.category}
                </div>
                {cat.items.map((item) => (
                  <div key={item.en} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.en}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {Object.entries(item).filter(([k]) => k !== 'en').map(([lang, text]) => (
                        <div key={lang} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '4px 8px' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase' }}>{lang}</div>
                          <div style={{ fontSize: '0.82rem' }}>{text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default LinguaAssist;
