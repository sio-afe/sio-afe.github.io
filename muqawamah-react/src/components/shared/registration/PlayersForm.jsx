import React from 'react';
import { useRegistration } from './RegistrationContext';

const positionOptions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'CF', 'ST'];



export default function PlayersForm() {
  const { players, setPlayers, setStep } = useRegistration();

  const handlePlayerChange = (index, field, value) => {
    setPlayers((prev) =>
      prev.map((player, idx) => (idx === index ? { ...player, [field]: value } : player))
    );
  };

  const mainPlayers = players.filter((p) => !p.isSubstitute);
  const subs = players.filter((p) => p.isSubstitute);

  const handleFile = async (index, file) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Player photo must be under 500KB');
      return;
    }
    const base64 = await fileToBase64(file);
    handlePlayerChange(index, 'image', base64);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const validatePlayers = () => {
    const filledMain = mainPlayers.every((player) => player.name && player.position);
    const filledSubs = subs.every((player) => player.name);
    return filledMain && filledSubs;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validatePlayers()) {
      alert('Please fill out all player names and positions (for main players).');
      return;
    }
    setStep(3);
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
        Player Photo (optional)
        <input type="file" accept="image/*" onChange={(e) => handleFile(index, e.target.files?.[0])} />
      </label>
    </div>
  );

  return (
    <form className="registration-form" onSubmit={handleNext}>
      <h3>Step 2 · Players</h3>
      <p className="step-description">Provide 7 main players and 3 substitutes.</p>

      <h4>Main Players</h4>
      <div className="players-grid">
        {mainPlayers.map((player, index) => renderPlayerCard(player, players.indexOf(player)))}
      </div>

      <h4>Substitutes</h4>
      <div className="players-grid">
        {subs.map((player) => renderPlayerCard(player, players.indexOf(player)))}
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
          Back
        </button>
        <button type="submit" className="primary-btn">
          Continue to Formation
        </button>
      </div>
    </form>
  );
}

