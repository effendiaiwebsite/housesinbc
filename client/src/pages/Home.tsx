/**
 * Home Page
 *
 * Landing page with hero section, features, and CTAs.
 */

import { Link } from 'wouter';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
          }}
        ></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
                Your First Home in BC
                <span className="block mt-2 text-4xl md:text-5xl text-blue-300">
                  Starts Here
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-gray-200 leading-relaxed max-w-2xl">
                Discover affordable homes, government incentives, and expert
                guidance for first-time buyers in British Columbia.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/landing">
                  <a className="inline-block px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors">
                    Get Your Free Guide
                    <i className="fas fa-arrow-right ml-3"></i>
                  </a>
                </Link>
                <Link href="/mortgage">
                  <a className="inline-block px-10 py-4 bg-white hover:bg-gray-100 text-blue-900 text-lg font-semibold rounded-lg shadow-lg transition-colors">
                    Calculate Mortgage
                    <i className="fas fa-calculator ml-3"></i>
                  </a>
                </Link>
              </div>
            </div>

            {/* Realtor Card */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <img
                      src="https://scontent.fyvr1-1.fna.fbcdn.net/v/t1.6435-9/107241492_3068456603270586_1976878397009641946_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=C_9yhzpCzFAQ7kNvwHYuiip&_nc_oc=AdmnWaKJj-eDERO8SZN4CndNsDPrjWfzb0Nw7Dhy5PxXfjRC5O22daADPBq5pAnrmaceEnD1uu5x0rt2Zdi9L2EY&_nc_zt=23&_nc_ht=scontent.fyvr1-1.fna&_nc_gid=HKBrnxGR8X8uGH1boxLSKA&oh=00_AfT1B8NCtPmc7dKB2uNwI7sTVG2wrZGW7mMNmSbbp2hVVA&oe=68B24BBA"
                      alt="Rida Kazmi - BC Home Buying Expert"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Rida Kazmi
                  </h3>
                  <p className="text-blue-600 font-medium mb-4">
                    Licensed Real Estate Professional
                  </p>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-star text-yellow-500"></i>
                      <span>500+ First-Time Buyers Helped</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-home text-blue-500"></i>
                      <span>BC Market Specialist</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fas fa-award text-green-500"></i>
                      <span>Government Incentive Expert</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                    <a href="tel:7783205031">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        <i className="fas fa-phone mr-2"></i>
                        Book Free Consultation
                      </button>
                    </a>
                    <Link href="/client/login">
                      <a className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors text-center">
                        <i className="fas fa-user mr-2"></i>
                        Client Login
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Buy Your First Home
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Navigate BC's real estate market with confidence using our
              comprehensive tools and expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-home text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Government Incentives</h3>
              <p className="text-gray-600 mb-4">
                Access up to $40,000 in first-time buyer programs and tax
                credits available in BC.
              </p>
              <Link href="/incentives">
                <a className="text-blue-600 font-medium hover:text-blue-700">
                  Learn More →
                </a>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-calculator text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Mortgage Calculator</h3>
              <p className="text-gray-600 mb-4">
                Calculate your monthly payments, affordability, and total costs
                with our advanced tools.
              </p>
              <Link href="/mortgage">
                <a className="text-blue-600 font-medium hover:text-blue-700">
                  Calculate Now →
                </a>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-map-marker-alt text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Neighborhood Guide</h3>
              <p className="text-gray-600 mb-4">
                Explore BC neighborhoods with pricing data, lifestyle info, and
                market trends.
              </p>
              <Link href="/pricing">
                <a className="text-blue-600 font-medium hover:text-blue-700">
                  Explore Areas →
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Home Buying Journey?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Get instant access to our comprehensive first-time buyer's guide and
            start making informed decisions today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/landing">
              <a className="inline-block px-12 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Download Free Guide
                <i className="fas fa-download ml-3"></i>
              </a>
            </Link>
            <Link href="/incentives">
              <a className="inline-block px-12 py-4 bg-blue-700 text-white rounded-lg text-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white">
                Explore Incentives
                <i className="fas fa-arrow-right ml-3"></i>
              </a>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
