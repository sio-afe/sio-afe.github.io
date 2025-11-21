import React from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import { useRegistration, defaultPlayers, initialTeamData } from './RegistrationContext';
import FormationPreview from './FormationPreview';

export default function RegistrationSummary({ readOnly = false }) {
  const {
    teamData,
    players,
    setStep,
    loading,
    setLoading,
    error,
    setError,
    successTeamId,
    setSuccessTeamId,
    existingTeamId,
    setExistingTeamId
  } = useRegistration();

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
        <ul className="players-summary">
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.name || 'Unnamed Player'}</span>
              <span>{player.isSubstitute ? 'SUB' : player.position}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="summary-section">
        <h4>Formation Preview</h4>
        <FormationPreview players={players.filter((p) => !p.isSubstitute)} />
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

