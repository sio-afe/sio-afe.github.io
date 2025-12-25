import React, { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import Footer from '../../../shared/Footer';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import TeamFormationDisplay from '../../../shared/TeamFormationDisplay';
import { TeamShareCard, PrewarmTeamShareCard, ShareButton } from '../../../shared/ShareableCard';
import SmartImg from '../../../shared/SmartImg';
import { useTournamentLiveUpdates } from '../../../../hooks/useTournamentLiveUpdates';

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

// Team color themes - 12 unique gradients for each team
const teamColorThemes = [
  { primary: '33, 150, 243', name: 'blue' },       // Blue
  { primary: '156, 39, 176', name: 'purple' },     // Purple
  { primary: '244, 67, 54', name: 'red' },         // Red
  { primary: '76, 175, 80', name: 'green' },       // Green
  { primary: '255, 152, 0', name: 'orange' },      // Orange
  { primary: '0, 188, 212', name: 'cyan' },        // Cyan
  { primary: '233, 30, 99', name: 'pink' },        // Pink
  { primary: '255, 193, 7', name: 'amber' },       // Amber
  { primary: '63, 81, 181', name: 'indigo' },      // Indigo
  { primary: '0, 150, 136', name: 'teal' },        // Teal
  { primary: '121, 85, 72', name: 'brown' },       // Brown
  { primary: '96, 125, 139', name: 'blue-grey' },  // Blue Grey
];

// Get consistent color theme based on team ID
const getTeamColorTheme = (teamId) => {
  if (!teamId) return teamColorThemes[0];
  // Simple hash from UUID to get a consistent index
  const hash = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return teamColorThemes[hash % teamColorThemes.length];
};

export default function TeamDetail({ teamId, onBack, onNavigateToPlayer }) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [leaderboards, setLeaderboards] = useState({
    topScorers: [],
    topAssists: []
  });
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const refetchTeam = useCallback(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Live updates: if anything affecting this team changes, refetch.
  useTournamentLiveUpdates({
    enabled: Boolean(teamId),
    channelKey: `team-detail:${teamId}`,
    tables: ['teams', 'matches', 'players', 'goals', 'cards'],
    debounceMs: 800,
    pollIntervalMs: 10_000,
    onUpdate: refetchTeam
  });

  const fetchTeamData = async () => {
    try {
      // Fetch team info - only select needed columns
      const { data: teamData, error: teamError } = await supabaseClient
        .from('teams')
        .select('id, name, crest_url, category, formation, captain')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      if (!teamData?.category) {
        setLoading(false);
        return;
      }

      // Parallelize independent queries for better performance
      const [standingsResult, matchesResult, playersResult] = await Promise.all([
        // Fetch all teams for standings (same category)
        supabaseClient
          .from('teams')
          .select('id, name, crest_url, played, won, drawn, lost, goals_for, goals_against, points')
          .eq('category', teamData.category)
          .order('points', { ascending: false })
          .order('goals_for', { ascending: false }),
        
        // Fetch matches where this team is home or away - only select needed columns
        supabaseClient
          .from('matches')
          .select(`
            id,
            match_date,
            scheduled_time,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            status,
            category,
            home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
            away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
          `)
          .eq('category', teamData.category)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order('match_date', { ascending: true })
          .order('scheduled_time', { ascending: true }),
        
        // Fetch players for this team from tournament players table
        supabaseClient
          .from('players')
          .select('id, name, player_image, position, position_x, position_y, is_substitute, registration_player_id')
          .eq('team_id', teamId)
      ]);

      // Process standings
      if (standingsResult.data) {
        const withPositions = standingsResult.data.map((t, idx) => ({
          ...t,
          position: idx + 1
        }));
        setStandings(withPositions);
      }

      // Process matches
      if (matchesResult.data) {
        setMatches(matchesResult.data);
      }

      // Process players and fetch goals
      if (playersResult.data) {
        // Map to expected structure for backwards compatibility
        const mappedPlayers = playersResult.data.map(p => ({
          ...p,
          player_name: p.name,
          player_age: null // Age not stored in players table
        }));
        setPlayers(mappedPlayers);
        
        // Fetch goals for this team to build leaderboards - only select needed columns
        const { data: goalsData } = await supabaseClient
          .from('goals')
          .select(`
            scorer_id,
            assister_id,
            scorer:team_players!goals_scorer_id_fkey(id, player_name, player_image),
            assister:team_players!goals_assister_id_fkey(id, player_name, player_image)
          `)
          .eq('team_id', teamId);

        // Build a mapping from registration_player_id (team_players.id) to tournament players
        const registrationToPlayerMap = {};
        (playersResult.data || []).forEach(p => {
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
                  goals: 0
                };
              } else if (goal.scorer) {
                // Fallback to team_players data
                scorersMap[playerKey] = {
                  id: goal.scorer_id,
                  player_name: goal.scorer.player_name,
                  player_image: goal.scorer.player_image,
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
                  assists: 0
                };
              } else if (goal.assister) {
                // Fallback to team_players data
                assistsMap[playerKey] = {
                  id: goal.assister_id,
                  player_name: goal.assister.player_name,
                  player_image: goal.assister.player_image,
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

        const topAssists = Object.values(assistsMap)
          .sort((a, b) => b.assists - a.assists)
          .slice(0, 5);

        setLeaderboards({
          topScorers,
          topAssists
        });
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
            <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
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
        
      </div>
    );
  }

  const groupedPlayers = groupPlayers();

  // Helper to format match data for display
  const formatMatchForTeam = (match, currentTeamId) => {
    const isHome = match.home_team_id === currentTeamId;
    const opponent = isHome ? match.away_team : match.home_team;
    const goalsFor = isHome ? match.home_score : match.away_score;
    const goalsAgainst = isHome ? match.away_score : match.home_score;
    
    // Determine result
    let result = 'scheduled';
    let points = '-';
    if (match.status === 'completed' && goalsFor !== null && goalsAgainst !== null) {
      if (goalsFor > goalsAgainst) {
        result = 'win';
        points = 3;
      } else if (goalsFor < goalsAgainst) {
        result = 'loss';
        points = 0;
      } else {
        result = 'draw';
        points = 1;
      }
    }
    
    // Format date
    const matchDate = match.match_date 
      ? new Date(match.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      : 'TBD';

    return {
      ...match,
      isHome,
      opponent,
      goalsFor: goalsFor ?? '-',
      goalsAgainst: goalsAgainst ?? '-',
      result,
      points,
      matchDate,
      score: match.status === 'completed' ? `${goalsFor} - ${goalsAgainst}` : 'vs'
    };
  };

  // Format matches for this team's perspective
  const matchLog = matches.map(m => formatMatchForTeam(m, teamId));

  // Get team's unique color theme
  const colorTheme = getTeamColorTheme(teamId);
  const teamGradientStyle = {
    background: `linear-gradient(180deg, 
      rgba(${colorTheme.primary}, 0.15) 0%, 
      rgba(${colorTheme.primary}, 0.08) 30%,
      #0d1225 70%,
      #0a0e1a 100%
    )`
  };
  const teamGlowStyle = {
    background: `
      radial-gradient(ellipse at 50% 0%, rgba(${colorTheme.primary}, 0.25) 0%, transparent 60%),
      radial-gradient(ellipse at 0% 100%, rgba(${colorTheme.primary}, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(${colorTheme.primary}, 0.1) 0%, transparent 50%)
    `
  };
  const teamCrestStyle = {
    background: `linear-gradient(135deg, rgba(${colorTheme.primary}, 0.2) 0%, rgba(${colorTheme.primary}, 0.05) 100%)`,
    borderColor: `rgba(${colorTheme.primary}, 0.4)`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(${colorTheme.primary}, 0.2), inset 0 0 20px rgba(${colorTheme.primary}, 0.1)`
  };
  const teamAccentColor = `rgb(${colorTheme.primary})`;

  // Get team stats for sharing
  const teamStats = standings.find(s => s.id === teamId) || team;

  return (
    <>
      <TournamentNavbar />
      <div className="team-detail">
        {/* Share Button - Floating */}
        <div className="team-action-buttons">
          <ShareButton onClick={() => setShowShareModal(true)} />
        </div>

        {/* Hero Section */}
        <div className="team-hero" style={teamGradientStyle}>
          <div className="team-hero-bg" style={teamGlowStyle}></div>
          
          <div className="team-hero-content">
            <div className="team-crest-hero" style={teamCrestStyle}>
              {team.crest_url ? (
                <SmartImg src={team.crest_url} preset="crestMd" alt={team.name} loading="eager" decoding="async" fetchpriority="high" />
              ) : (
                <span>{team.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="team-info-hero">
              <h1 className="team-name-hero">{team.name}</h1>
              <div className="team-meta-hero">
                <span className="meta-label">Captain:</span>
                <span className="meta-value" style={{ color: teamAccentColor }}>{team.captain || 'TBA'}</span>
              </div>
              {team.formation && (
                <div className="team-formation-hero" style={{ 
                  background: `rgba(${colorTheme.primary}, 0.15)`,
                  borderColor: `rgba(${colorTheme.primary}, 0.3)`
                }}>
                  <i className="fas fa-chess-board" style={{ color: teamAccentColor }}></i>
                  <span>{team.formation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="team-detail-body">
          <div className="team-detail-main">
            {/* Match Log - Simplified like Player Detail */}
            <div className="team-match-log-section">
              <h3 className="section-title-italic">MATCH LOG</h3>
              {matchLog.length > 0 ? (
                <div className="team-match-log-wrapper">
                  <table className="team-match-table">
                    <thead>
                      <tr>
                        <th>OPPONENT</th>
                        <th>RESULT</th>
                        <th>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchLog.map((match, index) => {
                        const opponent = match.isHome ? match.away_team : match.home_team;
                        return (
                          <tr 
                            key={match.id || index}
                            className="team-match-row"
                            onClick={() => {
                              const category = team.category || 'open-age';
                              window.location.href = `/muqawamah/2026/${category}/fixtures/?match=${match.id}`;
                            }}
                          >
                            <td className="opponent-cell">
                              <div className="opponent-inner">
                                {opponent?.crest_url && (
                                  <SmartImg
                                    src={opponent.crest_url} 
                                    preset="crestSm"
                                    alt="" 
                                    className="opponent-logo"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                )}
                                <span className="opponent-name">{opponent?.name || 'TBD'}</span>
                              </div>
                            </td>
                            <td className="result-cell">
                              <div className="result-inner">
                                {match.status === 'completed' ? (
                                  <>
                                    <span className={`result-badge result-${match.result}`}>
                                      {match.result === 'win' ? 'WIN' : match.result === 'loss' ? 'LOSS' : 'DRAW'}
                                    </span>
                                    <span className="score-text">{match.goalsFor}-{match.goalsAgainst}</span>
                                  </>
                                ) : (
                                  <span className="scheduled-badge-simple">VS</span>
                                )}
                              </div>
                            </td>
                            <td className="pts-cell">
                              <span className={`pts-value ${match.result}`}>{match.points}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-matches">
                  <i className="fas fa-calendar-alt"></i>
                  <p>No matches scheduled yet</p>
                </div>
              )}
            </div>

            {/* Team Formation */}
            <div className="team-formation-section">
              <h3 className="section-title-italic">FORMATION</h3>
              <TeamFormationDisplay 
                players={players} 
                formation={team.formation}
              />
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
                              <SmartImg
                                src={standingTeam.crest_url} 
                                preset="crestSm"
                                alt={standingTeam.name}
                                loading="lazy"
                                decoding="async"
                              />
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
            <h3 className="section-title-italic">SQUAD</h3>
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
                          <SmartImg
                            src={player.player_image} 
                            preset="playerAvatar"
                            alt={player.player_name}
                            loading="lazy"
                            decoding="async"
                          />
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
                          <img 
                            src={player.player_image} 
                            alt={player.player_name}
                            loading="lazy"
                          />
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
                          <img 
                            src={player.player_image} 
                            alt={player.player_name}
                            loading="lazy"
                          />
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

        

        <Footer edition="2026" />
      </div>

      {/* Prewarm share image in the background so first open is instant */}
      {team && <PrewarmTeamShareCard team={team} stats={teamStats} />}
      
      {/* Share Modal */}
      {showShareModal && (
        <TeamShareCard 
          team={team}
          stats={teamStats}
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </>
  );
}

