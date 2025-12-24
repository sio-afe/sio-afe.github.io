import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TeamMosaicPattern from '../../../shared/TeamMosaicPattern';
import SmartImg from '../../../shared/SmartImg';

// 12 unique color gradients - one for each team (moved outside for reuse)
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

// Get consistent color based on team ID
const getTeamColor = (teamId) => {
  if (!teamId) return teamColors[0];
  const hash = teamId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return teamColors[hash % teamColors.length];
};

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
          const color = getTeamColor(team.id);

          return (
            <div 
              className="team-card-db team-card-mosaic" 
              key={team.id}
              onClick={() => onTeamClick && onTeamClick(team)}
            >
              {/* P5.js Abstract Pattern Background */}
              <TeamMosaicPattern 
                teamId={team.id}
                colorRgb={color}
              />
              
              {/* Content overlay - Logo center, Info bottom-left */}
              <div className="team-card-content-new">
                {/* Logo - Center */}
                <div className="team-logo-center">
                  {team.crest_url ? (
                    <SmartImg
                      src={team.crest_url} 
                      preset="crestMd"
                      alt={team.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span>{team.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                
                {/* Team Info - Bottom Left */}
                <div className="team-info-corner">
                  <h3 className="team-name-corner">{team.name}</h3>
                  <p className="team-captain-corner">{team.captain}</p>
                </div>
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

