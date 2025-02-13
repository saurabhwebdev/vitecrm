import React from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft } from 'phosphor-react';

const TermsOfService = () => {
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
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using the Clinic CRM platform, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
            <p className="text-gray-600">
              Clinic CRM is a clinic management system that provides tools for managing patients, 
              appointments, prescriptions, invoices, and inventory.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. User Responsibilities</h2>
            <p className="text-gray-600">
              Users are responsible for maintaining the confidentiality of their account information 
              and for all activities that occur under their account.
            </p>
            <ul className="list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>Protect account credentials</li>
              <li>Ensure accuracy of patient information</li>
              <li>Comply with healthcare regulations</li>
              <li>Maintain patient confidentiality</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">4. Data Privacy</h2>
            <p className="text-gray-600">
              We are committed to protecting your data and patient information. All data is encrypted 
              and stored securely. For more information, please refer to our Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">5. Service Availability</h2>
            <p className="text-gray-600">
              While we strive to provide uninterrupted service, we cannot guarantee 100% uptime. 
              Maintenance and updates will be scheduled with advance notice when possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">6. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to terminate or suspend access to our service immediately, 
              without prior notice or liability, for any reason.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">7. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">8. Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at support@cliniccrm.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 