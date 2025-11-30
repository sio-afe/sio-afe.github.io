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
  'Goalkeeper': 'Goalkeepers',
  'Defender': 'Defenders',
  'Midfielder': 'Midfielders',
  'Forward': 'Forwards',
  'Substitute': 'Substitutes'
};

export default function PlayerDetail({ playerId, onBack, onNavigateToPlayer }) {
  const [player, setPlayer] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerIndex, setPlayerIndex] = useState(1);

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      const { data: playerData, error: playerError } = await supabaseClient
        .from('team_players')
        .select('id, player_name, player_image, position, player_age, is_substitute, team_id, team_registrations(id, team_name, team_logo)')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      if (playerData?.team_id) {
        const { data: allPlayers } = await supabaseClient
          .from('team_players')
          .select('id, player_name, player_image, position')
          .eq('team_id', playerData.team_id)
          .order('player_name', { ascending: true });
        
        if (allPlayers) {
          const idx = allPlayers.findIndex(p => p.id === playerId);
          setPlayerIndex(idx >= 0 ? idx + 1 : 1);
          setTeammates(allPlayers.filter(p => p.id !== playerId));
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

  const team = player.team_registrations;
  const positionLabel = getPositionLabel(player.position);
  const groupedTeammates = groupTeammates();

  // Stats (would come from DB in real implementation)
  const stats = {
    apps: 0,
    goals: 0,
    assists: 0
  };

  const matchLog = [];

  return (
    <>
      <TournamentNavbar />
      <div className="bls-player-page">
        {/* Hero Section with Background */}
        <div className="bls-hero-section">
          <div className="bls-hero-content">
            {/* Team Logo */}
            <div className="bls-team-logo">
              {team?.team_logo ? (
                <img src={team.team_logo} alt={team?.team_name} />
              ) : (
                <span>{team?.team_name?.charAt(0) || '?'}</span>
              )}
            </div>

            {/* Player Photo */}
            <div className="bls-player-photo">
              {player.player_image ? (
                <img src={player.player_image} alt={player.player_name} />
              ) : (
                <div className="bls-photo-placeholder">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="bls-player-info">
              <h1>{player.player_name}</h1>
              <p>
                <b>Position:</b> {positionLabel}
                &nbsp;&nbsp;
                <b>Age:</b> {player.player_age || '-'}
              </p>
            </div>

            {/* Player Number */}
            <span className="bls-player-number">#{playerIndex}</span>
          </div>
          <hr />
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
                {matchLog.length > 0 ? (
                  <table className="bls-match-table">
                    <thead>
                      <tr>
                        <th>MW</th>
                        <th>Date</th>
                        <th>Match</th>
                        <th>Score</th>
                        <th>MP</th>
                        <th>G</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchLog.map((match, idx) => (
                        <tr key={idx}>
                          <td>{match.matchweek}</td>
                          <td>{match.date}</td>
                          <td>{match.opponent}</td>
                          <td>
                            <span className={`bls-result bls-result-${match.result}`}>
                              {match.result}
                            </span>
                            <span>{match.score}</span>
                          </td>
                          <td>{match.minutes}</td>
                          <td>{match.goals}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="bls-no-data">No matches played yet</p>
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
                      onClick={() => onNavigateToPlayer && onNavigateToPlayer(tm.id, tm.player_name)}
                    >
                      <div className="bls-teammate-number">{idx + 1}</div>
                      <div className="bls-teammate-image">
                        {tm.player_image ? (
                          <img src={tm.player_image} alt={tm.player_name} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div className="bls-teammate-name">{tm.player_name}</div>
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

        <Footer edition="2026" />
      </div>
    </>
  );
}
