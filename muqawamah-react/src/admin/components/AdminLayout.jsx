/**
 * Admin Layout Component
 * Main layout wrapper for all admin pages
 */

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />
      
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="admin-main">
        <AdminHeader title={title} onMenuToggle={toggleSidebar} />
        
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

