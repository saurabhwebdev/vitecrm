import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import useClinicId from '../../hooks/useClinicId';

const SettingsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded-md" />
        <div className="mt-2 h-4 w-72 bg-gray-200 rounded-md" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Input Field Skeletons */}
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-md" />
              </div>
            ))}

            {/* Working Hours Skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded-md" />
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="flex justify-end pt-4">
            <div className="h-10 w-32 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { clinicId, loading: clinicLoading } = useClinicId();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: '',
    currency: 'USD',
    timezone: 'UTC',
    workingHours: {
      start: '09:00',
      end: '17:00',
    },
    appointmentDuration: 30, // in minutes
  });

  useEffect(() => {
    if (clinicId) {
      loadSettings();
    }
  }, [clinicId]);

  const loadSettings = async () => {
    try {
      if (!clinicId) return;

      const settingsRef = doc(db, 'settings', clinicId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data());
      }
    } catch (error) {
      showToast.error('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!clinicId) throw new Error('No clinic ID found');

      const settingsRef = doc(db, 'settings', clinicId);
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast.success('Settings saved successfully');
    } catch (error) {
      showToast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (isLoading || clinicLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your clinic settings and preferences
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Clinic Name"
              name="clinicName"
              value={settings.clinicName}
              onChange={handleChange}
              placeholder="Enter clinic name"
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="Enter clinic email"
              required
            />

            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={settings.phone}
              onChange={handleChange}
              placeholder="Enter clinic phone"
              required
            />

            <Input
              label="Address"
              name="address"
              value={settings.address}
              onChange={handleChange}
              placeholder="Enter clinic address"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="PST">PST</option>
                <option value="IST">IST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours Start
              </label>
              <input
                type="time"
                name="workingHours.start"
                value={settings.workingHours.start}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours End
              </label>
              <input
                type="time"
                name="workingHours.end"
                value={settings.workingHours.end}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Appointment Duration (minutes)
              </label>
              <select
                name="appointmentDuration"
                value={settings.appointmentDuration}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isSaving}
              className="w-full md:w-auto"
            >
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 