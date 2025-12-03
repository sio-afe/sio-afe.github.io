import React, { useState, useEffect, useRef } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import Footer from '../../../shared/Footer';
import TournamentNavbar from '../../../shared/TournamentNavbar';

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

const positionGroups = {
  'Goalkeeper': 'Goalkeepers',
  'Defender': 'Defenders',
  'Midfielder': 'Midfielders',
  'Forward': 'Forwards',
  'Substitute': 'Substitutes'
};

// Helper to convert image URL to webp format
const getWebpImageUrl = (url) => {
  if (!url) return null;
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Add webp transformation parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}format=webp&quality=80`;
  }
  
  // For other URLs, just return as is
  return url;
};

// Lazy loading image component
function LazyImage({ src, alt, className, style }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const webpSrc = getWebpImageUrl(src);

  return (
    <div ref={imgRef} style={{ width: '100%', height: '100%', ...style }}>
      {isInView && webpSrc && (
        <img
          src={webpSrc}
          alt={alt}
          className={className}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}
    </div>
  );
}

export default function PlayerDetail({ playerId, onBack, onNavigateToPlayer, onNavigateToMatch }) {
  const [player, setPlayer] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [playerGoals, setPlayerGoals] = useState([]);
  const [actualTeamId, setActualTeamId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerIndex, setPlayerIndex] = useState(1);
  const [matchLogTab, setMatchLogTab] = useState('completed');

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      const { data: playerData, error: playerError} = await supabaseClient
        .from('players')
        .select('id, name, player_image, position, is_substitute, team_id, registration_player_id, team:teams(id, name, crest_url)')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      if (playerData?.team_id) {
        // Fetch teammates
        const { data: allPlayers } = await supabaseClient
          .from('players')
          .select('id, name, player_image, position')
          .eq('team_id', playerData.team_id)
          .order('name', { ascending: true });
        
        if (allPlayers) {
          const idx = allPlayers.findIndex(p => p.id === playerId);
          setPlayerIndex(idx >= 0 ? idx + 1 : 1);
          setTeammates(allPlayers.filter(p => p.id !== playerId));
        }

        // Use the team data from the player record
        const teamId = playerData.team_id;
        console.log('Player team:', playerData.team);
        setActualTeamId(teamId);
        
        // Fetch matches where this team participated
        const { data: matchesData, error: matchError } = await supabaseClient
          .from('matches')
          .select(`
            id, 
            match_number,
            match_date, 
            scheduled_time,
            home_team_id, 
            away_team_id, 
            home_score, 
            away_score,
            status,
            home_team:teams!matches_home_team_id_fkey(id, name),
            away_team:teams!matches_away_team_id_fkey(id, name)
          `)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .order('match_date', { ascending: false });
        
        if (matchError) {
          console.error('Error fetching matches:', matchError);
        } else if (matchesData) {
          console.log('Found matches:', matchesData);
          setMatches(matchesData);
        }

        // Fetch goals/assists by this player using registration_player_id
        // Goals reference team_players (registration players), not tournament players
        const registrationPlayerId = playerData.registration_player_id;
        if (registrationPlayerId) {
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
              scorer:team_players!goals_scorer_id_fkey(id, player_name),
              assister:team_players!goals_assister_id_fkey(id, player_name)
            `)
            .or(`scorer_id.eq.${registrationPlayerId},assister_id.eq.${registrationPlayerId}`)
            .order('minute', { ascending: true});
          
          if (goalsData) {
            console.log('Found goals:', goalsData);
            setPlayerGoals(goalsData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching player:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position) => {
    return positionLabels[position] || position || 'Unknown';
  };

  const groupTeammates = () => {
    const groups = {};
    teammates.forEach(tm => {
      const posLabel = getPositionLabel(tm.position);
      const groupName = positionGroups[posLabel] || 'Others';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(tm);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="player-detail-loading">
        <div className="players-loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
          </div>
          <p>Loading player...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="player-detail-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Player not found</p>
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Players
        </button>
      </div>
    );
  }

  const team = player.team;
  const positionLabel = getPositionLabel(player.position);
  const groupedTeammates = groupTeammates();
  const registrationPlayerId = player.registration_player_id;

  // Calculate stats from fetched data using new schema
  const stats = {
    apps: matches.filter(m => m.status === 'completed').length,
    goals: playerGoals.filter(g => g.scorer_id === registrationPlayerId).length,
    assists: playerGoals.filter(g => g.assister_id === registrationPlayerId).length
  };

  // Build match log and split by status
  const allMatchLog = matches.map(match => {
    const isHome = match.home_team_id === actualTeamId;
    const opponent = isHome ? match.away_team?.name : match.home_team?.name;
    const teamScore = isHome ? match.home_score : match.away_score;
    const oppScore = isHome ? match.away_score : match.home_score;
    
    let result = '-';
    if (match.status === 'completed') {
      if (teamScore > oppScore) result = 'W';
      else if (teamScore < oppScore) result = 'L';
      else result = 'D';
    }
    
    const playerGoalsInMatch = playerGoals.filter(g => 
      g.match_id === match.id && g.scorer_id === registrationPlayerId
    ).length;
    
    return {
      matchId: match.id,
      matchweek: match.match_number || '-',
      date: match.match_date ? new Date(match.match_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '-',
      opponent: opponent || 'TBD',
      result: result,
      score: match.status === 'completed' ? `${teamScore}-${oppScore}` : 'vs',
      minutes: match.status === 'completed' ? '90' : '-',
      goals: playerGoalsInMatch,
      status: match.status
    };
  });

  const completedMatches = allMatchLog.filter(m => m.status === 'completed');
  const scheduledMatches = allMatchLog.filter(m => m.status !== 'completed');

  return (
    <>
      <TournamentNavbar />
      <div className="bls-player-page">
        <div className="player-hero-wrapper">
          {/* Hero Card with Photo and Gradient */}
          <div className="player-hero-card">
            {/* Team Logo Badge */}
            <div className="team-logo-badge">
              {team?.crest_url ? (
                <LazyImage src={team.crest_url} alt={team?.name} />
              ) : (
                <span className="team-initial">{team?.name?.charAt(0) || '?'}</span>
              )}
            </div>

            {/* Player Photo Container */}
            <div className="player-photo-main">
              {player.player_image ? (
                <LazyImage src={player.player_image} alt={player.name} />
              ) : (
                <div className="player-photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="player-info-gradient"></div>
              
            {/* Player Info Overlay */}
            <div className="player-info-overlay">
              <div className="player-name-position">
                <h1 className="player-name-hero">{player.name}</h1>
                <span className="player-position-hero">Position: {positionLabel}</span>
              </div>
              {playerIndex && <span className="player-number-hero">#{playerIndex}</span>}
            </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bls-content-wrapper">
          {/* Stats Grid */}
          <div className="bls-stats-grid">
            {/* Left: Main Stats */}
            <div className="bls-main-stats">
              {/* Quick Stats Bar */}
              <div className="bls-quick-stats">
                <div className="bls-stat-box">
                  <div className="bls-stat-value">{stats.goals}</div>
                  <span>Goals</span>
                </div>
                <div className="bls-stat-box">
                  <div className="bls-stat-value">{stats.assists}</div>
                  <span>Assists</span>
                </div>
              </div>

              {/* Match Log */}
              <div className="bls-match-log">
                <h4>Match Log</h4>
                
                {/* Toggle for Completed/Scheduled */}
                <div className="match-log-toggle-container">
                  <button 
                    className="match-log-toggle-btn"
                    onClick={() => setMatchLogTab(matchLogTab === 'completed' ? 'scheduled' : 'completed')}
                  >
                    <span className={`toggle-option ${matchLogTab === 'completed' ? 'active' : ''}`}>
                      Completed ({completedMatches.length})
                    </span>
                    <span className={`toggle-option ${matchLogTab === 'scheduled' ? 'active' : ''}`}>
                      Scheduled ({scheduledMatches.length})
                    </span>
                    <span 
                      className="toggle-slider" 
                      style={{ transform: matchLogTab === 'scheduled' ? 'translateX(100%)' : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* Completed Matches */}
                {matchLogTab === 'completed' && (
                  <>
                    {completedMatches.length > 0 ? (
                      <div className="match-log-table-wrapper">
                        <table className="bls-match-table">
                          <thead>
                            <tr>
                              <th>Match</th>
                              <th>Score</th>
                              <th>G</th>
                            </tr>
                          </thead>
                          <tbody>
                            {completedMatches.map((match, idx) => (
                              <tr 
                                key={idx}
                                onClick={() => onNavigateToMatch && onNavigateToMatch(match.matchId)}
                                className="match-row-clickable"
                              >
                                <td>{match.opponent}</td>
                                <td>
                                  <span className={`bls-result bls-result-${match.result}`}>
                                    {match.result}
                                  </span>
                                  <span>{match.score}</span>
                                </td>
                                <td>{match.goals}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="bls-no-data">No completed matches yet</p>
                    )}
                  </>
                )}

                {/* Scheduled Matches */}
                {matchLogTab === 'scheduled' && (
                  <>
                    {scheduledMatches.length > 0 ? (
                      <div className="match-log-table-wrapper">
                        <table className="bls-match-table">
                          <thead>
                            <tr>
                              <th>Match</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheduledMatches.map((match, idx) => (
                              <tr 
                                key={idx}
                                onClick={() => onNavigateToMatch && onNavigateToMatch(match.matchId)}
                                className="match-row-clickable"
                              >
                                <td>{match.opponent}</td>
                                <td>
                                  <span className="match-scheduled-badge">VS</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="bls-no-data">No scheduled matches</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Teammates */}
            <div className="bls-teammates">
              <h4>Teammates</h4>
              {Object.entries(groupedTeammates).map(([group, players]) => (
                <div className="bls-teammate-group" key={group}>
                  <h6>{group}</h6>
                  {players.map((tm, idx) => (
                    <a 
                      key={tm.id}
                      className="bls-teammate-row"
                      onClick={() => onNavigateToPlayer && onNavigateToPlayer(tm.id, tm.name)}
                    >
                      <div className="bls-teammate-number">{idx + 1}</div>
                      <div className="bls-teammate-image">
                        {tm.player_image ? (
                          <LazyImage src={tm.player_image} alt={tm.name} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div className="bls-teammate-name">{tm.name}</div>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="bls-back-section">
            <button onClick={onBack} className="bls-back-btn">
              <i className="fas fa-arrow-left"></i> Back to Players
            </button>
          </div>
        </div>
        </div>

        <Footer edition="2026" />
      </div>
    </>
  );
}
