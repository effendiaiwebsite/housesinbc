/**
 * Pie Chart Results Screen
 *
 * Shows personalized affordability breakdown and incentives after quiz
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, TrendingUp, Download, ArrowRight, DollarSign, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
// Quiz data type - matches server schema
type QuizData = {
  income: number;
  savings: number;
  hasRRSP: boolean;
  propertyType: 'condo' | 'townhome' | 'detached';
  timeline: '1-3' | '3-6' | '6-12';
};

interface QuizResults {
  breakdown: {
    affordablePrice: number;
    mortgage: number;
    downPayment: number;
    closingCosts: number;
    buffer: number;
  };
  incentives: {
    ptt: number;
    gst: number;
    fhsa: number;
    total: number;
  };
  sessionId: string;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export default function PieChartResults() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      if (!user?.id) {
        setLocation('/client/login');
        return;
      }

      // Check if quiz was already submitted by fetching from API
      const quizResponse = await fetch(`/api/quiz/response/${user.id}`);
      const quizResult = await quizResponse.json();

      if (quizResult.success && quizResult.data) {
        // Quiz already exists, load the results
        setQuizData(quizResult.data);
        setResults({
          breakdown: quizResult.data.calculatedBreakdown || {
            affordablePrice: 0,
            mortgage: 0,
            downPayment: 0,
            closingCosts: 0,
            buffer: 0,
          },
          incentives: quizResult.data.calculatedIncentives || {
            ptt: 0,
            gst: 0,
            fhsa: 0,
            total: 0,
          },
          sessionId: user.id,
        });
      } else {
        // No quiz found, redirect to quiz
        setLocation('/client/quiz');
        return;
      }
    } catch (err: any) {
      console.error('Load results error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleStartJourney = () => {
    setLocation('/client/dashboard');
  };

  const handleSavePlan = () => {
    // TODO: Generate and download PDF
    alert('PDF download coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
          />
          <p className="text-lg text-gray-600">Calculating your personalized plan...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error || 'Failed to load results'}</p>
            <Button onClick={() => setLocation('/client/quiz')}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pieData = [
    { name: 'Mortgage', value: results.breakdown.mortgage },
    { name: 'Down Payment', value: results.breakdown.downPayment },
    { name: 'Closing Costs', value: results.breakdown.closingCosts },
    { name: 'Buffer', value: results.breakdown.buffer },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            You Can Afford
          </h1>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl md:text-7xl font-bold text-blue-600 mb-4"
          >
            {formatCurrency(results.breakdown.affordablePrice)}
          </motion.div>
          <p className="text-xl text-gray-600">
            Based on ${quizData?.income.toLocaleString()} income and ${quizData?.savings.toLocaleString()} savings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Financial Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${((entry.value / results.breakdown.affordablePrice) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-3">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Incentives */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Your Incentives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Total First-Year Savings</div>
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {formatCurrency(results.incentives.total)}
                    </div>
                    <div className="text-sm text-gray-500">in BC government incentives</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {results.incentives.ptt > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">PTT Exemption</div>
                        <div className="text-sm text-gray-600">Property Transfer Tax savings</div>
                      </div>
                      <div className="font-bold text-blue-600">{formatCurrency(results.incentives.ptt)}</div>
                    </div>
                  )}

                  {results.incentives.gst > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">GST Rebate</div>
                        <div className="text-sm text-gray-600">New home rebate (if applicable)</div>
                      </div>
                      <div className="font-bold text-green-600">{formatCurrency(results.incentives.gst)}</div>
                    </div>
                  )}

                  {results.incentives.fhsa > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">FHSA Benefit</div>
                        <div className="text-sm text-gray-600">First-year tax deduction</div>
                      </div>
                      <div className="font-bold text-purple-600">{formatCurrency(results.incentives.fhsa)}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={handleSavePlan}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Download className="w-5 h-5 mr-2" />
            Save This Plan (PDF)
          </Button>

          <Button
            onClick={handleStartJourney}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            Start Step 1
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Info callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl text-center"
        >
          <p className="text-gray-700">
            💡 These calculations are estimates based on your inputs. Your actual affordability and incentives may vary.
            Rida will help you get exact numbers in your personalized dashboard.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
