/**
 * @fileoverview Firebase Auth context provider for StadiumIQ.
 * Exports only the AuthProvider component and related types.
 * The useAuth() hook lives in ./useAuth.ts (react-refresh requires one export per file).
 */

import React, { createContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import type { UserProfile, UserRole } from '@/types';

/** Shape of the authentication context value. */
export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isStaff: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/** React context holding the current auth state. Consumed via useAuth(). */
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides Firebase Auth state to the entire application.
 * Also fetches the user's Firestore profile to determine their role.
 *
 * @param children - React children wrapped by this provider
 * @returns Provider element with auth state
 */
export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          }
        } catch {
          // Profile fetch failed — use default fan role
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setProfile(null);
  };

  const role: UserRole = profile?.role ?? 'fan';

  return (
    <AuthContext.Provider value={{ user, profile, role, isStaff: role === 'staff' || role === 'admin', loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
