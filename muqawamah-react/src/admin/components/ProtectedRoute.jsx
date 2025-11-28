/**
 * Protected Route Component
 * Ensures only admins can access admin routes
 */

import React, { useEffect, useState } from 'react';
import { isSuperAdmin } from '../utils/authCheck';

export default function ProtectedRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await isSuperAdmin();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // Redirect to home if not admin
          alert('⚠️ Access Denied: You do not have admin privileges. Only authorized super admins can access this area.');
          window.location.href = '/muqawamah/';
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        alert('⚠️ Authentication Error: Unable to verify admin access.');
        window.location.href = '/muqawamah/';
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <i className="fas fa-lock"></i>
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

