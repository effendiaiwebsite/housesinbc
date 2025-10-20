/**
 * Landing Page
 *
 * Lead capture focused page with free guide download.
 * Triggers lead capture modal on submit.
 */

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LeadCaptureModal from '@/components/LeadCaptureModal';
import { useLeadCapture } from '@/hooks/useLeadCapture';

export default function Landing() {
  const { isModalOpen, source, metadata, trigger, close, onSuccess } = useLeadCapture();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleGetGuide = () => {
    trigger('landing', { guide: 'BC-First-Time-Home-Buyers-Guide-2025' });
  };

  const handleLeadSuccess = () => {
    onSuccess();
    setShowSuccessMessage(true);

    // Trigger PDF download
    setTimeout(() => {
      // In production, this would download the actual PDF
      console.log('📄 PDF Download triggered: BC First-Time Home Buyers Guide 2025');
      alert('Your guide is being downloaded! Check your downloads folder.');
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-yellow-400 text-blue-900 rounded-full text-sm font-bold uppercase">
              Free Download
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            The Complete Guide to Buying Your First Home in BC
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90">
            Everything you need to know about government incentives, mortgage options, and the home buying process in British Columbia.
          </p>

          {!showSuccessMessage ? (
            <button
              onClick={handleGetGuide}
              className="inline-block px-12 py-5 bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-xl font-bold rounded-lg shadow-2xl transition-colors"
            >
              <i className="fas fa-download mr-3"></i>
              Download Free Guide Now
            </button>
          ) : (
            <div className="bg-green-500 text-white px-8 py-4 rounded-lg inline-block">
              <i className="fas fa-check-circle mr-2"></i>
              Success! Check your downloads folder.
            </div>
          )}

          <p className="mt-6 text-sm opacity-75">
            No credit card required • Instant download • 50+ pages of expert advice
          </p>
        </div>
      </section>

      {/* What's Inside Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What's Inside the Guide?
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive information to help you navigate the BC housing market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-money-bill-wave text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Government Incentives</h3>
                <p className="text-gray-600">
                  Detailed breakdown of all available programs, including First-Time Home Buyers' Program and Home Buyers' Plan.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-file-contract text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Mortgage Basics</h3>
                <p className="text-gray-600">
                  Understanding mortgage types, rates, down payments, and how to get pre-approved.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-map-marked-alt text-purple-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">BC Neighborhoods</h3>
                <p className="text-gray-600">
                  Complete guide to BC's most affordable neighborhoods for first-time buyers.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clipboard-check text-yellow-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Buying Process</h3>
                <p className="text-gray-600">
                  Step-by-step timeline from pre-approval to closing day, including what to expect at each stage.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Common Mistakes</h3>
                <p className="text-gray-600">
                  Learn from others' experiences and avoid costly first-time buyer mistakes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-calculator text-indigo-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Budget Worksheets</h3>
                <p className="text-gray-600">
                  Practical templates to calculate your true affordability and ongoing costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by BC Home Buyers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">5,000+</div>
              <p className="text-gray-600">Guides Downloaded</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">$35K+</div>
              <p className="text-gray-600">Average Savings Per Buyer</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">4.9/5</div>
              <p className="text-gray-600">Client Satisfaction Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Download your free guide now and take the first step toward homeownership in BC.
          </p>

          {!showSuccessMessage ? (
            <button
              onClick={handleGetGuide}
              className="inline-block px-12 py-5 bg-white text-blue-600 text-xl font-bold rounded-lg shadow-2xl hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-download mr-3"></i>
              Get Your Free Guide
            </button>
          ) : (
            <div className="bg-green-500 text-white px-8 py-4 rounded-lg inline-block">
              <i className="fas fa-check-circle mr-2"></i>
              Guide Downloaded Successfully!
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={close}
        source={source}
        metadata={metadata}
        onSuccess={handleLeadSuccess}
      />
    </div>
  );
}
