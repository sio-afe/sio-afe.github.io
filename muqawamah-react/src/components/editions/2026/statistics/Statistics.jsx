import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState('goals'); // 'goals', 'assists', 'teams'
  const [playerStats, setPlayerStats] = useState({
    goals: [],
    assists: []
  });
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    fetchStatistics();
  }, [category]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch all matches for this category
      const { data: matches } = await supabaseClient
        .from('matches')
        .select('id')
        .eq('category', category);

      const matchIds = (matches || []).map(m => m.id);

      // Fetch all goals for these matches with player and team details
      const { data: goalsData } = await supabaseClient
        .from('goals')
        .select(`
          scorer_id,
          assister_id,
          team_id,
          scorer:team_players!goals_scorer_id_fkey(id, player_name, player_image, team_id, team_registrations(team_name, team_logo)),
          assister:team_players!goals_assister_id_fkey(id, player_name, player_image, team_id, team_registrations(team_name, team_logo))
        `)
        .in('match_id', matchIds);

      // Aggregate goals by player
      const scorersMap = {};
      const assistsMap = {};

      (goalsData || []).forEach(goal => {
        // Count goals
        if (goal.scorer?.id) {
          if (!scorersMap[goal.scorer.id]) {
            scorersMap[goal.scorer.id] = {
              id: goal.scorer.id,
              player_name: goal.scorer.player_name,
              player_image: goal.scorer.player_image,
              team_registrations: goal.scorer.team_registrations,
              goals: 0
            };
          }
          scorersMap[goal.scorer.id].goals += 1;
        }

        // Count assists
        if (goal.assister?.id) {
          if (!assistsMap[goal.assister.id]) {
            assistsMap[goal.assister.id] = {
              id: goal.assister.id,
              player_name: goal.assister.player_name,
              player_image: goal.assister.player_image,
              team_registrations: goal.assister.team_registrations,
              assists: 0
            };
          }
          assistsMap[goal.assister.id].assists += 1;
        }
      });

      const topScorers = Object.values(scorersMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);

      const topAssisters = Object.values(assistsMap)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 10);

      setPlayerStats({
        goals: topScorers,
        assists: topAssisters
      });

      // Fetch team stats from teams table
      const { data: teamsData } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('goals_for', { ascending: false });

      if (teamsData) {
        setTeamStats(teamsData.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (playerId) => {
    const base = category === 'u17' ? '/muqawamah/2026/u17' : '/muqawamah/2026/open-age';
    window.location.href = `${base}/players/?player=${playerId}`;
  };

  const handleTeamClick = (teamId) => {
    const base = category === 'u17' ? '/muqawamah/2026/u17' : '/muqawamah/2026/open-age';
    window.location.href = `${base}/teams/?team=${teamId}`;
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="stats-page-v2 stats-loading-v2">
          <div className="stats-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
            </div>
            <p>Loading statistics...</p>
          </div>
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  const tabs = [
    { id: 'goals', label: 'TOP SCORERS', icon: 'fa-futbol' },
    { id: 'assists', label: 'TOP ASSISTS', icon: 'fa-hands-helping' },
    { id: 'teams', label: 'TEAM STATS', icon: 'fa-shield-alt' }
  ];

  const renderPlayerLeaderboard = (players, statType) => (
    <div className="leaderboard-v2">
      {players.length > 0 ? (
        players.map((player, idx) => (
          <div 
            key={player.id} 
            className={`leaderboard-row-v2 ${idx === 0 ? 'top-player' : ''}`}
            onClick={() => handlePlayerClick(player.id)}
          >
            {/* Rank */}
            <div className="rank-cell-v2">
              <span className={`rank-number ${idx < 3 ? 'rank-top' : ''}`}>
                {idx + 1}
              </span>
            </div>

            {/* Player Photo */}
            <div className="player-photo-v2">
              {player.player_image ? (
                <img src={player.player_image} alt={player.player_name} />
              ) : (
                <div className="photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="player-info-v2">
              <span className="player-name-v2">{player.player_name}</span>
              <div className="team-info-v2">
                {player.team_registrations?.team_logo && (
                  <img 
                    src={player.team_registrations.team_logo} 
                    alt="" 
                    className="mini-team-logo"
                  />
                )}
                <span className="team-name-mini">
                  {player.team_registrations?.team_name || 'N/A'}
                </span>
              </div>
            </div>

            {/* Stat Value */}
            <div className="stat-value-v2">
              <span className="stat-number">
                {statType === 'goals' ? (player.goals || 0) : (player.assists || 0)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="no-data-v2">
          <i className="fas fa-chart-bar"></i>
          <p>No statistics available yet</p>
        </div>
      )}
    </div>
  );

  const renderTeamLeaderboard = () => (
    <div className="leaderboard-v2 team-leaderboard">
      {teamStats.length > 0 ? (
        teamStats.map((team, idx) => (
          <div 
            key={team.id} 
            className={`leaderboard-row-v2 team-row ${idx === 0 ? 'top-team' : ''}`}
            onClick={() => handleTeamClick(team.id)}
          >
            {/* Rank */}
            <div className="rank-cell-v2">
              <span className={`rank-number ${idx < 3 ? 'rank-top' : ''}`}>
                {idx + 1}
              </span>
            </div>

            {/* Team Logo */}
            <div className="team-logo-v2">
              {team.crest_url ? (
                <img src={team.crest_url} alt={team.name} />
              ) : (
                <div className="logo-placeholder">
                  <span>{team.name?.charAt(0) || '?'}</span>
                </div>
              )}
            </div>

            {/* Team Name */}
            <div className="team-info-main-v2">
              <span className="team-name-v2">{team.name}</span>
            </div>

            {/* Team Stats */}
            <div className="team-stats-row">
              <div className="team-stat-cell">
                <span className="stat-label-mini">GF</span>
                <span className="stat-num">{team.goals_for || 0}</span>
              </div>
              <div className="team-stat-cell">
                <span className="stat-label-mini">GA</span>
                <span className="stat-num">{team.goals_against || 0}</span>
              </div>
              <div className="team-stat-cell gd-cell">
                <span className="stat-label-mini">GD</span>
                <span className={`stat-num ${(team.goals_for - team.goals_against) >= 0 ? 'positive' : 'negative'}`}>
                  {(team.goals_for || 0) - (team.goals_against || 0) >= 0 ? '+' : ''}
                  {(team.goals_for || 0) - (team.goals_against || 0)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="no-data-v2">
          <i className="fas fa-shield-alt"></i>
          <p>No team statistics available yet</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <TournamentNavbar />
      <div className="stats-page-v2">
        <div className="stats-container-v2">
          {/* Header */}
          <div className="stats-header-v2">
            <h1>Statistics</h1>
            <hr className="stats-divider" />
          </div>

          {/* Tab Navigation */}
          <div className="stats-tabs-container">
            <div className="stats-tabs-v2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`stats-tab-v2 ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
              <span 
                className="stats-tab-slider" 
                style={{ 
                  transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)` 
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="stats-content-v2">
            {activeTab === 'goals' && (
              <div className="stats-section-v2">
                <div className="section-header-v2">
                  <h2>Top Scorers</h2>
                  <span className="section-subtitle">Players with most goals</span>
                </div>
                {renderPlayerLeaderboard(playerStats.goals, 'goals')}
              </div>
            )}

            {activeTab === 'assists' && (
              <div className="stats-section-v2">
                <div className="section-header-v2">
                  <h2>Top Assists</h2>
                  <span className="section-subtitle">Players with most assists</span>
                </div>
                {renderPlayerLeaderboard(playerStats.assists, 'assists')}
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="stats-section-v2">
                <div className="section-header-v2">
                  <h2>Team Statistics</h2>
                  <span className="section-subtitle">Goals scored and conceded</span>
                </div>
                {renderTeamLeaderboard()}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}
