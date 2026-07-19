import '@testing-library/jest-dom';
import { vi, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';
import enTranslations from '../i18n/locales/en.json';

// Extend expect matcher for axe-core
expect.extend(matchers);

// Mock window.HTMLElement.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock react-i18next to return translations synchronously using en.json
vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (key: string) => {
        const parts = key.split('.');
        let current: any = enTranslations;
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            current = undefined;
            break;
          }
        }
        return typeof current === 'string' ? current : (key.split('.').pop() || key);
      },
      i18n: {
        changeLanguage: () => Promise.resolve(),
        language: 'en',
        dir: () => 'ltr',
      },
    }),
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    },
  };
});

// Mock window.SpeechRecognition and webkitSpeechRecognition
const mockSpeechRecognition = vi.fn().mockImplementation(() => ({
  lang: '',
  onresult: null,
  onend: null,
  start: vi.fn(),
  stop: vi.fn(),
}));

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

// Mock environment variables — aligned with actual code (GROQ, not Gemini)
vi.stubEnv('VITE_GROQ_API_KEY', 'mock-groq-api-key');
vi.stubEnv('VITE_FIREBASE_API_KEY', 'mock-firebase-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'mock-auth-domain');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'mock-project-id');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'mock-storage-bucket');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'mock-sender-id');
vi.stubEnv('VITE_FIREBASE_APP_ID', 'mock-app-id');
vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'mock-measurement-id');
vi.stubEnv('VITE_MAPS_KEY', 'mock-maps-key');
vi.stubEnv('VITE_IS_DEV', 'true');

// Mock global fetch for Groq API calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () =>
    Promise.resolve({
      choices: [
        {
          message: {
            content: 'Mock Groq response',
          },
        },
      ],
    }),
  text: () => Promise.resolve('Mock Groq response'),
} as unknown as Response);

// Mock Firebase services
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => {
    // Immediately invoke callback with null user for tests
    cb(null);
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(() => ({})),
}));

// Mock Google Generative AI (kept for type compatibility even though Groq is used)
vi.mock('@google/generative-ai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Mock Groq Response',
    },
  });

  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => '["Mock tip 1", "Mock tip 2", "Mock tip 3"]',
    },
  });

  const mockStartChat = vi.fn().mockReturnValue({
    sendMessage: mockSendMessage,
  });

  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    startChat: mockStartChat,
    generateContent: mockGenerateContent,
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function (this: any) {
      return {
        getGenerativeModel: mockGetGenerativeModel,
      };
    }),
  };
});
