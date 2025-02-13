import React from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft } from 'phosphor-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <CaretLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
            <p className="text-gray-600">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>Personal identification information (Name, email address, phone number)</li>
              <li>Clinic and practice information</li>
              <li>Patient records and medical information</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Notify you about changes to our service</li>
              <li>Provide customer support</li>
              <li>Monitor the usage of our service</li>
              <li>Detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Data Security</h2>
            <p className="text-gray-600">
              The security of your data is important to us. We implement industry-standard security 
              measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure data storage with regular backups</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and updates</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. HIPAA Compliance</h2>
            <p className="text-gray-600">
              Our service is designed to be HIPAA compliant. We maintain appropriate physical, 
              electronic, and procedural safeguards to protect sensitive patient information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Data Retention</h2>
            <p className="text-gray-600">
              We will retain your personal data only for as long as is necessary for the purposes 
              set out in this Privacy Policy. We will retain and use your data to the extent 
              necessary to comply with our legal obligations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Your Data Protection Rights</h2>
            <p className="text-gray-600">
              You have the following data protection rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to update or correct your personal data</li>
              <li>The right to request deletion of your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Third-Party Services</h2>
            <p className="text-gray-600">
              We may employ third-party companies and individuals to facilitate our service, 
              provide service-related services, or assist us in analyzing how our service is used.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">9. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at privacy@cliniccrm.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 