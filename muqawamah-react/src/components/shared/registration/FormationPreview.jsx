import React from 'react';

export default function FormationPreview({ players }) {
  return (
    <div className="football-field">
      {players.map((player) => (
        <div
          key={player.id}
          className="player-marker"
          style={{ left: `${player.x}%`, top: `${player.y}%` }}
        >
          <div
            className={`player-circle ${player.isSubstitute ? 'substitute' : ''}`}
            draggable={false}
            style={{ cursor: 'default' }}
          >
            {player.image ? (
              <img src={player.image} alt={player.name || player.position} />
            ) : (
              <span>{player.position}</span>
            )}
          </div>
          <div className="player-label">
            <strong>{player.position}</strong>
            <span>{player.name || 'Unnamed'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

