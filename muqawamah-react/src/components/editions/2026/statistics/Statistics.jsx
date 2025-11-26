import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState('player'); // 'player' or 'team'
  const [playerStats, setPlayerStats] = useState({
    goals: [],
    assists: []
  });
  const [teamStats, setTeamStats] = useState({
    goalsScored: [],
    goalsAgainst: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch player stats from team_players table
      const { data: playersData } = await supabaseClient
        .from('team_players')
        .select(`
          id,
          player_name,
          player_image,
          goals,
          assists,
          team_id,
          team_registrations(team_name)
        `)
        .order('goals', { ascending: false });

      if (playersData) {
        const topScorers = playersData
          .filter(p => (p.goals || 0) > 0)
          .slice(0, 10);

        const topAssisters = [...playersData]
          .filter(p => (p.assists || 0) > 0)
          .sort((a, b) => (b.assists || 0) - (a.assists || 0))
          .slice(0, 10);

        setPlayerStats({
          goals: topScorers,
          assists: topAssisters
        });
      }

      // Fetch team stats from teams table
      const { data: teamsData } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('category', 'open-age')
        .order('goals_for', { ascending: false });

      if (teamsData) {
        const byGoalsScored = [...teamsData].slice(0, 5);
        const byGoalsAgainst = [...teamsData]
          .sort((a, b) => (a.goals_against || 999) - (b.goals_against || 999))
          .slice(0, 5);

        setTeamStats({
          goalsScored: byGoalsScored,
          goalsAgainst: byGoalsAgainst
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (playerId, playerName) => {
    window.location.href = `/muqawamah/2026/open-age/players/?player=${playerId}`;
  };

  const handleTeamClick = (teamId) => {
    window.location.href = `/muqawamah/2026/open-age/teams/?team=${teamId}`;
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="statistics-loading">
          <div className="statistics-loading-content">
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

  return (
    <>
      <TournamentNavbar />
      <div className="statistics-page">
        <div className="statistics-container">
          <h1 className="statistics-title">STATISTICS</h1>

          {/* Tab Selector */}
          <div className="stats-tabs">
            <button
              className={`stats-tab ${activeTab === 'player' ? 'active' : ''}`}
              onClick={() => setActiveTab('player')}
            >
              PLAYER STATS
            </button>
            <button
              className={`stats-tab ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              TEAM STATS
            </button>
          </div>

          {/* Player Stats */}
          {activeTab === 'player' && (
            <div className="stats-content">
              <h2 className="stats-section-title">PLAYER LEADERBOARDS</h2>

              <div className="stats-grid">
                {/* Goals */}
                <div className="stat-card">
                  <h3 className="stat-card-title">GOALS</h3>
                  <div className="stat-list">
                    {playerStats.goals.map((player, idx) => (
                      <div
                        key={player.id}
                        className="stat-item"
                        onClick={() => handlePlayerClick(player.id, player.player_name)}
                      >
                        <span className="stat-rank">{idx + 1}</span>
                        <div className="stat-player-photo">
                          {player.player_image ? (
                            <img src={player.player_image} alt={player.player_name} />
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="stat-player-info">
                          <span className="stat-player-name">{player.player_name}</span>
                          <span className="stat-player-team">
                            {player.team_registrations?.team_name || 'N/A'}
                          </span>
                        </div>
                        <span className="stat-value">{player.goals || 0}</span>
                      </div>
                    ))}
                  </div>
                  <button className="show-more-btn">
                    SHOW MORE
                  </button>
                </div>

                {/* Assists */}
                <div className="stat-card">
                  <h3 className="stat-card-title">ASSISTS</h3>
                  <div className="stat-list">
                    {playerStats.assists.map((player, idx) => (
                      <div
                        key={player.id}
                        className="stat-item"
                        onClick={() => handlePlayerClick(player.id, player.player_name)}
                      >
                        <span className="stat-rank">{idx + 1}</span>
                        <div className="stat-player-photo">
                          {player.player_image ? (
                            <img src={player.player_image} alt={player.player_name} />
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="stat-player-info">
                          <span className="stat-player-name">{player.player_name}</span>
                          <span className="stat-player-team">
                            {player.team_registrations?.team_name || 'N/A'}
                          </span>
                        </div>
                        <span className="stat-value">{player.assists || 0}</span>
                      </div>
                    ))}
                  </div>
                  <button className="show-more-btn">
                    SHOW MORE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Team Stats */}
          {activeTab === 'team' && (
            <div className="stats-content">
              <h2 className="stats-section-title">TEAM STATISTICS</h2>

              <div className="stats-grid">
                {/* Goals Scored */}
                <div className="stat-card">
                  <h3 className="stat-card-title">GOALS SCORED</h3>
                  <div className="stat-list">
                    {teamStats.goalsScored.map((team, idx) => (
                      <div
                        key={team.id}
                        className="stat-item team-stat-item"
                        onClick={() => handleTeamClick(team.id)}
                      >
                        <span className="stat-rank">{idx + 1}</span>
                        <div className="stat-team-logo">
                          {team.crest_url ? (
                            <img src={team.crest_url} alt={team.name} />
                          ) : (
                            <span>{team.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <span className="stat-team-name">{team.name}</span>
                        <span className="stat-value">{team.goals_for || 0}</span>
                      </div>
                    ))}
                  </div>
                  <button className="show-more-btn">
                    SHOW MORE
                  </button>
                </div>

                {/* Goals Against */}
                <div className="stat-card">
                  <h3 className="stat-card-title">GOALS AGAINST</h3>
                  <div className="stat-list">
                    {teamStats.goalsAgainst.map((team, idx) => (
                      <div
                        key={team.id}
                        className="stat-item team-stat-item"
                        onClick={() => handleTeamClick(team.id)}
                      >
                        <span className="stat-rank">{idx + 1}</span>
                        <div className="stat-team-logo">
                          {team.crest_url ? (
                            <img src={team.crest_url} alt={team.name} />
                          ) : (
                            <span>{team.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <span className="stat-team-name">{team.name}</span>
                        <span className="stat-value">{team.goals_against || 0}</span>
                      </div>
                    ))}
                  </div>
                  <button className="show-more-btn">
                    SHOW MORE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}


