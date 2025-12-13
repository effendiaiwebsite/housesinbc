/**
 * Quiz Screen
 *
 * 5-step interactive quiz to assess user's home-buying readiness
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Home, Building2, House, DollarSign, Calendar, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// Quiz data type - matches server schema
type QuizData = {
  income: number;
  savings: number;
  hasRRSP: boolean;
  propertyType: 'condo' | 'townhome' | 'detached';
  timeline: '1-3' | '3-6' | '6-12';
};

const QUIZ_STEPS = [
  {
    id: 1,
    title: 'Household Income',
    subtitle: "We'll stress-test at 4–5% rates",
    icon: DollarSign,
    field: 'income' as const,
  },
  {
    id: 2,
    title: 'Down Payment Savings',
    subtitle: 'Aim 5% ($25K–$50K for starters)',
    icon: Calculator,
    field: 'savings' as const,
  },
  {
    id: 3,
    title: 'Dream Property',
    subtitle: 'Condos in Whalley? Townhomes in Fleetwood?',
    icon: Home,
    field: 'propertyType' as const,
  },
  {
    id: 4,
    title: 'Your Timeline',
    subtitle: '1–3 months = urgent alerts!',
    icon: Calendar,
    field: 'timeline' as const,
  },
  {
    id: 5,
    title: 'Calculate & Save!',
    subtitle: 'See what you can afford',
    icon: Calculator,
    field: 'calculate' as const,
  },
];

const PROPERTY_TYPES = [
  {
    value: 'condo',
    label: 'Condo',
    icon: Building2,
    preview: 'Whalley from $450K',
  },
  {
    value: 'townhome',
    label: 'Townhome',
    icon: House,
    preview: 'Fleetwood from $700K',
  },
  {
    value: 'detached',
    label: 'Detached',
    icon: Home,
    preview: 'Cloverdale from $900K',
  },
];

const TIMELINES = [
  { value: '1-3', label: '1-3 months' },
  { value: '3-6', label: '3-6 months' },
  { value: '6-12', label: '6-12 months' },
];

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<Partial<QuizData>>({
    income: 100000,
    savings: 50000,
    hasRRSP: false,
    propertyType: 'condo',
    timeline: '3-6',
  });

  const currentStepData = QUIZ_STEPS[currentStep - 1];
  const progress = (currentStep / QUIZ_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < QUIZ_STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit quiz and navigate to pie chart
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation('/client/welcome');
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Please log in to continue.');
      setLocation('/client/login');
      return;
    }

    try {
      console.log('📝 Submitting quiz with data:', quizData);
      console.log('👤 User ID:', user.id);

      // Submit quiz to API with user ID (works for both phone and email users)
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quizData,
          userId: user.id, // Send userId to properly save and query
          sessionId: user.id, // Use user ID as sessionId for compatibility
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      if (data.success) {
        // Navigate to pie chart
        setLocation('/client/pie-chart');
      } else {
        throw new Error(data.error || 'Failed to calculate results');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const canProceed = () => {
    const step = currentStepData.field;
    if (step === 'income') return quizData.income && quizData.income > 0;
    if (step === 'savings') return quizData.savings !== undefined && quizData.savings >= 0;
    if (step === 'propertyType') return !!quizData.propertyType;
    if (step === 'timeline') return !!quizData.timeline;
    if (step === 'calculate') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {QUIZ_STEPS.length}
            </span>
            <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-green-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  {/* Step header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <currentStepData.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {currentStepData.title}
                    </h2>
                    <p className="text-lg text-gray-600">{currentStepData.subtitle}</p>
                  </div>

                  {/* Step content */}
                  <div className="space-y-8">
                    {/* Step 1: Income */}
                    {currentStep === 1 && (
                      <div>
                        <Slider
                          min={50000}
                          max={250000}
                          step={5000}
                          value={quizData.income || 100000}
                          onValueChange={(value) => setQuizData({ ...quizData, income: value })}
                          formatValue={formatCurrency}
                        />
                        <p className="text-center text-sm text-gray-500 mt-4">
                          Include all household income (you + partner)
                        </p>
                      </div>
                    )}

                    {/* Step 2: Savings */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <Slider
                          min={0}
                          max={150000}
                          step={1000}
                          value={quizData.savings || 50000}
                          onValueChange={(value) => setQuizData({ ...quizData, savings: value })}
                          formatValue={formatCurrency}
                        />
                        <div className="flex items-center justify-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={quizData.hasRRSP || false}
                              onChange={(e) => setQuizData({ ...quizData, hasRRSP: e.target.checked })}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="text-gray-700">I have RRSPs (Home Buyers' Plan)</span>
                          </label>
                        </div>
                        <p className="text-center text-sm text-gray-500">
                          We'll help you maximize with FHSA + HBP programs
                        </p>
                      </div>
                    )}

                    {/* Step 3: Property Type */}
                    {currentStep === 3 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PROPERTY_TYPES.map((type) => {
                          const Icon = type.icon;
                          const isSelected = quizData.propertyType === type.value;

                          return (
                            <motion.button
                              key={type.value}
                              onClick={() => setQuizData({ ...quizData, propertyType: type.value as 'condo' | 'townhome' | 'detached' })}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={cn(
                                'p-6 rounded-2xl border-2 text-center transition-all',
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'w-12 h-12 mx-auto mb-3',
                                  isSelected ? 'text-blue-600' : 'text-gray-400'
                                )}
                              />
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {type.label}
                              </div>
                              <div className="text-sm text-gray-500">{type.preview}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step 4: Timeline */}
                    {currentStep === 4 && (
                      <div className="flex flex-col gap-3">
                        {TIMELINES.map((timeline) => {
                          const isSelected = quizData.timeline === timeline.value;

                          return (
                            <motion.button
                              key={timeline.value}
                              onClick={() => setQuizData({ ...quizData, timeline: timeline.value as '1-3' | '3-6' | '6-12' })}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={cn(
                                'p-6 rounded-2xl border-2 text-center transition-all',
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              )}
                            >
                              <div className="text-xl font-bold text-gray-900">
                                {timeline.label}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Step 5: Calculate */}
                    {currentStep === 5 && (
                      <div className="text-center space-y-6">
                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8">
                          <div className="text-6xl mb-4">🏠</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to See Your Results?
                          </h3>
                          <p className="text-gray-600 max-w-md mx-auto">
                            We'll calculate your affordable home price, monthly payments, and show you
                            how much you can save with BC government incentives.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600">Income</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(quizData.income || 0)}
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600">Savings</div>
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(quizData.savings || 0)}
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600">Property</div>
                            <div className="text-lg font-bold text-gray-900 capitalize">
                              {quizData.propertyType}
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600">Timeline</div>
                            <div className="text-lg font-bold text-gray-900">
                              {quizData.timeline} mo
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation buttons */}
                  <div className="mt-12 flex items-center justify-between gap-4">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                      className="min-w-[120px]"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>

                    <Button
                      onClick={handleNext}
                      size="lg"
                      disabled={!canProceed()}
                      className="min-w-[120px] bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    >
                      {currentStep === QUIZ_STEPS.length ? 'Calculate!' : 'Next'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
