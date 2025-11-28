import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';

const RegistrationContext = createContext(null);

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return ctx;
};

export const defaultPlayers = () => {
  const basePositions = ['GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'ST'];
  const substitutes = ['SUB1', 'SUB2', 'SUB3', 'SUB4'];
  const defaults = basePositions.map((pos, index) => ({
    id: `${pos}-${index}`,
    name: '',
    age: '',
    aadhar_no: '',
    position: pos,
    isSubstitute: false,
    image: null,
    x: 50,
    y: 50
  }));
  const subs = substitutes.map((pos, index) => ({
    id: `${pos}-${index}`,
    name: '',
    age: '',
    aadhar_no: '',
    position: 'SUB',
    isSubstitute: true,
    image: null,
    x: 10 + index * 20,
    y: 90
  }));
  return [...defaults, ...subs];
};

export const initialTeamData = {
  teamName: '',
  category: 'open-age',
  teamLogo: null,
  teamLogoFileName: null,
  captainName: '',
  captainEmail: '',
  captainPhone: '',
  formation: '1-3-2-1'
};

export const RegistrationProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [teamData, setTeamData] = useState(initialTeamData);
  const [players, setPlayers] = useState(defaultPlayers());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successTeamId, setSuccessTeamId] = useState(null);
  const [existingTeamId, setExistingTeamId] = useState(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'
  const [transactionId, setTransactionId] = useState(null);
  const [lastSavedStep, setLastSavedStep] = useState(0);

  const resetForm = () => {
    setTeamData(initialTeamData);
    setPlayers(defaultPlayers());
    setSuccessTeamId(null);
    setExistingTeamId(null);
    setPaymentStatus(null);
    setTransactionId(null);
    setLastSavedStep(0);
    setStep(1);
  };

  // Save progress to database with status 'submitted'
  const saveProgress = useCallback(async (currentStep) => {
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to save your progress.');
      }

      let teamId = existingTeamId;

      // Prepare team data
      const teamPayload = {
        user_id: user.id,
        team_name: teamData.teamName || 'Draft Team',
        category: teamData.category,
        team_logo: teamData.teamLogo,
        captain_name: teamData.captainName,
        captain_email: teamData.captainEmail || user.email,
        captain_phone: teamData.captainPhone,
        formation: teamData.formation,
        status: 'submitted', // Saved to database, awaiting payment
        last_saved_step: currentStep,
        submitted_at: new Date().toISOString()
      };

      if (!existingTeamId) {
        // Create new registration
        const { data: insertTeam, error: teamError } = await supabaseClient
          .from('team_registrations')
          .insert(teamPayload)
          .select()
          .single();

        if (teamError) throw teamError;
        teamId = insertTeam.id;
        setExistingTeamId(teamId);
      } else {
        // Update existing registration
        const { error: updateError } = await supabaseClient
          .from('team_registrations')
          .update(teamPayload)
          .eq('id', existingTeamId);

        if (updateError) throw updateError;
      }

      // Save players if we have any with data
      const playersWithData = players.filter(p => p.name || p.image);
      if (playersWithData.length > 0 && teamId) {
        // Delete existing players first
        await supabaseClient.from('team_players').delete().eq('team_id', teamId);

        // Insert all players
        const payload = players.map((player) => ({
          team_id: teamId,
          player_name: player.name,
          player_age: player.age ? parseInt(player.age) : null,
          aadhar_no: player.aadhar_no || null,
          position: player.position,
          is_substitute: player.isSubstitute,
          player_image: player.image,
          position_x: player.x,
          position_y: player.y
        }));

        const { error: playersError } = await supabaseClient.from('team_players').insert(payload);
        if (playersError) throw playersError;
      }

      setLastSavedStep(currentStep);
      return { success: true, teamId };
    } catch (err) {
      console.error('Save progress error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [existingTeamId, teamData, players]);

  const value = useMemo(
    () => ({
      step,
      setStep,
      teamData,
      setTeamData,
      players,
      setPlayers,
      loading,
      setLoading,
      saving,
      setSaving,
      error,
      setError,
      successTeamId,
      setSuccessTeamId,
      existingTeamId,
      setExistingTeamId,
      readOnlyMode,
      setReadOnlyMode,
      paymentStatus,
      setPaymentStatus,
      transactionId,
      setTransactionId,
      lastSavedStep,
      setLastSavedStep,
      resetForm,
      saveProgress
    }),
    [step, teamData, players, loading, saving, error, successTeamId, existingTeamId, readOnlyMode, paymentStatus, transactionId, lastSavedStep, saveProgress]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};

