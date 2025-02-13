import React from 'react';
import { Info, ShieldCheck, Rocket, Users } from 'phosphor-react';

const About = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Secure & Compliant',
      description: 'Built with security and privacy in mind, ensuring your data is protected and HIPAA compliant.'
    },
    {
      icon: Rocket,
      title: 'Modern Technology',
      description: 'Leveraging the latest web technologies to provide a fast, reliable, and user-friendly experience.'
    },
    {
      icon: Users,
      title: 'Patient-Centric',
      description: 'Designed to streamline patient management and improve the quality of care delivery.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Info className="w-8 h-8 text-primary-600" weight="fill" />
        <h1 className="text-2xl font-semibold text-gray-900">About Us</h1>
      </div>

      {/* Mission Statement */}
      <div className="prose prose-primary max-w-none mb-12">
        <h2>Our Mission</h2>
        <p className="text-lg text-gray-600">
          We are dedicated to transforming healthcare management through innovative technology solutions. 
          Our clinic management system empowers healthcare providers to deliver better patient care while 
          streamlining their administrative workflows.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-8 md:grid-cols-3 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <feature.icon className="w-10 h-10 text-primary-600 mb-4" weight="fill" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Company Story */}
      <div className="prose prose-primary max-w-none">
        <h2>Our Story</h2>
        <p>
          Founded by healthcare professionals and technology experts, our journey began with a simple 
          mission: to create a comprehensive clinic management solution that addresses the real-world 
          challenges faced by medical practices.
        </p>

        <h2>What Sets Us Apart</h2>
        <p>
          We understand that every clinic is unique. That's why our system is designed to be flexible 
          and customizable, adapting to your specific workflows while maintaining the highest standards 
          of security and efficiency.
        </p>

        <h2>Our Commitment</h2>
        <p>
          We are committed to continuous improvement and innovation. Through regular updates and 
          responsive support, we ensure that our system evolves alongside the changing needs of 
          healthcare providers and their patients.
        </p>
      </div>
    </div>
  );
};

export default About; 