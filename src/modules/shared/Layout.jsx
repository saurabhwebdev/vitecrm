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
  X,
} from 'phosphor-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import ClinicLogo from '../../assets/icons/ClinicLogo';
import useClinicSettings from '../../hooks/useClinicSettings';
import ExportButton from './ExportButton';

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
      <div className="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-100">
        {/* Desktop Navigation */}
        <div className="h-16 mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-full">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center p-1.5 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                <ClinicLogo size={24} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {loading ? 'Loading...' : settings?.clinicName || 'Clinic CRM'}
                </h1>
                <p className="text-xs text-gray-500">Healthcare Management</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex flex-col items-center px-4 py-2 rounded-xl text-sm font-medium 
                      transition-all duration-200 min-w-[5rem]
                      ${isActive
                        ? 'bg-primary-50/70 text-primary-600 ring-1 ring-primary-100'
                        : 'text-gray-600 hover:bg-gray-50/70 hover:text-primary-600'}
                    `}
                  >
                    <item.icon 
                      weight={isActive ? "fill" : "regular"} 
                      className={`
                        w-5 h-5 mb-1 transition-transform duration-200
                        ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                      `}
                    />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Sign Out Button (Desktop) */}
              <button
                onClick={handleSignOut}
                className="hidden md:flex flex-col items-center px-4 py-2 text-sm font-medium 
                  text-gray-600 rounded-xl transition-all duration-200 hover:bg-red-50 
                  hover:text-red-600 min-w-[5rem] group"
              >
                <SignOut className="w-5 h-5 mb-1 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-xs font-medium">Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden rounded-xl p-2 text-gray-600 hover:bg-gray-50 
                  transition-all duration-200 hover:scale-105"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <List className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`
            md:hidden bg-white border-t border-gray-100 overflow-hidden 
            transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'max-h-[32rem] shadow-lg' : 'max-h-0'}
          `}
        >
          <nav className="px-4 py-3 grid grid-cols-3 gap-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex flex-col items-center px-3 py-3 rounded-xl text-sm
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50/70 text-primary-600 ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-50/70 hover:text-primary-600'}
                  `}
                >
                  <item.icon 
                    weight={isActive ? "fill" : "regular"} 
                    className={`
                      w-6 h-6 mb-1 transition-transform duration-200
                      ${isActive ? 'scale-110' : ''}
                    `}
                  />
                  <span className="text-xs font-medium text-center">{item.name}</span>
                </Link>
              );
            })}
            {/* Mobile Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center px-3 py-3 text-sm
                text-red-600 rounded-xl transition-all duration-200 
                hover:bg-red-50/70 col-span-3"
            >
              <SignOut className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Sign Out</span>
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
          <div className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Logo and Copyright */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600">
                  <ClinicLogo size={20} className="text-white" />
                </div>
                <div className="text-sm text-gray-500">
                  © {new Date().getFullYear()} {settings?.clinicName || 'Clinic CRM'}
                </div>
              </div>

              {/* Center Links */}
              <div className="flex flex-wrap justify-center gap-6">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                <ExportButton />
                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-600 transition-all duration-200"
                  >
                    <GithubLogo weight="fill" className="w-5 h-5" />
                  </a>
                  <a
                    href="https://website.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-600 transition-all duration-200"
                  >
                    <Globe weight="fill" className="w-5 h-5" />
                  </a>
                  <div className="text-xs text-gray-400 flex items-center">
                    <Heart weight="fill" className="w-3.5 h-3.5 text-red-400 mx-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 