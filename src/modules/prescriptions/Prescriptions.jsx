import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, PencilSimple, Trash, Printer, CaretLeft, CaretRight } from 'phosphor-react';
import { collection, query, orderBy, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AddPrescriptionModal from './AddPrescriptionModal';

const Prescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [clinicId, setClinicId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

        console.log('Found clinic ID for prescriptions list:', userClinicId);
        setClinicId(userClinicId);

      } catch (error) {
        console.error('Error getting clinic ID:', error);
        showToast.error('Failed to get clinic information');
      }
    };
    
    getClinicId();
  }, []);

  // Get prescriptions with realtime updates
  const prescriptionsQuery = clinicId ? query(
    collection(db, 'prescriptions'),
    where('clinicId', '==', clinicId),
    orderBy('createdAt', 'desc')
  ) : null;

  const [prescriptionsSnapshot, loading, error] = useCollection(prescriptionsQuery);

  const prescriptions = prescriptionsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) || [];

  console.log('Loaded prescriptions:', prescriptions); // Debug log

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (!prescription) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = prescription.patientName?.toLowerCase().includes(searchLower) ||
      prescription.medication?.toLowerCase().includes(searchLower) ||
      prescription.status?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleEdit = (prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleDelete = async (prescriptionId) => {
    if (!prescriptionId) {
      showToast.error('Cannot delete prescription: Invalid prescription ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
        await deleteDoc(prescriptionRef);
        showToast.success('Prescription deleted successfully');
      } catch (error) {
        console.error('Error deleting prescription:', error);
        showToast.error('Failed to delete prescription');
      }
    }
  };

  const handlePrint = async (prescription) => {
    try {
      // Get clinic settings
      if (!clinicId) {
        showToast.error('Clinic information not available');
        return;
      }

      const settingsDoc = await getDoc(doc(db, 'settings', clinicId));
      const settings = settingsDoc.data();

      if (!settings) {
        showToast.error('Clinic settings not found');
        return;
      }

      // Create print content
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        showToast.error('Please allow pop-ups to print prescriptions');
        return;
      }

      // Get formatted dates
      const startDate = new Date(prescription.startDate).toLocaleDateString();
      const endDate = new Date(prescription.endDate).toLocaleDateString();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription - ${prescription.patientName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .clinic-details {
              font-size: 14px;
              margin: 5px 0;
            }
            .prescription-details {
              margin: 20px 0;
            }
            .patient-info {
              margin-bottom: 20px;
            }
            .medications {
              margin: 20px 0;
            }
            .medication {
              margin: 15px 0;
              padding: 10px;
              border: 1px solid #ccc;
            }
            .footer {
              margin-top: 50px;
              text-align: right;
            }
            .signature-line {
              border-top: 1px solid #000;
              width: 200px;
              margin-left: auto;
              padding-top: 5px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="clinic-name">${settings.clinicName || 'Medical Clinic'}</h1>
            <p class="clinic-details">${settings.address || ''}</p>
            <p class="clinic-details">Phone: ${settings.phone || ''}</p>
            <p class="clinic-details">Email: ${settings.email || ''}</p>
            ${settings.timezone ? `<p class="clinic-details">Timezone: ${settings.timezone}</p>` : ''}
          </div>

          <div class="prescription-details">
            <div class="patient-info">
              <h2>Prescription</h2>
              <p><strong>Patient Name:</strong> ${prescription.patientName}</p>
              <p><strong>Date:</strong> ${startDate} to ${endDate}</p>
              <p><strong>Status:</strong> ${prescription.status}</p>
            </div>

            <div class="medications">
              <h3>Medications:</h3>
              ${prescription.medications.map((med, index) => `
                <div class="medication">
                  <p><strong>${index + 1}. ${med.name}</strong></p>
                  <p><strong>Dosage:</strong> ${med.dosage}</p>
                  <p><strong>Frequency:</strong> ${med.frequency}</p>
                  <p><strong>Duration:</strong> ${med.duration}</p>
                </div>
              `).join('')}
            </div>

            ${prescription.notes ? `
              <div class="notes">
                <h3>Additional Notes:</h3>
                <p>${prescription.notes}</p>
              </div>
            ` : ''}
          </div>

          <div class="footer">
            <p class="text-sm text-gray-500">Prescribed on: ${new Date(prescription.createdAt).toLocaleDateString()}</p>
            <div class="signature-line">
              Doctor's Signature
            </div>
          </div>

          <button class="no-print" onclick="window.print(); window.close();" 
                  style="position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #4F46E5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Prescription
          </button>
        </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error('Error printing prescription:', error);
      showToast.error('Failed to print prescription');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-3">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(endIndex, filteredPrescriptions.length)}
              </span>{' '}
              of <span className="font-medium">{filteredPrescriptions.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } border border-gray-300`}
              >
                <span className="sr-only">Previous</span>
                <CaretLeft className="h-5 w-5" />
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      isCurrentPage
                        ? 'z-10 bg-primary-600 text-white focus:z-20'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    } border border-gray-300`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } border border-gray-300`}
              >
                <span className="sr-only">Next</span>
                <CaretRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    console.error('Error loading prescriptions:', error);
    showToast.error('Failed to load prescriptions');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Prescriptions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage patient prescriptions and medications
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Prescription
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Discontinued">Discontinued</option>
        </select>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Skeleton loading animation
                [...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    {searchQuery || filterStatus !== 'all'
                      ? 'No prescriptions found matching your search criteria'
                      : 'No prescriptions added yet'}
                  </td>
                </tr>
              ) : (
                currentPrescriptions.map((prescription) => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prescription.patientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Prescribed: {formatDate(prescription.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {prescription.medications?.map((med, index) => (
                          <div key={index} className="mb-1">
                            {med.name} - {med.dosage}
                            <div className="text-xs text-gray-500">
                              {med.frequency}
                            </div>
                            {index < prescription.medications.length - 1 && <hr className="my-1" />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(prescription.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate(prescription.endDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        prescription.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : prescription.status === 'Completed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePrint(prescription)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Print prescription"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(prescription)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Edit prescription"
                      >
                        <PencilSimple className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete prescription"
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

      {/* Add/Edit Prescription Modal */}
      <AddPrescriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrescription(null);
        }}
        prescription={selectedPrescription}
      />

      {/* Add Pagination component */}
      <Pagination />
    </div>
  );
};

export default Prescriptions; 