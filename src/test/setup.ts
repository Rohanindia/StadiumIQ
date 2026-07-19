import '@testing-library/jest-dom';
import { vi, expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Extend expect matcher for axe-core
expect.extend(matchers);

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

// Mock environment variables
vi.stubEnv('VITE_GEMINI_API_KEY', 'mock-api-key');
vi.stubEnv('VITE_FIREBASE_API_KEY', 'mock-firebase-key');
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'mock-auth-domain');
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'mock-project-id');
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'mock-storage-bucket');
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'mock-sender-id');
vi.stubEnv('VITE_FIREBASE_APP_ID', 'mock-app-id');
vi.stubEnv('VITE_MAPS_KEY', 'mock-maps-key');
vi.stubEnv('VITE_IS_DEV', 'true');

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

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Mock Gemini Response',
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
