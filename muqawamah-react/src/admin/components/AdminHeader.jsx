/**
 * Admin Header Component
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabaseClient';

export default function AdminHeader({ title }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    window.location.href = '/muqawamah/';
  };

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <div className="admin-user-menu">
          <div className="admin-user-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="admin-user-details">
            <span className="admin-user-email">{user?.email}</span>
            <span className="admin-user-role">Super Admin</span>
          </div>
          <button 
            className="admin-logout-btn" 
            onClick={handleLogout}
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
}

