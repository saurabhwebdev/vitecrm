import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, PencilSimple, Trash } from 'phosphor-react';
import { collection, query, orderBy, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../../lib/firebase';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';
import Input from '../shared/Input';
import AddAppointmentModal from './AddAppointmentModal';

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [clinicId, setClinicId] = useState(null);

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

        console.log('Found clinic ID for appointments list:', userClinicId);
        setClinicId(userClinicId);

      } catch (error) {
        console.error('Error getting clinic ID:', error);
        showToast.error('Failed to get clinic information');
      }
    };
    
    getClinicId();
  }, []);

  // Get appointments with realtime updates
  const appointmentsQuery = clinicId ? query(
    collection(db, 'appointments'),
    where('clinicId', '==', clinicId),
    orderBy('startTime', 'desc')
  ) : null;

  const [appointmentsSnapshot, loading, error] = useCollection(appointmentsQuery);

  const appointments = appointmentsSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) || [];

  console.log('Loaded appointments:', appointments); // Debug log

  const filteredAppointments = appointments.filter(appointment => {
    if (!appointment) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchLower) ||
      appointment.type?.toLowerCase().includes(searchLower) ||
      appointment.status?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.startTime);
    appointmentDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let matchesDate = true;
    if (filterDate === 'today') {
      matchesDate = appointmentDate.getTime() === today.getTime();
    } else if (filterDate === 'tomorrow') {
      matchesDate = appointmentDate.getTime() === tomorrow.getTime();
    } else if (filterDate === 'week') {
      matchesDate = appointmentDate >= today && appointmentDate <= nextWeek;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  console.log('Filtered appointments:', filteredAppointments); // Debug log

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (appointmentId) => {
    if (!appointmentId) {
      showToast.error('Cannot delete appointment: Invalid appointment ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        await deleteDoc(appointmentRef);
        showToast.success('Appointment deleted successfully');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        showToast.error('Failed to delete appointment');
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    console.error('Error loading appointments:', error);
    showToast.error('Failed to load appointments');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage patient appointments and schedules
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">Next 7 Days</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    {searchQuery || filterStatus !== 'all' || filterDate !== 'all'
                      ? 'No appointments found matching your search criteria'
                      : 'No appointments scheduled yet'}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(appointment.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                        {appointment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.duration} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        appointment.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : appointment.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                        title="Edit appointment"
                      >
                        <PencilSimple className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete appointment"
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

      {/* Add/Edit Appointment Modal */}
      <AddAppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        selectedDate={new Date()}
      />
    </div>
  );
};

export default Appointments;