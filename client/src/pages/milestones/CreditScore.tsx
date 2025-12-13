import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, CheckCircle2, TrendingUp, Shield, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function CreditScore() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [creditScore, setCreditScore] = useState(680);
  const [method, setMethod] = useState<'checked' | 'estimated'>('estimated');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/progress/${user.id}/complete/step1_creditScore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            creditScore,
            method: method === 'checked' ? 'manual' : 'api',
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate back to dashboard
        setLocation('/client/dashboard');
      } else {
        alert('Failed to save credit score. Please try again.');
      }
    } catch (error) {
      console.error('Error saving credit score:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCreditRating = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 720) return { label: 'Very Good', color: 'text-blue-600' };
    if (score >= 650) return { label: 'Good', color: 'text-yellow-600' };
    if (score >= 600) return { label: 'Fair', color: 'text-orange-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  const rating = getCreditRating(creditScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/client/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Check Your Credit Score</h1>
                <p className="text-gray-600 mt-1">Step 1 of 8 • 5 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Credit Score Input */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enter Your Credit Score</h2>

            {/* Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Credit Score</label>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{creditScore}</div>
                  <div className={`text-sm font-medium ${rating.color}`}>{rating.label}</div>
                </div>
              </div>

              <input
                type="range"
                min="300"
                max="900"
                step="10"
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((creditScore - 300) / 600) * 100}%, #e5e7eb ${((creditScore - 300) / 600) * 100}%, #e5e7eb 100%)`,
                }}
              />

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>300 (Poor)</span>
                <span>900 (Excellent)</span>
              </div>
            </div>

            {/* Number Input */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Or enter manually:
              </label>
              <input
                type="number"
                min="300"
                max="900"
                value={creditScore}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 300 && val <= 900) {
                    setCreditScore(val);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter credit score (300-900)"
              />
            </div>

            {/* Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">How did you get this score?</label>

              <div
                onClick={() => setMethod('checked')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  method === 'checked'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === 'checked' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {method === 'checked' && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-medium">I checked Borrowell/Equifax</div>
                    <div className="text-sm text-gray-600">I have my official credit score</div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setMethod('estimated')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  method === 'estimated'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      method === 'estimated' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {method === 'estimated' && <CheckCircle2 className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <div className="font-medium">I estimated my score</div>
                    <div className="text-sm text-gray-600">I'm making an educated guess</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* External Links */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
            <h3 className="text-lg font-semibold mb-4">Get Your Free Credit Score</h3>
            <p className="text-gray-600 mb-4">
              Don't know your credit score? Check it for free with these trusted services:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://www.borrowell.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-500 hover:shadow-md transition-all"
              >
                <div>
                  <div className="font-semibold text-gray-900">Borrowell</div>
                  <div className="text-sm text-gray-600">Free credit score (soft check)</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>

              <a
                href="https://www.consumer.equifax.ca/personal/products/credit-score-report/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div>
                  <div className="font-semibold text-gray-900">Equifax</div>
                  <div className="text-sm text-gray-600">Official credit report</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </Card>

          {/* Why It Matters */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Why Your Credit Score Matters
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold mb-1">Interest Rates</h4>
                <p className="text-sm text-gray-600">
                  Higher scores get lower rates. A 720+ score can save you 0.25-0.50% on your mortgage.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold mb-1">Approval Odds</h4>
                <p className="text-sm text-gray-600">
                  Scores above 680 have high approval odds. Below 600 may face challenges.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-600 mb-2" />
                <h4 className="font-semibold mb-1">Down Payment</h4>
                <p className="text-sm text-gray-600">
                  Lower scores may require 10-20% down payment instead of 5%.
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Tips to Improve Your Score:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Pay bills on time (35% of your score)</li>
                <li>• Keep credit utilization below 30%</li>
                <li>• Don't close old credit cards</li>
                <li>• Avoid applying for multiple credit products</li>
                <li>• Check for errors on your credit report</li>
              </ul>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/client/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 px-8"
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
