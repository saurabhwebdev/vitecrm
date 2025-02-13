import React, { useState } from 'react';
import { Export } from 'phosphor-react';
import { exportClinicData } from '../../utils/exportData';
import { showToast } from '../../utils/toast.jsx';
import Button from './Button';
import { auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Get current user's clinic ID
      const user = auth.currentUser;
      if (!user) {
        showToast.error('Please log in to export data');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        showToast.error('User information not found');
        return;
      }

      const clinicId = userDoc.data().clinicId;
      if (!clinicId) {
        showToast.error('Clinic information not found');
        return;
      }

      // Export the data
      const fileName = await exportClinicData(clinicId);
      showToast.success(`Data exported successfully to ${fileName}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="ml-2"
    >
      <Export className="w-5 h-5 mr-2" />
      {isExporting ? 'Exporting...' : 'Export Data'}
    </Button>
  );
};

export default ExportButton; 