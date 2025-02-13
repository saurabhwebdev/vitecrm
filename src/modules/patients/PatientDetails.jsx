import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';
import { db } from '../../lib/firebase';
import { ArrowLeft, PencilSimple } from 'phosphor-react';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import AddPatientModal from './AddPatientModal';
import useClinicId from '../../hooks/useClinicId';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const { clinicId, loading: clinicLoading } = useClinicId();

  const [snapshot, loading, error] = useDocument(
    id ? doc(db, 'patients', id) : null
  );

  const patient = snapshot?.data();

  useEffect(() => {
    if (!id) {
      showToast.error('Invalid patient ID');
      navigate('/patients');
      return;
    }

    // Verify patient belongs to clinic
    const verifyPatient = async () => {
      if (!clinicId) return;
      
      try {
        const patientDoc = await getDoc(doc(db, 'patients', id));
        if (!patientDoc.exists()) {
          showToast.error('Patient not found');
          navigate('/patients');
          return;
        }

        const patientData = patientDoc.data();
        if (patientData.clinicId !== clinicId) {
          showToast.error('You do not have access to this patient');
          navigate('/patients');
        }
      } catch (err) {
        console.error('Error verifying patient:', err);
        showToast.error('Error loading patient details');
        navigate('/patients');
      }
    };

    verifyPatient();
  }, [id, clinicId, navigate]);

  if (error) {
    console.error('Error loading patient:', error);
    return (
      <div className="text-center text-red-500">
        Error loading patient details. Please try again. {error.message}
      </div>
    );
  }

  if (loading || clinicLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-gray-500">Patient not found.</div>
        <Button onClick={() => navigate('/patients')} variant="outline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Patient Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage patient information
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <PencilSimple className="w-5 h-5 mr-2" />
          Edit Patient
        </Button>
      </div>

      {/* Patient Information */}
      <div className="bg-white shadow rounded-lg">
        {/* Basic Information */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <div className="mt-1 text-sm text-gray-900">{patient.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Patient ID</label>
              <div className="mt-1 text-sm text-gray-900">{id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Age</label>
              <div className="mt-1 text-sm text-gray-900">{patient.age} years</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Gender</label>
              <div className="mt-1 text-sm text-gray-900">{patient.gender}</div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <div className="mt-1 text-sm text-gray-900">{patient.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <div className="mt-1 text-sm text-gray-900">{patient.phone}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Address</label>
              <div className="mt-1 text-sm text-gray-900">{patient.address}</div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Medical Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Blood Group</label>
              <div className="mt-1 text-sm text-gray-900">{patient.bloodGroup || 'Not specified'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Visit</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(patient.lastVisit)}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Medical History</label>
              <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {patient.medicalHistory || 'No medical history recorded'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-500">Allergies</label>
              <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {patient.allergies || 'No allergies recorded'}
              </div>
            </div>
          </div>
        </div>

        {/* Record Information */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900">Record Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(patient.createdAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Updated</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(patient.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AddPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={{ ...patient, id }}
        clinicId={clinicId}
      />
    </div>
  );
};

export default PatientDetails;