import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};

// Helper function to safely handle arrays or strings
const formatArray = (value) => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value;
  return String(value);
};

// Helper function to flatten nested objects
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else if (Array.isArray(obj[k])) {
      acc[pre + k] = formatArray(obj[k]);
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

// Function to fetch and format patients data
const getPatientsData = async (clinicId) => {
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      'Patient ID': doc.id,
      'Name': data.name || '',
      'Email': data.email || '',
      'Phone': data.phone || '',
      'Gender': data.gender || '',
      'Date of Birth': formatDate(data.dateOfBirth),
      'Address': data.address || '',
      'Medical History': formatArray(data.medicalHistory),
      'Allergies': formatArray(data.allergies),
      'Created At': formatDate(data.createdAt),
      'Last Updated': formatDate(data.updatedAt)
    };
  });
};

// Function to fetch and format appointments data
const getAppointmentsData = async (clinicId) => {
  const appointmentsRef = collection(db, 'appointments');
  const q = query(appointmentsRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      'Appointment ID': doc.id,
      'Patient Name': data.patientName || '',
      'Patient ID': data.patientId || '',
      'Date': formatDate(data.startTime),
      'Duration': data.duration || '',
      'Type': data.type || '',
      'Status': data.status || '',
      'Notes': data.notes || '',
      'Created At': formatDate(data.createdAt)
    };
  });
};

// Function to fetch and format prescriptions data
const getPrescriptionsData = async (clinicId) => {
  const prescriptionsRef = collection(db, 'prescriptions');
  const q = query(prescriptionsRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const medications = Array.isArray(data.medications) 
      ? data.medications.map(med => 
          `${med.name || ''} - ${med.dosage || ''} - ${med.frequency || ''}`
        ).join('; ')
      : '';

    return {
      'Prescription ID': doc.id,
      'Patient Name': data.patientName || '',
      'Patient ID': data.patientId || '',
      'Medications': medications,
      'Start Date': formatDate(data.startDate),
      'End Date': formatDate(data.endDate),
      'Notes': data.notes || '',
      'Status': data.status || '',
      'Created At': formatDate(data.createdAt)
    };
  });
};

// Function to fetch and format inventory data
const getInventoryData = async (clinicId) => {
  const inventoryRef = collection(db, 'inventory');
  const q = query(inventoryRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      'Item ID': doc.id,
      'Name': data.name || '',
      'Category': data.category || '',
      'Quantity': data.quantity || 0,
      'Min Quantity': data.minQuantity || 0,
      'Price': data.price || 0,
      'Supplier': data.supplier || '',
      'Last Restocked': formatDate(data.lastRestocked),
      'Created At': formatDate(data.createdAt)
    };
  });
};

// Function to fetch and format invoices data
const getInvoicesData = async (clinicId) => {
  const invoicesRef = collection(db, 'invoices');
  const q = query(invoicesRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    const items = Array.isArray(data.items) 
      ? data.items.map(item => 
          `${item.name || ''} (${item.quantity || 0} x ${item.price || 0})`
        ).join('; ')
      : '';

    return {
      'Invoice ID': doc.id,
      'Invoice Number': data.invoiceNumber || '',
      'Patient Name': data.patientName || '',
      'Patient ID': data.patientId || '',
      'Date': formatDate(data.createdAt),
      'Due Date': formatDate(data.dueDate),
      'Subtotal': data.subtotal || 0,
      'Tax': data.tax || 0,
      'Discount': data.discount || 0,
      'Total': data.total || 0,
      'Status': data.status || '',
      'Items': items,
      'Notes': data.notes || ''
    };
  });
};

// Main export function
export const exportClinicData = async (clinicId) => {
  try {
    // Fetch all data
    const [patients, appointments, prescriptions, inventory, invoices] = await Promise.all([
      getPatientsData(clinicId),
      getAppointmentsData(clinicId),
      getPrescriptionsData(clinicId),
      getInventoryData(clinicId),
      getInvoicesData(clinicId)
    ]);

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Add each dataset as a separate sheet
    if (patients.length) {
      const ws_patients = XLSX.utils.json_to_sheet(patients);
      XLSX.utils.book_append_sheet(wb, ws_patients, "Patients");
    }

    if (appointments.length) {
      const ws_appointments = XLSX.utils.json_to_sheet(appointments);
      XLSX.utils.book_append_sheet(wb, ws_appointments, "Appointments");
    }

    if (prescriptions.length) {
      const ws_prescriptions = XLSX.utils.json_to_sheet(prescriptions);
      XLSX.utils.book_append_sheet(wb, ws_prescriptions, "Prescriptions");
    }

    if (inventory.length) {
      const ws_inventory = XLSX.utils.json_to_sheet(inventory);
      XLSX.utils.book_append_sheet(wb, ws_inventory, "Inventory");
    }

    if (invoices.length) {
      const ws_invoices = XLSX.utils.json_to_sheet(invoices);
      XLSX.utils.book_append_sheet(wb, ws_invoices, "Invoices");
    }

    // Generate filename with current date
    const fileName = `clinic_data_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);

    return fileName;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}; 