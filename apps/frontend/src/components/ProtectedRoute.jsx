import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected Route wrapper component
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const accessToken = window['localStorage']?.getItem('accessToken');

  console.log('[ProtectedRoute] Checking accessToken:', !!accessToken);

  if (!accessToken) {
    console.log('[ProtectedRoute] No accessToken, redirecting to /login');
    // Clear any remaining storage
    window['localStorage']?.clear();
    window['sessionStorage']?.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
