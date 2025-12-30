/**
 * Admin Login Page
 *
 * Email/Password authentication for admin access.
 * Admin emails: satindersandhu138@gmail.com, rida.kazmi14@gmail.com
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ADMIN_EMAIL = 'satindersandhu138@gmail.com';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { signInWithEmail, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    console.log('🔄 ADMIN LOGIN - useEffect redirect check:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user);
    if (isAuthenticated && user?.role === 'admin') {
      console.log('✅ ADMIN LOGIN - Already authenticated as admin, redirecting to /admin/dashboard');
      setLocation('/admin/dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 ADMIN LOGIN - Signing in with email');
      await signInWithEmail(email, password, 'admin');
      console.log('✅ ADMIN LOGIN - Sign-in successful, redirecting to /admin/dashboard');
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      // Force redirect after small delay to ensure state updates
      setTimeout(() => {
        setLocation('/admin/dashboard');
      }, 100);
    } catch (error: any) {
      console.error('❌ ADMIN LOGIN - Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                Admin access only - use your admin email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">
                Enter your password to continue
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>🔒 Admin Access Only</p>
            <p className="mt-1 text-xs">Authorized personnel only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
