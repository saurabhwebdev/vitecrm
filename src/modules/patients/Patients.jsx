import React, { useState } from 'react';
import { Plus, MagnifyingGlass, PencilSimple, Trash } from 'phosphor-react';
import { collection, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AddPatientModal from './AddPatientModal';
import { useNavigate } from 'react-router-dom';
import useClinicId from '../../hooks/useClinicId';

const Patients = () => {
  const { clinicId, loading: clinicLoading } = useClinicId();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  // Get patients with realtime updates
  const patientsQuery = clinicId ? query(
    collection(db, 'patients'),
    where('clinicId', '==', clinicId),
    orderBy('createdAt', 'desc')
  ) : null;
  
  const [patientsSnapshot, loading, error] = useCollection(patientsQuery);

  const patients = patientsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const filteredPatients = patients?.filter(patient => {
    if (!patient) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchQuery)
    );
  }) || [];

  const handleEdit = (patient) => {
    if (!patient?.id) {
      showToast.error('Cannot edit patient: Invalid patient data');
      return;
    }
    setSelectedPatient(patient);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (patientId) => {
    if (!patientId) {
      showToast.error('Cannot delete patient: Invalid patient ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const patientRef = doc(db, 'patients', patientId);
        await deleteDoc(patientRef);
        showToast.success('Patient deleted successfully');
      } catch (error) {
        console.error('Error deleting patient:', error);
        showToast.error('Failed to delete patient: ' + error.message);
      }
    }
  };

  const handleViewDetails = (e, patientId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!patientId) return;
    navigate(`/patients/${patientId}`);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (error) {
    console.error('Error loading patients:', error);
    return (
      <div className="text-center text-red-500">
        Error loading patients. Please try again. {error.message}
      </div>
    );
  }

  if (clinicLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your patient records and information
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search patients by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Patients List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age/Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    {searchQuery ? 'No patients found matching your search' : 'No patients added yet'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer group" 
                      onClick={(e) => handleViewDetails(e, patient.id)}
                    >
                      <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {patient.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(patient.dateOfBirth)} years
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Edit patient"
                      >
                        <PencilSimple className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete patient"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        clinicId={clinicId}
      />
    </div>
  );
};

export default Patients; 