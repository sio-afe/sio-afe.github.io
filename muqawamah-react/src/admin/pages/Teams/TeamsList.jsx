/**
 * Teams Management Page
 * Manage confirmed tournament teams
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchTeams();
  }, [categoryFilter]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      let query = supabaseClient
        .from('teams')
        .select('*')
        .order('name');

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error} = await query;

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStats = async (teamId, updates) => {
    try {
      const { error } = await supabaseClient
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;

      alert('Team stats updated!');
      fetchTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team');
    }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team? This will remove them from the tournament.')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      alert('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.captain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Teams Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchTeams}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
        <div className="page-header-right">
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="open-age">Open Age</option>
            <option value="u17">Under 17</option>
          </select>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading teams...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-stats">
            <p>Total Teams: <strong>{filteredTeams.length}</strong></p>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Captain</th>
                <th>Category</th>
                <th>Formation</th>
                <th>Played</th>
                <th>W-D-L</th>
                <th>GD</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No teams found</p>
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="team-cell">
                        {team.crest_url && (
                          <img src={team.crest_url} alt="" className="team-logo-small" />
                        )}
                        <strong>{team.name}</strong>
                      </div>
                    </td>
                    <td>{team.captain || 'N/A'}</td>
                    <td>
                      <span className="category-badge">{team.category}</span>
                    </td>
                    <td>{team.formation || 'N/A'}</td>
                    <td>{team.played || 0}</td>
                    <td>{team.won || 0}-{team.drawn || 0}-{team.lost || 0}</td>
                    <td>{(team.goals_for || 0) - (team.goals_against || 0)}</td>
                    <td><strong>{team.points || 0}</strong></td>
                    <td>
                      <div className="action-buttons">
                        <a 
                          href={`/muqawamah/2026/${team.category}/teams/?team=${team.id}`}
                          className="btn-icon btn-view"
                          title="View Team Page"
                          target="_blank"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => deleteTeam(team.id)}
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
    </AdminLayout>
  );
}

