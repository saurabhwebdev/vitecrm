import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const medicalConditions = [
  'Hypertension',
  'Diabetes Type 2',
  'Asthma',
  'Arthritis',
  'Migraine',
  'Anxiety',
  'Depression',
  'GERD',
  'Hypothyroidism',
  'Allergies'
];

const allergies = [
  'Penicillin',
  'Peanuts',
  'Latex',
  'Dust',
  'Pollen',
  'Shellfish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const samplePatients = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 123-4567',
    gender: 'Female',
    dateOfBirth: '1985-03-15',
    bloodGroup: 'O+',
    address: '123 Oak Street, Springfield, IL',
    occupation: 'Teacher'
  },
  {
    name: 'Michael Chen',
    email: 'mchen@example.com',
    phone: '(555) 234-5678',
    gender: 'Male',
    dateOfBirth: '1992-08-22',
    bloodGroup: 'A+',
    address: '456 Maple Ave, Riverside, CA',
    occupation: 'Software Engineer'
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '(555) 345-6789',
    gender: 'Female',
    dateOfBirth: '1978-11-30',
    bloodGroup: 'B-',
    address: '789 Pine Road, Austin, TX',
    occupation: 'Nurse'
  },
  {
    name: 'James Wilson',
    email: 'jwilson@example.com',
    phone: '(555) 456-7890',
    gender: 'Male',
    dateOfBirth: '1990-05-10',
    bloodGroup: 'AB+',
    address: '321 Cedar Lane, Seattle, WA',
    occupation: 'Architect'
  },
  {
    name: 'Sophia Patel',
    email: 'sophia.p@example.com',
    phone: '(555) 567-8901',
    gender: 'Female',
    dateOfBirth: '1988-12-05',
    bloodGroup: 'O-',
    address: '654 Birch Street, Boston, MA',
    occupation: 'Doctor'
  },
  {
    name: 'David Kim',
    email: 'dkim@example.com',
    phone: '(555) 678-9012',
    gender: 'Male',
    dateOfBirth: '1995-02-18',
    bloodGroup: 'A-',
    address: '987 Elm Court, Portland, OR',
    occupation: 'Accountant'
  },
  {
    name: 'Maria Garcia',
    email: 'mgarcia@example.com',
    phone: '(555) 789-0123',
    gender: 'Female',
    dateOfBirth: '1982-07-25',
    bloodGroup: 'B+',
    address: '147 Willow Drive, Miami, FL',
    occupation: 'Marketing Manager'
  },
  {
    name: 'Robert Taylor',
    email: 'rtaylor@example.com',
    phone: '(555) 890-1234',
    gender: 'Male',
    dateOfBirth: '1975-09-08',
    bloodGroup: 'O+',
    address: '258 Aspen Circle, Denver, CO',
    occupation: 'Sales Representative'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '(555) 901-2345',
    gender: 'Female',
    dateOfBirth: '1993-04-12',
    bloodGroup: 'AB-',
    address: '369 Magnolia Blvd, Nashville, TN',
    occupation: 'Graphic Designer'
  },
  {
    name: 'Thomas Wright',
    email: 'twright@example.com',
    phone: '(555) 012-3456',
    gender: 'Male',
    dateOfBirth: '1987-01-20',
    bloodGroup: 'A+',
    address: '741 Sycamore Ave, Chicago, IL',
    occupation: 'Business Analyst'
  }
];

// Function to get random items from an array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Function to add sample patients to Firestore
export const addSamplePatients = async (clinicId) => {
  try {
    const patientsRef = collection(db, 'patients');
    const timestamp = new Date();

    for (const patient of samplePatients) {
      // Generate random medical history and allergies
      const medicalHistory = getRandomItems(medicalConditions, Math.floor(Math.random() * 3) + 1);
      const patientAllergies = getRandomItems(allergies, Math.floor(Math.random() * 3));

      const patientData = {
        ...patient,
        clinicId,
        medicalHistory,
        allergies: patientAllergies,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'Active',
        notes: 'Sample patient data',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family Member',
          phone: '(555) 999-9999'
        }
      };

      await addDoc(patientsRef, patientData);
    }

    return {
      success: true,
      message: `Successfully added ${samplePatients.length} sample patients`
    };
  } catch (error) {
    console.error('Error adding sample patients:', error);
    return {
      success: false,
      message: error.message
    };
  }
}; 