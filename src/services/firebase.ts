/**
 * @fileoverview Firebase service initialization — Auth, Firestore, Analytics, Performance.
 * All Firebase config is loaded from environment variables.
 * This module crashes fast with a clear error if any required env var is missing.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import {
  getAnalytics,
  type Analytics,
} from 'firebase/analytics';
import {
  getPerformance,
  type FirebasePerformance,
} from 'firebase/performance';

// ── Environment variable validation ──────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/**
 * Validates all required Firebase environment variables are present.
 * Throws with a clear message listing missing vars.
 *
 * @throws {Error} If any required Firebase env var is missing
 */
function validateFirebaseEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `StadiumIQ: Missing required Firebase environment variables:\n` +
      missing.map((k) => `  • ${k}`).join('\n') +
      `\n\nCopy .env.example to .env and fill in your Firebase project credentials.`
    );
  }
}

// Run validation immediately on module load
validateFirebaseEnv();

// ── Firebase initialization ───────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'] as string,
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] as string,
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string,
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] as string,
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] as string,
  appId: import.meta.env['VITE_FIREBASE_APP_ID'] as string,
  ...(import.meta.env['VITE_FIREBASE_MEASUREMENT_ID']
    ? { measurementId: import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'] as string }
    : {}),
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;
let perf: FirebasePerformance | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Firebase Analytics — requires measurementId; initialize lazily to avoid SSR issues
  if (import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'] && typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch {
      // Analytics may be unavailable in certain environments (e.g. ad-blockers, testing)
      analytics = null;
    }
  }

  // Firebase Performance Monitoring — browser only
  if (typeof window !== 'undefined') {
    try {
      perf = getPerformance(app);
    } catch {
      perf = null;
    }
  }
} catch (error) {
  throw new Error(
    `StadiumIQ: Failed to initialize Firebase. Check your credentials.\n${String(error)}`
  );
}

export { app, auth, db, analytics, perf };
