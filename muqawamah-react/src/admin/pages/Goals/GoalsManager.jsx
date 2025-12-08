/**
 * Goals & Stats Management
 * Manage goals, assists, and player statistics
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function GoalsManager() {
  const [goals, setGoals] = useState([]);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [matchFilter, setMatchFilter] = useState('');
  const [newGoal, setNewGoal] = useState({
    match_id: '',
    scorer_id: '',
    assister_id: '',
    minute: '',
    goal_type: 'open_play'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabaseClient
        .from('goals')
        .select(`
          id,
          match_id,
          team_id,
          scorer_id,
          assister_id,
          minute,
          goal_type,
          created_at,
          match:matches(id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)),
          scorer:team_players!goals_scorer_id_fkey(player_name, team_id),
          assister:team_players!goals_assister_id_fkey(player_name)
        `)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch recent matches for dropdown
      const { data: matchesData, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('match_date', { ascending: false })
        .limit(20);

      if (matchesError) throw matchesError;

      // Fetch all players
      const { data: playersData, error: playersError } = await supabaseClient
        .from('team_players')
        .select('id, player_name, team_id, team_registrations(team_name)')
        .order('player_name');

      if (playersError) throw playersError;

      setGoals(goalsData || []);
      setMatches(matchesData || []);
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.match_id || !newGoal.scorer_id) {
      alert('Please select match and scorer');
      return;
    }

    try {
      // Get the scorer's team from team_players table
      const { data: scorerData, error: scorerError } = await supabaseClient
        .from('team_players')
        .select('team_id, team_registrations(tournament_team_id)')
        .eq('id', newGoal.scorer_id)
        .single();

      if (scorerError) throw scorerError;

      // Get the tournament team_id from the registration
      const teamId = scorerData?.team_registrations?.tournament_team_id;
      
      if (!teamId) {
        alert('Could not determine team for this player. Make sure the team is confirmed in the tournament.');
        return;
      }

      const { error } = await supabaseClient
        .from('goals')
        .insert({
          match_id: newGoal.match_id,
          team_id: teamId,
          scorer_id: newGoal.scorer_id,
          assister_id: newGoal.assister_id || null,
          minute: parseInt(newGoal.minute) || null,
          goal_type: newGoal.goal_type
        });

      if (error) throw error;

      alert('Goal added successfully!');
      setShowModal(false);
      setNewGoal({
        match_id: '',
        scorer_id: '',
        assister_id: '',
        minute: '',
        goal_type: 'open_play'
      });
      fetchData();
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal: ' + error.message);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      alert('Goal deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  const clearMatchGoals = async (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const matchName = `${match.home_team?.name} vs ${match.away_team?.name}`;
    const goalsInMatch = filteredGoals.length;

    if (!confirm(`Delete all ${goalsInMatch} goal(s) from this match?\n\n${matchName}\n\nThis cannot be undone!`)) {
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .eq('match_id', matchId);

      if (error) throw error;

      alert(`Successfully deleted ${goalsInMatch} goal(s)!`);
      setMatchFilter('');
      fetchData();
    } catch (error) {
      console.error('Error clearing match goals:', error);
      alert('Failed to clear match goals');
    }
  };

  // Filter goals by selected match
  const filteredGoals = matchFilter 
    ? goals.filter(goal => goal.match_id === matchFilter)
    : goals;

  return (
    <AdminLayout title="Goals & Stats Management">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          
        </div>
      </div>

      {/* Match Filter */}
      {!loading && (
        <div className="filter-section">
          <div className="filter-group">
            <label><i className="fas fa-filter"></i> Filter by Match:</label>
            <select
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Matches ({goals.length} goals)</option>
              {matches.map(match => {
                const matchGoals = goals.filter(g => g.match_id === match.id).length;
                return (
                  <option key={match.id} value={match.id}>
                    {match.home_team?.name} vs {match.away_team?.name} ({matchGoals} goals)
                  </option>
                );
              })}
            </select>
          </div>
          {matchFilter && (
            <button 
              className="btn-danger-outline"
              onClick={() => clearMatchGoals(matchFilter)}
              title="Delete all goals from this match"
            >
              <i className="fas fa-trash-alt"></i> Clear Match Goals
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading goals...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-stats">
            <p>
              {matchFilter ? (
                <>Showing: <strong>{filteredGoals.length}</strong> goals (filtered)</>
              ) : (
                <>Total Goals: <strong>{goals.length}</strong></>
              )}
            </p>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Match</th>
                <th>Scorer</th>
                <th>Assister</th>
                <th>Minute</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-trophy" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>{matchFilter ? 'No goals recorded for this match' : 'No goals recorded'}</p>
                  </td>
                </tr>
              ) : (
                filteredGoals.map((goal) => (
                  <tr key={goal.id}>
                    <td>
                      <div>
                        {goal.match?.home_team?.name} vs {goal.match?.away_team?.name}
                      </div>
                    </td>
                    <td><strong>{goal.scorer?.player_name || 'Unknown'}</strong></td>
                    <td>{goal.assister?.player_name || '-'}</td>
                    <td>{goal.minute ? `${goal.minute}'` : '-'}</td>
                    <td>
                      <span className="goal-type-badge">{goal.goal_type.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={() => deleteGoal(goal.id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Goal</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Match</label>
                <select
                  value={newGoal.match_id}
                  onChange={(e) => setNewGoal({ ...newGoal, match_id: e.target.value })}
                >
                  <option value="">Select Match</option>
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.home_team?.name} vs {match.away_team?.name} - {new Date(match.match_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Goal Scorer</label>
                <select
                  value={newGoal.scorer_id}
                  onChange={(e) => setNewGoal({ ...newGoal, scorer_id: e.target.value })}
                >
                  <option value="">Select Scorer</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.player_name} ({player.team_registrations?.team_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assister (Optional)</label>
                <select
                  value={newGoal.assister_id}
                  onChange={(e) => setNewGoal({ ...newGoal, assister_id: e.target.value })}
                >
                  <option value="">No Assist</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.player_name} ({player.team_registrations?.team_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Minute</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newGoal.minute}
                    onChange={(e) => setNewGoal({ ...newGoal, minute: e.target.value })}
                    placeholder="e.g., 45"
                  />
                </div>

                <div className="form-group">
                  <label>Goal Type</label>
                  <select
                    value={newGoal.goal_type}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_type: e.target.value })}
                  >
                    <option value="open_play">Open Play</option>
                    <option value="penalty">Penalty</option>
                    <option value="free_kick">Free Kick</option>
                    <option value="header">Header</option>
                    <option value="own_goal">Own Goal</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={addGoal}
                >
                  <i className="fas fa-plus"></i> Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

