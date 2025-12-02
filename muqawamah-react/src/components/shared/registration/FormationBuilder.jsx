import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRegistration } from './RegistrationContext';
import FormationPreview from './FormationPreview';
import { applyFormationToPlayers, presetFormations } from './utils/formationUtils';

export default function FormationBuilder() {
  const { players, setPlayers, teamData, setTeamData, setStep, saveProgress, saving, error } = useRegistration();
  const fieldRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [presetApplied, setPresetApplied] = useState(false);

  const updatePlayerPosition = useCallback((playerId, x, y) => {
    // Ensure x and y are valid numbers
    const validX = typeof x === 'number' && !isNaN(x) ? x : 50;
    const validY = typeof y === 'number' && !isNaN(y) ? y : 50;
    
    // Find the player to check if it's GK
    const player = players.find(p => p.id === playerId);
    
    // GK is locked - cannot be moved at all
    if (player?.position === 'GK') {
      return; // Don't update GK position
    }
    
    // All other players can go anywhere
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: validX, y: validY } : p))
    );
  }, [setPlayers, players]);

  const handleDragStart = useCallback((_, playerId) => {
    // Don't allow dragging GK
    const player = players.find(p => p.id === playerId);
    if (player?.position === 'GK') {
      return; // GK is locked
    }
    setDraggingId(playerId);
  }, [players]);

  const handleDrag = useCallback((event) => {
    const field = fieldRef.current;
    if (!draggingId || !field) return;
    event.preventDefault();
    
    // Get the SVG element inside the container
    const svgElement = field.querySelector('svg');
    if (!svgElement) return;
    
    const rect = svgElement.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Calculate position relative to SVG viewport
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100 (field boundaries only)
    const clampedX = Math.min(Math.max(x, 0), 100);
    const clampedY = Math.min(Math.max(y, 0), 100);
    
    updatePlayerPosition(draggingId, clampedX, clampedY);
  }, [draggingId, updatePlayerPosition]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const applyPreset = (formation) => {
    console.log('Applying preset formation:', formation);
    setPlayers((currentPlayers) => {
      const updated = applyFormationToPlayers(currentPlayers, formation);
      console.log('Updated players:', updated);
      return updated;
    });
    setTeamData((prev) => ({ ...prev, formation }));
  };

  // Apply initial formation on mount
  useEffect(() => {
    if (!presetApplied && teamData.formation && players.length > 0) {
      console.log('Applying initial formation:', teamData.formation);
      const updated = applyFormationToPlayers(players, teamData.formation);
      setPlayers(updated);
      setPresetApplied(true);
    }
  }, []);

  const handleNext = async (e) => {
    e.preventDefault();
    
    // Save progress to database
    const result = await saveProgress(3);
    if (result.success) {
      setStep(4);
    }
  };

  return (
    <form className="registration-form" onSubmit={handleNext}>
      <h3>Step 3 · Formation & Positions</h3>
      <p className="step-description">Choose a preset formation below, then drag players to customize positions.</p>

      <div className="formation-instruction-box">
        <div className="instruction-icon">
          <i className="fas fa-hand-pointer"></i>
        </div>
        <div className="instruction-content">
          <strong className="instruction-title">Interactive Field</strong>
          <p className="instruction-text">Click and drag any player to reposition them (GK is locked)</p>
        </div>
      </div>

      <div className="formation-presets-section">
        <div className="presets-header">
          <i className="fas fa-chess-board"></i>
          <span className="presets-title">Choose Formation</span>
        </div>
        <div className="formation-buttons-grid">
          {presetFormations.map((formation) => (
            <button 
              type="button" 
              key={formation} 
              className={`formation-preset-btn ${teamData.formation === formation ? 'active' : ''}`}
              onClick={() => applyPreset(formation)}
            >
              <span className="formation-name">{formation}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={fieldRef} className="formation-field-container">
        <FormationPreview
          players={players.filter((p) => !p.isSubstitute)}
          editable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        />
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={() => setStep(2)} disabled={saving}>
          Back
        </button>
        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Save & Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}
