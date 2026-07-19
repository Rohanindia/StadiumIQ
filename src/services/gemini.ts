import type { ChatSession } from '@google/generative-ai';
import { createTokenBucket, consumeToken } from '@/utils/rateLimit';
import type { ChatMessage, GameDayContext, CrowdPrediction } from '@/types';
import { cleanPromptInjection } from '@/utils/sanitize';

const IS_DEV = import.meta.env['VITE_IS_DEV'] === 'true';

const devLog = (...args: unknown[]): void => {
  if (IS_DEV) {
    console.warn('[AI Dev]', ...args);
  }
};

// ── API Key validation ────────────────────────────────────────────────────────

const GROQ_API_KEY = import.meta.env['VITE_GROQ_API_KEY'] as string | undefined;

if (!GROQ_API_KEY && typeof window !== 'undefined') {
  console.warn(
    'StadiumIQ: VITE_GROQ_API_KEY is not set. ' +
    'GameDay AI and other features will use offline fallbacks.'
  );
}

// ── Rate limiter (10 calls/min per session) ───────────────────────────────────

const aiRateLimiter = createTokenBucket(10, 60_000);

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are GameDay AI, the official AI assistant for FIFA World Cup 2026 powered by StadiumIQ.

Key facts you know:
- 48 teams, 104 matches across 3 host countries: USA, Canada, Mexico
- 16 venues: MetLife Stadium (NY/NJ, final venue), SoFi Stadium (LA), AT&T Stadium (Dallas), Hard Rock Stadium (Miami), Allegiant Stadium (Las Vegas), Lumen Field (Seattle), Bank of America Stadium (Charlotte), Arrowhead Stadium (Kansas City), Lincoln Financial Field (Philadelphia), Gillette Stadium (Boston), NRG Stadium (Houston), Levi's Stadium (SF Bay Area), Estadio Azteca (Mexico City, opener), Estadio BBVA (Monterrey), Estadio Akron (Guadalajara), BMO Field (Toronto)
- Group stage: June 11 – June 27, 2026
- Knockout rounds: June 29 – July 18, 2026  
- Final: July 19, 2026 at MetLife Stadium

Your capabilities:
- Stadium navigation and wayfinding
- Crowd management advice
- Transport and parking guidance
- Accessibility assistance
- Sustainability tips
- Multilingual support (respond in the user's language)
- Real-time match updates

Always be helpful, concise, and friendly. For safety-critical situations (medical, security), immediately direct users to contact staff or call emergency services. Never make up specific real-time data — acknowledge when you don't have live information.`;

// ── Offline fallback responses ────────────────────────────────────────────────

const OFFLINE_RESPONSES: string[] = [
  "I'm currently offline, but I'm here to help! For urgent assistance, please visit the nearest Information Desk or call stadium staff.",
  "No internet connection right now. For navigation help, check the printed stadium map at any gate. Emergency services: call 911.",
  "I can't connect to AI services right now. The StadiumIQ app still works for basic navigation, maps, and transport info.",
  "Offline mode active. Your local transport schedule and venue map are still available. Check the Transport tab for shuttle info.",
];

let offlineFallbackIndex = 0;

function getOfflineFallback(): string {
  const response = OFFLINE_RESPONSES[offlineFallbackIndex % OFFLINE_RESPONSES.length] ?? OFFLINE_RESPONSES[0] ?? "I'm offline right now. Please visit an Information Desk for assistance.";
  offlineFallbackIndex++;
  return response;
}

// ── Groq API Client Implementation ─────────────────────────────────────────────

async function callGroqAPI(
  messages: { role: string; content: string }[],
  jsonOutput = false
): Promise<string> {
  const cleanedMessages = messages.map(msg => ({
    ...msg,
    content: msg.role === 'user' ? cleanPromptInjection(msg.content) : msg.content
  }));

  const projectId = import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string | undefined;

  // 1. Attempt secure backend proxy call first
  if (projectId) {
    const functionUrl = `https://us-central1-${projectId}.cloudfunctions.net/groqProxy`;
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: cleanedMessages,
          jsonOutput,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content as string;
        }
      }
    } catch {
      // Fail silently and proceed to local client fallback
    }
  }

  // 1.5 Try Vercel Serverless Function Proxy next
  try {
    const response = await fetch('/api/groqProxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: cleanedMessages,
        jsonOutput,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return content as string;
      }
    }
  } catch {
    // Fail silently and proceed to local client fallback
  }

  // 2. Client-side fallback if Cloud Function is not available
  const apiKey = import.meta.env['VITE_GROQ_API_KEY'] as string | undefined;
  if (!apiKey) {
    throw new Error('Groq API Key not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: cleanedMessages,
      temperature: jsonOutput ? 0.2 : 0.7,
      max_tokens: jsonOutput ? 512 : 1024,
      ...(jsonOutput ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API HTTP error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned empty response');
  }
  return content as string;
}

/** Groq Chat Session Mock to replace GoogleGenerativeAI's ChatSession */
export class GroqChatSession {
  private history: { role: 'user' | 'assistant'; content: string }[] = [];
  private contextStr: string;

  constructor(contextStr: string) {
    this.contextStr = contextStr;
  }

  async sendMessage(message: string): Promise<{ response: { text: () => string } }> {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + this.contextStr },
      ...this.history,
      { role: 'user', content: message }
    ];

    const replyText = await callGroqAPI(messages, false);

    // Save to history
    this.history.push({ role: 'user', content: message });
    this.history.push({ role: 'assistant', content: replyText });

    return {
      response: {
        text: () => replyText,
      },
    };
  }
}

