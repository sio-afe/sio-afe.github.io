import React, { useState, useEffect } from 'react';
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
  'Goalkeeper': 'GOALKEEPERS',
  'Defender': 'DEFENDERS',
  'Midfielder': 'MIDFIELDERS',
  'Forward': 'FORWARDS',
  'Substitute': 'SUBSTITUTES'
};

export default function PlayerDetail({ playerId, onBack, onNavigateToPlayer }) {
  const [player, setPlayer] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      // Fetch player with team info - only necessary fields
      const { data: playerData, error: playerError } = await supabaseClient
        .from('team_players')
        .select('id, player_name, player_image, position, player_age, team_id, team_registrations(id, team_name, team_logo)')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // Fetch teammates in parallel - only necessary fields
      if (playerData?.team_id) {
        supabaseClient
          .from('team_players')
          .select('id, player_name, player_image, position')
          .eq('team_id', playerData.team_id)
          .neq('id', playerId)
          .then(({ data }) => {
            if (data) setTeammates(data);
          });
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
      const groupName = positionGroups[posLabel] || 'OTHERS';
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

  const team = player.team_registrations;
  const positionLabel = getPositionLabel(player.position);
  const groupedTeammates = groupTeammates();

  // Mock stats - these would come from a stats table in real implementation
  const stats = {
    apps: player.stats?.apps || 0,
    goals: player.stats?.goals || 0,
    assists: player.stats?.assists || 0
  };

  // Mock match log
  const matchLog = player.match_log || [];

  return (
    <>
      <TournamentNavbar />
      <div className="player-detail">
        {/* Hero Section */}
        <div className="player-hero">
        <div className="player-hero-bg"></div>
        
        {/* Top Logos */}
        <div className="hero-logos">
          <div className="team-logo-hero">
            {team?.team_logo ? (
              <img src={team.team_logo} alt={team.team_name} />
            ) : (
              <span>{team?.team_name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="tournament-logo-hero">
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" />
          </div>
        </div>

        {/* Player Content */}
        <div className="player-hero-content">
          <div className="player-photo-hero">
            {player.player_image ? (
              <img src={player.player_image} alt={player.player_name} />
            ) : (
              <div className="player-photo-placeholder-hero">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className="player-info-hero">
            <h1 className="player-name-hero">{player.player_name}</h1>
            <div className="player-meta-hero">
              <span className="meta-label">Position:</span>
              <span className="meta-value">{positionLabel}</span>
              <span className="meta-label">Age:</span>
              <span className="meta-value">{player.player_age || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="player-detail-body">
        <div className="player-detail-main">
          {/* Season Header */}
          <div className="season-header">
            <h2 className="section-title-italic">SEASONS</h2>
            <div className="season-selector">
              <span>2026</span>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats-card">
            <div className="quick-stat">
              <span className="stat-value-big">{stats.apps}</span>
              <span className="stat-label">APPS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="quick-stat">
              <span className="stat-value-big">{stats.goals}</span>
              <span className="stat-label">GOALS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="quick-stat">
              <span className="stat-value-big">{stats.assists}</span>
              <span className="stat-label">ASSISTS</span>
            </div>
          </div>

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
                  <span>MP</span>
                  <span>G</span>
                  <span>Y</span>
                  <span>R</span>
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
                    <span>{match.minutes}</span>
                    <span>{match.goals}</span>
                    <span>{match.yellows}</span>
                    <span>{match.reds}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-matches">
                <p>No matches played yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Teammates */}
        <div className="player-detail-sidebar">
          <h3 className="section-title">TEAMMATES</h3>
          <div className="teammates-list">
            {Object.entries(groupedTeammates).map(([group, players]) => (
              <div className="teammate-group" key={group}>
                <h4 className="teammate-group-title">{group}</h4>
                {players.map((tm, idx) => (
                  <div 
                    className="teammate-row" 
                    key={tm.id}
                    onClick={() => onNavigateToPlayer && onNavigateToPlayer(tm.id, tm.player_name)}
                  >
                    <span className="teammate-number">{idx + 1}</span>
                    <div className="teammate-photo">
                      {tm.player_image ? (
                        <img src={tm.player_image} alt={tm.player_name} />
                      ) : (
                        <i className="fas fa-user"></i>
                      )}
                    </div>
                    <span className="teammate-name">{tm.player_name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="player-detail-footer">
        <button onClick={onBack} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Players
        </button>
      </div>

        <Footer edition="2026" />
      </div>
    </>
  );
}

