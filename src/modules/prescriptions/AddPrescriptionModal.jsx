import React, { useEffect, useState } from 'react';
import { X, Plus, Trash } from 'phosphor-react';
import { doc, collection, addDoc, updateDoc, query, getDocs, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';

const AddPrescriptionModal = ({ isOpen, onClose, prescription }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [clinicId, setClinicId] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '',
      }
    ],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    status: 'Active'
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

        console.log('Found clinic ID for prescription:', userClinicId);
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

  useEffect(() => {
    // Load patients when modal opens and clinicId is available
    const loadPatients = async () => {
      if (!clinicId) {
        console.log('No clinic ID available yet');
        return;
      }

      try {
        console.log('Loading patients for clinic:', clinicId);
        // Load patients filtered by clinicId
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

  useEffect(() => {
    if (prescription) {
      setFormData({
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        medications: prescription.medications || [
          {
            name: prescription.medication || '',
            dosage: prescription.dosage || '',
            frequency: prescription.frequency || 'Once daily',
            duration: prescription.duration || '',
          }
        ],
        startDate: new Date(prescription.startDate).toISOString().split('T')[0],
        endDate: new Date(prescription.endDate).toISOString().split('T')[0],
        notes: prescription.notes || '',
        status: prescription.status
      });
    } else {
      setFormData({
        patientId: '',
        patientName: '',
        medications: [
          {
            name: '',
            dosage: '',
            frequency: 'Once daily',
            duration: '',
          }
        ],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        status: 'Active'
      });
    }
  }, [prescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      const selectedPatient = patients.find(p => p.id === formData.patientId);

      if (!selectedPatient) {
        showToast.error('Please select a patient');
        return;
      }

      const prescriptionData = {
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        medications: formData.medications,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        notes: formData.notes,
        status: formData.status,
        clinicId,
        updatedAt: new Date().toISOString()
      };

      if (prescription) {
        // Update existing prescription
        const prescriptionRef = doc(db, 'prescriptions', prescription.id);
        await updateDoc(prescriptionRef, prescriptionData);
        showToast.success('Prescription updated successfully');
      } else {
        // Add new prescription
        prescriptionData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'prescriptions'), prescriptionData);
        showToast.success('Prescription added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      showToast.error(prescription ? 'Failed to update prescription' : 'Failed to add prescription');
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

  const handleMedicationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: 'Once daily',
          duration: ''
        }
      ]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length === 1) {
      showToast.error('At least one medication is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
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
              {prescription ? 'Edit Prescription' : 'New Prescription'}
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
            <div className="space-y-6">
              {/* Patient Selection */}
              <div>
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

              {/* Medications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Medications</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedication}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

                {formData.medications.map((medication, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">
                        Medication #{index + 1}
                      </h4>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Input
                        label="Medication Name"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        required
                        placeholder="Enter medication name"
                      />

                      <Input
                        label="Dosage"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        required
                        placeholder="e.g., 500mg"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          required
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>

                      <Input
                        label="Duration"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        required
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate}
                />
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
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  placeholder="Add any notes about the prescription..."
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
                {prescription ? 'Update Prescription' : 'Add Prescription'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPrescriptionModal; 