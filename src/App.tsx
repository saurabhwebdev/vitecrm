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
            {/* Public routes */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/" replace />}
            />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
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