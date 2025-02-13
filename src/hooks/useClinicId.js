import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const useClinicId = () => {
  const [user] = useAuthState(auth);
  const [clinicId, setClinicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getClinicId = async () => {
      try {
        if (!user) {
          setClinicId(null);
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setClinicId(userDoc.data().clinicId);
        } else {
          setError(new Error('User document not found'));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getClinicId();
  }, [user]);

  return { clinicId, loading, error };
};

export default useClinicId; 