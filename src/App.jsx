import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './modules/shared/Layout';
import { auth } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Lazy load components
const Login = React.lazy(() => import('./modules/auth/Login'));
const Register = React.lazy(() => import('./modules/auth/Register'));
const Dashboard = React.lazy(() => import('./modules/dashboard/Dashboard'));
const Settings = React.lazy(() => import('./modules/settings/Settings'));
const Patients = React.lazy(() => import('./modules/patients/Patients'));
const PatientDetails = React.lazy(() => import('./modules/patients/PatientDetails'));
const Appointments = React.lazy(() => import('./modules/appointments/Appointments'));
const Prescriptions = React.lazy(() => import('./modules/prescriptions/Prescriptions'));
const Invoices = React.lazy(() => import('./modules/invoices/Invoices'));
const Inventory = React.lazy(() => import('./modules/inventory/Inventory'));

// Legal pages
const TermsOfService = React.lazy(() => import('./modules/legal/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./modules/auth/PrivacyPolicy'));
const Contact = React.lazy(() => import('./modules/legal/Contact'));
const About = React.lazy(() => import('./modules/legal/About'));

const queryClient = new QueryClient();

// Protected Layout component
const ProtectedLayout = () => {
  const [user] = useAuthState(auth);
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Public Layout component for legal pages
const PublicLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          }
        >
          <Routes>
            {/* Auth routes */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/" replace />}
            />
            
            {/* Legal routes - with layout but publicly accessible */}
            <Route element={<PublicLayout />}>
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/patients/:id" element={<PatientDetails />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </React.Suspense>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
