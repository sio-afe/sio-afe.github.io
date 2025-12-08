/**
 * Match Result Recorder
 * Record and update match results, goals, assists
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';

export default function MatchRecorder() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [matchResult, setMatchResult] = useState({
    home_score: 0,
    away_score: 0,
    status: 'completed'
  });
  const [matchGoals, setMatchGoals] = useState([]);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [newGoal, setNewGoal] = useState({
    scorer_id: '',
    assister_id: '',
    minute: '',
    goal_type: 'open_play',
    team_id: ''
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
        `)
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      alert('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const recordResult = async () => {
    if (!selectedMatch) return;

    try {
      // Check if match was previously completed
      const wasCompleted = selectedMatch.status === 'completed';
      const oldHomeScore = selectedMatch.home_score || 0;
      const oldAwayScore = selectedMatch.away_score || 0;

      // Check if anything actually changed
      const scoreChanged = (matchResult.home_score !== oldHomeScore) || (matchResult.away_score !== oldAwayScore);
      const statusChanged = matchResult.status !== selectedMatch.status;

      if (!scoreChanged && !statusChanged) {
        alert('No changes detected');
        setShowModal(false);
        return;
      }

      // Update match result
      const { error: matchError } = await supabaseClient
        .from('matches')
        .update({
          home_score: matchResult.home_score,
          away_score: matchResult.away_score,
          status: matchResult.status
        })
        .eq('id', selectedMatch.id);

      if (matchError) throw matchError;

      // NOTE: Team stats are updated automatically by the database trigger
      // (update_match_team_stats_trigger) when match status changes to 'completed'.
      // DO NOT update stats here to avoid double-counting!
      // The trigger also checks for match_type = 'group' to exclude knockout matches.

      alert('Match result recorded successfully!');
      setShowModal(false);
      fetchMatches();
    } catch (error) {
      console.error('Error recording result:', error);
      alert('Failed to record match result: ' + error.message);
    }
  };

  const reverseTeamStats = async (homeTeamId, awayTeamId, homeScore, awayScore) => {
    try {
      // Fetch current stats
      const { data: homeTeam } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', homeTeamId)
        .single();

      const { data: awayTeam } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', awayTeamId)
        .single();

      // Reverse stats for home team
      let homeStats = {
        played: Math.max((homeTeam.played || 0) - 1, 0),
        goals_for: Math.max((homeTeam.goals_for || 0) - homeScore, 0),
        goals_against: Math.max((homeTeam.goals_against || 0) - awayScore, 0)
      };

      // Reverse stats for away team
      let awayStats = {
        played: Math.max((awayTeam.played || 0) - 1, 0),
        goals_for: Math.max((awayTeam.goals_for || 0) - awayScore, 0),
        goals_against: Math.max((awayTeam.goals_against || 0) - homeScore, 0)
      };

      // Reverse result
      if (homeScore > awayScore) {
        homeStats.won = Math.max((homeTeam.won || 0) - 1, 0);
        homeStats.points = Math.max((homeTeam.points || 0) - 3, 0);
        awayStats.lost = Math.max((awayTeam.lost || 0) - 1, 0);
      } else if (homeScore < awayScore) {
        awayStats.won = Math.max((awayTeam.won || 0) - 1, 0);
        awayStats.points = Math.max((awayTeam.points || 0) - 3, 0);
        homeStats.lost = Math.max((homeTeam.lost || 0) - 1, 0);
      } else {
        homeStats.drawn = Math.max((homeTeam.drawn || 0) - 1, 0);
        homeStats.points = Math.max((homeTeam.points || 0) - 1, 0);
        awayStats.drawn = Math.max((awayTeam.drawn || 0) - 1, 0);
        awayStats.points = Math.max((awayTeam.points || 0) - 1, 0);
      }

      // Update both teams
      await supabaseClient.from('teams').update(homeStats).eq('id', homeTeamId);
      await supabaseClient.from('teams').update(awayStats).eq('id', awayTeamId);
    } catch (error) {
      console.error('Error reversing team stats:', error);
    }
  };

  const updateTeamStats = async (homeTeamId, awayTeamId, homeScore, awayScore) => {
    try {
      // Fetch current stats
      const { data: homeTeam } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', homeTeamId)
.single();

      const { data: awayTeam } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', awayTeamId)
        .single();

      // Calculate new stats for home team
      let homeStats = {
        played: (homeTeam.played || 0) + 1,
        goals_for: (homeTeam.goals_for || 0) + homeScore,
        goals_against: (homeTeam.goals_against || 0) + awayScore
      };

      // Calculate new stats for away team
      let awayStats = {
        played: (awayTeam.played || 0) + 1,
        goals_for: (awayTeam.goals_for || 0) + awayScore,
        goals_against: (awayTeam.goals_against || 0) + homeScore
      };

      // Determine result
      if (homeScore > awayScore) {
        homeStats.won = (homeTeam.won || 0) + 1;
        homeStats.points = (homeTeam.points || 0) + 3;
        awayStats.lost = (awayTeam.lost || 0) + 1;
      } else if (homeScore < awayScore) {
        awayStats.won = (awayTeam.won || 0) + 1;
        awayStats.points = (awayTeam.points || 0) + 3;
        homeStats.lost = (homeTeam.lost || 0) + 1;
      } else {
        homeStats.drawn = (homeTeam.drawn || 0) + 1;
        homeStats.points = (homeTeam.points || 0) + 1;
        awayStats.drawn = (awayTeam.drawn || 0) + 1;
        awayStats.points = (awayTeam.points || 0) + 1;
      }

      // Update both teams
      await supabaseClient.from('teams').update(homeStats).eq('id', homeTeamId);
      await supabaseClient.from('teams').update(awayStats).eq('id', awayTeamId);
    } catch (error) {
      console.error('Error updating team stats:', error);
    }
  };

  const openMatchModal = async (match) => {
    setSelectedMatch(match);
    setMatchResult({
      home_score: match.home_score || 0,
      away_score: match.away_score || 0,
      status: match.status === 'scheduled' ? 'completed' : match.status
    });

    // Fetch players from both teams
    await fetchMatchPlayers(match);
    
    // Fetch existing goals for this match
    await fetchMatchGoals(match.id);

    setShowModal(true);
  };

  const fetchMatchPlayers = async (match) => {
    try {
      // Get home team's registration
      const { data: homeTeam } = await supabaseClient
        .from('teams')
        .select('registration_id')
        .eq('id', match.home_team_id)
        .single();

      // Get away team's registration
      const { data: awayTeam } = await supabaseClient
        .from('teams')
        .select('registration_id')
        .eq('id', match.away_team_id)
        .single();

      if (homeTeam?.registration_id) {
        const { data: homePlayers } = await supabaseClient
          .from('team_players')
          .select('id, player_name, position')
          .eq('team_id', homeTeam.registration_id)
          .order('player_name');
        
        setHomePlayers(homePlayers || []);
      }

      if (awayTeam?.registration_id) {
        const { data: awayPlayers } = await supabaseClient
          .from('team_players')
          .select('id, player_name, position')
          .eq('team_id', awayTeam.registration_id)
          .order('player_name');
        
        setAwayPlayers(awayPlayers || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchMatchGoals = async (matchId) => {
    try {
      const { data, error} = await supabaseClient
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
          scorer:team_players!goals_scorer_id_fkey(player_name),
          assister:team_players!goals_assister_id_fkey(player_name)
        `)
        .eq('match_id', matchId)
        .order('minute');

      if (error) throw error;
      setMatchGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const addGoal = async () => {
    if (!newGoal.scorer_id || !newGoal.team_id) {
      alert('Please select scorer and team');
      return;
    }

    try {
      const { error } = await supabaseClient
        .from('goals')
        .insert({
          match_id: selectedMatch.id,
          team_id: newGoal.team_id,
          scorer_id: newGoal.scorer_id,
          assister_id: newGoal.assister_id || null,
          minute: parseInt(newGoal.minute) || null,
          goal_type: newGoal.goal_type
        });

      if (error) throw error;

      // Auto-increment score based on which team scored
      const newMatchResult = { ...matchResult };
      if (newGoal.team_id === selectedMatch.home_team_id) {
        newMatchResult.home_score = (matchResult.home_score || 0) + 1;
      } else if (newGoal.team_id === selectedMatch.away_team_id) {
        newMatchResult.away_score = (matchResult.away_score || 0) + 1;
      }
      setMatchResult(newMatchResult);

      // Reset goal form
      setNewGoal({
        scorer_id: '',
        assister_id: '',
        minute: '',
        goal_type: 'open_play',
        team_id: ''
      });

      // Refresh goals list
      await fetchMatchGoals(selectedMatch.id);
      
      alert('Goal added! Score updated automatically.');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal: ' + error.message);
    }
  };

  const deleteGoal = async (goalId, goalTeamId) => {
    if (!confirm('Delete this goal? The score will be updated automatically.')) return;

    try {
      const { error } = await supabaseClient
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      // Auto-decrement score based on which team's goal was deleted
      const newMatchResult = { ...matchResult };
      if (goalTeamId === selectedMatch.home_team_id) {
        newMatchResult.home_score = Math.max((matchResult.home_score || 0) - 1, 0);
      } else if (goalTeamId === selectedMatch.away_team_id) {
        newMatchResult.away_score = Math.max((matchResult.away_score || 0) - 1, 0);
      }
      setMatchResult(newMatchResult);

      await fetchMatchGoals(selectedMatch.id);
      alert('Goal deleted! Score updated automatically.');
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  return (
    <AdminLayout title="Match Results">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchMatches}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading matches...</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Home Team</th>
                <th>Score</th>
                <th>Away Team</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-futbol" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                    <p>No matches found</p>
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <tr key={match.id}>
                    <td>{new Date(match.match_date).toLocaleDateString()}</td>
                    <td>
                      <div className="team-cell">
                        {match.home_team?.crest_url && (
                          <img src={match.home_team.crest_url} alt="" className="team-logo-small" />
                        )}
                        <span>{match.home_team?.name}</span>
                      </div>
                    </td>
                    <td>
                      {match.status === 'completed' ? (
                        <strong className="score-display">
                          {match.home_score} - {match.away_score}
                        </strong>
                      ) : (
                        <span className="vs-text">vs</span>
                      )}
                    </td>
                    <td>
                      <div className="team-cell">
                        {match.away_team?.crest_url && (
                          <img src={match.away_team.crest_url} alt="" className="team-logo-small" />
                        )}
                        <span>{match.away_team?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${match.status}`}>
                        {match.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-icon btn-edit"
                        onClick={() => openMatchModal(match)}
                        title="Record/Edit Result"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedMatch && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Match Result</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="match-info">
                <div className="team-score-input">
                  <div className="team-name">
                    {selectedMatch.home_team?.crest_url && (
                      <img src={selectedMatch.home_team.crest_url} alt="" />
                    )}
                    <h3>{selectedMatch.home_team?.name}</h3>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.home_score}
                    onChange={(e) => setMatchResult({
                      ...matchResult,
                      home_score: parseInt(e.target.value) || 0
                    })}
                    className="score-input"
                  />
                </div>

                <div className="score-separator">-</div>

                <div className="team-score-input">
                  <div className="team-name">
                    {selectedMatch.away_team?.crest_url && (
                      <img src={selectedMatch.away_team.crest_url} alt="" />
                    )}
                    <h3>{selectedMatch.away_team?.name}</h3>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.away_score}
                    onChange={(e) => setMatchResult({
                      ...matchResult,
                      away_score: parseInt(e.target.value) || 0
                    })}
                    className="score-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Match Status</label>
                <select
                  value={matchResult.status}
                  onChange={(e) => setMatchResult({ ...matchResult, status: e.target.value })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="postponed">Postponed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="goals-section">
                <h3>⚽ Goals ({matchGoals.length})</h3>
                
                {matchGoals.length > 0 && (
                  <div className="goals-list">
                    {matchGoals.map((goal) => (
                      <div key={goal.id} className="goal-item">
                        <div className="goal-info">
                          <span className="goal-minute">{goal.minute}'</span>
                          <span className="goal-scorer">{goal.scorer?.player_name || 'Unknown'}</span>
                          {goal.assister?.player_name && (
                            <span className="goal-assist">
                              (Assist: {goal.assister.player_name})
                            </span>
                          )}
                        </div>
                        <button 
                          className="goal-delete-btn"
                          onClick={() => deleteGoal(goal.id, goal.team_id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="add-goal-form">
                  <h4>Add Goal</h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Scoring Team</label>
                      <select
                        value={newGoal.team_id}
                        onChange={(e) => {
                          setNewGoal({ 
                            ...newGoal, 
                            team_id: e.target.value,
                            scorer_id: '',
                            assister_id: ''
                          });
                        }}
                      >
                        <option value="">Select Team</option>
                        <option value={selectedMatch.home_team_id}>
                          {selectedMatch.home_team?.name}
                        </option>
                        <option value={selectedMatch.away_team_id}>
                          {selectedMatch.away_team?.name}
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Goal Scorer</label>
                      <select
                        value={newGoal.scorer_id}
                        onChange={(e) => setNewGoal({ ...newGoal, scorer_id: e.target.value })}
                        disabled={!newGoal.team_id}
                      >
                        <option value="">Select Scorer</option>
                        {newGoal.team_id === selectedMatch.home_team_id && 
                          homePlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.player_name} ({p.position})
                            </option>
                          ))
                        }
                        {newGoal.team_id === selectedMatch.away_team_id && 
                          awayPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.player_name} ({p.position})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Assister (Optional)</label>
                      <select
                        value={newGoal.assister_id}
                        onChange={(e) => setNewGoal({ ...newGoal, assister_id: e.target.value })}
                        disabled={!newGoal.team_id}
                      >
                        <option value="">No Assist</option>
                        {newGoal.team_id === selectedMatch.home_team_id && 
                          homePlayers
                            .filter(p => p.id !== newGoal.scorer_id)
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.player_name} ({p.position})
                              </option>
                            ))
                        }
                        {newGoal.team_id === selectedMatch.away_team_id && 
                          awayPlayers
                            .filter(p => p.id !== newGoal.scorer_id)
                            .map(p => (
                              <option key={p.id} value={p.id}>
                                {p.player_name} ({p.position})
                              </option>
                            ))
                        }
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Minute</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={newGoal.minute}
                        onChange={(e) => setNewGoal({ ...newGoal, minute: e.target.value })}
                        placeholder="e.g., 23"
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-add-goal"
                    onClick={addGoal}
                    disabled={!newGoal.scorer_id}
                  >
                    <i className="fas fa-plus"></i> Add Goal
                  </button>
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
                  onClick={recordResult}
                >
                  <i className="fas fa-save"></i> Save Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

