import React from 'react';

export default function GoalsAndHighlights({ goals, cards, match, isFinished }) {
  // Combine goals and cards, sort by minute
  const events = [...goals.map(g => ({ ...g, type: 'goal' })), ...cards.map(c => ({ ...c, type: 'card' }))]
    .sort((a, b) => (a.minute || 0) - (b.minute || 0));

  return (
    <div className="goals-panel-compact">
      <h3 className="panel-title-compact">
        <i className="fas fa-futbol"></i>
        Goals & Highlights
      </h3>
      
      {events.length > 0 ? (
        <div className="goals-list-compact">
          {events.map((event, idx) => {
            if (event.type === 'goal') {
              const isHomeGoal = event.team_id === match.home_team_id;
              return (
                <div key={`goal-${event.id || idx}`} className={`goal-row-compact ${isHomeGoal ? 'home' : 'away'}`}>
                  <span className="goal-minute-compact">{event.minute}'</span>
                  <span className="goal-icon-compact">
                    <i className="fas fa-futbol"></i>
                  </span>
                  <span className="goal-scorer-compact">{event.scorer?.player_name || 'Unknown'}</span>
                  {event.assister?.player_name && (
                    <span className="goal-assist-compact">({event.assister.player_name})</span>
                  )}
                  <span className="goal-team-compact">{isHomeGoal ? match.home_team?.name : match.away_team?.name}</span>
                </div>
              );
            } else {
              const isHomeCard = event.team_id === match.home_team_id;
              return (
                <div key={`card-${event.id || idx}`} className={`card-row-compact ${isHomeCard ? 'home' : 'away'}`}>
                  <span className="goal-minute-compact">{event.minute}'</span>
                  <span className={`card-icon-compact ${event.card_type}`}>
                    {event.card_type === 'yellow' ? (
                      <i className="fas fa-square" style={{ color: '#ffd700' }}></i>
                    ) : (
                      <i className="fas fa-square" style={{ color: '#ff0000' }}></i>
                    )}
                  </span>
                  <span className="goal-scorer-compact">{event.player?.player_name || 'Unknown'}</span>
                  <span className="goal-team-compact">{isHomeCard ? match.home_team?.name : match.away_team?.name}</span>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <p className="no-goals-compact">
          {isFinished ? 'No events' : 'Events will appear here'}
        </p>
      )}
    </div>
  );
}

