import React from 'react';
import { useRegistration } from './RegistrationContext';

const positionOptions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST'];

export default function PlayersForm() {
  const { players, setPlayers, setStep, saveProgress, saving, error, teamData } = useRegistration();

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prev) =>
      prev.map((player, idx) => (idx === index ? { ...player, [field]: value } : player))
    );
  };

  const mainPlayers = players.filter((p) => !p.isSubstitute);
  const subs = players.filter((p) => p.isSubstitute);
  
  // First player is the captain
  const captain = mainPlayers[0];
  const otherMainPlayers = mainPlayers.slice(1);

  const handleFile = (index, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Player photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      handlePlayerChange(index, 'image', event.target.result);
      handlePlayerChange(index, 'imageFileName', file.name);
    };
    reader.readAsDataURL(file);
  };

  const validatePlayers = () => {
    const filledMain = mainPlayers.every(
      (player) => player.name && player.age && player.position && player.image
    );
    const filledSubs = subs.every((player) => player.name && player.age && player.image);
    return filledMain && filledSubs;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validatePlayers()) {
      alert('Please fill out all player names and upload photos for all players.');
      return;
    }
    
    // Save progress to database
    const result = await saveProgress(2);
    if (result.success) {
      setStep(3);
    }
  };

  const renderPlayerCard = (player, index, isCaptain = false) => (
    <div className={`player-card ${isCaptain ? 'captain-card' : ''}`} key={player.id}>
      {isCaptain && (
        <div className="captain-badge">
          <i className="fas fa-star"></i> Team Captain
        </div>
      )}
      <label>
        {isCaptain ? 'Captain Name' : 'Player Name'}
        <input
          type="text"
          value={player.name}
          onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
          placeholder={isCaptain ? teamData.captainName || 'Captain Name' : (player.isSubstitute ? 'Substitute Name' : `${player.position} Player`)}
          required
        />
      </label>

      <label>
        Age
        <input
          type="number"
          value={player.age || ''}
          onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
          placeholder="e.g., 22"
          min="10"
          max="60"
          required
        />
      </label>

      {!player.isSubstitute && (
        <label>
          Position
          <select
            value={player.position}
            onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
          >
            {positionOptions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="file-label">
        Player Photo
        {player.image && (
          <div className="uploaded-photo-preview">
            <div className="photo-preview-container">
              <img src={player.image} alt="Player photo" className="photo-preview" />
              <div className="photo-overlay">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="uploaded-file-info">
              <i className="fas fa-check-circle"></i>
              <span>
                {player.imageFileName 
                  ? `Uploaded: ${player.imageFileName}` 
                  : 'Photo uploaded'}
              </span>
              <span className="file-change-hint">(Click to change)</span>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(index, e.target.files?.[0])}
        />
        {!player.image && (
          <span className="input-hint">JPG/PNG up to 2MB. Required.</span>
        )}
      </label>
    </div>
  );

  return (
    <form className="registration-form" onSubmit={handleNext}>
      <h3>Step 2 · Players</h3>
      <p className="step-description">Start with the captain, then add 6 more players and 4 substitutes.</p>

      <h4>Captain</h4>
      <div className="captain-section">
        {captain && renderPlayerCard(captain, players.indexOf(captain), true)}
      </div>

      <h4>Other Main Players</h4>
      <div className="players-grid">
        {otherMainPlayers.map((player) => renderPlayerCard(player, players.indexOf(player)))}
      </div>

      <h4>Substitutes</h4>
      <div className="players-grid">
        {subs.map((player) => renderPlayerCard(player, players.indexOf(player)))}
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={() => setStep(1)} disabled={saving}>
          Back
        </button>
        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> Save & Continue
            </>
          )}
        </button>
      </div>
    </form>
  );
}

