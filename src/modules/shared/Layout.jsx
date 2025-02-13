import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  Users,
  Calendar,
  Prescription,
  Receipt,
  Package,
  Gear,
  SignOut,
  List,
  Heart,
  GithubLogo,
  Globe,
} from 'phosphor-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import ClinicLogo from '../../assets/icons/ClinicLogo';
import useClinicSettings from '../../hooks/useClinicSettings';

const Layout = ({ children }) => {
  const location = useLocation();
  const { settings, loading } = useClinicSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  // Update document title when settings are loaded
  useEffect(() => {
    if (settings?.clinicName) {
      document.title = `${settings.clinicName} - Clinic Management`;
    }
  }, [settings?.clinicName]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: House },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Prescriptions', href: '/prescriptions', icon: Prescription },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Settings', href: '/settings', icon: Gear },
  ];

  const footerLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact', href: '/contact' },
    { name: 'About', href: '/about' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-md">
        {/* Desktop Navigation */}
        <div className="h-16 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <ClinicLogo size={28} className="flex-shrink-0" />
              <h1 className="text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent truncate hidden sm:block">
                {loading ? 'Loading...' : settings?.clinicName || 'Clinic CRM'}
              </h1>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}
                      transform hover:scale-[1.02] active:scale-[0.98]
                    `}
                  >
                    <item.icon 
                      weight={isActive ? "fill" : "regular"} 
                      className="w-5 h-5"
                    />
                    <span className="ml-2">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Sign Out Button (Desktop) */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-600 
                  rounded-lg transition-all duration-200 hover:bg-red-50 hover:text-red-600
                  transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <SignOut className="w-5 h-5" />
                <span className="ml-2">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <List className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`
          md:hidden bg-white border-t border-gray-100 overflow-hidden transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'}
        `}>
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'}
                  `}
                >
                  <item.icon 
                    weight={isActive ? "fill" : "regular"} 
                    className="w-5 h-5"
                  />
                  <span className="ml-2">{item.name}</span>
                </Link>
              );
            })}
            {/* Mobile Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 
                rounded-lg transition-all duration-200 hover:bg-red-50"
            >
              <SignOut className="w-5 h-5" />
              <span className="ml-2">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow pt-16">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Footer Content */}
          <div className="py-8">
            {/* Top Section */}
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              {/* Logo and Copyright */}
              <div className="flex items-center space-x-2">
                <ClinicLogo size={24} className="text-primary-600" />
                <span className="text-sm text-gray-600">
                  © {new Date().getFullYear()} {settings?.clinicName || 'Clinic CRM'}. All rights reserved.
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <GithubLogo weight="fill" className="w-5 h-5" />
                </a>
                <a
                  href="https://website.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Globe weight="fill" className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-gray-100" />

            {/* Bottom Section */}
            <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
              {/* Links */}
              <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Made with Love */}
              <div className="flex items-center text-sm text-gray-500">
                Made with <Heart weight="fill" className="w-4 h-4 mx-1 text-red-500" /> by Your Team
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 