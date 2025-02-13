import React from 'react';
import { EnvelopeSimple, Phone, MapPin } from 'phosphor-react';

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <EnvelopeSimple className="w-8 h-8 text-primary-600" weight="fill" />
        <h1 className="text-2xl font-semibold text-gray-900">Contact Us</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-medium text-gray-900">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions about our Clinic Management System? We're here to help!
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <EnvelopeSimple className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-gray-600">support@cliniccrm.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Office</p>
                <p className="text-gray-600">
                  123 Healthcare Avenue<br />
                  Suite 456<br />
                  Medical District, MD 12345
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact; 