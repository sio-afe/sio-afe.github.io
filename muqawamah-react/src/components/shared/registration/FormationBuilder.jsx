import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRegistration } from './RegistrationContext';
import FormationPreview from './FormationPreview';
import { applyFormationToPlayers, presetFormations } from './utils/formationUtils';

export default function FormationBuilder() {
  const { players, setPlayers, teamData, setTeamData, setStep } = useRegistration();
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
    const rect = fieldRef.current.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    updatePlayerPosition(draggingId, Math.min(Math.max(x, 0), 100), Math.min(Math.max(y, 0), 100));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const applyPreset = useCallback(
    (formation) => {
      const updated = applyFormationToPlayers(players, formation);
      setPlayers(updated);
      setTeamData((prev) => ({ ...prev, formation }));
    },
    [players, setPlayers, setTeamData]
  );

  useEffect(() => {
    if (!presetApplied && teamData.formation) {
      const updated = applyFormationToPlayers(players, teamData.formation);
      setPlayers(updated);
      setPresetApplied(true);
    }
  }, [teamData.formation, players, setPlayers, presetApplied]);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(4);
  };

  return (
    <form className="registration-form" onSubmit={handleNext}>
      <h3>Step 3 · Formation & Positions</h3>
      <p className="step-description">Drag players around the field or start from a preset.</p>

      <label>
        Formation Label
        <input
          type="text"
          value={teamData.formation}
          onChange={(e) => setTeamData((prev) => ({ ...prev, formation: e.target.value }))}
          placeholder="e.g., 1-3-2-1"
        />
      </label>

      <div className="formation-presets">
        {presetFormations.map((formation) => (
          <button type="button" key={formation} onClick={() => applyPreset(formation)}>
            {formation}
          </button>
        ))}
        <button type="button" onClick={() => applyPreset(teamData.formation)}>
          Apply Current
        </button>
      </div>

      <div ref={fieldRef}>
        <FormationPreview
          players={players.filter((p) => !p.isSubstitute)}
          editable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
          Back
        </button>
        <button type="submit" className="primary-btn">
          Review Registration
        </button>
      </div>
    </form>
  );
}

