import React from 'react';
import { useRegistration } from './RegistrationContext';
import FormationPreview from './FormationPreview';

export default function RegistrationSummary({ readOnly = false }) {
  const {
    teamData,
    players,
    setStep,
    existingTeamId
  } = useRegistration();

  const handleProceedToPayment = () => {
    setStep(5);
  };

  return (
    <div className="registration-form">
      <h3>Step 4 · Review & {existingTeamId ? 'Update' : 'Submit'}</h3>
      <p className="step-description">Verify everything looks good before {existingTeamId ? 'updating' : 'submitting'} your team.</p>

      <section className="summary-section">
        <h4>Team Information</h4>
        <div className="team-info-card">
          <div className="team-info-header">
            <div className="team-logo-large">
              {teamData.teamLogo ? (
                <img src={teamData.teamLogo} alt={`${teamData.teamName} logo`} />
              ) : (
                <div className="team-logo-placeholder-large">
                  <i className="fas fa-shield-alt"></i>
                </div>
              )}
            </div>
            <div className="team-info-main">
              <h3 className="team-name-display">{teamData.teamName}</h3>
              <span className="team-category-badge">
                <i className="fas fa-trophy"></i> {teamData.category === 'open-age' ? 'Open Age' : 'Under 17'}
              </span>
            </div>
          </div>
          
          <div className="team-info-details">
            <div className="info-row">
              <div className="info-item">
                <i className="fas fa-user-tie"></i>
                <div className="info-content">
                  <span className="info-label">Captain</span>
                  <span className="info-value">{teamData.captainName}</span>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{teamData.captainEmail}</span>
                </div>
              </div>
            </div>
            {teamData.captainPhone && (
              <div className="info-row">
                <div className="info-item">
                  <i className="fas fa-phone"></i>
                  <div className="info-content">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{teamData.captainPhone}</span>
                  </div>
                </div>
                <div className="info-item">
                  <i className="fas fa-futbol"></i>
                  <div className="info-content">
                    <span className="info-label">Formation</span>
                    <span className="info-value">{teamData.formation}</span>
                  </div>
                </div>
              </div>
            )}
            {!teamData.captainPhone && (
              <div className="info-row">
                <div className="info-item">
                  <i className="fas fa-futbol"></i>
                  <div className="info-content">
                    <span className="info-label">Formation</span>
                    <span className="info-value">{teamData.formation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="summary-section">
        <h4>Players</h4>
        <div className="player-card-grid">
          {players
            .filter((player) => player.name && player.name.trim() !== '')
            .map((player, index) => (
            <div
              className={`player-card-badge simple ${player.isSubstitute ? 'substitute' : ''}`}
              key={player.id || index}
            >
              <div className="badge-header">
                <div className="badge-team">
                  <div className="team-logo">
                    {teamData.teamLogo ? (
                      <img src={teamData.teamLogo} alt={`${teamData.teamName} logo`} />
                    ) : (
                      <div className="team-logo-placeholder">
                        {teamData.teamName?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                    )}
                  </div>
                  <div className="team-meta">
                    <span className="team-name">{teamData.teamName || 'Team name'}</span>
                    <span className="player-role">
                      {player.isSubstitute ? 'Substitute' : player.position || 'Player'}
                    </span>
                  </div>
                </div>
                <div className="muqawama-logo">
                  <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama 2026" />
                </div>
              </div>
              <div className="badge-photo">
                {player.image ? (
                  <img src={player.image} alt={player.name || player.position} />
                ) : (
                  <div className="badge-photo-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <div className="badge-player-info">
                <span className="player-name">{player.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-section">
        <h4>Formation Preview</h4>
        <div>
          <FormationPreview
            players={players.filter((p) => !p.isSubstitute)}
            editable={false}
            showDownload
          />
        </div>
      </section>

      {!readOnly && (
        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => setStep(3)}>
            Back
          </button>
          <button type="button" className="primary-btn" onClick={handleProceedToPayment}>
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
}

