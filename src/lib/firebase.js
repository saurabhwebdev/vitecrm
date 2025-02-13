import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBqi8UCwTEvKqS_6-kEdkXecqx1cPArwYI",
  authDomain: "crmvite.firebaseapp.com",
  projectId: "crmvite",
  storageBucket: "crmvite.firebasestorage.app",
  messagingSenderId: "21186237245",
  appId: "1:21186237245:web:dae8602d2473e96ce8eb54",
  measurementId: "G-4K1RVR0TXN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 