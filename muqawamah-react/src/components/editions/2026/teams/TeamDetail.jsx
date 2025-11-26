import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import Footer from '../../../shared/Footer';
import TournamentNavbar from '../../../shared/TournamentNavbar';

const positionGroups = {
  'Goalkeeper': 'GOALKEEPERS',
  'Defender': 'DEFENDERS',
  'Midfielder': 'MIDFIELDERS',
  'Forward': 'FORWARDS',
  'Striker': 'FORWARDS',
  'Substitute': 'SUBSTITUTES'
};

const positionLabels = {
  'GK': 'Goalkeeper',
  'CB': 'Defender',
  'LB': 'Defender',
  'RB': 'Defender',
  'CDM': 'Midfielder',
  'CM': 'Midfielder',
  'CAM': 'Midfielder',
  'LM': 'Midfielder',
  'RM': 'Midfielder',
  'CF': 'Forward',
  'ST': 'Forward',
  'SUB': 'Substitute'
};

export default function TeamDetail({ teamId, onBack, onNavigateToPlayer }) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [leaderboards, setLeaderboards] = useState({
    topScorers: [],
    topAssists: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      // Fetch team info
      const { data: teamData, error: teamError } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Fetch all teams for standings (same category)
      if (teamData?.category) {
        const { data: standingsData } = await supabaseClient
          .from('teams')
          .select('id, name, crest_url, played, won, drawn, lost, goals_for, goals_against, points')
          .eq('category', teamData.category)
          .order('points', { ascending: false })
          .order('goals_for', { ascending: false });
        
        if (standingsData) {
          // Add position numbers
          const withPositions = standingsData.map((t, idx) => ({
            ...t,
            position: idx + 1
          }));
          setStandings(withPositions);
        }
      }

      // Fetch players for this team
      if (teamData?.registration_id) {
        const { data: playersData } = await supabaseClient
          .from('team_players')
          .select('id, player_name, player_image, position, player_age')
          .eq('team_id', teamData.registration_id);
        
        if (playersData) {
          setPlayers(playersData);
          
          // Leaderboards will be empty for now since goals/assists aren't in team_players
          setLeaderboards({
            topScorers: [],
            topAssists: []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position) => {
    return positionLabels[position] || position || 'Unknown';
  };

  const groupPlayers = () => {
    const groups = {};
    players.forEach(player => {
      const posLabel = getPositionLabel(player.position);
      const groupName = positionGroups[posLabel] || 'OTHERS';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(player);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="team-detail-loading">
        <div className="teams-loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
          </div>
          <p>Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Team not found</p>
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Teams
        </button>
      </div>
    );
  }

  const groupedPlayers = groupPlayers();

  // Mock match log
  const matchLog = team.match_log || [];

  return (
    <>
      <TournamentNavbar />
      <div className="team-detail">
        {/* Hero Section */}
        <div className="team-hero">
          <div className="team-hero-bg"></div>
          
          <div className="team-hero-content">
            <div className="team-crest-hero">
              {team.crest_url ? (
                <img src={team.crest_url} alt={team.name} />
              ) : (
                <span>{team.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="team-info-hero">
              <h1 className="team-name-hero">{team.name}</h1>
              <div className="team-meta-hero">
                <span className="meta-label">Captain:</span>
                <span className="meta-value">{team.captain || 'TBA'}</span>
              </div>
              {team.formation && (
                <div className="team-formation-hero">
                  <i className="fas fa-chess-board"></i>
                  <span>{team.formation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="team-detail-body">
          <div className="team-detail-main">
            {/* Match Log */}
            <div className="match-log-section">
              <h3 className="section-title-italic">MATCH LOG</h3>
              {matchLog.length > 0 ? (
                <div className="match-log-table">
                  <div className="match-log-header">
                    <span>MW</span>
                    <span>DATE</span>
                    <span>MATCH</span>
                    <span>SCORE</span>
                    <span>GF</span>
                    <span>GA</span>
                    <span>PTS</span>
                  </div>
                  {matchLog.map((match, index) => (
                    <div className="match-log-row" key={index}>
                      <span>{match.matchweek}</span>
                      <span>{match.date}</span>
                      <span className="match-teams">
                        <img src={match.home_logo} alt="" className="match-team-logo" />
                        <span>{match.home_abbr}</span>
                        <span className="vs">vs</span>
                        <img src={match.away_logo} alt="" className="match-team-logo" />
                        <span>{match.away_abbr}</span>
                      </span>
                      <span className={`match-score ${match.result}`}>
                        {match.score}
                      </span>
                      <span>{match.goals_for}</span>
                      <span>{match.goals_against}</span>
                      <span>{match.points}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-matches">
                  <p>No matches played yet</p>
                </div>
              )}
            </div>

            {/* Standings Table */}
            <div className="standings-section">
              <h3 className="section-title-italic">STANDINGS</h3>
              <div className="standings-table">
                <div className="standings-header">
                  <span className="col-pos">#</span>
                  <span className="col-team">TEAM</span>
                  <span className="col-pts">PTS</span>
                </div>
                {standings.map((standingTeam) => {
                  const isCurrentTeam = standingTeam.id === teamId;
                  
                  return (
                    <div 
                      className={`standings-row ${isCurrentTeam ? 'highlighted' : ''}`}
                      key={standingTeam.id}
                    >
                      <span className="col-pos">{standingTeam.position}</span>
                      <span className="col-team">
                        <div className="team-cell">
                          <div className="team-logo-small">
                            {standingTeam.crest_url ? (
                              <img src={standingTeam.crest_url} alt={standingTeam.name} />
                            ) : (
                              <span>{standingTeam.name?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <span className="team-name-standings">{standingTeam.name}</span>
                        </div>
                      </span>
                      <span className="col-pts">{standingTeam.points || 0}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Squad */}
          <div className="team-detail-sidebar">
            <h3 className="section-title">SQUAD</h3>
            <div className="squad-list">
              {Object.entries(groupedPlayers).map(([group, groupPlayers]) => (
                <div className="squad-group" key={group}>
                  <h4 className="squad-group-title">{group}</h4>
                  {groupPlayers.map((player, idx) => (
                    <div 
                      className="squad-row" 
                      key={player.id}
                      onClick={() => onNavigateToPlayer && onNavigateToPlayer(player.id, player.player_name)}
                    >
                      <span className="squad-number">{idx + 1}</span>
                      <div className="squad-photo">
                        {player.player_image ? (
                          <img src={player.player_image} alt={player.player_name} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div className="squad-info">
                        <span className="squad-name">{player.player_name}</span>
                        <span className="squad-position">{getPositionLabel(player.position)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="leaderboards-section">
          <h2 className="leaderboards-title">LEADERBOARDS</h2>
          <div className="leaderboards-grid">
            {/* Top Scorers */}
            <div className="leaderboard-card">
              <h3 className="leaderboard-card-title">TOP SCORERS</h3>
              <div className="leaderboard-list">
                {leaderboards.topScorers.length > 0 ? (
                  leaderboards.topScorers.map((player, idx) => (
                    <div 
                      className="leaderboard-item" 
                      key={player.id}
                      onClick={() => onNavigateToPlayer && onNavigateToPlayer(player.id, player.player_name)}
                    >
                      <span className="lb-rank">{idx + 1}</span>
                      <div className="lb-player-photo">
                        {player.player_image ? (
                          <img src={player.player_image} alt={player.player_name} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <span className="lb-player-name">{player.player_name}</span>
                      <span className="lb-stat">{player.goals || 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-stats">No goals scored yet</div>
                )}
              </div>
              <button className="view-more-btn">
                VIEW MORE <i className="fas fa-arrow-right"></i>
              </button>
            </div>

            {/* Top Assists */}
            <div className="leaderboard-card">
              <h3 className="leaderboard-card-title">TOP ASSISTS</h3>
              <div className="leaderboard-list">
                {leaderboards.topAssists.length > 0 ? (
                  leaderboards.topAssists.map((player, idx) => (
                    <div 
                      className="leaderboard-item" 
                      key={player.id}
                      onClick={() => onNavigateToPlayer && onNavigateToPlayer(player.id, player.player_name)}
                    >
                      <span className="lb-rank">{idx + 1}</span>
                      <div className="lb-player-photo">
                        {player.player_image ? (
                          <img src={player.player_image} alt={player.player_name} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <span className="lb-player-name">{player.player_name}</span>
                      <span className="lb-stat">{player.assists || 0}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-stats">No assists yet</div>
                )}
              </div>
              <button className="view-more-btn">
                VIEW MORE <i className="fas fa-arrow-right"></i>
              </button>
            </div>

          </div>
        </div>

        {/* Back Button */}
        <div className="team-detail-footer">
          <button onClick={onBack} className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Teams
          </button>
        </div>

        <Footer edition="2026" />
      </div>
    </>
  );
}

