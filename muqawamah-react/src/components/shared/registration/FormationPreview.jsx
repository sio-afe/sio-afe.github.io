import React from 'react';

export default function FormationPreview({ players, editable = false, onDragStart, onDrag, onDragEnd }) {
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
            onMouseDown={(e) => editable && onDragStart?.(e, player.id)}
            onTouchStart={(e) => editable && onDragStart?.(e, player.id)}
            onMouseMove={(e) => editable && onDrag?.(e)}
            onTouchMove={(e) => editable && onDrag?.(e)}
            onMouseUp={() => editable && onDragEnd?.()}
            onTouchEnd={() => editable && onDragEnd?.()}
            style={{ cursor: editable ? 'grab' : 'default' }}
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

