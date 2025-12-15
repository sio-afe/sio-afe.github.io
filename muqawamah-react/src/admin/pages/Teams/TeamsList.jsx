/**
 * Teams Management Page
 * Manage confirmed tournament teams
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import AdminFormationEditor from '../../components/AdminFormationEditor';

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFormationEditor, setShowFormationEditor] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

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
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const confirmMsg = `⚠️ WARNING: This will permanently delete "${team.name}" and ALL related data:\n\n` +
      `✓ All players from this team\n` +
      `✓ All goals scored by this team\n` +
      `✓ All matches involving this team\n` +
      `✓ Team registration data\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Type the team name to confirm: "${team.name}"`;

    const userInput = prompt(confirmMsg);
    
    if (userInput !== team.name) {
      if (userInput !== null) {
        alert('Team name did not match. Deletion cancelled.');
      }
      return;
    }

    try {
      // Step 1: Delete from players table (tournament players that reference team_players)
      if (team.registration_id) {
        const { error: tournamentPlayersError } = await supabaseClient
          .from('players')
          .delete()
          .eq('team_id', teamId);

        if (tournamentPlayersError) throw new Error(`Failed to delete tournament players: ${tournamentPlayersError.message}`);
      }

      // Step 2: Delete all goals involving this team
      const { error: goalsError } = await supabaseClient
        .from('goals')
        .delete()
        .eq('team_id', teamId);

      if (goalsError) throw new Error(`Failed to delete goals: ${goalsError.message}`);

      // Step 3: Delete all matches where this team is home or away
      const { error: matchesError } = await supabaseClient
        .from('matches')
        .delete()
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);

      if (matchesError) throw new Error(`Failed to delete matches: ${matchesError.message}`);

      // Step 4: Delete the team itself
      const { error: teamError } = await supabaseClient
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (teamError) throw new Error(`Failed to delete team: ${teamError.message}`);

      // Step 5: Delete all players from team_players (registration players)
      if (team.registration_id) {
        const { error: playersError } = await supabaseClient
          .from('team_players')
          .delete()
          .eq('team_id', team.registration_id);

        if (playersError) throw new Error(`Failed to delete registration players: ${playersError.message}`);

        // Step 6: Delete from team_registrations
        const { error: registrationError } = await supabaseClient
          .from('team_registrations')
          .delete()
          .eq('id', team.registration_id);

        if (registrationError) throw new Error(`Failed to delete registration: ${registrationError.message}`);
      }

      alert(`✅ Successfully deleted "${team.name}" and all related data!`);
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert(`❌ Failed to delete team: ${error.message}`);
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
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowFormationEditor(true);
                          }}
                          title="Edit Formation"
                        >
                          <i className="fas fa-chess-board"></i>
                        </button>
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

      {showFormationEditor && selectedTeam && (
        <AdminFormationEditor
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          onClose={() => {
            setShowFormationEditor(false);
            setSelectedTeam(null);
          }}
          onSave={() => {
            fetchTeams();
          }}
        />
      )}
    </AdminLayout>
  );
}

