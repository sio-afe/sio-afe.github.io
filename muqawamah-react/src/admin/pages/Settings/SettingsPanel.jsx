/**
 * Settings Panel
 * System configuration and management
 */

import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { SUPER_ADMIN_EMAILS } from '../../config/adminConfig';

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [showMatchClearModal, setShowMatchClearModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'data') {
      fetchMatches();
    }
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleResetStandings = async () => {
    if (!confirm('Are you sure you want to reset ALL team standings? This cannot be undone!')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('teams')
        .update({
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0
        })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;

      alert('All team standings have been reset!');
    } catch (error) {
      console.error('Error resetting standings:', error);
      alert('Failed to reset standings');
    }
  };

  const handleClearAllGoals = async () => {
    if (!confirm('Are you sure you want to delete ALL goals? This cannot be undone!')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      alert('All goals have been deleted!');
    } catch (error) {
      console.error('Error clearing goals:', error);
      alert('Failed to clear goals');
    }
  };

  const handleClearAllStatistics = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL goals AND reset ALL team standings!\n\nThis action cannot be undone. Are you absolutely sure?')) {
      return;
    }

    // Double confirmation for this dangerous action
    if (!confirm('Please confirm again: Delete ALL statistics and reset ALL standings?')) {
      return;
    }

    try {
      // Delete all goals
      const { error: goalsError } = await supabaseClient
        .from('goals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (goalsError) throw goalsError;

      // Reset all standings
      const { error: standingsError } = await supabaseClient
        .from('teams')
        .update({
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (standingsError) throw standingsError;

      alert('All statistics have been cleared and standings reset!');
    } catch (error) {
      console.error('Error clearing all statistics:', error);
      alert('Failed to clear statistics');
    }
  };

  const handleClearMatchStatistics = async () => {
    if (!selectedMatch) {
      alert('Please select a match');
      return;
    }

    const match = matches.find(m => m.id === selectedMatch);
    if (!match) return;

    const matchName = `${match.home_team?.name} vs ${match.away_team?.name}`;
    
    if (!confirm(`Are you sure you want to delete all goals for this match?\n\n${matchName}\n\nThis cannot be undone!`)) {
      return;
    }

    try {
      // Count goals first
      const { count } = await supabaseClient
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', selectedMatch);

      // Delete all goals for this match
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .eq('match_id', selectedMatch);

      if (error) throw error;

      alert(`Successfully deleted ${count || 0} goal(s) from this match!`);
      setShowMatchClearModal(false);
      setSelectedMatch('');
    } catch (error) {
      console.error('Error clearing match statistics:', error);
      alert('Failed to clear match statistics');
    }
  };

  const exportData = async (table) => {
    try {
      const { data, error } = await supabaseClient
        .from(table)
        .select('*');

      if (error) throw error;

      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${table}-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      alert(`${table} data exported successfully!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <i className="fas fa-cog"></i> General
          </button>
          <button
            className={`settings-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <i className="fas fa-database"></i> Data Management
          </button>
          <button
            className={`settings-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <i className="fas fa-user-shield"></i> Admin Info
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>Tournament Settings</h3>
              <div className="settings-card">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Registration Status</h4>
                    <p>Enable or disable team registrations</p>
                  </div>
                  <button className="toggle-btn active">
                    <span>Enabled</span>
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Tournament Year</h4>
                    <p>Current tournament season</p>
                  </div>
                  <input type="text" value="2026" readOnly className="setting-input" />
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Registration Fee (Open Age)</h4>
                    <p>Registration amount for open age category</p>
                  </div>
                  <input type="number" value="2500" readOnly className="setting-input" />
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Registration Fee (U17)</h4>
                    <p>Registration amount for under 17 category</p>
                  </div>
                  <input type="number" value="2300" readOnly className="setting-input" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>Data Management</h3>
              
              <div className="settings-card">
                <h4>Export Data</h4>
                <p>Download data from database tables in JSON format</p>
                <div className="export-buttons">
                  <button className="btn-export" onClick={() => exportData('team_registrations')}>
                    <i className="fas fa-download"></i> Export Registrations
                  </button>
                  <button className="btn-export" onClick={() => exportData('teams')}>
                    <i className="fas fa-download"></i> Export Teams
                  </button>
                  <button className="btn-export" onClick={() => exportData('team_players')}>
                    <i className="fas fa-download"></i> Export Players
                  </button>
                  <button className="btn-export" onClick={() => exportData('matches')}>
                    <i className="fas fa-download"></i> Export Matches
                  </button>
                  <button className="btn-export" onClick={() => exportData('goals')}>
                    <i className="fas fa-download"></i> Export Goals
                  </button>
                </div>
              </div>

              <div className="settings-card danger">
                <h4><i className="fas fa-exclamation-triangle"></i> Danger Zone</h4>
                <p>These actions are irreversible. Proceed with caution!</p>
                <div className="danger-actions">
                  <button 
                    className="btn-danger"
                    onClick={handleResetStandings}
                  >
                    <i className="fas fa-undo"></i> Reset All Standings
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={handleClearAllGoals}
                  >
                    <i className="fas fa-trash"></i> Clear All Goals
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={handleClearAllStatistics}
                  >
                    <i className="fas fa-exclamation-circle"></i> Clear All Statistics
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => setShowMatchClearModal(true)}
                  >
                    <i className="fas fa-futbol"></i> Clear Match Statistics
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="settings-section">
              <h3>Admin Information</h3>
              <div className="settings-card">
                <div className="admin-info-grid">
                  <div className="info-item">
                    <label>Super Admin Emails</label>
                    <div className="email-list">
                      {SUPER_ADMIN_EMAILS.map((email, idx) => (
                        <div key={idx} className="email-badge">
                          <i className="fas fa-shield-alt"></i>
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Admin Panel Version</label>
                    <p>v1.0.0</p>
                  </div>

                  <div className="info-item">
                    <label>Last Updated</label>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="info-item">
                    <label>Configuration File</label>
                    <code>admin/config/adminConfig.js</code>
                  </div>
                </div>

                <div className="info-note">
                  <i className="fas fa-info-circle"></i>
                  <p>To add more admin users, edit the <code>SUPER_ADMIN_EMAILS</code> array in the admin configuration file.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Match Statistics Modal */}
      {showMatchClearModal && (
        <div className="modal-overlay" onClick={() => setShowMatchClearModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-futbol"></i> Clear Match Statistics</h2>
              <button className="modal-close" onClick={() => setShowMatchClearModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>This will delete all goals recorded for the selected match. This action cannot be undone.</p>
              </div>

              <div className="form-group">
                <label>Select Match</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a match...</option>
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.home_team?.name} vs {match.away_team?.name} - {new Date(match.match_date).toLocaleDateString()} ({match.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setShowMatchClearModal(false);
                    setSelectedMatch('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleClearMatchStatistics}
                  disabled={!selectedMatch}
                >
                  <i className="fas fa-trash"></i> Clear Statistics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

