/**
 * Fixtures Management Page
 * Create and manage match fixtures
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function FixturesManager() {
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFixture, setNewFixture] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    scheduled_time: '',
    venue: '',
    match_number: 1,
    category: 'open-age',
    match_type: 'group'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fixtures
      const { data: fixturesData, error: fixturesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
        `)
        .order('match_date', { ascending: true });

      if (fixturesError) throw fixturesError;

      // Fetch all teams for dropdown
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('teams')
        .select('id, name, category')
        .order('name');

      if (teamsError) throw teamsError;

      setFixtures(fixturesData || []);
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load fixtures');
    } finally {
      setLoading(false);
    }
  };

  const createFixture = async () => {
    if (!newFixture.home_team_id || !newFixture.away_team_id) {
      alert('Please select both teams');
      return;
    }

    if (newFixture.home_team_id === newFixture.away_team_id) {
      alert('Home and away teams must be different');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('matches')
        .insert({
          home_team_id: newFixture.home_team_id,
          away_team_id: newFixture.away_team_id,
          match_date: newFixture.match_date,
          scheduled_time: newFixture.scheduled_time,
          venue: newFixture.venue,
          match_number: newFixture.match_number,
          category: newFixture.category,
          match_type: newFixture.match_type,
          status: 'scheduled'
        });

      if (error) throw error;

      alert('Fixture created successfully!');
      setShowCreateModal(false);
      setNewFixture({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        scheduled_time: '',
        venue: '',
        match_number: 1,
        category: 'open-age',
        match_type: 'group'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating fixture:', error);
      alert('Failed to create fixture');
    }
  };

  const deleteFixture = async (fixtureId) => {
    if (!confirm('Are you sure you want to delete this fixture?')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('matches')
        .delete()
        .eq('id', fixtureId);

      if (error) throw error;

      alert('Fixture deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting fixture:', error);
      alert('Failed to delete fixture');
    }
  };

  const categoryTeams = teams.filter(t => t.category === newFixture.category);

  return (
    <AdminLayout title="Fixtures Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i> Create Fixture
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading fixtures...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-stats">
            <p>Total Fixtures: <strong>{fixtures.length}</strong></p>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>MW</th>
                <th>Date & Time</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-calendar-alt" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No fixtures found</p>
                  </td>
                </tr>
              ) : (
                fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td><strong>{fixture.match_number}</strong></td>
                    <td>
                      <div>{new Date(fixture.match_date).toLocaleDateString()}</div>
                      <small>{fixture.scheduled_time || 'TBD'}</small>
                    </td>
                    <td>
                      <div className="team-cell">
                        {fixture.home_team?.crest_url && (
                          <img src={fixture.home_team.crest_url} alt="" className="team-logo-small" />
                        )}
                        <span>{fixture.home_team?.name || 'TBD'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        {fixture.away_team?.crest_url && (
                          <img src={fixture.away_team.crest_url} alt="" className="team-logo-small" />
                        )}
                        <span>{fixture.away_team?.name || 'TBD'}</span>
                      </div>
                    </td>
                    <td>{fixture.venue || 'TBD'}</td>
                    <td>
                      <span className={`status-badge status-${fixture.status}`}>
                        {fixture.status}
                      </span>
                    </td>
                    <td>
                      {fixture.status === 'completed' ? (
                        <strong>{fixture.home_score} - {fixture.away_score}</strong>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => deleteFixture(fixture.id)}
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

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Fixture</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newFixture.category}
                  onChange={(e) => setNewFixture({ ...newFixture, category: e.target.value })}
                >
                  <option value="open-age">Open Age</option>
                  <option value="u17">Under 17</option>
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Home Team</label>
                  <select
                    value={newFixture.home_team_id}
                    onChange={(e) => setNewFixture({ ...newFixture, home_team_id: e.target.value })}
                  >
                    <option value="">Select Home Team</option>
                    {categoryTeams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Away Team</label>
                  <select
                    value={newFixture.away_team_id}
                    onChange={(e) => setNewFixture({ ...newFixture, away_team_id: e.target.value })}
                  >
                    <option value="">Select Away Team</option>
                    {categoryTeams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Match Date</label>
                  <input
                    type="date"
                    value={newFixture.match_date}
                    onChange={(e) => setNewFixture({ ...newFixture, match_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Match Time</label>
                  <input
                    type="time"
                    value={newFixture.scheduled_time}
                    onChange={(e) => setNewFixture({ ...newFixture, scheduled_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    value={newFixture.venue}
                    onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                    placeholder="e.g., Sio Stadium"
                  />
                </div>

                <div className="form-group">
                  <label>Match Number</label>
                  <input
                    type="number"
                    min="1"
                    value={newFixture.match_number}
                    onChange={(e) => setNewFixture({ ...newFixture, match_number: parseInt(e.target.value) })}
                    placeholder="e.g., 1, 2, 3..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Match Type</label>
                <select
                  value={newFixture.match_type}
                  onChange={(e) => setNewFixture({ ...newFixture, match_type: e.target.value })}
                >
                  <option value="group">Group Stage</option>
                  <option value="quarter-final">Quarter Final</option>
                  <option value="semi-final">Semi Final</option>
                  <option value="final">Final</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={createFixture}
                >
                  <i className="fas fa-plus"></i> Create Fixture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

