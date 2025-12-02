import React from 'react';
import { DarkFieldSVG } from './DarkFieldSVG';

/**
 * Team Formation Display Component
 * Shows team formation on a dark football field with white lines
 * Used on team detail pages
 */
export default function TeamFormationDisplay({ players = [], formation = '' }) {
  // Filter out substitutes - only show starting 7
  const starters = players.filter(p => !p.isSubstitute && p.position !== 'SUB').slice(0, 7);
  
  if (starters.length === 0) {
    return (
      <div className="team-formation-display">
        <div className="no-formation">
          <i className="fas fa-users-slash"></i>
          <p>Formation not set</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-formation-display">
      {formation && (
        <div className="formation-label">
          <i className="fas fa-chess-board"></i>
          <span>{formation}</span>
        </div>
      )}
      <div className="formation-field-wrapper">
        <DarkFieldSVG style={{ width: '100%', height: 'auto', maxWidth: '350px', display: 'block', margin: '0 auto' }}>
          {/* Define clip paths for player images */}
          <defs>
            {starters.map((player) => (
              <clipPath key={`clip-${player.id}`} id={`team-clip-${player.id}`}>
                <circle r="3.5" cx="0" cy="0" />
              </clipPath>
            ))}
          </defs>
          
          {starters.map((player) => {
            // Use position_x and position_y directly from database (set by formation builder)
            const playerX = typeof player.position_x === 'number' ? player.position_x : 50;
            const playerY = typeof player.position_y === 'number' ? player.position_y : 50;
            
            // Convert percentage to SVG coordinates (accounting for the 3px transform)
            const svgX = 3 + (playerX / 100) * 68;
            const svgY = 3 + (playerY / 100) * 105;
            
            return (
              <g 
                key={player.id}
                transform={`translate(${svgX}, ${svgY})`}
                className="formation-player"
              >
                {/* Player circle background */}
                <circle 
                  r="3.5" 
                  fill="#e63946" 
                  stroke="#fff" 
                  strokeWidth="0.6"
                />
                
                {/* Player image (clipped inside circle) or position text */}
                {player.player_image ? (
                  <image 
                    href={player.player_image} 
                    x="-3.5" 
                    y="-3.5" 
                    width="7" 
                    height="7" 
                    clipPath={`url(#team-clip-${player.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  <text 
                    x="0" 
                    y="1.2" 
                    textAnchor="middle" 
                    fill="#fff" 
                    fontSize="2.8" 
                    fontWeight="700"
                  >
                    {player.position || '?'}
                  </text>
                )}
                
                {/* Player name below */}
                <text 
                  x="0" 
                  y="6.5" 
                  textAnchor="middle" 
                  fill="#fff" 
                  fontSize="2.2" 
                  fontWeight="600"
                >
                  {player.player_name?.split(' ')[0] || 'Player'}
                </text>
              </g>
            );
          })}
        </DarkFieldSVG>
      </div>
    </div>
  );
}
