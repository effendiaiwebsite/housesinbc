/**
 * Admin Login Page
 *
 * OTP-based authentication for admin access.
 * Admin phone number: +14034783995
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ADMIN_PHONE = '+14034783995';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { sendOTP, verifyOTP, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(ADMIN_PHONE);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      setLocation('/admin/dashboard');
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendOTP(phoneNumber);
      setStep('verify');
      toast({
        title: 'OTP Sent',
        description: 'Check your phone for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
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
      await verifyOTP(phoneNumber, code, 'admin');
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      setLocation('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid OTP code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            {step === 'phone'
              ? 'Click the button below to receive a verification code'
              : 'Enter the 6-digit code sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Admin Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  readOnly
                  disabled
                  className="bg-gray-50 text-center font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Admin access only - phone number is pre-configured
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP to My Phone'}
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
                  {loading ? 'Verifying...' : 'Verify & Login'}
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
                  Resend Code
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>🔒 Admin Access Only</p>
            <p className="mt-1 text-xs">Authorized personnel only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
