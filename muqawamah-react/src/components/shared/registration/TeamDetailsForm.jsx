import React, { useRef } from 'react';
import { useRegistration } from './RegistrationContext';
import { presetFormations } from './utils/formationUtils';

const MAX_LOGO_SIZE = 500 * 1024; // 500KB

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

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) {
      alert('Logo size must be under 500KB');
      fileInputRef.current.value = '';
      return;
    }
    const base64 = await fileToBase64(file);
    setTeamData((prev) => ({ ...prev, teamLogo: base64 }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleNext = (e) => {
    e.preventDefault();
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

      <label>
        Team Logo (optional)
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} />
        <span className="input-hint">JPG/PNG up to 500KB. Displayed across the tournament site.</span>
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
        Captain Phone (optional)
        <input
          type="tel"
          name="captainPhone"
          value={teamData.captainPhone}
          onChange={handleChange}
          placeholder="+966 5x xxx xxxx"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="primary-btn">
          Continue to Players
        </button>
      </div>
    </form>
  );
}

