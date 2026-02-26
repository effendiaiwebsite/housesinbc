/**
 * Privacy Policy Page
 *
 * Publicly accessible at /privacy.
 * Required by the Google Play Store listing for the Houses BC mobile app.
 */

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero */}
      <div className="gradient-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="premium-card rounded-2xl p-8 md:p-12 space-y-10">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">About This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Houses BC ("we", "our", or "us") operates the Houses BC website and mobile application
              (the "Service"). This Privacy Policy explains what information we collect, how we use it,
              and the choices you have regarding that information. By using the Service you agree to the
              collection and use of information as described here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <ul className="space-y-3">
              {[
                {
                  title: 'Account information',
                  desc: 'Your name and email address, stored securely via Firebase Authentication.',
                },
                {
                  title: 'Usage data',
                  desc: 'Screens visited, features used, and session duration — collected in anonymised form to improve the Service.',
                },
                {
                  title: 'Search and filter preferences',
                  desc: 'Saved locally on your device to restore your last search state.',
                },
                {
                  title: 'Appointment details',
                  desc: 'Date, time, and property information for viewings you book through the Service.',
                },
                {
                  title: 'Device information',
                  desc: 'Device model, operating system version, and crash-report data used for debugging.',
                },
                {
                  title: 'Location (optional)',
                  desc: 'Your approximate location, only if you grant permission, used solely to show nearby properties.',
                },
              ].map(({ title, desc }) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-800">{title}:</span> {desc}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="space-y-3">
              {[
                'To create and manage your account.',
                'To display property listings and calculate mortgage estimates relevant to you.',
                'To schedule and confirm property viewing appointments.',
                'To send transactional notifications (appointment reminders, account updates).',
                'To improve and debug the Service using anonymised analytics and crash data.',
                'To comply with applicable laws and regulations.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We do not sell your personal information. We may share data only in the following limited
              circumstances:
            </p>
            <ul className="space-y-3">
              {[
                'Service providers: Firebase (Google LLC) for authentication, database, and crash reporting.',
                'Legal requirements: if required by law, court order, or to protect our legal rights.',
                'Business transfers: in the event of a merger or acquisition, subject to the same privacy commitments.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your account data for as long as your account is active. You may request
              deletion of your account and associated data at any time by contacting us at{' '}
              <a href="mailto:privacy@housesinbc.com" className="text-blue-600 hover:underline">
                privacy@housesinbc.com
              </a>
              . Anonymised analytics data may be retained for up to 24 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard measures to protect your data, including TLS encryption in
              transit and encrypted storage for sensitive credentials. No method of transmission over
              the internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service is not directed to children under 13 years of age. We do not knowingly
              collect personal information from children. If you believe a child has provided us with
              personal information, please contact us so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Your Rights (Canadian Residents)
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Under PIPEDA and British Columbia's PIPA, you have the right to:
            </p>
            <ul className="space-y-3">
              {[
                'Access the personal information we hold about you.',
                'Correct inaccurate personal information.',
                'Withdraw consent to certain uses of your information.',
                'Request deletion of your account and associated data.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be
              communicated via an in-app notification or the updated "last updated" date above.
              Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please contact:
            </p>
            <div className="mt-4 space-y-1 text-gray-700">
              <p className="font-semibold">Houses BC — Privacy Team</p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@housesinbc.com" className="text-blue-600 hover:underline">
                  privacy@housesinbc.com
                </a>
              </p>
              <p>
                Website:{' '}
                <a href="https://housesinbc.com" className="text-blue-600 hover:underline">
                  housesinbc.com
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
