/**
 * Client Login Page
 *
 * OTP-based authentication for client portal access.
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const { sendOTP, verifyOTP, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendOTP(phoneNumber);
      setStep('verify');
      toast({
        title: 'Code Sent',
        description: 'Check your phone for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📱 CLIENT LOGIN - Calling verifyOTP with loginType="client"');
      console.log('  Phone:', phoneNumber);
      await verifyOTP(phoneNumber, code, 'client');
      console.log('✅ CLIENT LOGIN - OTP verified successfully');
      console.log('  Redirecting to /client/dashboard');
      toast({
        title: 'Welcome!',
        description: 'You are now logged in',
      });
      setLocation('/client/dashboard');
    } catch (error: any) {
      console.error('❌ CLIENT LOGIN - Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid verification code',
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
            {step === 'phone'
              ? 'Enter your phone number to access your account'
              : 'Enter the verification code sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (234) 567-8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Use E.164 format (e.g., +12345678900)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={loading}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Sent to {phoneNumber}
                </p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                  {loading ? 'Verifying...' : 'Login'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                  }}
                  disabled={loading}
                >
                  Use Different Number
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>View your appointments and property bookings</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
