import React, { useRef } from 'react';
import { useRegistration } from './RegistrationContext';
import { presetFormations } from './utils/formationUtils';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const categories = [
  { value: 'open-age', label: 'Open Age' },
  { value: 'u17', label: 'Under 17' }
];

export default function TeamDetailsForm() {
  const { teamData, setTeamData, setStep } = useRegistration();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) {
      alert('Logo size must be under 2MB');
      fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTeamData((prev) => ({ 
        ...prev, 
        teamLogo: event.target.result,
        teamLogoFileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!teamData.teamLogo) {
      alert('Please upload a team logo');
      return;
    }
    // Validate phone number (should have 10 digits after +91)
    const phoneDigits = teamData.captainPhone?.replace(/^\+91\s?/g, '').replace(/\s/g, '') || '';
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setStep(2);
  };

  return (
    <form className="registration-form" onSubmit={handleNext}>
      <h3>Step 1 · Team Details</h3>
      <p className="step-description">Tell us about your team and captain information.</p>

      <label>
        Team Name
        <input
          type="text"
          name="teamName"
          value={teamData.teamName}
          onChange={handleChange}
          placeholder="e.g., Rising Stars"
          required
        />
      </label>

      <label>
        Category
        <select name="category" value={teamData.category} onChange={handleChange}>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </label>

      <label className="file-label">
        Team Logo
        {teamData.teamLogo && (
          <div className="uploaded-photo-preview">
            <div className="photo-preview-container">
              <img src={teamData.teamLogo} alt="Team logo" className="photo-preview" />
              <div className="photo-overlay">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="uploaded-file-info">
              <i className="fas fa-check-circle"></i>
              <span>
                {teamData.teamLogoFileName 
                  ? `Uploaded: ${teamData.teamLogoFileName}` 
                  : 'Logo uploaded'}
              </span>
              <span className="file-change-hint">(Click to change)</span>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleLogoUpload}
        />
        {!teamData.teamLogo && (
          <span className="input-hint">JPG/PNG up to 2MB. Displayed across the tournament site.</span>
        )}
      </label>

      <label>
        Preferred Formation
        <select name="formation" value={teamData.formation} onChange={handleChange}>
          {presetFormations.map((formation) => (
            <option key={formation} value={formation}>
              {formation}
            </option>
          ))}
        </select>
        <span className="input-hint">This will be the starting layout in Step 3. You can still adjust players later.</span>
      </label>

      <div className="grid-2">
        <label>
          Captain Name
          <input
            type="text"
            name="captainName"
            value={teamData.captainName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Captain Email
          <input
            type="email"
            name="captainEmail"
            value={teamData.captainEmail}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label>
        Captain Phone
        <div className="phone-input-wrapper">
          <span className="phone-prefix">
            <i className="fas fa-flag"></i> +91
          </span>
          <input
            type="tel"
            name="captainPhone"
            value={teamData.captainPhone?.replace(/^\+91\s?/, '').trim() || ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Only numbers
              let formatted = '';
              if (value) {
                // Format as +91 XXXXX XXXXX (10 digits)
                formatted = '+91 ';
                if (value.length <= 5) {
                  formatted += value;
                } else {
                  formatted += `${value.slice(0, 5)} ${value.slice(5, 10)}`;
                }
              }
              setTeamData((prev) => ({ ...prev, captainPhone: formatted }));
            }}
            placeholder="98765 43210"
            pattern="[0-9\s]{10,12}"
            maxLength={12}
            onInvalid={(e) => {
              const input = e.target;
              const phoneNumber = teamData.captainPhone?.replace(/^\+91\s?/g, '').replace(/\s/g, '') || '';
              if (phoneNumber.length < 10) {
                input.setCustomValidity('Please enter a valid 10-digit mobile number');
              } else {
                input.setCustomValidity('');
              }
            }}
            onInput={(e) => {
              e.target.setCustomValidity('');
            }}
            required
          />
        </div>
        <span className="input-hint">
          <i className="fas fa-info-circle"></i> 10-digit mobile number (e.g., 98765 43210)
        </span>
      </label>

      <div className="form-actions">
        <button type="submit" className="primary-btn">
          Continue to Players
        </button>
      </div>
    </form>
  );
}

