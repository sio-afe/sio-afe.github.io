/**
 * Statistics Viewer Page
 * View comprehensive tournament statistics
 */

import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AdminLayout from '../../components/AdminLayout';
import { imgUrl } from '../../../lib/imagePresets';

export default function StatisticsViewer() {
  const [stats, setStats] = useState({
    topScorers: [],
    topAssisters: [],
    teamStats: [],
    matchStats: {
      totalMatches: 0,
      completedMatches: 0,
      totalGoals: 0,
      averageGoals: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchStatistics();
  }, [categoryFilter]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Top Scorers
      const { data: scorers, error: scorersError } = await supabaseClient
        .from('goals')
        .select('scorer_id, team_players!goals_scorer_id_fkey(player_name, player_image, team_registrations(team_name, category))')
        .order('scorer_id');

      if (scorersError) throw scorersError;

      // Count goals per player
      const scorerCounts = {};
      scorers?.forEach(goal => {
        const playerId = goal.scorer_id;
        if (!scorerCounts[playerId]) {
          scorerCounts[playerId] = {
            player: goal.team_players,
            goals: 0
          };
        }
        scorerCounts[playerId].goals++;
      });

      const topScorers = Object.values(scorerCounts)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);

      // Top Assisters
      const { data: assists, error: assistsError } = await supabaseClient
        .from('goals')
        .select('assister_id, team_players!goals_assister_id_fkey(player_name, player_image, team_registrations(team_name))')
        .not('assister_id', 'is', null);

      if (assistsError) throw assistsError;

      const assisterCounts = {};
      assists?.forEach(goal => {
        const playerId = goal.assister_id;
        if (!scorerCounts[playerId]) {
          assisterCounts[playerId] = {
            player: goal.team_players,
            assists: 0
          };
        }
        assisterCounts[playerId].assists++;
      });

      const topAssisters = Object.values(assisterCounts)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10);

      // Team Stats
      let teamsQuery = supabaseClient
        .from('teams')
        .select('*')
        .order('points', { ascending: false });

      if (categoryFilter !== 'all') {
        teamsQuery = teamsQuery.eq('category', categoryFilter);
      }

      const { data: teamsData, error: teamsError } = await teamsQuery;
      if (teamsError) throw teamsError;

      // Match Stats
      const { data: matchesData, error: matchesError } = await supabaseClient
        .from('matches')
        .select('*');

      if (matchesError) throw matchesError;

      const totalGoals = (scorers?.length || 0);
      const completedMatches = matchesData?.filter(m => m.status === 'completed').length || 0;

      setStats({
        topScorers,
        topAssisters,
        teamStats: teamsData || [],
        matchStats: {
          totalMatches: matchesData?.length || 0,
          completedMatches,
          totalGoals,
          averageGoals: completedMatches > 0 ? (totalGoals / completedMatches).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Tournament Statistics">
      <div className="admin-page-header">
        <div className="page-header-left">
          <button className="refresh-btn" onClick={fetchStatistics}>
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
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Match Statistics */}
          <div className="stats-overview">
            <h3>Match Overview</h3>
            <div className="stats-grid">
              <div className="stat-box">
                <i className="fas fa-futbol"></i>
                <div>
                  <p className="stat-label">Total Matches</p>
                  <p className="stat-value">{stats.matchStats.totalMatches}</p>
                </div>
              </div>
              <div className="stat-box">
                <i className="fas fa-check-circle"></i>
                <div>
                  <p className="stat-label">Completed</p>
                  <p className="stat-value">{stats.matchStats.completedMatches}</p>
                </div>
              </div>
              <div className="stat-box">
                <i className="fas fa-trophy"></i>
                <div>
                  <p className="stat-label">Total Goals</p>
                  <p className="stat-value">{stats.matchStats.totalGoals}</p>
                </div>
              </div>
              <div className="stat-box">
                <i className="fas fa-chart-line"></i>
                <div>
                  <p className="stat-label">Avg Goals/Match</p>
                  <p className="stat-value">{stats.matchStats.averageGoals}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Scorers & Assisters */}
          <div className="stats-tables-grid">
            <div className="stats-table-section">
              <h3>Top Scorers</h3>
              <table className="admin-table compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topScorers.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No goals recorded
                      </td>
                    </tr>
                  ) : (
                    stats.topScorers.map((scorer, idx) => (
                      <tr key={idx}>
                        <td><strong>{idx + 1}</strong></td>
                        <td>
                          <div className="player-cell">
                            {scorer.player?.player_image && (
                              <img
                                src={imgUrl(scorer.player.player_image, 'playerAvatar')}
                                alt=""
                                className="player-image-tiny"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <span>{scorer.player?.player_name}</span>
                          </div>
                        </td>
                        <td>{scorer.player?.team_registrations?.team_name}</td>
                        <td><strong className="highlight-value">{scorer.goals}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="stats-table-section">
              <h3>Top Assisters</h3>
              <table className="admin-table compact">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAssisters.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No assists recorded
                      </td>
                    </tr>
                  ) : (
                    stats.topAssisters.map((assister, idx) => (
                      <tr key={idx}>
                        <td><strong>{idx + 1}</strong></td>
                        <td>
                          <div className="player-cell">
                            {assister.player?.player_image && (
                              <img
                                src={imgUrl(assister.player.player_image, 'playerAvatar')}
                                alt=""
                                className="player-image-tiny"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <span>{assister.player?.player_name}</span>
                          </div>
                        </td>
                        <td>{assister.player?.team_registrations?.team_name}</td>
                        <td><strong className="highlight-value">{assister.assists}</strong></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Standings */}
          <div className="stats-table-section full-width">
            <h3>Team Standings</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Played</th>
                  <th>Won</th>
                  <th>Drawn</th>
                  <th>Lost</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {stats.teamStats.map((team, idx) => (
                  <tr key={team.id}>
                    <td><strong>{idx + 1}</strong></td>
                    <td>
                      <div className="team-cell">
                        {team.crest_url && (
                          <img
                            src={imgUrl(team.crest_url, 'crestSm')}
                            alt=""
                            className="team-logo-small"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <span>{team.name}</span>
                      </div>
                    </td>
                    <td>{team.played || 0}</td>
                    <td>{team.won || 0}</td>
                    <td>{team.drawn || 0}</td>
                    <td>{team.lost || 0}</td>
                    <td>{team.goals_for || 0}</td>
                    <td>{team.goals_against || 0}</td>
                    <td>{(team.goals_for || 0) - (team.goals_against || 0)}</td>
                    <td><strong className="highlight-value">{team.points || 0}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

