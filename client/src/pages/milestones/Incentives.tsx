import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Gift, ExternalLink, DollarSign, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface IncentivesData {
  ptt: number;
  gst: number;
  fhsa: number;
  hbp?: number;
  total: number;
}

export default function Incentives() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<IncentivesData>({
    ptt: 0,
    gst: 0,
    fhsa: 0,
    hbp: 0,
    total: 0,
  });
  const [affordablePrice, setAffordablePrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIncentives = async () => {
      if (!user?.id) {
        setLocation('/client/login');
        return;
      }

      try {
        const response = await fetch(`/api/quiz/response/${user.id}`);
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setAffordablePrice(data.calculatedAffordability || 0);

          if (data.calculatedIncentives) {
            setIncentives({
              ptt: data.calculatedIncentives.ptt || 0,
              gst: data.calculatedIncentives.gst || 0,
              fhsa: data.calculatedIncentives.fhsa || 0,
              hbp: data.calculatedIncentives.hbp || 0,
              total: data.calculatedIncentives.total || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error loading incentives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIncentives();
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your incentives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
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
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">BC First-Time Buyer Incentives</h1>
                <p className="text-gray-600 mt-1">Step 4 of 8 • Auto-Calculated ✓</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Total Savings Card */}
          <Card className="p-8 bg-gradient-to-br from-green-600 to-emerald-600 text-white text-center">
            <Gift className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-5xl font-bold mb-2">${incentives.total.toLocaleString()}</h2>
            <p className="text-xl opacity-90">in First-Year Savings</p>
            <p className="mt-4 text-sm opacity-75">
              These incentives are already factored into your home-buying plan
            </p>
          </Card>

          {/* Breakdown Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Incentive Breakdown</h2>

            <div className="space-y-4">
              {/* Property Transfer Tax Exemption */}
              <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">Property Transfer Tax (PTT) Exemption</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      First-time buyers are exempt from PTT on homes up to $500,000. Partial exemption up to $835,000.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>How to claim:</strong> Automatic (via your lawyer at closing)
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-blue-600">${incentives.ptt.toLocaleString()}</div>
                    <div className="text-xs text-green-600 font-semibold">✓ Eligible</div>
                  </div>
                </div>
              </div>

              {/* GST/HST New Housing Rebate */}
              <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">GST/HST New Housing Rebate</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Rebate of up to 36% of GST paid on new homes under $350,000. Phases out to $450,000.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>How to claim:</strong> Apply with CRA after purchase (Form GST190)
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-purple-600">
                      ${incentives.gst.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      {incentives.gst > 0 ? '✓ If new home' : 'Resale only'}
                    </div>
                  </div>
                </div>
              </div>

              {/* FHSA Tax Deduction */}
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-lg">FHSA Tax Deduction</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Contribute up to $8,000/year to your FHSA and deduct it from your taxable income. Saves $1,600-$2,800 depending on tax bracket.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>How to claim:</strong> File with your tax return (tax deduction)
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      ${incentives.fhsa.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 font-semibold">✓ Eligible</div>
                  </div>
                </div>
              </div>

              {/* Home Buyers' Plan (HBP) */}
              {incentives.hbp && incentives.hbp > 0 && (
                <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                        <h3 className="font-semibold text-lg">Home Buyers' Plan (HBP)</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Withdraw up to $35,000 tax-free from your RRSP for your down payment. Must repay over 15 years.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>How to claim:</strong> Withdraw up to $35K from RRSP
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        ${incentives.hbp.toLocaleString()}
                      </div>
                      <div className="text-xs text-yellow-600 font-semibold">
                        ✓ If has RRSPs
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Row */}
              <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">TOTAL FIRST-YEAR SAVINGS</div>
                  <div className="text-3xl font-bold">${incentives.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Government Resources */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Official Government Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax/exemptions/first-time-home-buyers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div>
                  <div className="font-semibold">BC Property Transfer Tax</div>
                  <div className="text-xs text-gray-600">Gov of BC - Official Page</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>

              <a
                href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-36200-home-buyers-amount.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div>
                  <div className="font-semibold">GST/HST New Housing Rebate</div>
                  <div className="text-xs text-gray-600">Canada Revenue Agency</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>

              <a
                href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div>
                  <div className="font-semibold">FHSA Official Page</div>
                  <div className="text-xs text-gray-600">Canada Revenue Agency</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>

              <a
                href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all"
              >
                <div>
                  <div className="font-semibold">Home Buyers' Plan (HBP)</div>
                  <div className="text-xs text-gray-600">Canada Revenue Agency</div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/client/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setLocation('/client/pie-chart')}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculate from Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
