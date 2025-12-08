import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';

export default function TeamDatabase({ teams = [], onTeamClick }) {

  return (
    <div className="team-database">
      <div className="team-database-header">
        <h1 className="team-database-title">Teams</h1>
      </div>

      <div className="teams-count">
        <span>{teams.length} teams registered</span>
      </div>

      <div className="teams-grid">
        {teams.map((team, index) => {
          // 12 unique color gradients - one for each team
          const teamColors = [
            '33, 150, 243',   // Blue
            '156, 39, 176',   // Purple
            '244, 67, 54',    // Red
            '76, 175, 80',    // Green
            '255, 152, 0',    // Orange
            '0, 188, 212',    // Cyan
            '233, 30, 99',    // Pink
            '255, 193, 7',    // Amber
            '63, 81, 181',    // Indigo
            '0, 150, 136',    // Teal
            '121, 85, 72',    // Brown
            '96, 125, 139',   // Blue Grey
          ];
          // Get consistent color based on team ID (same as TeamDetail)
          const hash = team.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const colorIndex = hash % teamColors.length;
          const color = teamColors[colorIndex];
          const gradient = `linear-gradient(135deg, rgba(${color}, 0.15) 0%, rgba(${color}, 0.02) 100%)`;

          return (
            <div 
              className="team-card-db" 
              key={team.id}
              style={{ background: gradient }}
              onClick={() => onTeamClick && onTeamClick(team)}
            >
              <div className="team-logo-large">
                {team.crest_url ? (
                  <img 
                    src={team.crest_url} 
                    alt={team.name}
                    loading="lazy"
                  />
                ) : (
                  <span>{team.name?.charAt(0) || '?'}</span>
                )}
              </div>
              
              <div className="team-info-db">
                <h3 className="team-name-db">{team.name}</h3>
                <p className="team-captain-db">{team.captain}</p>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="no-teams">
          <i className="fas fa-shield-alt"></i>
          <p>No teams registered yet</p>
        </div>
      )}
    </div>
  );
}

