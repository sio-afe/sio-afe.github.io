/**
 * Admin Panel Main Entry Point
 * Handles routing between admin pages
 */

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabaseClient } from './lib/supabaseClient';
import ProtectedRoute from './admin/components/ProtectedRoute';

// Import admin pages
import AdminDashboard from './admin/pages/Dashboard';
import RegistrationsList from './admin/pages/Registrations/RegistrationsList';
import PlayersList from './admin/pages/Players/PlayersList';
import TeamsList from './admin/pages/Teams/TeamsList';
import FixturesManager from './admin/pages/Fixtures/FixturesManager';
import MatchRecorder from './admin/pages/Matches/MatchRecorder';
import GoalsManager from './admin/pages/Goals/GoalsManager';
import StatisticsViewer from './admin/pages/Statistics/StatisticsViewer';
import SettingsPanel from './admin/pages/Settings/SettingsPanel';

// Import styles
import './admin/styles/admin.css';
import './admin/styles/admin-auth.css';
import './admin/styles/admin-tables.css';
import './admin/styles/admin-modals.css';
import './admin/styles/admin-settings.css';
import './admin/styles/admin-match-recorder.css';

// Auth Modal for admin login
function AdminAuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Page will reload and show admin panel
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-modal">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="auth-logo" />
          <h2>Admin Login</h2>
          <p>Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="admin-auth-form">
          {error && (
            <div className="auth-error-banner">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sioafe.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/muqawamah/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Muqawama
          </a>
        </div>
      </div>
    </div>
  );
}

// Main Admin App Component
function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Determine current page from URL
    const path = window.location.pathname;
    if (path.includes('/admin/registrations')) {
      setCurrentPage('registrations');
    } else if (path.includes('/admin/players')) {
      setCurrentPage('players');
    } else if (path.includes('/admin/teams')) {
      setCurrentPage('teams');
    } else if (path.includes('/admin/fixtures')) {
      setCurrentPage('fixtures');
    } else if (path.includes('/admin/matches')) {
      setCurrentPage('matches');
    } else if (path.includes('/admin/goals')) {
      setCurrentPage('goals');
    } else if (path.includes('/admin/statistics')) {
      setCurrentPage('statistics');
    } else if (path.includes('/admin/settings')) {
      setCurrentPage('settings');
    } else {
      setCurrentPage('dashboard');
    }

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminAuthModal />;
  }

  // Render appropriate page based on URL
  const renderPage = () => {
    switch (currentPage) {
      case 'registrations':
        return <RegistrationsList />;
      case 'players':
        return <PlayersList />;
      case 'teams':
        return <TeamsList />;
      case 'fixtures':
        return <FixturesManager />;
      case 'matches':
        return <MatchRecorder />;
      case 'goals':
        return <GoalsManager />;
      case 'statistics':
        return <StatisticsViewer />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <ProtectedRoute>
      {renderPage()}
    </ProtectedRoute>
  );
}

// Mount the app
const root = createRoot(document.getElementById('admin-root'));
root.render(<AdminApp />);

