import React from 'react';
import '../styles/MatchFormation.css';

/**
 * MatchFormationDisplay - Shows both teams on ONE football field
 * Home team at bottom, Away team at top (facing each other)
 */
export default function MatchFormationDisplay({ matchData }) {
  if (!matchData) return null;

  const { home_team, away_team, match } = matchData;

  // Get starting XI (non-substitutes)
  const homeStarters = home_team.players?.filter(p => !p.is_substitute) || [];
  const awayStarters = away_team.players?.filter(p => !p.is_substitute) || [];

  return (
    <div className="match-formation-container">
      {/* Match Header */}
      <div className="match-formation-header">
        <div className="team-info home">
          <img src={home_team.crest_url} alt={home_team.name} className="team-crest" />
          <div>
            <h3>{home_team.name}</h3>
            <span className="formation-label">{home_team.formation}</span>
          </div>
        </div>
        
        <div className="match-score">
          <span className="score">{match.home_score}</span>
          <span className="separator">-</span>
          <span className="score">{match.away_score}</span>
        </div>
        
        <div className="team-info away">
          <div>
            <h3>{away_team.name}</h3>
            <span className="formation-label">{away_team.formation}</span>
          </div>
          <img src={away_team.crest_url} alt={away_team.name} className="team-crest" />
        </div>
      </div>

      {/* Single Football Field with Both Teams */}
      <div className="match-football-field">
        <div className="field-surface">
          {/* Field markings */}
          <div className="center-circle"></div>
          <div className="center-line"></div>
          <div className="penalty-box top"></div>
          <div className="penalty-box bottom"></div>
          
          {/* Away Team (Top Half) - Inverted positions */}
          <div className="team-formation away-side">
            {awayStarters.map((player, index) => (
              <div
                key={player.id || index}
                className="player-marker away"
                style={{
                  left: `${100 - player.position_x}%`, // Mirror horizontally
                  top: `${100 - player.position_y}%`   // Flip to top half
                }}
              >
                <div className="player-circle">
                  {player.player_image ? (
                    <img src={player.player_image} alt={player.name} />
                  ) : (
                    <span className="player-initial">{player.position}</span>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-position">{player.position}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Home Team (Bottom Half) - Normal positions */}
          <div className="team-formation home-side">
            {homeStarters.map((player, index) => (
              <div
                key={player.id || index}
                className="player-marker home"
                style={{
                  left: `${player.position_x}%`,
                  top: `${player.position_y}%`
                }}
              >
                <div className="player-circle">
                  {player.player_image ? (
                    <img src={player.player_image} alt={player.name} />
                  ) : (
                    <span className="player-initial">{player.position}</span>
                  )}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-position">{player.position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Substitutes */}
      <div className="substitutes-section">
        <div className="subs-column">
          <h4>{home_team.name} - Substitutes</h4>
          <div className="subs-list">
            {home_team.players?.filter(p => p.is_substitute).map((player, index) => (
              <div key={player.id || index} className="sub-player">
                {player.player_image && (
                  <img src={player.player_image} alt={player.name} className="sub-photo" />
                )}
                <span className="sub-name">{player.name}</span>
                <span className="sub-position">{player.position}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="subs-column">
          <h4>{away_team.name} - Substitutes</h4>
          <div className="subs-list">
            {away_team.players?.filter(p => p.is_substitute).map((player, index) => (
              <div key={player.id || index} className="sub-player">
                {player.player_image && (
                  <img src={player.player_image} alt={player.name} className="sub-photo" />
                )}
                <span className="sub-name">{player.name}</span>
                <span className="sub-position">{player.position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Timeline */}
      {matchData.goals && matchData.goals.length > 0 && (
        <div className="goals-timeline">
          <h4>Goals</h4>
          <div className="goals-list">
            {matchData.goals.map((goal, index) => (
              <div key={goal.id || index} className="goal-item">
                <span className="goal-minute">{goal.minute}'</span>
                <span className="goal-icon">⚽</span>
                <span className="goal-scorer">{goal.scorer_name}</span>
                <span className="goal-team">({goal.team_name})</span>
                {goal.assist_name && (
                  <span className="goal-assist">Assist: {goal.assist_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

