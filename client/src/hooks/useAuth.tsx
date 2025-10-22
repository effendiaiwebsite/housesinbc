/**
 * Authentication Hook
 *
 * Manages authentication state and provides auth functions.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  phoneNumber: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, code: string, loginType?: 'admin' | 'client') => Promise<void>;
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

  const sendOTP = async (phoneNumber: string) => {
    try {
      await authAPI.sendOTP(phoneNumber);
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber: string, code: string, loginType: 'admin' | 'client' = 'client') => {
    try {
      console.log('🔑 useAuth.verifyOTP called:');
      console.log('  phoneNumber:', phoneNumber);
      console.log('  loginType:', loginType);
      const response = await authAPI.verifyOTP(phoneNumber, code, loginType);
      console.log('  API response:', response);
      setUser(response.user);
      console.log('  User state updated to:', response.user);
    } catch (error) {
      console.error('  ❌ verifyOTP error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
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
        sendOTP,
        verifyOTP,
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
