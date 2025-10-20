/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to login if not authenticated or if role doesn't match.
 */

import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'admin' | 'client';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to appropriate login if not authenticated
  if (!isAuthenticated) {
    const loginPath = requireRole === 'admin' ? '/admin/login' : '/client/login';
    setLocation(loginPath);
    return null;
  }

  // Check if user has required role
  if (requireRole && user?.role !== requireRole) {
    // Redirect to their appropriate dashboard
    const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    setLocation(dashboardPath);
    return null;
  }

  return <>{children}</>;
}
