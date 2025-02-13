import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Receipt, Package, CaretUp, CaretDown,
  ChartLine, ChartPie, ArrowRight, Plus, Syringe, Clock,
  FirstAid, Money, UserList, ChartBar, Warning
} from 'phosphor-react';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../../lib/firebase';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format, subMonths, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';
import { showToast } from '../../utils/toast.jsx';
import Button from '../shared/Button';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-md" />
          <div className="mt-2 h-4 w-72 bg-gray-200 rounded-md" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-20 bg-gray-200 rounded-md" />
          <div className="h-10 w-20 bg-gray-200 rounded-md" />
          <div className="h-10 w-20 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-6 w-6 bg-gray-200 rounded-md mb-2" />
            <div className="h-5 w-32 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-40 bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg bg-white p-6 shadow">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-md" />
              <div className="ml-4 flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-7 w-20 bg-gray-200 rounded-md" />
              <div className="h-4 w-32 bg-gray-200 rounded-md" />
              <div className="h-4 w-24 bg-gray-200 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Insights Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments Skeleton */}
        <div className="rounded-lg bg-white shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded-md" />
            <div className="h-4 w-20 bg-gray-200 rounded-md" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-20 bg-gray-200 rounded-md" />
                <div className="h-4 w-16 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Demographics Skeleton */}
        <div className="rounded-lg bg-white shadow p-6">
          <div className="h-6 w-48 bg-gray-200 rounded-md mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-gray-200 rounded-md" />
                  <div className="h-4 w-12 bg-gray-200 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full" />
                  <div className="h-4 w-12 bg-gray-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Services Skeleton */}
        <div className="rounded-lg bg-white shadow p-6">
          <div className="h-6 w-48 bg-gray-200 rounded-md mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-gray-200 rounded-md" />
                  <div className="h-4 w-12 bg-gray-200 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full" />
                  <div className="h-4 w-12 bg-gray-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Items Skeleton */}
        <div className="rounded-lg bg-white shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded-md" />
            <div className="h-4 w-32 bg-gray-200 rounded-md" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-20 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: { total: 0, change: '0%', newThisMonth: 0 },
    appointments: { total: 0, change: '0%', completed: 0, cancelled: 0 },
    revenue: { total: 0, change: '0%', currency: 'USD', lastMonth: 0 },
    lowStock: { total: 0, items: [] }
  });
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState({
    patientDemographics: [],
    popularAppointments: [],
    revenueByService: [],
    upcomingAppointments: []
  });
  const [clinicId, setClinicId] = useState(null);
  const [settings, setSettings] = useState(null);

  // Get clinicId and settings only once when component mounts
  useEffect(() => {
    const getClinicId = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }

      try {
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

        setClinicId(userClinicId);

        const settingsDoc = await getDoc(doc(db, 'settings', userClinicId));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        } else {
          console.error('Settings not found for clinic');
          showToast.error('Clinic settings not found');
        }
      } catch (error) {
        console.error('Error getting clinic ID:', error);
        showToast.error('Failed to get clinic information');
      }
    };
    
    getClinicId();
  }, []); // Empty dependency array to run only once

  // Memoize queries to prevent unnecessary recreations
  const queries = React.useMemo(() => {
    if (!clinicId) return { patientsQuery: null, appointmentsQuery: null, upcomingAppointmentsQuery: null, inventoryQuery: null };

    const today = new Date();
    const startOfToday = startOfDay(today).toISOString();
    const endOfToday = endOfDay(today).toISOString();

    return {
      patientsQuery: query(
        collection(db, 'patients'),
        where('clinicId', '==', clinicId)
      ),
      appointmentsQuery: query(
        collection(db, 'appointments'),
        where('clinicId', '==', clinicId),
        where('startTime', '>=', startOfToday),
        where('startTime', '<=', endOfToday)
      ),
      upcomingAppointmentsQuery: query(
        collection(db, 'appointments'),
        where('clinicId', '==', clinicId),
        where('startTime', '>=', today.toISOString()),
        orderBy('startTime'),
        limit(5)
      ),
      // Add a query for all appointments in the current month for services stats
      allMonthAppointmentsQuery: query(
        collection(db, 'appointments'),
        where('clinicId', '==', clinicId),
        where('startTime', '>=', startOfMonth(today).toISOString()),
        where('startTime', '<=', endOfMonth(today).toISOString())
      ),
      inventoryQuery: query(
        collection(db, 'inventory'),
        where('clinicId', '==', clinicId)
      )
    };
  }, [clinicId]);

  // Use realtime data with memoized queries
  const [patientsSnapshot, patientsLoading] = useCollection(queries.patientsQuery);
  const [appointmentsSnapshot, appointmentsLoading] = useCollection(queries.appointmentsQuery);
  const [upcomingAppointmentsSnapshot, upcomingLoading] = useCollection(queries.upcomingAppointmentsQuery);
  const [allMonthAppointmentsSnapshot] = useCollection(queries.allMonthAppointmentsQuery);
  const [inventorySnapshot, inventoryLoading] = useCollection(queries.inventoryQuery);

  // Memoize calculateRevenue function
  const calculateRevenue = React.useCallback(async (startDate, endDate) => {
    if (!clinicId) return 0;

    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('clinicId', '==', clinicId),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString())
    );
    
    try {
      const invoicesSnapshot = await getDocs(invoicesQuery);
      return invoicesSnapshot.docs.reduce((total, doc) => {
        const data = doc.data();
        return total + (data.total || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating revenue:', error);
      return 0;
    }
  }, [clinicId]);

  // Update dashboard data when realtime data changes
  useEffect(() => {
    const updateDashboardData = async () => {
      if (!clinicId || !settings) return;

      // Don't update if any queries are still loading
      if (patientsLoading || appointmentsLoading || upcomingLoading || inventoryLoading) {
        return;
      }

      try {
        const totalPatients = patientsSnapshot?.size || 0;
        const newPatients = patientsSnapshot?.docs.filter(doc => {
          const data = doc.data();
          return new Date(data.createdAt) >= startOfMonth(new Date());
        }).length || 0;

        const appointments = appointmentsSnapshot?.docs.map(doc => doc.data()) || [];
        const completedAppointments = appointments.filter(apt => apt.status === 'Completed').length;
        const cancelledAppointments = appointments.filter(apt => apt.status === 'Cancelled').length;

        // Get upcoming appointments with proper formatting
        const upcomingAppointments = upcomingAppointmentsSnapshot?.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            patientName: data.patientName,
            startTime: data.startTime,
            type: data.type,
            status: data.status,
            duration: data.duration
          };
        }).filter(Boolean) || [];

        // Get all appointments for the current month for service statistics
        const allMonthAppointments = allMonthAppointmentsSnapshot?.docs.map(doc => doc.data()) || [];
        
        // Calculate popular services from all month appointments
        const serviceStats = allMonthAppointments.reduce((acc, apt) => {
          if (apt.type) {
            acc[apt.type] = (acc[apt.type] || 0) + 1;
          }
          return acc;
        }, {});

        const totalMonthAppointments = allMonthAppointments.length;

        const today = new Date();
        const currentMonthRevenue = await calculateRevenue(startOfMonth(today), endOfMonth(today));
        const lastMonthRevenue = await calculateRevenue(
          startOfMonth(subMonths(today, 1)),
          endOfMonth(subMonths(today, 1))
        );

        const revenueChange = ((currentMonthRevenue - lastMonthRevenue) / (lastMonthRevenue || 1) * 100).toFixed(1);

        const demographics = patientsSnapshot?.docs.reduce((acc, doc) => {
          const patient = doc.data();
          acc[patient.gender] = (acc[patient.gender] || 0) + 1;
          return acc;
        }, {}) || {};

        const lowStockItems = inventorySnapshot?.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(item => item.quantity <= item.minQuantity) || [];

        setStats({
          patients: {
            total: totalPatients,
            change: `${((newPatients / totalPatients) * 100).toFixed(1)}%`,
            newThisMonth: newPatients
          },
          appointments: {
            total: appointments.length,
            completed: completedAppointments,
            cancelled: cancelledAppointments,
            change: '0%'
          },
          revenue: {
            total: currentMonthRevenue,
            lastMonth: lastMonthRevenue,
            change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
            currency: settings.currency
          },
          lowStock: {
            total: lowStockItems.length,
            items: lowStockItems
          }
        });

        setInsights({
          patientDemographics: Object.entries(demographics).map(([key, value]) => ({
            label: key,
            value,
            percentage: ((value / (totalPatients || 1)) * 100).toFixed(1)
          })),
          popularAppointments: Object.entries(serviceStats)
            .map(([type, count]) => ({
              type,
              count,
              percentage: ((count / (totalMonthAppointments || 1)) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5), // Only show top 5 services
          upcomingAppointments
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error updating dashboard data:', error);
        showToast.error('Failed to update dashboard data');
      }
    };

    updateDashboardData();
  }, [
    clinicId,
    settings,
    patientsSnapshot,
    appointmentsSnapshot,
    upcomingAppointmentsSnapshot,
    allMonthAppointmentsSnapshot,
    inventorySnapshot,
    patientsLoading,
    appointmentsLoading,
    upcomingLoading,
    inventoryLoading,
    calculateRevenue
  ]);

  const formatCurrency = (amount) => {
    if (!settings?.currency) return `$${amount.toFixed(2)}`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Link
        to="/appointments"
        className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg hover:shadow-md transition-all group"
      >
        <Calendar className="w-8 h-8 text-primary-600 mb-2 group-hover:scale-110 transition-transform" />
        <h3 className="font-medium text-gray-900">New Appointment</h3>
        <p className="text-sm text-gray-600">Schedule a visit</p>
      </Link>
      <Link
        to="/patients"
        className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group"
      >
        <UserList className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
        <h3 className="font-medium text-gray-900">Add Patient</h3>
        <p className="text-sm text-gray-600">Register new patient</p>
      </Link>
      <Link
        to="/prescriptions"
        className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group"
      >
        <FirstAid className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
        <h3 className="font-medium text-gray-900">New Prescription</h3>
        <p className="text-sm text-gray-600">Write prescription</p>
      </Link>
      <Link
        to="/invoices"
        className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all group"
      >
        <Receipt className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
        <h3 className="font-medium text-gray-900">Create Invoice</h3>
        <p className="text-sm text-gray-600">Bill patient</p>
      </Link>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Patients Stats */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-primary-50 p-3 group-hover:bg-primary-100 transition-colors">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <div className={`flex items-center text-sm ${
            parseFloat(stats.patients.change) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            <span className="font-medium">{stats.patients.change}</span>
            {parseFloat(stats.patients.change) >= 0 ? (
              <CaretUp className="ml-1 h-4 w-4" />
            ) : (
              <CaretDown className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900">{stats.patients.total.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-600">
              +{stats.patients.newThisMonth} new this month
            </p>
          </div>
        </div>
      </div>

      {/* Appointments Stats */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
              {stats.appointments.completed}
            </div>
            <div className="flex items-center text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1" />
              {stats.appointments.cancelled}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Today's Appointments</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900">{stats.appointments.total.toLocaleString()}</p>
            <Link 
              to="/appointments" 
              className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 group-hover:underline"
            >
              View schedule
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-green-50 p-3 group-hover:bg-green-100 transition-colors">
            <Money className="h-6 w-6 text-green-600" />
          </div>
          <div className={`flex items-center text-sm ${
            parseFloat(stats.revenue.change) >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            <span className="font-medium">{stats.revenue.change}</span>
            {parseFloat(stats.revenue.change) >= 0 ? (
              <CaretUp className="ml-1 h-4 w-4" />
            ) : (
              <CaretDown className="ml-1 h-4 w-4" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900">
              {settings?.currency || '$'}{stats.revenue.total.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Last month: {settings?.currency || '$'}{stats.revenue.lastMonth.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Alert */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-yellow-50 p-3 group-hover:bg-yellow-100 transition-colors">
            <Warning className="h-6 w-6 text-yellow-600" />
          </div>
          <Link 
            to="/inventory" 
            className="text-sm text-primary-600 hover:text-primary-700 group-hover:underline flex items-center"
          >
            View all
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900">{stats.lowStock.total.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-600">
              items need attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightGrids = () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Upcoming Appointments */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-primary-600" />
            Upcoming Appointments
          </h2>
          <Link 
            to="/appointments"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            View all
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {(insights.upcomingAppointments || []).map((appointment, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  isToday(new Date(appointment.startTime))
                    ? 'bg-green-500'
                    : isTomorrow(new Date(appointment.startTime))
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(appointment.startTime), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700">
                  {appointment.type}
                </span>
              </div>
            </div>
          ))}
          {(insights.upcomingAppointments || []).length === 0 && (
            <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
          )}
        </div>
      </div>

      {/* Popular Services */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FirstAid className="w-5 h-5 mr-2 text-primary-600" />
            Popular Services
          </h2>
        </div>
        <div className="space-y-4">
          {(insights.popularAppointments || []).map((service, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{service.type}</span>
                <span className="text-sm text-gray-500">({service.count} appointments)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{service.percentage}%</span>
              </div>
            </div>
          ))}
          {(insights.popularAppointments || []).length === 0 && (
            <p className="text-center text-gray-500 py-4">No services data available</p>
          )}
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChartBar className="w-5 h-5 mr-2 text-primary-600" />
            Revenue by Service
          </h2>
        </div>
        <div className="space-y-4">
          {(insights.revenueByService || []).map((service, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{service.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {settings?.currency || '$'}{service.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          {(insights.revenueByService || []).length === 0 && (
            <p className="text-center text-gray-500 py-4">No revenue data available</p>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary-600" />
            Low Stock Items
          </h2>
          <Link 
            to="/inventory"
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            View all
            <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {(stats.lowStock?.items || []).map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.unit} remaining
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  item.quantity <= item.minQuantity / 2
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.quantity <= item.minQuantity / 2 ? 'Critical' : 'Low Stock'}
                </span>
              </div>
            </div>
          ))}
          {(stats.lowStock?.items || []).length === 0 && (
            <p className="text-center text-gray-500 py-4">No low stock items</p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Here's what's happening at your clinic today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={timeRange === 'week' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'year' ? 'primary' : 'outline'}
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
        </div>
      </div>

      {renderQuickActions()}
      {renderStats()}
      {renderInsightGrids()}
    </div>
  );
};

export default Dashboard; 