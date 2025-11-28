/**
 * Admin Layout Component
 * Main layout wrapper for all admin pages
 */

import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-main">
        <AdminHeader title={title} />
        
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

