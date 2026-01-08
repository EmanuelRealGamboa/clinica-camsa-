import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is superuser or has ADMIN role
  const isSuperAdmin = user?.is_superuser === true;
  const hasAdminRole = user?.roles?.includes('ADMIN');

  if (!isSuperAdmin && !hasAdminRole) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return <>{children}</>;
};
