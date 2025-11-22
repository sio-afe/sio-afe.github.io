import React, { useRef, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import { useRegistration } from './RegistrationContext';
import FormationPreview from './FormationPreview';

export default function RegistrationSummary({ readOnly = false }) {
  const {
    teamData,
    players,
    setStep,
    setPlayers,
    loading,
    setLoading,
    error,
    setError,
    successTeamId,
    setSuccessTeamId,
    existingTeamId,
    setExistingTeamId
  } = useRegistration();

  const fieldRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  const updatePlayerPosition = (playerId, x, y) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, x, y } : player))
    );
  };

  const handleDragStart = (_, playerId) => {
    setDraggingId(playerId);
  };

  const handleDrag = (event) => {
    if (!draggingId || !fieldRef.current) return;
    event.preventDefault();
    const rect = fieldRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const relativeY = ((clientY - rect.top) / rect.height) * 100;
    updatePlayerPosition(
      draggingId,
      Math.min(Math.max(relativeX, 0), 100),
      Math.min(Math.max(relativeY, 0), 100)
    );
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (readOnly) return;

      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to submit the registration.');
      }

      let teamId = existingTeamId;
      if (existingTeamId) {
        const { error: updateError } = await supabaseClient
          .from('team_registrations')
          .update({
            team_name: teamData.teamName,
            category: teamData.category,
            team_logo: teamData.teamLogo,
            captain_name: teamData.captainName,
            captain_email: teamData.captainEmail,
            captain_phone: teamData.captainPhone,
            formation: teamData.formation,
            submitted_at: new Date().toISOString()
          })
          .eq('id', existingTeamId);
        if (updateError) throw updateError;
        await supabaseClient.from('team_players').delete().eq('team_id', existingTeamId);
      } else {
        const { data: insertTeam, error: teamError } = await supabaseClient
          .from('team_registrations')
          .insert({
            user_id: user.id,
            team_name: teamData.teamName,
            category: teamData.category,
            team_logo: teamData.teamLogo,
            captain_name: teamData.captainName,
            captain_email: teamData.captainEmail,
            captain_phone: teamData.captainPhone,
            formation: teamData.formation,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (teamError) throw teamError;
        teamId = insertTeam.id;
        setExistingTeamId(teamId);
      }

      if (!teamId) throw new Error('Unable to determine team id.');

      const payload = players.map((player) => ({
        team_id: teamId,
        player_name: player.name,
        position: player.position,
        is_substitute: player.isSubstitute,
        player_image: player.image,
        position_x: player.x,
        position_y: player.y
      }));

      const { error: playersError } = await supabaseClient.from('team_players').insert(payload);
      if (playersError) throw playersError;

      await supabaseClient.functions.invoke('send-registration-email', {
        body: {
          teamId,
          email: teamData.captainEmail,
          teamName: teamData.teamName,
          category: teamData.category
        }
      });

      setSuccessTeamId(teamId);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  if (successTeamId && !readOnly) {
    return (
      <div className="registration-form">
        <h3>{existingTeamId ? 'Registration Updated ✅' : 'Registration Submitted ✅'}</h3>
        <p>
          Your team has been {existingTeamId ? 'updated' : 'registered'}. Team ID: <strong>{successTeamId}</strong>. 
          {!existingTeamId && ` A confirmation email has been sent to ${teamData.captainEmail}.`}
        </p>
      </div>
    );
  }

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
          {players.map((player, index) => (
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
                <span className="player-name">{player.name || 'Unnamed Player'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-section">
        <h4>Formation Preview</h4>
        <div ref={fieldRef}>
          <FormationPreview
            players={players.filter((p) => !p.isSubstitute)}
            editable={!readOnly}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            showDownload
          />
        </div>
      </section>

      {error && <p className="auth-error">{error}</p>}

      {!readOnly && (
        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={() => setStep(3)} disabled={loading}>
            Back
          </button>
          <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (existingTeamId ? 'Updating...' : 'Submitting...') : (existingTeamId ? 'Update Registration' : 'Submit Registration')}
          </button>
        </div>
      )}
    </div>
  );
}

