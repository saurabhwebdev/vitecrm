import React, { useEffect, useState } from 'react';
import { X } from 'phosphor-react';
import { doc, collection, addDoc, updateDoc, query, getDocs, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';

const AddAppointmentModal = ({ isOpen, onClose, appointment, selectedDate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [clinicId, setClinicId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: '',
    startTime: '',
    duration: '30',
    type: 'Consultation',
    notes: '',
    status: 'Scheduled'
  });

  // Get clinicId from user document
  useEffect(() => {
    const getClinicId = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }

      try {
        // Get user's document from users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.error('User document not found');
          showToast.error('User information not found');
          return;
        }

        const userData = userDoc.data();
        const userClinicId = userData.clinicId;
        
        if (!userClinicId) {
          console.error('No clinic ID found in user document');
          showToast.error('Clinic information not found');
          return;
        }

        console.log('Found clinic ID:', userClinicId);
        setClinicId(userClinicId);

      } catch (error) {
        console.error('Error getting clinic ID:', error);
        showToast.error('Failed to get clinic information');
      }
    };
    
    if (isOpen) {
      getClinicId();
    }
  }, [isOpen]);

  // Load patients for the dropdown
  useEffect(() => {
    const loadPatients = async () => {
      if (!clinicId) {
        console.log('No clinic ID available yet');
        return;
      }
      
      try {
        console.log('Loading patients for clinic:', clinicId);
        const patientsQuery = query(
          collection(db, 'patients'),
          where('clinicId', '==', clinicId)
        );
        const snapshot = await getDocs(patientsQuery);
        const patientsList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        console.log('Loaded patients:', patientsList);
        setPatients(patientsList);

        if (patientsList.length === 0) {
          showToast.info('No patients found. Please add patients first.');
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        showToast.error('Failed to load patients list');
      }
    };

    if (isOpen && clinicId) {
      loadPatients();
    }
  }, [isOpen, clinicId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        patientId: '',
        patientName: '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        startTime: '09:00',
        duration: '30',
        type: 'Consultation',
        notes: '',
        status: 'Scheduled'
      });
    }
  }, [isOpen, selectedDate]);

  // Load appointment data for editing
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.startTime);
      const formattedDate = appointmentDate.toISOString().split('T')[0];
      const formattedTime = appointmentDate.toTimeString().slice(0, 5);

      setFormData({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        date: formattedDate,
        startTime: formattedTime,
        duration: appointment.duration.toString(),
        type: appointment.type,
        notes: appointment.notes || '',
        status: appointment.status
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const selectedPatient = patients.find(p => p.id === formData.patientId);

      if (!selectedPatient) {
        showToast.error('Please select a patient');
        return;
      }

      const appointmentData = {
        clinicId,
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        startTime: startDateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        notes: formData.notes,
        status: formData.status,
        updatedAt: new Date().toISOString()
      };

      if (appointment) {
        // Update existing appointment
        const appointmentRef = doc(db, 'appointments', appointment.id);
        await updateDoc(appointmentRef, appointmentData);
        showToast.success('Appointment updated successfully');
      } else {
        // Add new appointment
        appointmentData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'appointments'), appointmentData);
        showToast.success('Appointment scheduled successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      showToast.error(appointment ? 'Failed to update appointment' : 'Failed to schedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Patient Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <Input
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <Input
                label="Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                required
              />

              {/* Duration & Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Check-up">Check-up</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  placeholder="Add any notes about the appointment..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                {appointment ? 'Update Appointment' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAppointmentModal; 