/**
 * @fileoverview Custom hook to access Firebase Auth state and actions.
 * Separated from AuthContext.tsx to satisfy react-refresh's single-export-component rule.
 */

import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';

/**
 * Hook to access authentication state and actions.
 * Must be used inside `<AuthProvider>`.
 *
 * @returns AuthContextValue with user, profile, role, signIn, signOut
 * @throws If used outside of AuthProvider
 *
 * @example
 * const { user, role, signOut } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
