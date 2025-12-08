import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import MatchFormationField from '../../../shared/MatchFormationField';

export default function MatchDetail({ matchId, onBack }) {
  const [match, setMatch] = useState(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchMatchData();
    }
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);

      // Fetch match details
      const { data: matchData, error: matchError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;
      setMatch(matchData);

      // Fetch goals for this match with player details
      const { data: goalsData } = await supabaseClient
        .from('goals')
        .select(`
          id,
          match_id,
          team_id,
          scorer_id,
          assister_id,
          minute,
          goal_type,
          scorer:team_players!goals_scorer_id_fkey(player_name, player_image),
          assister:team_players!goals_assister_id_fkey(player_name, player_image)
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: true });

      if (goalsData) {
        setGoals(goalsData);
      }

      // Fetch home team players (with position coordinates)
      if (matchData.home_team?.registration_id) {
        const { data: homePlayers } = await supabaseClient
          .from('team_players')
          .select('*')
          .eq('team_id', matchData.home_team.registration_id)
          .order('position');
        
        if (homePlayers) setHomeTeamPlayers(homePlayers);
      }

      // Fetch away team players (with position coordinates)
      if (matchData.away_team?.registration_id) {
        const { data: awayPlayers } = await supabaseClient
          .from('team_players')
          .select('*')
          .eq('team_id', matchData.away_team.registration_id)
          .order('position');
        
        if (awayPlayers) setAwayTeamPlayers(awayPlayers);
      }

    } catch (error) {
      console.error('Error fetching match:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString.substring(0, 5);
  };

  const getPositionLabel = (position) => {
    const labels = {
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
    return labels[position] || position || 'Player';
  };

  // Sort players by position for squad display
  const sortPlayersByPosition = (players) => {
    const positionOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST', 'SUB'];
    return [...players].sort((a, b) => {
      const indexA = positionOrder.indexOf(a.position);
      const indexB = positionOrder.indexOf(b.position);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  };

  // Group goals by scorer to count goals and assists
  const getPlayerStats = () => {
    const statsMap = {};
    
    goals.forEach(goal => {
      // Count goals (using new schema: scorer_id and scorer object)
      if (goal.scorer?.player_name) {
        const scorerName = goal.scorer.player_name;
        if (!statsMap[scorerName]) {
          statsMap[scorerName] = { 
            name: scorerName, 
            goals: 0, 
            assists: 0,
            team_id: goal.team_id 
          };
        }
        statsMap[scorerName].goals += 1;
      }
      
      // Count assists (using new schema: assister_id and assister object)
      if (goal.assister?.player_name) {
        const assisterName = goal.assister.player_name;
        if (!statsMap[assisterName]) {
          statsMap[assisterName] = { 
            name: assisterName, 
            goals: 0, 
            assists: 0,
            team_id: goal.team_id 
          };
        }
        statsMap[assisterName].assists += 1;
      }
    });
    
    // Convert to array and sort by goals, then assists
    return Object.values(statsMap).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return b.assists - a.assists;
    });
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="match-detail-loading">
          <div className="fixtures-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
            </div>
            <p>Loading match details...</p>
          </div>
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  if (!match) {
    return (
      <>
        <TournamentNavbar />
        <div className="match-detail-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Match not found</p>
         
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  const isFinished = match.status === 'completed';
  const isLive = match.status === 'live';
  const hasScore = isFinished || isLive;
  const playerStats = getPlayerStats();

  const getMatchStatusBadge = () => {
    if (match.status === 'completed') {
      return { label: 'FULL TIME', className: 'status-completed' };
    } else if (match.status === 'live') {
      return { label: 'LIVE', className: 'status-live' };
    } else if (match.status === 'scheduled') {
      return { label: 'SCHEDULED', className: 'status-scheduled' };
    }
    return { label: 'UPCOMING', className: 'status-scheduled' };
  };

  const getMatchTypeLabel = () => {
    const matchType = match.match_type?.toLowerCase();
    if (!matchType || matchType === 'group') return 'Group Stage';
    if (matchType === 'quarter-final' || matchType === 'quarterfinal') return 'Quarter Final';
    if (matchType === 'semi-final' || matchType === 'semifinal') return 'Semi Final';
    if (matchType === 'final') return 'Final';
    if (matchType === 'third-place' || matchType === 'thirdplace') return '3rd Place';
    return matchType.charAt(0).toUpperCase() + matchType.slice(1);
  };

  const statusBadge = getMatchStatusBadge();

  return (
    <>
      <TournamentNavbar />
      <div className="match-detail-page">
        {/* Match Header */}
        <section className="match-header-section">
          <div className="match-header-content">
            <div className="match-datetime">
              <p className="match-date">{formatDate(match.match_date)}</p>
              <p className="match-time">{formatTime(match.scheduled_time)}</p>
            </div>

            <div className="match-teams-header">
              {/* Home Team */}
              <div className="header-team home">
                <div className="team-logo-large">
                  {match.home_team?.crest_url ? (
                    <img 
                      src={match.home_team.crest_url} 
                      alt={match.home_team.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{match.home_team?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h4 className="team-name-header">{match.home_team?.name || 'TBD'}</h4>
              </div>

              {/* Score */}
              <div className="match-score-header">
                {hasScore ? (
                  <span className={`score-big ${isLive ? 'live' : ''}`}>{match.home_score ?? 0} - {match.away_score ?? 0}</span>
                ) : (
                  <span className="score-vs">VS</span>
                )}
                {/* Match Type Label */}
                <span className="match-type-label">{getMatchTypeLabel()}</span>
                {/* Match Status Badge */}
                <span className={`match-status-badge-detail ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Away Team */}
              <div className="header-team away">
                <div className="team-logo-large">
                  {match.away_team?.crest_url ? (
                    <img 
                      src={match.away_team.crest_url} 
                      alt={match.away_team.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>{match.away_team?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h4 className="team-name-header">{match.away_team?.name || 'TBD'}</h4>
              </div>
            </div>

            <div className="match-meta">
              <p className="matchday-label">MATCHDAY {match.match_number || 1}</p>
              {match.venue && <p className="venue-label">{match.venue}</p>}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="match-detail-content">
          <div className="match-detail-single-column">
            {/* Goals Timeline - Compact */}
            <div className="goals-panel-compact">
              <h3 className="panel-title-compact">
                <i className="fas fa-futbol"></i>
                Goals
              </h3>
              
              {goals.length > 0 ? (
                <div className="goals-list-compact">
                  {goals.map((goal, idx) => {
                    const isHomeGoal = goal.team_id === match.home_team_id;
                    return (
                      <div key={idx} className={`goal-row-compact ${isHomeGoal ? 'home' : 'away'}`}>
                        <span className="goal-minute-compact">{goal.minute}'</span>
                        <span className="goal-scorer-compact">{goal.scorer?.player_name || 'Unknown'}</span>
                        {goal.assister?.player_name && (
                          <span className="goal-assist-compact">({goal.assister.player_name})</span>
                        )}
                        <span className="goal-team-compact">{isHomeGoal ? match.home_team?.name : match.away_team?.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-goals-compact">
                  {isFinished ? 'No goals' : 'Goals will appear here'}
                </p>
              )}
            </div>

            {/* Formation Display - Both Teams */}
            <div className="formation-section">
              <h3 className="panel-title">FORMATIONS</h3>
              <MatchFormationField
                homePlayers={homeTeamPlayers}
                awayPlayers={awayTeamPlayers}
                homeTeam={match.home_team}
                awayTeam={match.away_team}
                goals={goals}
              />
            </div>

            {/* Squads Section */}
            <div className="squads-section">
              <h3 className="panel-title">SQUADS</h3>
              
              <div className="squads-grid">
                {/* Home Team Squad */}
                <div className="squad-column home">
                  <div className="squad-header">
                    {match.home_team?.crest_url && (
                      <img 
                        src={match.home_team.crest_url} 
                        alt="" 
                        className="squad-team-logo"
                        loading="lazy"
                      />
                    )}
                    <span>{match.home_team?.name}</span>
                  </div>
                  <div className="squad-list">
                    {sortPlayersByPosition(homeTeamPlayers).map((player, idx) => (
                      <div className={`squad-player-row ${player.position === 'SUB' || player.is_substitute ? 'substitute' : ''}`} key={player.id}>
                        <span className="player-name">{player.player_name}</span>
                        <span className="player-position">{getPositionLabel(player.position)}</span>
                      </div>
                    ))}
                    {homeTeamPlayers.length === 0 && (
                      <p className="no-squad">Squad not available</p>
                    )}
                  </div>
                </div>

                {/* Away Team Squad */}
                <div className="squad-column away">
                  <div className="squad-header away">
                    <span>{match.away_team?.name}</span>
                    {match.away_team?.crest_url && (
                      <img 
                        src={match.away_team.crest_url} 
                        alt="" 
                        className="squad-team-logo"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="squad-list">
                    {sortPlayersByPosition(awayTeamPlayers).map((player, idx) => (
                      <div className={`squad-player-row ${player.position === 'SUB' || player.is_substitute ? 'substitute' : ''}`} key={player.id}>
                        <span className="player-name">{player.player_name}</span>
                        <span className="player-position">{getPositionLabel(player.position)}</span>
                      </div>
                    ))}
                    {awayTeamPlayers.length === 0 && (
                      <p className="no-squad">Squad not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="match-detail-footer">
          
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}
