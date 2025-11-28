/**
 * Registrations Management Page
 * View, edit, delete team registrations
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { REGISTRATION_STATUSES } from '../../config/adminConfig';

export default function RegistrationsList() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [inTournament, setInTournament] = useState({});

  useEffect(() => {
    fetchRegistrations();
    checkTournamentStatus();
  }, [filter]);

  const checkTournamentStatus = async () => {
    try {
      // Get all teams in tournament with their registration IDs
      const { data, error } = await supabaseClient
        .from('teams')
        .select('registration_id');

      if (error) throw error;

      // Create a map of registration IDs that are already in tournament
      const tournamentMap = {};
      data?.forEach(team => {
        if (team.registration_id) {
          tournamentMap[team.registration_id] = true;
        }
      });

      setInTournament(tournamentMap);
    } catch (error) {
      console.error('Error checking tournament status:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      let query = supabaseClient
        .from('team_registrations')
        .select('*, team_players(count)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabaseClient
        .from('team_registrations')
        .update({ 
          status: newStatus,
          confirmed_at: newStatus === 'confirmed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      alert('Status updated successfully!');
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const addToTournament = async (registration) => {
    // Check if already in tournament
    if (inTournament[registration.id]) {
      alert(`ℹ️ "${registration.team_name}" is already in the tournament!`);
      return;
    }

    if (!confirm(`Add "${registration.team_name}" to the tournament?\n\nThis will create an entry in the teams table for fixtures and standings.`)) {
      return;
    }

    try {
      // Double-check if already in tournament
      const { data: existing } = await supabaseClient
        .from('teams')
        .select('id')
        .eq('registration_id', registration.id)
        .single();

      if (existing) {
        alert('This team is already in the tournament!');
        checkTournamentStatus(); // Refresh status
        return;
      }

      // Add to tournament teams table
      const { error } = await supabaseClient
        .from('teams')
        .insert({
          name: registration.team_name,
          crest_url: registration.team_logo,
          captain: registration.captain_name,
          category: registration.category,
          formation: registration.formation,
          registration_id: registration.id
        });

      if (error) throw error;

      alert(`✅ "${registration.team_name}" added to tournament successfully!\n\nYou can now create fixtures and matches for this team.`);
      
      // Refresh tournament status
      checkTournamentStatus();
    } catch (error) {
      console.error('Error adding to tournament:', error);
      alert('Failed to add team to tournament: ' + error.message);
    }
  };

  const deleteRegistration = async (id) => {
    if (!confirm('Are you sure you want to delete this registration? This will also delete all associated players.')) {
      return;
    }

    try {
      // Delete players first
      await supabaseClient.from('team_players').delete().eq('team_id', id);
      
      // Delete registration
      const { error } = await supabaseClient
        .from('team_registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Registration deleted successfully!');
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const viewDetails = async (id) => {
    try {
      const { data, error } = await supabaseClient
        .from('team_registrations')
        .select('*, team_players(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      setSelectedReg(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching details:', error);
      alert('Failed to load details');
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.captain_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusConfig = REGISTRATION_STATUSES.find(s => s.value === status);
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: statusConfig?.color || '#6b7280' }}
      >
        {statusConfig?.label || status}
      </span>
    );
  };

  return (
    <AdminLayout title="Registrations Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchRegistrations}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="page-header-right">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by team, captain, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({registrations.length})
        </button>
        {REGISTRATION_STATUSES.map(status => (
          <button
            key={status.value}
            className={`filter-tab ${filter === status.value ? 'active' : ''}`}
            onClick={() => setFilter(status.value)}
          >
            {status.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading registrations...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Captain</th>
                <th>Category</th>
                <th>Players</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No registrations found</p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div className="team-cell">
                        {reg.team_logo && (
                          <img src={reg.team_logo} alt="" className="team-logo-small" />
                        )}
                        <strong>{reg.team_name}</strong>
                      </div>
                    </td>
                    <td>
                      <div>{reg.captain_name}</div>
                      <small style={{ color: '#6b7280' }}>{reg.captain_email}</small>
                    </td>
                    <td>
                      <span className="category-badge">{reg.category}</span>
                    </td>
                    <td>{reg.team_players?.[0]?.count || 0} players</td>
                    <td>{getStatusBadge(reg.status)}</td>
                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-view"
                          onClick={() => viewDetails(reg.id)}
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {reg.status === 'confirmed' && (
                          inTournament[reg.id] ? (
                            <button 
                              className="btn-icon btn-tournament-added"
                              disabled
                              title="Already in Tournament"
                            >
                              <i className="fas fa-check-circle"></i>
                            </button>
                          ) : (
                            <button 
                              className="btn-icon btn-tournament"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToTournament(reg);
                              }}
                              title="Add to Tournament"
                            >
                              <i className="fas fa-trophy"></i>
                            </button>
                          )
                        )}
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => deleteRegistration(reg.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedReg && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Team Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Team Name:</label>
                    <span>{selectedReg.team_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedReg.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Formation:</label>
                    <span>{selectedReg.formation}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    {getStatusBadge(selectedReg.status)}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Captain Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedReg.captain_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedReg.captain_email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedReg.captain_phone}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Players ({selectedReg.team_players?.length || 0})</h3>
                <div className="players-list">
                  {selectedReg.team_players?.map((player, idx) => (
                    <div key={idx} className="player-item">
                      {player.player_image && (
                        <img src={player.player_image} alt="" className="player-image-small" />
                      )}
                      <div>
                        <strong>{player.player_name}</strong>
                        <small>{player.position} {player.is_substitute && '(SUB)'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Change Status</h3>
                <div className="status-buttons">
                  {REGISTRATION_STATUSES.map(status => (
                    <button
                      key={status.value}
                      className={`status-btn ${selectedReg.status === status.value ? 'active' : ''}`}
                      style={{ borderColor: status.color }}
                      onClick={() => {
                        updateStatus(selectedReg.id, status.value);
                        setShowModal(false);
                      }}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReg.status === 'confirmed' && (
                <div className="detail-section">
                  <h3>Tournament Actions</h3>
                  <button 
                    className="btn-primary tournament-add-btn"
                    onClick={() => addToTournament(selectedReg)}
                  >
                    <i className="fas fa-trophy"></i> Add to Tournament
                  </button>
                  <p className="help-text">
                    <i className="fas fa-info-circle"></i> This will create an entry in the Teams table for fixtures, matches, and standings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

