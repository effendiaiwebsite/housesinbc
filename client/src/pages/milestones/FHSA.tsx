import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  PiggyBank,
  DollarSign,
  TrendingUp,
  Home,
  ExternalLink,
  Upload,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function FHSA() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [hasAccount, setHasAccount] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG, JPG, and PDF files are allowed');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    if (hasAccount && !selectedFile) {
      alert('Please upload proof of your FHSA account');
      return;
    }

    setIsSubmitting(true);

    try {
      let proofUrl = '';

      // In a real implementation, upload to Firebase Storage here
      // For now, we'll simulate with a placeholder URL
      if (selectedFile) {
        proofUrl = `fhsa_proof_${Date.now()}_${selectedFile.name}`;
        console.log('Would upload file:', selectedFile.name);
      }

      const response = await fetch(`/api/progress/${user.id}/milestone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: 'step2_fhsa',
          status: 'completed',
          data: {
            hasAccount,
            proofUrl: hasAccount ? proofUrl : null,
            openedAt: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLocation('/client/dashboard');
      } else {
        alert('Failed to save progress. Please try again.');
      }
    } catch (error) {
      console.error('Error saving FHSA progress:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/progress/${user.id}/milestone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: 'step2_fhsa',
          status: 'completed',
          data: {
            hasAccount: false,
            skipped: true,
            skippedAt: new Date().toISOString(),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLocation('/client/dashboard');
      } else {
        alert('Failed to save progress. Please try again.');
      }
    } catch (error) {
      console.error('Error skipping FHSA:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
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
              <div className="p-3 bg-green-100 rounded-full">
                <PiggyBank className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  First Home Savings Account (FHSA)
                </h1>
                <p className="text-gray-600 mt-1">Step 2 of 8 • 10 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What is FHSA */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <h2 className="text-2xl font-bold mb-4">What is an FHSA?</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The <strong>First Home Savings Account (FHSA)</strong> is a tax-free savings account
              launched by the Canadian government in 2023 to help first-time home buyers save for
              their down payment. It combines the best features of an RRSP and a TFSA.
            </p>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Tax-deductible contributions</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Tax-free investment growth</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Tax-free withdrawals for your first home</span>
              </div>
            </div>
          </Card>

          {/* Key Benefits */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Key Benefits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                <DollarSign className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Tax Deduction</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Contribute up to <strong>$8,000/year</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Reduce your taxable income and save $1,600 - $2,800 in taxes (depending on your
                  tax bracket)
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                <TrendingUp className="h-10 w-10 text-green-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Tax-Free Growth</h3>
                <p className="text-sm text-gray-700 mb-2">Investments grow tax-free</p>
                <p className="text-xs text-gray-600">
                  Any interest, dividends, or capital gains earned in the account are not taxed
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                <Home className="h-10 w-10 text-purple-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Tax-Free Withdrawal</h3>
                <p className="text-sm text-gray-700 mb-2">For your first home purchase</p>
                <p className="text-xs text-gray-600">
                  Withdraw up to $40,000 tax-free (lifetime limit) for your down payment
                </p>
              </Card>
            </div>
          </div>

          {/* How to Open */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">How to Open an FHSA</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold">Choose a provider</div>
                  <div className="text-sm text-gray-600">
                    Wealthsimple, Questrade, TD, RBC, or your bank
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold">Download app or visit branch</div>
                  <div className="text-sm text-gray-600">Most banks offer online signup in 5-10 minutes</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold">Select "FHSA" account type</div>
                  <div className="text-sm text-gray-600">
                    Different from RRSP, TFSA, or regular savings
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <div className="font-semibold">Link your bank account</div>
                  <div className="text-sm text-gray-600">For automatic contributions</div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <div className="font-semibold">Set up automatic contributions</div>
                  <div className="text-sm text-gray-600">
                    Contribute $666/month to maximize $8,000/year limit
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Call to Action */}
          <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <h2 className="text-2xl font-bold mb-4">Ready to Open Your FHSA?</h2>
            <p className="mb-6 opacity-90">
              We recommend Wealthsimple for their easy setup, low fees, and automated investing.
            </p>

            <div className="space-y-4">
              <a
                href="https://www.wealthsimple.com/en-ca/product/fhsa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div>
                  <div className="font-semibold text-lg">Open with Wealthsimple</div>
                  <div className="text-sm text-gray-600">Free to open • Low fees • 5 min setup</div>
                </div>
                <ExternalLink className="h-6 w-6 text-green-600" />
              </a>

              <button
                onClick={() => setHasAccount(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-white/10 border-2 border-white/30 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                <CheckCircle2 className="h-5 w-5" />
                I Already Have an FHSA
              </button>
            </div>
          </Card>

          {/* Upload Proof Section (shown if hasAccount is true) */}
          {hasAccount && (
            <Card className="p-6 border-2 border-green-200 bg-green-50">
              <h3 className="text-xl font-semibold mb-4">Upload Proof of Your FHSA Account</h3>
              <p className="text-gray-700 mb-4">
                Please upload a screenshot or PDF showing your FHSA account details (statement,
                confirmation email, or account screen).
              </p>

              <div className="space-y-4">
                <label className="block">
                  <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-green-400 focus:outline-none">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="font-medium text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload file'}
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG, or PDF (max 5MB)</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileSelect}
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation('/client/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (hasAccount && !selectedFile)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
              >
                {isSubmitting ? 'Saving...' : hasAccount ? 'Submit Proof' : 'Mark as Complete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
