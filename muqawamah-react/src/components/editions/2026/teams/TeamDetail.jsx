import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import Footer from '../../../shared/Footer';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import TeamFormationDisplay from '../../../shared/TeamFormationDisplay';

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
  const [matches, setMatches] = useState([]);
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

        // Fetch matches where this team is home or away
        const { data: matchesData } = await supabaseClient
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
            away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
          `)
          .eq('category', teamData.category)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order('match_date', { ascending: true })
          .order('scheduled_time', { ascending: true });

        if (matchesData) {
          setMatches(matchesData);
        }
      }

      // Fetch players for this team (including position coordinates)
      if (teamData?.registration_id) {
        const { data: playersData } = await supabaseClient
          .from('team_players')
          .select('id, player_name, player_image, position, player_age, position_x, position_y, is_substitute')
          .eq('team_id', teamData.registration_id);
        
        if (playersData) {
          setPlayers(playersData);
          
          // Fetch goals for this team to build leaderboards
          const { data: goalsData } = await supabaseClient
            .from('goals')
            .select(`
              scorer_id,
              assister_id,
              scorer:team_players!goals_scorer_id_fkey(id, player_name, player_image),
              assister:team_players!goals_assister_id_fkey(id, player_name, player_image)
            `)
            .eq('team_id', teamId);

          // Aggregate goals by player
          const scorersMap = {};
          const assistsMap = {};

          (goalsData || []).forEach(goal => {
            // Count goals
            if (goal.scorer_id && goal.scorer) {
              if (!scorersMap[goal.scorer_id]) {
                scorersMap[goal.scorer_id] = {
                  id: goal.scorer_id,
                  player_name: goal.scorer.player_name,
                  player_image: goal.scorer.player_image,
                  goals: 0
                };
              }
              scorersMap[goal.scorer_id].goals += 1;
            }

            // Count assists
            if (goal.assister_id && goal.assister) {
              if (!assistsMap[goal.assister_id]) {
                assistsMap[goal.assister_id] = {
                  id: goal.assister_id,
                  player_name: goal.assister.player_name,
                  player_image: goal.assister.player_image,
                  assists: 0
                };
              }
              assistsMap[goal.assister_id].assists += 1;
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
                    <span className="col-mw">#</span>
                    <span className="col-date">DATE</span>
                    <span className="col-match">MATCH</span>
                    <span className="col-score">SCORE</span>
                    <span className="col-gf">GF</span>
                    <span className="col-ga">GA</span>
                    <span className="col-pts">PTS</span>
                  </div>
                  {matchLog.map((match, index) => (
                    <div 
                      className={`match-log-row ${match.result} clickable`} 
                      key={match.id || index}
                      data-date={match.matchDate}
                      data-stats={match.status === 'completed' ? `GF: ${match.goalsFor} | GA: ${match.goalsAgainst} | PTS: ${match.points}` : 'Upcoming'}
                      onClick={() => {
                        // Navigate to match detail page
                        const category = team.category || 'open-age';
                        window.location.href = `/muqawamah/2026/${category}/fixtures/?match=${match.id}`;
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="col-mw">{match.match_number || index + 1}</span>
                      <span className="col-date">{match.matchDate}</span>
                      <span className="col-match match-teams">
                        <div className="match-team home">
                          {match.home_team?.crest_url ? (
                            <img src={match.home_team.crest_url} alt="" className="match-team-logo" />
                          ) : (
                            <div className="match-team-logo match-team-placeholder">
                              {match.home_team?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className={match.isHome ? 'team-name current' : 'team-name'}>
                            {match.home_team?.name || 'TBD'}
                          </span>
                        </div>
                        <span className="vs-separator">
                          {match.status === 'completed' ? (
                            <span className={`mobile-score ${match.result}`}>
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : (
                            <span className="scheduled-badge">
                              {match.scheduled_time || 'TBD'}
                            </span>
                          )}
                        </span>
                        <div className="match-team away">
                          {match.away_team?.crest_url ? (
                            <img src={match.away_team.crest_url} alt="" className="match-team-logo" />
                          ) : (
                            <div className="match-team-logo match-team-placeholder">
                              {match.away_team?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <span className={!match.isHome ? 'team-name current' : 'team-name'}>
                            {match.away_team?.name || 'TBD'}
                          </span>
                        </div>
                      </span>
                      <span className={`col-score match-score ${match.result}`}>
                        {match.status === 'completed' ? (
                          <>{match.home_score} - {match.away_score}</>
                        ) : (
                          <span className="scheduled-badge">
                            {match.scheduled_time || 'TBD'}
                          </span>
                        )}
                      </span>
                      <span className="col-gf">{match.goalsFor}</span>
                      <span className="col-ga">{match.goalsAgainst}</span>
                      <span className={`col-pts ${match.result}`}>{match.points}</span>
                    </div>
                  ))}
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

