import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ClinicLogo from '../../assets/icons/ClinicLogo';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      // Create user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create clinic document first
      const clinicRef = doc(collection(db, 'clinics'));
      const clinicData = {
        name: `${name}'s Clinic`,
        ownerId: user.uid,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Create all documents in parallel for better performance
      await Promise.all([
        // Update user profile
        updateProfile(user, { displayName: name }),
        
        // Create clinic document
        setDoc(clinicRef, clinicData),
        
        // Create user document
        setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          role: 'admin',
          clinicId: clinicRef.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        
        // Create settings document
        setDoc(doc(db, 'settings', clinicRef.id), {
          clinicName: `${name}'s Clinic`,
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workingHours: {
            start: '09:00',
            end: '17:00',
          },
          appointmentDuration: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      ]);

      showToast.success('Account created successfully! Welcome aboard.');
      
      // Add a small delay before navigation to ensure Firestore writes are completed
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      showToast.error(
        error.code === 'auth/email-already-in-use'
          ? 'This email is already registered. Please try logging in.'
          : 'Failed to create account. Please try again.'
      );
      
      // Cleanup if registration fails
      try {
        const user = auth.currentUser;
        if (user) {
          await user.delete();
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <ClinicLogo size={48} className="text-primary-600" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started with your clinic management journey
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-sm rounded-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Full name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
            />

            <Input
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Create a password"
              minLength={6}
              helperText="Password must be at least 6 characters long"
            />

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Create account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;