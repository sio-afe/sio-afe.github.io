import React, { useRef, useState } from 'react';
import { useRegistration } from './RegistrationContext';
import { presetFormations } from './utils/formationUtils';
import { compressImage, getBase64SizeKB } from './utils/imageCompression';

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const categories = [
  { value: 'open-age', label: 'Open Age' },
  { value: 'u17', label: 'Under 17' }
];

export default function TeamDetailsForm() {
  const { teamData, setTeamData, setStep, saveProgress, saving, error } = useRegistration();
  const fileInputRef = useRef(null);
  const [compressing, setCompressing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_LOGO_SIZE) {
      alert('Logo size must be under 2MB');
      fileInputRef.current.value = '';
      return;
    }

    try {
      setCompressing(true);
      
      // Compress the image before storing
      const compressedBase64 = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        outputFormat: 'image/jpeg'
      });

      const compressedSizeKB = getBase64SizeKB(compressedBase64);
      console.log(`Logo compressed: ${Math.round(file.size / 1024)}KB → ${compressedSizeKB}KB`);

      setTeamData((prev) => ({ 
        ...prev, 
        teamLogo: compressedBase64,
        teamLogoFileName: file.name
      }));
    } catch (error) {
      console.error('Error compressing logo:', error);
      alert('Failed to process image. Please try another file.');
      fileInputRef.current.value = '';
    } finally {
      setCompressing(false);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!teamData.teamLogo) {
      alert('Please upload a team logo');
      return;
    }
    // Validate phone number (should have 10 digits)
    const phoneDigits = teamData.captainPhone?.replace(/\s/g, '') || '';
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    
    // Save progress to database
    const result = await saveProgress(1);
    if (result.success) {
      setStep(2);
    }
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
        {compressing && (
          <div className="compressing-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Compressing image...</span>
          </div>
        )}
        {teamData.teamLogo && !compressing && (
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
          disabled={compressing}
        />
        {!teamData.teamLogo && !compressing && (
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
        <input
          type="tel"
          name="captainPhone"
          value={teamData.captainPhone || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Only numbers
            let formatted = '';
            if (value) {
              // Format as XXXXX XXXXX (10 digits)
              if (value.length <= 5) {
                formatted = value;
              } else {
                formatted = `${value.slice(0, 5)} ${value.slice(5, 10)}`;
              }
            }
            setTeamData((prev) => ({ ...prev, captainPhone: formatted }));
          }}
          placeholder="98765 43210"
          pattern="[0-9\s]{10,12}"
          maxLength={11}
          onInvalid={(e) => {
            const input = e.target;
            const phoneNumber = teamData.captainPhone?.replace(/\s/g, '') || '';
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
        <span className="input-hint">
          <i className="fas fa-info-circle"></i> 10-digit mobile number (e.g., 98765 43210)
        </span>
      </label>

      {error && <p className="auth-error">{error}</p>}

      <div className="form-actions">
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

