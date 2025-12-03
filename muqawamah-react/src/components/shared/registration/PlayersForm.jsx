import React, { useState } from 'react';
import { useRegistration } from './RegistrationContext';
import { compressImage, getBase64SizeKB } from './utils/imageCompression';

const positionOptions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST'];

export default function PlayersForm() {
  const { players, setPlayers, setStep, saveProgress, saving, error, teamData } = useRegistration();
  const [compressingIndex, setCompressingIndex] = useState(null);

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

  const handleFile = async (index, file) => {
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Player photo must be under 2MB');
      return;
    }

    try {
      setCompressingIndex(index);
      
      // Compress and convert the image to WebP format before storing
      const compressedBase64 = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        outputFormat: 'image/webp' // Convert to WebP for better compression
      });

      const compressedSizeKB = getBase64SizeKB(compressedBase64);
      const originalSizeKB = Math.round(file.size / 1024);
      console.log(`Player photo compressed to WebP: ${originalSizeKB}KB → ${compressedSizeKB}KB`);

      handlePlayerChange(index, 'image', compressedBase64);
      handlePlayerChange(index, 'imageFileName', file.name.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    } catch (error) {
      console.error('Error compressing player photo:', error);
      alert('Failed to process image. Please try another file.');
    } finally {
      setCompressingIndex(null);
    }
  };

  const validatePlayers = () => {
    const filledMain = mainPlayers.every(
      (player) => player.name && player.age && player.aadhar_no && player.aadhar_no.length === 12 && player.position && player.image
    );
    const filledSubs = subs.every((player) => player.name && player.age && player.aadhar_no && player.aadhar_no.length === 12 && player.image);
    return filledMain && filledSubs;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!validatePlayers()) {
      alert('Please fill out all required fields including name, age, Aadhar number, and photo for all players.');
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

      <label>
        Aadhar Number
        <input
          type="text"
          value={player.aadhar_no || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
            if (value.length <= 12) {
              handlePlayerChange(index, 'aadhar_no', value);
            }
          }}
          placeholder="12-digit Aadhar number"
          maxLength="12"
          pattern="[0-9]{12}"
          required
        />
        <span className="input-hint">Enter 12-digit Aadhar number</span>
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
        {compressingIndex === index && (
          <div className="compressing-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Compressing image...</span>
          </div>
        )}
        {player.image && compressingIndex !== index && (
          <div className="uploaded-photo-preview">
            <div className="photo-preview-container">
              <img src={player.image} alt="Player photo" className="photo-preview" />
              <div className="photo-overlay">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="uploaded-file-info">
              <i className="fas fa-check-circle"></i>
              <span className="file-name-text">
                <strong>Uploaded:</strong> {player.imageFileName || 'Photo uploaded'}
              </span>
              <span className="file-change-hint">(Click to change)</span>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(index, e.target.files?.[0])}
          disabled={compressingIndex === index}
        />
        {!player.image && compressingIndex !== index && (
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

