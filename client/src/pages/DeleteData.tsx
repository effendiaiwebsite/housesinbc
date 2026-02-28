/**
 * Data Deletion Request Page
 *
 * Publicly accessible at /delete-my-data.
 * Required by Google Play Store policy — users must have a way to request
 * deletion of their account and associated data.
 */

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type Step = 'form' | 'submitting' | 'success' | 'error';

export default function DeleteData() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');

    try {
      const res = await fetch('/api/data-deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), reason: reason.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
      } else {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStep('error');
      }
    } catch {
      setErrorMessage('Could not connect to the server. Please email privacy@housesinbc.com directly.');
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Request Data Deletion</h1>
          <p className="text-gray-300">
            You have the right to request deletion of your personal data at any time.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* What gets deleted */}
        <div className="premium-card rounded-2xl p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What will be deleted</h2>
          <ul className="space-y-3">
            {[
              'Your account (name, email address)',
              'Your quiz responses and home-buying preferences',
              'Saved properties and search history',
              'Appointment booking history',
              'Any offers you submitted through the app',
              'Your milestone progress data',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Please note:</span> Deletion is permanent and cannot
              be undone. We will process your request within <span className="font-semibold">30 days</span> and
              send a confirmation to your email once complete.
            </p>
          </div>
        </div>

        {/* Form / Success / Error */}
        {step === 'form' || step === 'submitting' ? (
          <div className="premium-card rounded-2xl p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Submit your request</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address on your account <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={step === 'submitting'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email you used to sign up. We'll send a confirmation here when deletion is complete.
                </p>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for deletion <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. No longer using the app, privacy concerns…"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={step === 'submitting'}
                />
              </div>

              <button
                type="submit"
                disabled={step === 'submitting' || !email.trim()}
                className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-lg transition-colors"
              >
                {step === 'submitting' ? 'Submitting…' : 'Submit Deletion Request'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Prefer to contact us directly?{' '}
              <a href="mailto:privacy@housesinbc.com" className="text-blue-600 hover:underline">
                privacy@housesinbc.com
              </a>
            </p>
          </div>
        ) : step === 'success' ? (
          <div className="premium-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request received</h2>
            <p className="text-gray-600 mb-6">
              We've received your deletion request for <span className="font-semibold">{email}</span>.
              We will delete your data within 30 days and send a confirmation email when it's done.
            </p>
            <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Home
            </a>
          </div>
        ) : (
          <div className="premium-card rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep('form')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <a
                href="mailto:privacy@housesinbc.com"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Email us
              </a>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
