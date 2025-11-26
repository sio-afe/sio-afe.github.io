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
          // Color gradients for variety
          const gradients = [
            'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.02) 100%)',
            'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(156, 39, 176, 0.02) 100%)',
            'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.02) 100%)',
            'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.02) 100%)',
            'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.02) 100%)',
            'linear-gradient(135deg, rgba(158, 158, 158, 0.15) 0%, rgba(158, 158, 158, 0.02) 100%)',
          ];
          const gradient = gradients[index % gradients.length];

          return (
            <div 
              className="team-card-db" 
              key={team.id}
              style={{ background: gradient }}
              onClick={() => onTeamClick && onTeamClick(team)}
            >
              <div className="team-logo-large">
                {team.crest_url ? (
                  <img src={team.crest_url} alt={team.name} />
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

      <div className="back-to-tournament">
        <a href="/muqawamah/2026/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Tournament
        </a>
      </div>
    </div>
  );
}

