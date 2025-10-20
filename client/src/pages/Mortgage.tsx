/**
 * Mortgage Calculator Page
 *
 * Interactive mortgage calculator with lead capture after calculation.
 */

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function Mortgage() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();

  // Calculator inputs
  const [homePrice, setHomePrice] = useState(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(5.5);
  const [amortization, setAmortization] = useState(25);

  // Calculated results
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [downPaymentAmount, setDownPaymentAmount] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);

  // Track if calculation has been performed
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPaymentPercent, interestRate, amortization]);

  const calculateMortgage = () => {
    const downPayment = homePrice * (downPaymentPercent / 100);
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = amortization * 12;

    // Monthly payment formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
    const monthly =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const total = monthly * numberOfPayments;
    const interest = total - principal;

    setMonthlyPayment(monthly);
    setTotalInterest(interest);
    setTotalCost(total + downPayment);
    setDownPaymentAmount(downPayment);
    setLoanAmount(principal);
  };

  const handleCalculate = () => {
    if (!hasCalculated) {
      setHasCalculated(true);

      // Trigger lead capture after first calculation
      trigger('mortgage', {
        homePrice,
        downPaymentPercent,
        interestRate,
        amortization,
        monthlyPayment: Math.round(monthlyPayment),
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mortgage Calculator
          </h1>
          <p className="text-xl opacity-90">
            Calculate your monthly payments and see what you can afford
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Mortgage Details</CardTitle>
                <CardDescription>
                  Adjust the values to see how they affect your monthly payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Home Price: {formatCurrency(homePrice)}</Label>
                  <Input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="10000"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Down Payment: {downPaymentPercent}%</Label>
                  <Input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">
                    Amount: {formatCurrency(downPaymentAmount)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interest Rate: {interestRate}%</Label>
                  <Input
                    type="range"
                    min="2"
                    max="10"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amortization Period: {amortization} years</Label>
                  <Input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={amortization}
                    onChange={(e) => setAmortization(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleCalculate} className="w-full" size="lg">
                  <i className="fas fa-calculator mr-2"></i>
                  Calculate Payment
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Your Results</CardTitle>
                <CardDescription>
                  Based on the values you provided
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white p-6 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Monthly Payment</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {formatCurrency(monthlyPayment)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">per month</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Loan Amount</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(loanAmount)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Down Payment</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(downPaymentAmount)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Total Interest</div>
                    <div className="text-xl font-bold text-orange-600">
                      {formatCurrency(totalInterest)}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Total Cost</div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalCost)}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg text-sm text-blue-900">
                  <i className="fas fa-info-circle mr-2"></i>
                  These calculations are estimates. Actual payments may vary based on your lender and mortgage type.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Understanding Your Mortgage</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">What affects my monthly payment?</h3>
              <p className="text-gray-600">
                Your monthly payment is primarily determined by four factors: the home price, your down payment amount, the interest rate you secure, and the amortization period (length of your mortgage).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">How much should I put down?</h3>
              <p className="text-gray-600">
                In Canada, the minimum down payment is 5% for homes under $500K. A down payment of 20% or more helps you avoid CMHC insurance fees, which can save you thousands of dollars.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">What's a good interest rate?</h3>
              <p className="text-gray-600">
                Interest rates vary based on market conditions and your credit profile. As of 2025, rates typically range from 4.5% to 7%. Getting pre-approved helps you lock in a rate for 90-120 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={close}
        source={source}
        metadata={metadata}
        onSuccess={onSuccess}
      />
    </div>
  );
}
