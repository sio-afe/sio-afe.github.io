import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRegistration } from './RegistrationContext';
import FormationPreview from './FormationPreview';
import { applyFormationToPlayers, presetFormations } from './utils/formationUtils';

export default function FormationBuilder() {
  const { players, setPlayers, teamData, setTeamData, setStep, saveProgress, saving, error } = useRegistration();
  const fieldRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [presetApplied, setPresetApplied] = useState(false);

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
    
    // Get the SVG element inside the container
    const svgElement = fieldRef.current.querySelector('svg');
    if (!svgElement) return;
    
    const rect = svgElement.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Calculate position relative to SVG viewport
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Clamp values between 0 and 100
    const clampedX = Math.min(Math.max(x, 0), 100);
    const clampedY = Math.min(Math.max(y, 0), 100);
    
    updatePlayerPosition(draggingId, clampedX, clampedY);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

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
          <p className="instruction-text">Click and drag any player on the field to reposition them</p>
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

