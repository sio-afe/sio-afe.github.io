import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../lib/supabaseClient';

/**
 * Combined Match Formation Field
 * Shows both teams on the same dark field - home team on top, away team on bottom
 * Both teams face each other with strikers meeting near the center
 */
export default function MatchFormationField({ 
  homePlayers = [], 
  awayPlayers = [], 
  homeTeam = {},
  awayTeam = {},
  goals = [],
  cards = []
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isHome, setIsHome] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [overallPlayerStats, setOverallPlayerStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Filter starters only (exclude substitutes)
  const homeStarters = homePlayers.filter(p => !p.is_substitute && p.position !== 'SUB').slice(0, 7);
  const awayStarters = awayPlayers.filter(p => !p.is_substitute && p.position !== 'SUB').slice(0, 7);

  // Calculate player stats from goals and cards
  // Priority: 1) Match via players table (registration_player_id), 2) Fallback to team_players table (name matching)
  const getPlayerStats = (player) => {
    if (!player) return { goalsScored: 0, assists: 0, yellowCards: 0, redCards: 0 };
    
    let goalsScored = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    
    // Get player identifiers
    const playerName = player.name || player.player_name || '';
    const registrationPlayerId = player.registration_player_id;
    
    goals.forEach(goal => {
      let isScorer = false;
      let isAssister = false;
      
      // FIRST: Try to match via players table using registration_player_id
      // This is the primary method for tournament players
      if (registrationPlayerId) {
        if (goal.scorer_id === registrationPlayerId) {
          isScorer = true;
        }
        if (goal.assister_id === registrationPlayerId) {
          isAssister = true;
        }
      }
      
      // FALLBACK: If no match via players table, try team_players table by name
      // This handles cases where player might not be in players table yet
      if (!isScorer && !isAssister) {
        const scorerName = goal.scorer?.player_name || '';
        const assisterName = goal.assister?.player_name || '';
        
        if (scorerName && playerName && scorerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          isScorer = true;
        }
        if (assisterName && playerName && assisterName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
          isAssister = true;
        }
      }
      
      if (isScorer) goalsScored++;
      if (isAssister) assists++;
    });

    // Count cards for this player
    if (cards && cards.length > 0) {
      cards.forEach(card => {
        let isCardForPlayer = false;
        
        // FIRST: Try to match via players table
        if (registrationPlayerId && card.player_id === registrationPlayerId) {
          isCardForPlayer = true;
        }
        
        // FALLBACK: Try to match via team_players table by name
        if (!isCardForPlayer) {
          const cardPlayerName = card.player?.player_name || '';
          if (cardPlayerName && playerName && cardPlayerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
            isCardForPlayer = true;
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

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePlayerClick = (player, isHomeTeam) => {
    setSelectedPlayer(player);
    setIsHome(isHomeTeam);
    setOverallPlayerStats(null); // Reset stats when selecting new player
  };

  // Fetch overall player statistics when a player is selected
  useEffect(() => {
    const fetchOverallStats = async () => {
      if (!selectedPlayer) {
        setOverallPlayerStats(null);
        return;
      }

      setLoadingStats(true);
      try {
        const playerName = selectedPlayer.name || selectedPlayer.player_name || '';
        const registrationPlayerId = selectedPlayer.registration_player_id;

        // Fetch all goals for this player across all matches
        let allGoals = [];
        if (registrationPlayerId) {
          // Fetch goals where this player is scorer or assister
          const { data: goalsAsScorer } = await supabaseClient
            .from('goals')
            .select('id, scorer_id, assister_id')
            .eq('scorer_id', registrationPlayerId);

          const { data: goalsAsAssister } = await supabaseClient
            .from('goals')
            .select('id, scorer_id, assister_id')
            .eq('assister_id', registrationPlayerId);

          // Combine and deduplicate by goal id
          const goalsMap = new Map();
          (goalsAsScorer || []).forEach(goal => goalsMap.set(goal.id, goal));
          (goalsAsAssister || []).forEach(goal => goalsMap.set(goal.id, goal));
          allGoals = Array.from(goalsMap.values());
        }

        // Also try to fetch by name if we have player name and no goals found by ID
        if (playerName && allGoals.length === 0) {
          // Get all goals and filter by name matching
          const { data: allGoalsData } = await supabaseClient
            .from('goals')
            .select(`
              id,
              scorer_id,
              assister_id,
              scorer:team_players!goals_scorer_id_fkey(player_name),
              assister:team_players!goals_assister_id_fkey(player_name)
            `);

          if (allGoalsData) {
            allGoals = allGoalsData.filter(goal => {
              const scorerName = goal.scorer?.player_name || '';
              const assisterName = goal.assister?.player_name || '';
              return (
                (scorerName && scorerName.toLowerCase().trim() === playerName.toLowerCase().trim()) ||
                (assisterName && assisterName.toLowerCase().trim() === playerName.toLowerCase().trim())
              );
            });
          }
        }

        // Fetch all cards for this player across all matches
        let allCards = [];
        if (registrationPlayerId) {
          const { data: cardsData } = await supabaseClient
            .from('cards')
            .select('id, player_id, card_type')
            .eq('player_id', registrationPlayerId);

          allCards = cardsData || [];
        }

        // Also try to fetch by name if we have player name and no cards found by ID
        if (playerName && allCards.length === 0) {
          const { data: allCardsData } = await supabaseClient
            .from('cards')
            .select(`
              id,
              player_id,
              card_type,
              player:team_players!cards_player_id_fkey(player_name)
            `);

          if (allCardsData) {
            allCards = allCardsData.filter(card => {
              const cardPlayerName = card.player?.player_name || '';
              return cardPlayerName && cardPlayerName.toLowerCase().trim() === playerName.toLowerCase().trim();
            });
          }
        }

        // Calculate overall stats
        let goalsScored = 0;
        let assists = 0;
        let yellowCards = 0;
        let redCards = 0;

        allGoals.forEach(goal => {
          if (registrationPlayerId) {
            if (goal.scorer_id === registrationPlayerId) goalsScored++;
            if (goal.assister_id === registrationPlayerId) assists++;
          } else {
            const scorerName = goal.scorer?.player_name || '';
            const assisterName = goal.assister?.player_name || '';
            if (scorerName && scorerName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
              goalsScored++;
            }
            if (assisterName && assisterName.toLowerCase().trim() === playerName.toLowerCase().trim()) {
              assists++;
            }
          }
        });

        allCards.forEach(card => {
          if (card.card_type === 'yellow') yellowCards++;
          if (card.card_type === 'red') redCards++;
        });

        setOverallPlayerStats({
          goalsScored,
          assists,
          yellowCards,
          redCards
        });
      } catch (error) {
        console.error('Error fetching overall player stats:', error);
        setOverallPlayerStats({ goalsScored: 0, assists: 0, yellowCards: 0, redCards: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchOverallStats();
  }, [selectedPlayer]);

  const closeModal = () => {
    setSelectedPlayer(null);
  };

  // Calculate position for home team (top half)
  const getHomePlayerPosition = (player) => {
    const x = typeof player.position_x === 'number' ? player.position_x : 50;
    const y = typeof player.position_y === 'number' ? player.position_y : 50;
    const invertedY = 100 - y;
    const mappedY = 4 + (invertedY / 100) * 44;
    return { x, y: mappedY };
  };

  // Calculate position for away team (bottom half)
  const getAwayPlayerPosition = (player) => {
    const x = typeof player.position_x === 'number' ? player.position_x : 50;
    const y = typeof player.position_y === 'number' ? player.position_y : 50;
    const mappedY = 52 + (y / 100) * 44;
    return { x, y: mappedY };
  };

  const hasFormation = homeStarters.length > 0 || awayStarters.length > 0;

  if (!hasFormation) {
    return (
      <div className="match-formation-empty">
        <i className="fas fa-users-slash"></i>
        <p>Formation not available</p>
      </div>
    );
  }

  // Use overall stats for modal, match-specific stats for field icons
  const matchPlayerStats = selectedPlayer ? getPlayerStats(selectedPlayer) : null;
  const playerAge = selectedPlayer ? calculateAge(selectedPlayer.date_of_birth) : null;
  // Use overall stats in modal, fallback to match stats if overall not loaded yet
  const displayStats = overallPlayerStats !== null ? overallPlayerStats : matchPlayerStats;

  return (
    <div className="match-formation-field">
      <div className="formation-field-wrapper">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 74 111"
          className="match-field-svg"
        >
          {/* Dark background */}
          <rect width="74" height="111" fill="#0d1117"/>
          
          {/* Field markings */}
          <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" transform="translate(3 3)">
            <path d="M 0 0 h 68 v 105 h -68 Z"/>
            <path d="M 0 52.5 h 68"/>
            <circle r="9.15" cx="34" cy="52.5"/>
            <circle r="0.75" cx="34" cy="52.5" fill="rgba(255,255,255,0.35)" stroke="none"/>
            <g>
              <path d="M 13.84 0 v 16.5 h 40.32 v -16.5"/>
              <path d="M 24.84 0 v 5.5 h 18.32 v -5.5"/>
              <circle r="0.75" cx="34" cy="10.94" fill="rgba(255,255,255,0.35)" stroke="none"/>
              <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0"/>
            </g>
            <g transform="rotate(180,34,52.5)">
              <path d="M 13.84 0 v 16.5 h 40.32 v -16.5"/>
              <path d="M 24.84 0 v 5.5 h 18.32 v -5.5"/>
              <circle r="0.75" cx="34" cy="10.94" fill="rgba(255,255,255,0.35)" stroke="none"/>
              <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0"/>
            </g>
            <path d="M 0 2 a 2 2 0 0 0 2 -2M 66 0 a 2 2 0 0 0 2 2M 68 103 a 2 2 0 0 0 -2 2M 2 105 a 2 2 0 0 0 -2 -2"/>
          </g>

          {/* Home Team Players */}
          {homeStarters.map((player) => {
            const pos = getHomePlayerPosition(player);
            const svgX = 3 + (pos.x / 100) * 68;
            const svgY = 3 + (pos.y / 100) * 105;
            const playerStats = getPlayerStats(player);
            const hasGoals = playerStats.goalsScored > 0;
            const hasYellowCard = playerStats.yellowCards > 0;
            const hasRedCard = playerStats.redCards > 0;
            
            return (
              <g 
                key={`home-${player.id}`} 
                transform={`translate(${svgX}, ${svgY})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handlePlayerClick(player, true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayerClick(player, true); }}
              >
                <circle r="3.8" fill="none" stroke="#4a90e2" strokeWidth="0.3"/>
                <circle r="3" fill="#1e2a38" stroke="none"/>
                {player.player_image ? (
                  <>
                    <defs>
                      <clipPath id={`clip-home-${player.id}`}>
                        <circle r="3" cx="0" cy="0" />
                      </clipPath>
                    </defs>
                    <image 
                      href={player.player_image} 
                      x="-3" y="-3" width="6" height="6" 
                      clipPath={`url(#clip-home-${player.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </>
                ) : (
                  <text x="0" y="1" textAnchor="middle" fill="#4a90e2" fontSize="2.2" fontWeight="700">
                    {player.position || '?'}
                  </text>
                )}
                <text x="0" y="6.5" textAnchor="middle" fill="#4a90e2" fontSize="1.8" fontWeight="600">
                  {player.name?.split(' ')[0]?.substring(0, 8) || player.player_name?.split(' ')[0]?.substring(0, 8) || ''}
                </text>
                {/* Football icon - only show if player has goals, positioned on border edge (top-right) */}
                {hasGoals && (
                  <g transform="translate(2.7, -2.7)">
                    <circle r="1.2" fill="#fff" opacity="0.98"/>
                    <image 
                      href="/assets/img/Muqawama/ball.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                    {/* Goal count badge on ball corner (top-right of ball) */}
                    {playerStats.goalsScored > 1 && (
                      <g>
                        <circle cx="0.9" cy="-0.9" r="0.65" fill="#fff" stroke="#000" strokeWidth="0.18"/>
                        <text x="0.9" y="-0.75" textAnchor="middle" fontSize="0.75" fill="#000" fontWeight="700">
                          {playerStats.goalsScored}
                        </text>
                      </g>
                    )}
                  </g>
                )}
                {/* Yellow card icon - positioned on border edge (top-left) */}
                {hasYellowCard && (
                  <g transform="translate(-2.7, -2.7)">
                    <image 
                      href="/assets/img/Muqawama/Yellow_card.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
                {/* Red card icon - positioned on border edge (bottom-right) */}
                {hasRedCard && (
                  <g transform="translate(2.7, 2.7)">
                    <image 
                      href="/assets/img/Muqawama/Red_card.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Away Team Players */}
          {awayStarters.map((player) => {
            const pos = getAwayPlayerPosition(player);
            const svgX = 3 + (pos.x / 100) * 68;
            const svgY = 3 + (pos.y / 100) * 105;
            const playerStats = getPlayerStats(player);
            const hasGoals = playerStats.goalsScored > 0;
            const hasYellowCard = playerStats.yellowCards > 0;
            const hasRedCard = playerStats.redCards > 0;
            
            return (
              <g 
                key={`away-${player.id}`} 
                transform={`translate(${svgX}, ${svgY})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handlePlayerClick(player, false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayerClick(player, false); }}
              >
                <circle r="3.8" fill="none" stroke="#e63946" strokeWidth="0.3"/>
                <circle r="3" fill="#2a1e1e" stroke="none"/>
                {player.player_image ? (
                  <>
                    <defs>
                      <clipPath id={`clip-away-${player.id}`}>
                        <circle r="3" cx="0" cy="0" />
                      </clipPath>
                    </defs>
                    <image 
                      href={player.player_image} 
                      x="-3" y="-3" width="6" height="6" 
                      clipPath={`url(#clip-away-${player.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </>
                ) : (
                  <text x="0" y="1" textAnchor="middle" fill="#e63946" fontSize="2.2" fontWeight="700">
                    {player.position || '?'}
                  </text>
                )}
                <text x="0" y="6.5" textAnchor="middle" fill="#e63946" fontSize="1.8" fontWeight="600">
                  {player.name?.split(' ')[0]?.substring(0, 8) || player.player_name?.split(' ')[0]?.substring(0, 8) || ''}
                </text>
                {/* Football icon - only show if player has goals, positioned on border edge (top-right) */}
                {hasGoals && (
                  <g transform="translate(2.7, -2.7)">
                    <circle r="1.2" fill="#fff" opacity="0.98"/>
                    <image 
                      href="/assets/img/Muqawama/ball.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                    {/* Goal count badge on ball corner (top-right of ball) */}
                    {playerStats.goalsScored > 1 && (
                      <g>
                        <circle cx="0.9" cy="-0.9" r="0.65" fill="#fff" stroke="#000" strokeWidth="0.18"/>
                        <text x="0.9" y="-0.75" textAnchor="middle" fontSize="0.75" fill="#000" fontWeight="700">
                          {playerStats.goalsScored}
                        </text>
                      </g>
                    )}
                  </g>
                )}
                {/* Yellow card icon - positioned on border edge (top-left) */}
                {hasYellowCard && (
                  <g transform="translate(-2.7, -2.7)">
                    <image 
                      href="/assets/img/Muqawama/Yellow_card.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
                {/* Red card icon - positioned on border edge (bottom-right) */}
                {hasRedCard && (
                  <g transform="translate(2.7, 2.7)">
                    <image 
                      href="/assets/img/Muqawama/Red_card.svg"
                      x="-1.2"
                      y="-1.2"
                      width="2.4"
                      height="2.4"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Formation Legend */}
      <div className="formation-legend">
        <div className="legend-item home">
          <span className="legend-dot home"></span>
          <span>{homeTeam.name || 'Home'} {homeTeam.formation && `(${homeTeam.formation})`}</span>
        </div>
        <div className="legend-item away">
          <span className="legend-dot away"></span>
          <span>{awayTeam.name || 'Away'} {awayTeam.formation && `(${awayTeam.formation})`}</span>
        </div>
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="player-modal-overlay" onClick={closeModal}>
          <div className="player-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="player-modal-close" onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className={`player-modal-header ${isHome ? 'home' : 'away'}`}>
              <div className="player-modal-image">
                {selectedPlayer.player_image ? (
                  <img src={selectedPlayer.player_image} alt={selectedPlayer.name || selectedPlayer.player_name} />
                ) : (
                  <div className="player-modal-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                <div className={`player-modal-ring ${isHome ? 'home' : 'away'}`}></div>
              </div>
              <h3 className="player-modal-name">{selectedPlayer.name || selectedPlayer.player_name}</h3>
              <p className="player-modal-team">
                {isHome ? homeTeam.name : awayTeam.name}
              </p>
            </div>

            <div className="player-modal-stats">
              <table className="player-stats-table-modal">
                <tbody>
                  <tr>
                    <td className="stat-label">Position</td>
                    <td className="stat-value">{selectedPlayer.position || 'N/A'}</td>
                  </tr>
                  {playerAge && (
                    <tr>
                      <td className="stat-label">Age</td>
                      <td className="stat-value">{playerAge} years</td>
                    </tr>
                  )}
                  <tr>
                    <td className="stat-label">Goals</td>
                    <td className="stat-value stat-highlight goals">
                      {loadingStats ? '...' : (displayStats?.goalsScored || 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="stat-label">Assists</td>
                    <td className="stat-value stat-highlight assists">
                      {loadingStats ? '...' : (displayStats?.assists || 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button 
              className="player-modal-view-btn"
              disabled={isNavigating}
              onClick={async () => {
                if (isNavigating) return;
                setIsNavigating(true);
                
                try {
                  // selectedPlayer is already from players table, so we can use its id directly
                  const category = window.location.pathname.includes('/u17/') ? 'u17' : 'open-age';
                  window.location.href = `/muqawamah/2026/${category}/players/?player=${selectedPlayer.id}`;
                } catch (err) {
                  console.error('Error navigating to player:', err);
                  setIsNavigating(false);
                }
              }}
            >
              {isNavigating ? 'Loading...' : 'View Full Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
