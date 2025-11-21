import React, { useState } from 'react';
import { motion } from 'framer-motion';

function StandingsTable({ teams, category }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  const formatPosition = (index) => {
    return index + 1;
  };

  const getPositionColor = (index) => {
    if (index < 4) return 'qualification-zone';
    return '';
  };

  const formatGoalDifference = (gd) => {
    if (gd > 0) return `+${gd}`;
    return gd;
  };

  const closePopup = () => {
    setSelectedTeam(null);
  };

  return (
    <div className="standings-container">
      <div className="table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th>POS</th>
              <th className="team-column">CLUB</th>
              <th className="mobile-hide">P</th>
              <th className="mobile-hide">W</th>
              <th className="mobile-hide">D</th>
              <th className="mobile-hide">L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th className="points-column">PTS</th>
              <th className="form-column mobile-hide">FORM</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <motion.tr
                key={team.id}
                className={getPositionColor(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTeam(team)}
              >
                <td className="position-cell">
                  <div className={`position-indicator ${getPositionColor(index)}`}>
                    {formatPosition(index)}
                  </div>
                </td>
                <td className="team-cell">
                  <div className="team-info">
                    <img
                      src={team.crest_url || '/assets/data/open-age/team-logos/default.png'}
                      alt={team.name}
                      className="team-crest-small"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/assets/data/open-age/team-logos/default.png';
                      }}
                    />
                    <span className="team-name">{team.name}</span>
                  </div>
                </td>
                <td className="mobile-hide">{team.played || 0}</td>
                <td className="mobile-hide stat-win">{team.won || 0}</td>
                <td className="mobile-hide">{team.drawn || 0}</td>
                <td className="mobile-hide stat-loss">{team.lost || 0}</td>
                <td>{team.goals_for || 0}</td>
                <td>{team.goals_against || 0}</td>
                <td className={`gd-cell ${team.gd > 0 ? 'positive' : team.gd < 0 ? 'negative' : ''}`}>
                  {formatGoalDifference(team.gd || 0)}
                </td>
                <td className="points-cell">
                  <strong>{team.points || 0}</strong>
                </td>
                <td className="form-cell mobile-hide">
                  {renderForm(team.form)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="table-legend">
        <div className="legend-item">
          <span className="legend-indicator qualification-zone"></span>
          <span>Qualification to Semi-Finals</span>
        </div>
      </div>

      {/* Team Popup Modal */}
      {selectedTeam && (
        <motion.div
          className="team-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
        >
          <motion.div
            className="team-popup-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-popup-btn" onClick={closePopup}>
              <i className="fas fa-times"></i>
            </button>

            <div className="popup-header">
              <img
                src={selectedTeam.crest_url || '/assets/data/open-age/team-logos/default.png'}
                alt={selectedTeam.name}
                className="popup-team-crest"
                onError={(e) => {
                  e.target.src = '/assets/data/open-age/team-logos/default.png';
                }}
              />
              <h2>{selectedTeam.name}</h2>
              {selectedTeam.captain && (
                <p className="captain-info">
                  <i className="fas fa-user-tie"></i>
                  Captain: {selectedTeam.captain}
                </p>
              )}
            </div>

            <div className="popup-stats">
              <div className="stat-row">
                <div className="stat-item">
                  <span className="stat-label">Played</span>
                  <span className="stat-value">{selectedTeam.played || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Won</span>
                  <span className="stat-value">{selectedTeam.won || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Drawn</span>
                  <span className="stat-value">{selectedTeam.drawn || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Lost</span>
                  <span className="stat-value">{selectedTeam.lost || 0}</span>
                </div>
              </div>

              <div className="stat-row">
                <div className="stat-item">
                  <span className="stat-label">Goals For</span>
                  <span className="stat-value">{selectedTeam.goals_for || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Goals Against</span>
                  <span className="stat-value">{selectedTeam.goals_against || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Goal Difference</span>
                  <span className={`stat-value ${selectedTeam.gd > 0 ? 'positive' : selectedTeam.gd < 0 ? 'negative' : ''}`}>
                    {formatGoalDifference(selectedTeam.gd || 0)}
                  </span>
                </div>
                <div className="stat-item highlighted">
                  <span className="stat-label">Points</span>
                  <span className="stat-value">{selectedTeam.points || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// Helper function to render form (last 5 matches)
function renderForm(formString) {
  if (!formString) return <span className="no-form">-</span>;
  
  return (
    <div className="form-indicators">
      {formString.split('').slice(0, 5).map((result, index) => (
        <span key={index} className={`form-result ${result.toLowerCase()}`}>
          {result}
        </span>
      ))}
    </div>
  );
}

export default StandingsTable;

