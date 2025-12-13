import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Upload,
  CheckCircle2,
  X,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface Rate {
  lender: string;
  type: 'fixed' | 'variable';
  term: number;
  advertisedRate: number;
  personalizedRate: number;
  monthlyPayment: number;
  stressTestPayment: number;
  approvalOdds: 'high' | 'medium' | 'low';
}

interface QuizData {
  income: number;
  savings: number;
  hasRRSP: boolean;
  propertyType: string;
  timeline: string;
}

export default function PreApproval() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [creditScore, setCreditScore] = useState(680);
  const [affordablePrice, setAffordablePrice] = useState(0);
  const [rates, setRates] = useState<Rate[]>([]);
  const [filteredRates, setFilteredRates] = useState<Rate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRates, setSelectedRates] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive controls
  const [amortization, setAmortization] = useState(25);
  const [term, setTerm] = useState(5);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [rateFilter, setRateFilter] = useState<'all' | 'fixed' | 'variable'>('all');
  const [sortBy, setSortBy] = useState<'rate' | 'payment' | 'odds'>('rate');

  useEffect(() => {
    // Load quiz data and credit score from session/API
    const loadData = async () => {
      if (!user?.id) {
        setLocation('/client/login');
        return;
      }

      try {
        // Get quiz data
        const quizResponse = await fetch(`/api/quiz/response/${user.id}`);
        const quizResult = await quizResponse.json();

        if (quizResult.success) {
          setQuizData(quizResult.data);
          const affordability = quizResult.data.calculatedBreakdown?.affordablePrice
            || quizResult.data.calculatedAffordability
            || 300000;
          setAffordablePrice(affordability);
          console.log('🏠 Affordable Price loaded:', affordability);
        }

        // Get credit score from progress
        const progressResponse = await fetch(`/api/progress/${user.id}`);
        const progressResult = await progressResponse.json();

        if (progressResult.success) {
          const creditData = progressResult.data.milestones?.step1_creditScore?.data;
          if (creditData?.creditScore) {
            setCreditScore(creditData.creditScore);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user, setLocation]);

  useEffect(() => {
    // Fetch personalized rates when parameters change
    const fetchRates = async () => {
      if (!quizData || !user?.id) return;

      setIsLoadingRates(true);

      try {
        const loanAmount = affordablePrice * ((100 - downPaymentPercent) / 100);

        const requestData = {
          creditScore,
          downPaymentPercent,
          income: quizData.income,
          loanAmount,
          amortizationYears: amortization,
          term,
        };

        console.log('📤 Sending rates request:', requestData);

        const response = await fetch('/api/rates/personalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        });

        const result = await response.json();

        console.log('📊 Rates API Response:', result);
        console.log('📊 Rates array:', result.data?.rates);

        if (result.success) {
          setRates(result.data.rates || []);
          console.log('✅ Rates set successfully:', result.data.rates.length, 'rates');
        } else {
          console.error('❌ Rates API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    if (quizData) {
      fetchRates();
    }
  }, [quizData, user, creditScore, downPaymentPercent, amortization, term, affordablePrice]);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...rates];

    // Filter by type
    if (rateFilter !== 'all') {
      filtered = filtered.filter((r) => r.type === rateFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rate') return a.personalizedRate - b.personalizedRate;
      if (sortBy === 'payment') return a.monthlyPayment - b.monthlyPayment;
      // odds: high > medium > low
      const oddsOrder = { high: 3, medium: 2, low: 1 };
      return oddsOrder[b.approvalOdds] - oddsOrder[a.approvalOdds];
    });

    setFilteredRates(filtered);
  }, [rates, rateFilter, sortBy]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRateSelection = (lender: string) => {
    setSelectedRates((prev) => {
      if (prev.includes(lender)) {
        return prev.filter((l) => l !== lender);
      }
      if (prev.length >= 2) {
        alert('You can select up to 2 rates for comparison');
        return prev;
      }
      return [...prev, lender];
    });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    if (selectedRates.length === 0) {
      alert('Please select at least one preferred rate');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files via backend API (more secure)
      console.log('📤 Uploading', uploadedFiles.length, 'files via backend...');

      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('documents', file);
      });
      formData.append('userId', user.id);

      const uploadResponse = await fetch('/api/upload/pre-approval-docs', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload documents');
      }

      const uploadResult = await uploadResponse.json();
      const documentUrls = uploadResult.data.files;
      console.log('✅ All files uploaded successfully:', documentUrls);

      const selectedRateDetails = rates.filter((r) => selectedRates.includes(r.lender));

      const response = await fetch(`/api/progress/${user.id}/complete/step3_preApproval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ratePreferences: selectedRateDetails,
            documentsUploaded: documentUrls,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            creditScore,
            downPaymentPercent,
            amortization,
            term,
            affordablePrice,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Pre-approval request sent to Rida! You will be contacted within 24 hours.');
        setLocation('/client/dashboard');
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting pre-approval:', error);
      alert('An error occurred while uploading documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getApprovalBadgeColor = (odds: string) => {
    if (odds === 'high') return 'bg-green-100 text-green-700';
    if (odds === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (!quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const downPayment = affordablePrice * (downPaymentPercent / 100);
  const loanAmount = affordablePrice - downPayment;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
              <div className="p-3 bg-purple-100 rounded-full">
                <FileCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Get Pre-Approved</h1>
                <p className="text-gray-600 mt-1">Step 3 of 8 • 15-20 minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1: Your Profile */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Annual Income</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${quizData.income.toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Down Payment</div>
                <div className="text-2xl font-bold text-green-600">
                  ${downPayment.toLocaleString()} ({downPaymentPercent}%)
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Credit Score</div>
                <div className="text-2xl font-bold text-purple-600">{creditScore}</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Affordable Price</div>
                <div className="text-2xl font-bold text-yellow-600">
                  ${affordablePrice.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Interactive Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Adjust Your Preferences</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Amortization */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Amortization</label>
                  <span className="text-lg font-bold text-blue-600">{amortization} years</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="5"
                  value={amortization}
                  onChange={(e) => setAmortization(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 yrs</span>
                  <span>30 yrs</span>
                </div>
              </div>

              {/* Term */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Term</label>
                  <span className="text-lg font-bold text-green-600">{term} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 yr</span>
                  <span>10 yrs</span>
                </div>
              </div>

              {/* Down Payment % */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Down Payment</label>
                  <span className="text-lg font-bold text-purple-600">{downPaymentPercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
              <strong>Loan Amount:</strong> ${loanAmount.toLocaleString()}
              {filteredRates.length > 0 && (
                <>
                  {' '}•{' '}
                  <strong className="ml-2">Monthly Payment Range:</strong> ${Math.min(...filteredRates.map(r => r.monthlyPayment)).toLocaleString()} - ${Math.max(...filteredRates.map(r => r.monthlyPayment)).toLocaleString()}
                </>
              )}
            </div>
          </Card>

          {/* Section 3: Rate Comparison Table */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-xl font-semibold mb-2 md:mb-0">Personalized Rate Comparison</h2>

              <div className="flex gap-2">
                {/* Filter */}
                <select
                  value={rateFilter}
                  onChange={(e) => setRateFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Rates</option>
                  <option value="fixed">Fixed Only</option>
                  <option value="variable">Variable Only</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="rate">Best Rate</option>
                  <option value="payment">Lowest Payment</option>
                  <option value="odds">Best Approval Odds</option>
                </select>
              </div>
            </div>

            {isLoadingRates && filteredRates.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Calculating personalized rates...</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                {isLoadingRates && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Recalculating...</p>
                    </div>
                  </div>
                )}
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Advertised</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stress Test</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRates.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          No rates available for the selected filters. Try adjusting your preferences.
                        </td>
                      </tr>
                    ) : (
                      filteredRates.map((rate, index) => (
                        <tr
                          key={rate.lender}
                          className={`hover:bg-gray-50 ${index < 3 ? 'bg-green-50' : ''}`}
                        >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRates.includes(rate.lender)}
                            onChange={() => toggleRateSelection(rate.lender)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900">{rate.lender}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${rate.type === 'fixed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {rate.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{rate.term}yr</td>
                        <td className="px-4 py-4 text-gray-600">{(rate.advertisedRate * 100).toFixed(2)}%</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-green-600">{(rate.personalizedRate * 100).toFixed(2)}%</span>
                            {rate.personalizedRate < rate.advertisedRate && (
                              <TrendingDown className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-semibold">${rate.monthlyPayment.toLocaleString()}</td>
                        <td className="px-4 py-4 text-gray-600">${rate.stressTestPayment.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getApprovalBadgeColor(rate.approvalOdds)}`}>
                            {rate.approvalOdds}
                          </span>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {selectedRates.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Selected: {selectedRates.join(', ')} ({selectedRates.length}/2)
                </p>
              </div>
            )}
          </Card>

          {/* Section 4: Document Upload */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Required Documents</h2>

            <div className="mb-4 grid md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                <span className="text-sm">Pay Stubs (last 2 months)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                <span className="text-sm">T4 / Notice of Assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                <span className="text-sm">Bank Statements (90 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${uploadedFiles.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                <span className="text-sm">Government ID</span>
              </div>
            </div>

            <label className="block">
              <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="font-medium text-gray-600">Click to upload documents</span>
                  <span className="text-xs text-gray-500">PDF, PNG, JPG (max 5MB each)</span>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileUpload}
              />
            </label>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => removeFile(index)} className="text-red-600 hover:text-red-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Validation messages */}
            {(uploadedFiles.length === 0 || selectedRates.length === 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Required to submit:</p>
                <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                  {uploadedFiles.length === 0 && (
                    <li className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Upload at least one document
                    </li>
                  )}
                  {selectedRates.length === 0 && (
                    <li className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Select at least one preferred rate from the table
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <Button variant="outline" onClick={() => setLocation('/client/dashboard')} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || uploadedFiles.length === 0 || selectedRates.length === 0}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Send Pre-Approval Request to Rida'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
