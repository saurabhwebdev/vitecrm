import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useClinicId from './useClinicId';

const useClinicSettings = () => {
  const { clinicId, loading: clinicLoading } = useClinicId();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      try {
        const settingsRef = doc(db, 'settings', clinicId);
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        } else {
          setError('Settings not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [clinicId]);

  return { settings, loading: loading || clinicLoading, error };
};

export default useClinicSettings; 