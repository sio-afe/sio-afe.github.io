import React from 'react';

export default function SquadsSection({ homeTeamPlayers, awayTeamPlayers, match, goals, cards }) {
  // Sort players by position for squad display
  const sortPlayersByPosition = (players) => {
    const positionOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST', 'SUB'];
    return [...players].sort((a, b) => {
      const indexA = positionOrder.indexOf(a.position);
      const indexB = positionOrder.indexOf(b.position);
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  };

  // Calculate player stats for squad display (goals and cards)
  const getPlayerStatsForSquad = (player) => {
    if (!player) return { goalsScored: 0, assists: 0, yellowCards: 0, redCards: 0 };
    
    let goalsScored = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    
    const playerName = player.name || player.player_name || '';
    const registrationPlayerId = player.registration_player_id;
    
    // Count goals
    goals.forEach(goal => {
      let isScorer = false;
      let isAssister = false;
      
      // First try via players table
      if (registrationPlayerId) {
        if (goal.scorer_id === registrationPlayerId) isScorer = true;
        if (goal.assister_id === registrationPlayerId) isAssister = true;
      }
      
      // Fallback to team_players by name
      // IMPORTANT: Also check team_id to avoid matching players with same name on different teams
      if (!isScorer && !isAssister) {
        const scorerName = goal.scorer?.player_name || '';
        const assisterName = goal.assister?.player_name || '';
        const playerTeamId = player.team_id;
        
        if (scorerName && playerName && scorerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          // Only match if goal's team matches player's team
          if (goal.team_id === playerTeamId) {
            isScorer = true;
          }
        }
        if (assisterName && playerName && assisterName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          // Only match if goal's team matches player's team
          if (goal.team_id === playerTeamId) {
            isAssister = true;
          }
        }
      }
      
      if (isScorer) goalsScored++;
      if (isAssister) assists++;
    });

    // Count cards
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        let isCardForPlayer = false;
        
        if (registrationPlayerId && card.player_id === registrationPlayerId) {
          isCardForPlayer = true;
        }
        
        // IMPORTANT: Also check team_id to avoid matching players with same name on different teams
        if (!isCardForPlayer) {
          const cardPlayerName = card.player?.player_name || '';
          const playerTeamId = player.team_id;
          if (cardPlayerName && playerName && cardPlayerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
            // Only match if card's team matches player's team
            if (card.team_id === playerTeamId) {
              isCardForPlayer = true;
            }
          }
        }
        
        if (isCardForPlayer) {
          if (card.card_type === 'yellow') yellowCards++;
          if (card.card_type === 'red') redCards++;
        }
      });
    }
    
    return { goalsScored, assists, yellowCards, redCards };
  };

  const renderSquadColumn = (players, team, isHome) => (
    <div className={`squad-column ${isHome ? 'home' : 'away'}`}>
      <div className={`squad-header ${isHome ? '' : 'away'}`}>
        {isHome ? (
          <>
            {team?.crest_url && (
              <img 
                src={team.crest_url} 
                alt="" 
                className="squad-team-logo"
                loading="lazy"
              />
            )}
            <span>{team?.name}</span>
          </>
        ) : (
          <>
            <span>{team?.name}</span>
            {team?.crest_url && (
              <img 
                src={team.crest_url} 
                alt="" 
                className="squad-team-logo"
                loading="lazy"
              />
            )}
          </>
        )}
      </div>
      <div className="squad-list">
        {sortPlayersByPosition(players).map((player) => {
          const playerStats = getPlayerStatsForSquad(player);
          return (
            <div 
              className={`squad-player-row ${player.position === 'SUB' || player.is_substitute ? 'substitute' : ''}`} 
              key={player.id}
            >
              <span className="player-name">{player.name || player.player_name || 'Unknown'}</span>
              <div className="player-stats-icons">
                {playerStats.goalsScored > 0 && (
                  <span className="stat-icon goal-icon" title={`${playerStats.goalsScored} goal${playerStats.goalsScored > 1 ? 's' : ''}`}>
                    <span className="ball-icon-wrapper">
                      <img src="/assets/img/Muqawama/ball.svg" alt="Goal" style={{ width: '16px', height: '16px' }} />
                    </span>
                    {playerStats.goalsScored > 1 && (
                      <span className="stat-count-badge">{playerStats.goalsScored}</span>
                    )}
                  </span>
                )}
                {playerStats.yellowCards > 0 && (
                  <span className="stat-icon yellow-card-icon" title={`${playerStats.yellowCards} yellow card${playerStats.yellowCards > 1 ? 's' : ''}`}>
                    <img src="/assets/img/Muqawama/Yellow_card.svg" alt="Yellow Card" style={{ width: '14px', height: '14px' }} />
                    {playerStats.yellowCards > 1 && (
                      <span className="stat-count-badge">{playerStats.yellowCards}</span>
                    )}
                  </span>
                )}
                {playerStats.redCards > 0 && (
                  <span className="stat-icon red-card-icon" title={`${playerStats.redCards} red card${playerStats.redCards > 1 ? 's' : ''}`}>
                    <img src="/assets/img/Muqawama/Red_card.svg" alt="Red Card" style={{ width: '14px', height: '14px' }} />
                    {playerStats.redCards > 1 && (
                      <span className="stat-count-badge">{playerStats.redCards}</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {players.length === 0 && (
          <p className="no-squad">Squad not available</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="squads-section">
      <h3 className="panel-title">SQUADS</h3>
      
      <div className="squads-grid">
        {renderSquadColumn(homeTeamPlayers, match.home_team, true)}
        {renderSquadColumn(awayTeamPlayers, match.away_team, false)}
      </div>
    </div>
  );
}

