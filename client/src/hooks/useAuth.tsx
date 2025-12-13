/**
 * Authentication Hook
 *
 * Manages authentication state and provides Firebase auth functions.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  role: 'admin' | 'client';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: (loginType?: 'admin' | 'client') => Promise<void>;
  signInWithEmail: (email: string, password: string, loginType?: 'admin' | 'client') => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string, loginType?: 'admin' | 'client') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authAPI.checkStatus();
      if (response.authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signInWithGoogle = async (loginType: 'admin' | 'client' = 'client') => {
    try {
      console.log('🔐 useAuth - Starting Google sign-in');

      // Sign in with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      console.log('✅ Firebase sign-in successful:', firebaseUser.email);

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Send to backend
      const response = await authAPI.googleSignIn(
        idToken,
        firebaseUser.email!,
        firebaseUser.displayName,
        loginType
      );

      console.log('✅ Backend authentication successful');
      setUser(response.user);
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const signInWithEmail = async (email: string, password: string, loginType: 'admin' | 'client' = 'client') => {
    try {
      console.log('🔐 useAuth - Starting email sign-in');

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase email sign-in successful:', firebaseUser.email);

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Send to backend
      const response = await authAPI.emailSignIn(idToken, email, loginType);

      console.log('✅ Backend authentication successful');
      setUser(response.user);
    } catch (error: any) {
      console.error('❌ Email sign-in error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string,
    loginType: 'admin' | 'client' = 'client'
  ) => {
    try {
      console.log('🔐 useAuth - Starting email sign-up');

      // Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase account created:', firebaseUser.email);

      // Update display name if provided
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Send to backend to create user record
      const response = await authAPI.emailSignUp(idToken, email, name, loginType);

      console.log('✅ Backend user record created');
      setUser(response.user);
    } catch (error: any) {
      console.error('❌ Email sign-up error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await auth.signOut();

      // Call backend logout
      await authAPI.logout();

      setUser(null);
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
