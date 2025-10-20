/**
 * Footer Component
 *
 * Site-wide footer with links and contact info.
 */

import { Link } from 'wouter';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Houses in BC</h3>
            <p className="text-sm">
              Your trusted partner for first-time home buying in British Columbia. Expert guidance, government incentives, and local market knowledge.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="hover:text-white transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="hover:text-white transition-colors">Neighborhoods</a>
                </Link>
              </li>
              <li>
                <Link href="/mortgage">
                  <a className="hover:text-white transition-colors">Mortgage Calculator</a>
                </Link>
              </li>
              <li>
                <Link href="/incentives">
                  <a className="hover:text-white transition-colors">Government Incentives</a>
                </Link>
              </li>
              <li>
                <Link href="/properties">
                  <a className="hover:text-white transition-colors">Property Search</a>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <a className="hover:text-white transition-colors">Blog</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/landing">
                  <a className="hover:text-white transition-colors">Free Home Buyer's Guide</a>
                </Link>
              </li>
              <li>
                <Link href="/incentives">
                  <a className="hover:text-white transition-colors">First-Time Buyer Programs</a>
                </Link>
              </li>
              <li>
                <Link href="/client/login">
                  <a className="hover:text-white transition-colors">Client Portal</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <i className="fas fa-phone text-blue-400"></i>
                <a href="tel:+17783205031" className="hover:text-white transition-colors">
                  +1 (778) 320-5031
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope text-blue-400"></i>
                <a href="mailto:info@housesinbc.com" className="hover:text-white transition-colors">
                  info@housesinbc.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-blue-400"></i>
                <span>British Columbia, Canada</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {currentYear} Houses in BC. All rights reserved.</p>
          <p className="mt-2 text-gray-500">
            Helping first-time home buyers achieve their dreams in British Columbia.
          </p>
        </div>
      </div>
    </footer>
  );
}
