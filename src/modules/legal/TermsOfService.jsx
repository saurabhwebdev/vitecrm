import React from 'react';
import { FileText } from 'phosphor-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-primary-600" weight="fill" />
        <h1 className="text-2xl font-semibold text-gray-900">Terms of Service</h1>
      </div>
      
      <div className="prose prose-primary max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using this Clinic Management System, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use this software for personal or business medical practice management purposes only. This is the grant of a license, not a transfer of title.
        </p>

        <h2>3. Data Privacy</h2>
        <p>
          We are committed to protecting patient data privacy and maintaining compliance with relevant healthcare regulations and standards.
        </p>

        <h2>4. User Obligations</h2>
        <p>
          Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
        </p>

        <h2>5. System Availability</h2>
        <p>
          While we strive to keep the system available 24/7, we cannot guarantee uninterrupted access to the service. Maintenance windows will be communicated in advance.
        </p>

        <h2>6. Modifications to Service</h2>
        <p>
          We reserve the right to modify or discontinue the service with or without notice to the user. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us through our support channels.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService; 