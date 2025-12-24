import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import { ensurePublicImageUrl, sanitizePathSegment } from '../../../lib/storage';

async function resizeDataUrlToWebp(dataUrl, { maxWidth, maxHeight, quality = 0.82 } = {}) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return null;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
    img.onload = () => {
      try {
        let { width, height } = img;
        const ratio = Math.min((maxWidth || width) / width, (maxHeight || height) / height, 1);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.src = dataUrl;
  });
}

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
        // team_logo will be set after we have a teamId (so we can upload to Storage path).
        team_logo: null,
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

      // Upload team logo (if currently a base64 data URL) and save the public URL in DB.
      if (teamId) {
        // Also upload a thumbnail variant for fast lists/grids.
        const teamLogoUrl = await ensurePublicImageUrl({
          value: teamData.teamLogo,
          path: `registrations/${teamId}/team_logo.webp`
        });

        const teamLogoThumb = await resizeDataUrlToWebp(teamData.teamLogo, {
          maxWidth: 240,
          maxHeight: 240,
          quality: 0.82
        });
        await ensurePublicImageUrl({
          value: teamLogoThumb,
          path: `registrations/${teamId}/team_logo_thumb.webp`
        });

        if (teamLogoUrl) {
          // Update local state so we don't re-upload on subsequent saves.
          setTeamData((prev) => ({ ...prev, teamLogo: teamLogoUrl }));
          const { error: logoUpdateError } = await supabaseClient
            .from('team_registrations')
            .update({ team_logo: teamLogoUrl })
            .eq('id', teamId);
          if (logoUpdateError) throw logoUpdateError;
        }
      }

      // Save players if we have any with data
      // Only save players that have at least a name (substitutes can be skipped)
      const playersWithData = players.filter(p => p.name && p.name.trim() !== '');
      if (playersWithData.length > 0 && teamId) {
        // Delete existing players first
        await supabaseClient.from('team_players').delete().eq('team_id', teamId);

        // Upload player images (if data URLs) and store public URLs.
        const payload = await Promise.all(
          playersWithData.map(async (player) => {
            const stableId = sanitizePathSegment(player.id || player.name || 'player');

            // Upload thumbnail variants for fast lists/grids.
            const thumbDataUrl = await resizeDataUrlToWebp(player.image || null, {
              maxWidth: 240,
              maxHeight: 240,
              quality: 0.82
            });
            const cardDataUrl = await resizeDataUrlToWebp(player.image || null, {
              maxWidth: 520,
              maxHeight: 650,
              quality: 0.86
            });
            await ensurePublicImageUrl({
              value: thumbDataUrl,
              path: `registrations/${teamId}/players/${stableId}_thumb.webp`
            });
            await ensurePublicImageUrl({
              value: cardDataUrl,
              path: `registrations/${teamId}/players/${stableId}_card.webp`
            });

            const imageUrl = await ensurePublicImageUrl({
              value: player.image || null,
              path: `registrations/${teamId}/players/${stableId}.webp`
            });

            return {
          team_id: teamId,
          player_name: player.name,
          player_age: player.age ? parseInt(player.age) : null,
          aadhar_no: player.aadhar_no || null,
          position: player.position || 'SUB',
          is_substitute: player.isSubstitute || false,
              player_image: imageUrl || null,
          position_x: typeof player.x === 'number' && !isNaN(player.x) ? player.x : 50,
          position_y: typeof player.y === 'number' && !isNaN(player.y) ? player.y : 50
            };
          })
        );

        const { error: playersError } = await supabaseClient.from('team_players').insert(payload);
        if (playersError) throw playersError;

        // Update local state to replace any data URLs with uploaded URLs.
        const imageByName = new Map(payload.map((row) => [row.player_name, row.player_image]));
        setPlayers((prev) =>
          prev.map((p) => {
            if (!p?.name) return p;
            const uploaded = imageByName.get(p.name);
            if (!uploaded) return p;
            return { ...p, image: uploaded };
          })
        );
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

