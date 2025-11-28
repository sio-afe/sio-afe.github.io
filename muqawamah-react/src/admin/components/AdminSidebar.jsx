/**
 * Admin Sidebar Navigation
 */

import React, { useState } from 'react';
import { ADMIN_ROUTES } from '../config/adminConfig';

export default function AdminSidebar() {
  const [activePath, setActivePath] = useState(window.location.pathname);

  const navItems = [
    { 
      icon: 'fas fa-tachometer-alt', 
      label: 'Dashboard', 
      path: ADMIN_ROUTES.DASHBOARD 
    },
    { 
      icon: 'fas fa-file-alt', 
      label: 'Registrations', 
      path: ADMIN_ROUTES.REGISTRATIONS 
    },
    { 
      icon: 'fas fa-users', 
      label: 'Players', 
      path: ADMIN_ROUTES.PLAYERS 
    },
    { 
      icon: 'fas fa-shield-alt', 
      label: 'Teams', 
      path: ADMIN_ROUTES.TEAMS 
    },
    { 
      icon: 'fas fa-calendar-alt', 
      label: 'Fixtures', 
      path: ADMIN_ROUTES.FIXTURES 
    },
    { 
      icon: 'fas fa-futbol', 
      label: 'Matches', 
      path: ADMIN_ROUTES.MATCHES 
    },
    { 
      icon: 'fas fa-trophy', 
      label: 'Goals & Stats', 
      path: ADMIN_ROUTES.GOALS 
    },
    { 
      icon: 'fas fa-chart-bar', 
      label: 'Statistics', 
      path: ADMIN_ROUTES.STATISTICS 
    },
    { 
      icon: 'fas fa-cog', 
      label: 'Settings', 
      path: ADMIN_ROUTES.SETTINGS 
    }
  ];

  const handleNavigation = (path) => {
    setActivePath(path);
    window.location.href = path;
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <img 
          src="/assets/img/MuqawamaLogo.png" 
          alt="Muqawama Admin" 
          className="admin-logo"
        />
        <h2 className="admin-brand">Muqawama Admin</h2>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`admin-nav-item ${activePath === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <i className="fas fa-user-shield"></i>
          <span>Super Admin</span>
        </div>
      </div>
    </aside>
  );
}

