import React, { useMemo, useRef, useState } from 'react';
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

  const statLabels = useMemo(() => ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'], []);

  const buildCardStats = (player, index) => {
    const seed = ((player.name?.length || 4) * 11 + index * 17 + (player.position?.length || 3) * 5) % 100;
    const base = 60 + (seed % 30);
    const stats = statLabels.map((label, idx) => ({
      label,
      value: Math.min(99, base + ((seed + idx * 7) % 25))
    }));
    const rating = Math.min(
      99,
      Math.round(stats.reduce((sum, stat) => sum + stat.value, 0) / stats.length)
    );
    return { stats, rating };
  };

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
        <h3>Registration Submitted ✅</h3>
        <p>
          Your team has been registered. Team ID: <strong>{successTeamId}</strong>. A confirmation
          email has been sent to {teamData.captainEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="registration-form">
      <h3>Step 4 · Review & Submit</h3>
      <p className="step-description">Verify everything looks good before locking your team.</p>

      <section className="summary-section">
        <h4>Team Information</h4>
        <p>
          <strong>{teamData.teamName}</strong> · {teamData.category === 'open-age' ? 'Open Age' : 'U17'}
        </p>
        <p>
          Captain: {teamData.captainName} ({teamData.captainEmail})
        </p>
        {teamData.captainPhone && <p>Phone: {teamData.captainPhone}</p>}
      </section>

      <section className="summary-section">
        <h4>Players</h4>
        <div className="player-card-grid">
          {players.map((player, index) => {
            const { stats, rating } = buildCardStats(player, index);
            return (
              <div
                className={`player-card-badge ${player.isSubstitute ? 'substitute' : ''}`}
                key={player.id || index}
              >
                <div className="badge-header">
                  <div className="badge-rating">
                    <span className="rating-value">{String(rating).padStart(2, '0')}</span>
                    <span className="rating-pos">{player.isSubstitute ? 'SUB' : player.position || 'POS'}</span>
                  </div>
                  <div className="badge-flair">
                    <i className="fas fa-shield-alt" aria-hidden="true"></i>
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
                <div className="badge-name">{player.name || 'Unnamed Player'}</div>
                <div className="badge-stats">
                  {stats.map((stat) => (
                    <div className="badge-stat" key={stat.label}>
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      )}
    </div>
  );
}

