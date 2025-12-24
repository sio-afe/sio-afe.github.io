import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import SmartImg from '../../../shared/SmartImg';
import { StatsShareCard, PrewarmStatsShareCard } from '../../../shared/ShareableCard';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState('goals'); // 'goals', 'assists', 'teams'
  const [playerStats, setPlayerStats] = useState({
    goals: [],
    assists: []
  });
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareCard, setShowShareCard] = useState(false);

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

      // Get all teams for this category
      const { data: categoryTeams } = await supabaseClient
        .from('teams')
        .select('id')
        .eq('category', category);

      const teamIds = categoryTeams?.map(t => t.id) || [];

      // Fetch all players from players table for this category
      const { data: allPlayers } = await supabaseClient
        .from('players')
        .select('id, name, player_image, registration_player_id, team_id, team:teams(name, crest_url)')
        .in('team_id', teamIds);

      // Create mapping from registration_player_id (team_players.id) to players table data
      const registrationToPlayerMap = {};
      (allPlayers || []).forEach(p => {
        if (p.registration_player_id) {
          registrationToPlayerMap[p.registration_player_id] = p;
        }
      });

      // Aggregate goals by player - prioritize players table, fallback to team_players
      const scorersMap = {};
      const assistsMap = {};

      (goalsData || []).forEach(goal => {
        // Count goals - first try players table, then fallback to team_players
        if (goal.scorer_id) {
          const tournamentPlayer = registrationToPlayerMap[goal.scorer_id];
          const playerKey = tournamentPlayer?.id || goal.scorer_id;
          
          if (!scorersMap[playerKey]) {
            if (tournamentPlayer) {
              // Use players table data
              scorersMap[playerKey] = {
                id: tournamentPlayer.id,
                player_name: tournamentPlayer.name || tournamentPlayer.player_name,
                player_image: tournamentPlayer.player_image,
                team_registrations: {
                  team_name: tournamentPlayer.team?.name || 'Unknown',
                  team_logo: tournamentPlayer.team?.crest_url || null
                },
                goals: 0
              };
            } else if (goal.scorer) {
              // Fallback to team_players data
              scorersMap[playerKey] = {
                id: goal.scorer.id,
                player_name: goal.scorer.player_name,
                player_image: goal.scorer.player_image,
                team_registrations: goal.scorer.team_registrations,
                goals: 0
              };
            }
          }
          if (scorersMap[playerKey]) {
            scorersMap[playerKey].goals += 1;
          }
        }

        // Count assists - first try players table, then fallback to team_players
        if (goal.assister_id) {
          const tournamentPlayer = registrationToPlayerMap[goal.assister_id];
          const playerKey = tournamentPlayer?.id || goal.assister_id;
          
          if (!assistsMap[playerKey]) {
            if (tournamentPlayer) {
              // Use players table data
              assistsMap[playerKey] = {
                id: tournamentPlayer.id,
                player_name: tournamentPlayer.name || tournamentPlayer.player_name,
                player_image: tournamentPlayer.player_image,
                team_registrations: {
                  team_name: tournamentPlayer.team?.name || 'Unknown',
                  team_logo: tournamentPlayer.team?.crest_url || null
                },
                assists: 0
              };
            } else if (goal.assister) {
              // Fallback to team_players data
              assistsMap[playerKey] = {
                id: goal.assister.id,
                player_name: goal.assister.player_name,
                player_image: goal.assister.player_image,
                team_registrations: goal.assister.team_registrations,
                assists: 0
              };
            }
          }
          if (assistsMap[playerKey]) {
            assistsMap[playerKey].assists += 1;
          }
        }
      });

      const topScorers = Object.values(scorersMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 5);

      const topAssisters = Object.values(assistsMap)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 5);

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
        setTeamStats(teamsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = async (playerId) => {
    if (!playerId) return;
    
    try {
      // Check if this is already a players table ID or a team_players ID
      // First, try to find in players table directly
      const { data: tournamentPlayer, error: directError } = await supabaseClient
        .from('players')
        .select('id')
        .eq('id', playerId)
        .single();

      if (!directError && tournamentPlayer) {
        // It's already a players table ID
        const base = category === 'u17' ? '/muqawamah/2026/u17' : '/muqawamah/2026/open-age';
        window.location.href = `${base}/players/?player=${playerId}`;
        return;
      }

      // If not found, try to find by registration_player_id (team_players.id)
      const { data: tournamentPlayerByReg, error: regError } = await supabaseClient
        .from('players')
        .select('id')
        .eq('registration_player_id', playerId)
        .single();

      if (regError || !tournamentPlayerByReg) {
        console.error('Player not found in tournament players:', regError);
        alert('Player details not available');
        return;
      }

      const base = category === 'u17' ? '/muqawamah/2026/u17' : '/muqawamah/2026/open-age';
      window.location.href = `${base}/players/?player=${tournamentPlayerByReg.id}`;
    } catch (err) {
      console.error('Error finding player:', err);
    }
  };

  const handleTeamClick = (teamId) => {
    const base = category === 'u17' ? '/muqawamah/2026/u17' : '/muqawamah/2026/open-age';
    window.location.href = `${base}/teams/?team=${teamId}`;
  };

  // Get data for share card
  const getShareData = () => {
    if (activeTab === 'goals') {
      return playerStats.goals.slice(0, 3).map(p => ({
        name: p.player_name,
        image: p.player_image,
        team_name: p.team_registrations?.team_name,
        value: p.goals || 0
      }));
    } else if (activeTab === 'assists') {
      return playerStats.assists.slice(0, 3).map(p => ({
        name: p.player_name,
        image: p.player_image,
        team_name: p.team_registrations?.team_name,
        value: p.assists || 0
      }));
    } else {
      return teamStats.slice(0, 3).map(t => ({
        name: t.name,
        crest_url: t.crest_url,
        value: t.goals_for || 0
      }));
    }
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="stats-page-v2 stats-loading-v2">
          <div className="stats-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
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
                <SmartImg
                  src={player.player_image}
                  preset="playerAvatar"
                  alt={player.player_name}
                  loading="lazy"
                  decoding="async"
                />
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
                  <SmartImg
                    src={player.team_registrations.team_logo}
                    preset="crestSm"
                    alt=""
                    className="mini-team-logo"
                    loading="lazy"
                    decoding="async"
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

            {/* Team Name */}
            <div className="team-info-main-v2">
              <span className="team-name-v2">{team.name}</span>
            </div>

            {/* Team Logo */}
            <div className="team-logo-v2" aria-hidden="true">
              {team.crest_url ? (
                <SmartImg
                  src={team.crest_url}
                  preset="crestSm"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="logo-placeholder">
                  <span>{team.name?.charAt(0) || '?'}</span>
                </div>
              )}
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

        {/* Share Button - Fixed Bottom Right */}
        <button 
          className="stats-share-btn-fixed"
          onClick={() => setShowShareCard(true)}
          title="Share Top 3"
        >
          <i className="fas fa-share-alt"></i>
        </button>

        {/* Prewarm share image in the background so first open is instant */}
        <PrewarmStatsShareCard
          statType={activeTab === 'teams' ? 'points' : activeTab}
          items={getShareData()}
        />

        {/* Share Card Modal */}
        {showShareCard && (
          <StatsShareCard 
            statType={activeTab === 'teams' ? 'points' : activeTab}
            items={getShareData()}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </div>
      <Footer edition="2026" />
    </>
  );
}
