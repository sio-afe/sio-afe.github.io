import React from 'react';
import { useRegistration } from './RegistrationContext';

const positionOptions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST'];

export default function PlayersForm() {
  const { players, setPlayers, setStep, saveProgress, saving, error } = useRegistration();

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prev) =>
      prev.map((player, idx) => (idx === index ? { ...player, [field]: value } : player))
    );
  };

  const mainPlayers = players.filter((p) => !p.isSubstitute);
  const subs = players.filter((p) => p.isSubstitute);

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
      (player) => player.name && player.position && player.image
    );
    const filledSubs = subs.every((player) => player.name && player.image);
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

  const renderPlayerCard = (player, index) => (
    <div className="player-card" key={player.id}>
      <label>
        Player Name
        <input
          type="text"
          value={player.name}
          onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
          placeholder={player.isSubstitute ? 'Substitute Name' : `${player.position} Player`}
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
      <p className="step-description">Provide 7 main players and 4 substitutes.</p>

      <h4>Main Players</h4>
      <div className="players-grid">
        {mainPlayers.map((player, index) => renderPlayerCard(player, players.indexOf(player)))}
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

