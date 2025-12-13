/**
 * Client Login Page
 *
 * Google and Email/Password authentication for client portal access.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated as client
  useEffect(() => {
    console.log('🔄 CLIENT LOGIN - useEffect redirect check:');
    console.log('  isAuthenticated:', isAuthenticated);
    console.log('  user:', user);
    if (isAuthenticated && user?.role === 'client') {
      console.log('✅ CLIENT LOGIN - Already authenticated as client, redirecting to /client/dashboard');
      setLocation('/client/dashboard');
    } else if (isAuthenticated && user?.role !== 'client') {
      console.log('⚠️  CLIENT LOGIN - Authenticated but role is:', user?.role);
    }
  }, [isAuthenticated, user, setLocation]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      console.log('📱 CLIENT LOGIN - Starting Google sign-in');
      await signInWithGoogle('client');
      console.log('✅ CLIENT LOGIN - Google sign-in successful');
      toast({
        title: 'Welcome!',
        description: 'You are now logged in',
      });
      setLocation('/client/dashboard');
    } catch (error: any) {
      console.error('❌ CLIENT LOGIN - Google sign-in error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📧 CLIENT LOGIN - Signing in with email');
      await signInWithEmail(email, password, 'client');
      console.log('✅ CLIENT LOGIN - Email sign-in successful');
      toast({
        title: 'Welcome Back!',
        description: 'You are now logged in',
      });
      setLocation('/client/dashboard');
    } catch (error: any) {
      console.error('❌ CLIENT LOGIN - Email sign-in error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('📧 CLIENT LOGIN - Creating account with email');
      await signUpWithEmail(email, password, name || undefined, 'client');
      console.log('✅ CLIENT LOGIN - Account created successfully');
      toast({
        title: 'Account Created!',
        description: 'Welcome to Houses BC',
      });
      setLocation('/client/dashboard');
    } catch (error: any) {
      console.error('❌ CLIENT LOGIN - Sign-up error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Client Portal</CardTitle>
          <CardDescription className="text-center">
            {mode === 'signin'
              ? 'Sign in to access your account'
              : 'Create an account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
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
              />
              <p className="text-xs text-muted-foreground">
                At least 6 characters
              </p>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center text-sm">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setMode('signup')}
                  disabled={loading}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setMode('signin')}
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>View your appointments and property bookings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