// ── Chat session management ───────────────────────────────────────────────────

export function createChatSession(context?: GameDayContext): ChatSession | null {
  const contextStr = context
    ? `\n\nCurrent context: Stadium: ${context.stadiumName ?? 'Unknown'}, Match: ${context.currentMatch?.homeTeam ?? ''} vs ${context.currentMatch?.awayTeam ?? ''}, User role: ${context.userRole ?? 'fan'}`
    : '';

  // Cast mock session to ChatSession to remain fully compatible with existing codebase
  return new GroqChatSession(contextStr) as unknown as ChatSession;
}

export async function sendChatMessage(
  session: ChatSession | null,
  message: string
): Promise<{ text: string; isOffline: boolean }> {
  if (!session || !GROQ_API_KEY) {
    return { text: getOfflineFallback(), isOffline: true };
  }

  const allowed = consumeToken(aiRateLimiter);
  if (!allowed) {
    return {
      text: "You've sent too many messages. Please wait a moment before trying again.",
      isOffline: false,
    };
  }

  try {
    devLog('Sending message to Groq:', message);
    const result = await (session as unknown as GroqChatSession).sendMessage(message);
    const text = result.response.text();
    devLog('Groq response:', text);
    return { text, isOffline: false };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Groq API error:', errorMsg);
    return { text: getOfflineFallback(), isOffline: true };
  }
}

// ── Completion Helper ──────────────────────────────────────────────────────────

export async function generateCompletion(
  prompt: string,
  jsonOutput = false
): Promise<string | null> {
  if (!GROQ_API_KEY) {
    devLog('Groq unavailable, returning null');
    return null;
  }

  const allowed = consumeToken(aiRateLimiter);
  if (!allowed) {
    console.warn('Groq rate limit exceeded');
    return null;
  }

  const messages = [
    { role: 'system', content: 'You are an AI assistant for StadiumIQ.' },
    { role: 'user', content: prompt }
  ];

  try {
    const result = await callGroqAPI(messages, jsonOutput);
    return result;
  } catch (error) {
    console.error('Groq completion error:', error);
    return null;
  }
}

// ── Downstream Functions ───────────────────────────────────────────────────────

export async function predictCrowdChokePoints(zoneData: string): Promise<CrowdPrediction[]> {
  const prompt = `You are an AI crowd management system for a FIFA World Cup stadium.

Analyze this real-time zone data:
${zoneData}

Return a JSON array of crowd predictions. Each item must have:
- zoneId (string)
- zoneName (string)
- density ("low" | "medium" | "high" | "critical")
- estimatedCount (number)
- chokePoints (string[])
- recommendation (string, max 50 words)
- confidence (number 0-1)

Return ONLY the JSON array.`;

  const raw = await generateCompletion(prompt, true);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as CrowdPrediction[];
    }
    return [];
  } catch {
    console.error('Failed to parse crowd prediction JSON');
    return [];
  }
}

export async function generatePAAnnouncement(
  zone: string,
  severity: 'amber' | 'red',
  situation: string
): Promise<string> {
  const urgency = severity === 'red' ? 'urgent' : 'advisory';
  const prompt = `Generate a short, clear PA announcement for a FIFA World Cup stadium.

Zone: ${zone}
Urgency: ${urgency}
Situation: ${situation}

Rules:
- Maximum 40 words
- Calm but firm tone
- Direct fans to alternative routes or actions
- Do NOT cause panic
- End with a positive/helpful statement

Return only the announcement text, no quotes.`;

  const result = await generateCompletion(prompt);
  return result ?? `Attention: Please note that ${zone} is experiencing high congestion. Please use alternative routes. Thank you for your patience.`;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}. Return ONLY the translation, no explanations:\n\n${text}`;
  const result = await generateCompletion(prompt);
  return result ?? text;
}

export async function generateEcoTips(
  travelMode: string,
  mealType: string,
  carbonKg: number
): Promise<string[]> {
  const prompt = `A FIFA World Cup fan has:
- Traveled by: ${travelMode}
- Ate: ${mealType} meal
- Carbon footprint: ${carbonKg.toFixed(1)} kg CO2

Generate exactly 3 specific, actionable sustainability tips to reduce their impact at future events. 
Return a JSON array of 3 strings. Each tip: max 20 words, positive tone.
Return ONLY the JSON array.`;

  const raw = await generateCompletion(prompt, true);
  if (!raw) {
    return [
      'Take public transit to your next match to reduce emissions.',
      'Choose plant-based meals — they use 50% less carbon.',
      'Recycle your cups and containers in the green bins.',
    ];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (parsed as unknown[]).slice(0, 3).map(String);
    }
    return [];
  } catch {
    return [];
  }
}

export function buildChatMessage(
  role: 'user' | 'model',
  content: string,
  id?: string
): ChatMessage {
  return {
    id: id ?? `${role}-${Date.now().toString()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}
