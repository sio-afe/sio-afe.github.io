import React, { useCallback, useEffect, useRef, useState } from 'react';
import { supabaseClient } from '../../lib/supabaseClient';
import FormationPreview from '../../components/shared/registration/FormationPreview';
import { applyFormationToPlayers, presetFormations } from '../../components/shared/registration/utils/formationUtils';
import '../../styles/Registration.css';

export default function AdminFormationEditor({ teamId, teamName, onClose, onSave }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formation, setFormation] = useState('1-3-2-1');
  const [draggingId, setDraggingId] = useState(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team info to get formation
      const { data: teamData } = await supabaseClient
        .from('teams')
        .select('formation, registration_id')
        .eq('id', teamId)
        .single();

      if (teamData?.formation) {
        setFormation(teamData.formation);
      }

      // Fetch players from tournament players table (primary source)
      const { data: tournamentPlayers } = await supabaseClient
        .from('players')
        .select('id, name, player_image, position, position_x, position_y, is_substitute, registration_player_id')
        .eq('team_id', teamId)
        .order('position');

      if (tournamentPlayers && tournamentPlayers.length > 0) {
        // Map tournament players to expected format
        const mappedPlayers = tournamentPlayers.map(p => ({
          id: p.id,
          name: p.name,
          image: p.player_image,
          position: p.position,
          x: p.position_x ?? 50,
          y: p.position_y ?? 50,
          isSubstitute: p.is_substitute,
          registration_player_id: p.registration_player_id
        }));
        setPlayers(mappedPlayers);
      } else if (teamData?.registration_id) {
        // Fallback to registration players if no tournament players
        const { data: regPlayers } = await supabaseClient
          .from('team_players')
          .select('id, player_name, player_image, position, position_x, position_y, is_substitute')
          .eq('team_id', teamData.registration_id)
          .order('position');

        if (regPlayers) {
          const mappedPlayers = regPlayers.map(p => ({
            id: p.id,
            name: p.player_name,
            image: p.player_image,
            position: p.position,
            x: p.position_x ?? 50,
            y: p.position_y ?? 50,
            isSubstitute: p.is_substitute,
            registration_player_id: p.id
          }));
          setPlayers(mappedPlayers);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      alert('Failed to load team formation');
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerPosition = useCallback((playerId, x, y) => {
    const validX = typeof x === 'number' && !isNaN(x) ? x : 50;
    const validY = typeof y === 'number' && !isNaN(y) ? y : 50;
    
    const player = players.find(p => p.id === playerId);
    
    // GK is locked
    if (player?.position === 'GK') {
      return;
    }
    
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, x: validX, y: validY } : p))
    );
  }, [players]);

  const handleDragStart = useCallback((_, playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player?.position === 'GK') {
      return;
    }
    setDraggingId(playerId);
  }, [players]);

  const handleDrag = useCallback((event) => {
    const field = fieldRef.current;
    if (!draggingId || !field) return;
    event.preventDefault();
    
    const svgElement = field.querySelector('svg');
    if (!svgElement) return;
    
    const rect = svgElement.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.min(Math.max(x, 0), 100);
    const clampedY = Math.min(Math.max(y, 0), 100);
    
    updatePlayerPosition(draggingId, clampedX, clampedY);
  }, [draggingId, updatePlayerPosition]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const applyPreset = (newFormation) => {
    setPlayers((currentPlayers) => {
      return applyFormationToPlayers(currentPlayers, newFormation);
    });
    setFormation(newFormation);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update team formation
      await supabaseClient
        .from('teams')
        .update({ formation })
        .eq('id', teamId);

      // Update player positions
      const starters = players.filter(p => !p.isSubstitute);
      for (const player of starters) {
        // Check if this is a tournament player (has registration_player_id) or registration player
        if (player.registration_player_id && player.registration_player_id !== player.id) {
          // Tournament player - update both tables
          // Update in players table (tournament)
          await supabaseClient
            .from('players')
            .update({
              position_x: player.x,
              position_y: player.y
            })
            .eq('id', player.id);

          // Also update in team_players table
          await supabaseClient
            .from('team_players')
            .update({
              position_x: player.x,
              position_y: player.y
            })
            .eq('id', player.registration_player_id);
        } else {
          // Registration player only - update team_players table
          await supabaseClient
            .from('team_players')
            .update({
              position_x: player.x,
              position_y: player.y
            })
            .eq('id', player.id);
        }
      }

      alert('Formation saved successfully!');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error saving formation:', error);
      alert('Failed to save formation: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading formation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-chess-board"></i>
            Edit Formation - {teamName}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="formation-instruction-box" style={{ marginBottom: '20px' }}>
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
              {presetFormations.map((presetFormation) => (
                <button
                  type="button"
                  key={presetFormation}
                  className={`formation-preset-btn ${formation === presetFormation ? 'active' : ''}`}
                  onClick={() => applyPreset(presetFormation)}
                >
                  <span className="formation-name">{presetFormation}</span>
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
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Formation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

