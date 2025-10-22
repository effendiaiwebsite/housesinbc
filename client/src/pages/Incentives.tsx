/**
 * Incentives Page
 *
 * Government programs and incentives for first-time buyers with lead capture.
 */

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Incentives() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState('');

  const handleLearnMore = (program: string) => {
    setCurrentProgram(program);
    setIsModalOpen(true);
  };

  const programs = [
    {
      title: "First-Time Home Buyers' Program",
      icon: 'fa-home',
      color: 'blue',
      savings: 'Up to $8,000',
      description: 'Property transfer tax exemption for eligible first-time buyers purchasing homes up to $500,000.',
      eligibility: [
        'Must be a Canadian citizen or permanent resident',
        'Must be a first-time home buyer',
        'Property value under $500,000',
        'Must occupy the home as principal residence',
      ],
    },
    {
      title: "Home Buyers' Plan (HBP)",
      icon: 'fa-piggy-bank',
      color: 'green',
      savings: 'Up to $35,000',
      description: 'Withdraw funds from your RRSP to buy or build your first home without paying tax on the withdrawal.',
      eligibility: [
        'Must be a first-time home buyer',
        'Must have a written agreement to buy or build',
        'Must be a Canadian resident',
        'Funds must be repaid within 15 years',
      ],
    },
    {
      title: 'GST/HST New Housing Rebate',
      icon: 'fa-receipt',
      color: 'purple',
      savings: 'Up to $6,300',
      description: 'Recover some of the GST paid on a new home purchase or substantial renovation.',
      eligibility: [
        'Must purchase or build a new home',
        'Home must be your primary residence',
        'Purchase price under $450,000 for full rebate',
        'Rebate decreases for homes between $350K-$450K',
      ],
    },
    {
      title: 'BC Home Owner Grant',
      icon: 'fa-dollar-sign',
      color: 'yellow',
      savings: 'Up to $570/year',
      description: 'Annual grant to reduce property taxes for eligible BC homeowners.',
      eligibility: [
        'Must be a BC resident',
        'Must occupy the home as principal residence',
        'Property assessed value under threshold',
        'Seniors qualify for additional grant',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Government Incentives & Programs
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Access up to $50,000+ in combined savings and benefits for first-time home buyers in British Columbia
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program) => (
              <Card key={program.title} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-${program.color}-100 rounded-lg flex items-center justify-center`}>
                      <i className={`fas ${program.icon} text-${program.color}-600 text-2xl`}></i>
                    </div>
                    <div className={`text-2xl font-bold text-${program.color}-600`}>
                      {program.savings}
                    </div>
                  </div>
                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3 text-sm text-gray-700">Eligibility Requirements:</h4>
                  <ul className="space-y-2 mb-6">
                    {program.eligibility.map((req, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-600">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleLearnMore(program.title)}
                    variant="outline"
                    className="w-full"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Calculate Your Potential Savings</h2>
          <p className="text-xl text-gray-600 mb-8">
            See how much you could save with BC's first-time buyer programs
          </p>
          <Button size="lg" onClick={() => handleLearnMore('Savings Calculator')}>
            <i className="fas fa-calculator mr-2"></i>
            Calculate My Savings
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-blue-600">
                Can I combine multiple programs?
              </h3>
              <p className="text-gray-600">
                Yes! Most first-time buyers can combine the First-Time Home Buyers' Program with the Home Buyers' Plan and GST Rebate, potentially saving over $50,000.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-blue-600">
                What qualifies as a "first-time buyer"?
              </h3>
              <p className="text-gray-600">
                Generally, you're considered a first-time buyer if you haven't owned a principal residence in the last 4 years. Specific definitions may vary by program.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-blue-600">
                How do I apply for these programs?
              </h3>
              <p className="text-gray-600">
                Most programs are applied for during the home purchase process. Your real estate agent and lawyer will guide you through the applications. Contact us for personalized assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take Advantage of These Programs?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get expert guidance on maximizing your government incentives
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => handleLearnMore('Contact')}
          >
            Get Free Consultation
          </Button>
        </div>
      </section>

      <Footer />

      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="incentives"
        metadata={{ program: currentProgram }}
        onSuccess={() => setIsModalOpen(false)}
      />
    </div>
  );
}
