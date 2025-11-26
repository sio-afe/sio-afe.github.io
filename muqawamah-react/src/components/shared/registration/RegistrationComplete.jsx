import React from 'react';
import { useRegistration } from './RegistrationContext';

export default function RegistrationComplete() {
  const { teamData, resetForm } = useRegistration();

  const handleBackToHome = () => {
    resetForm();
    window.location.href = '/muqawamah/2026/';
  };

  return (
    <div className="registration-form registration-complete">
      <div className="complete-container">
        <div className="complete-icon">
          <div className="icon-circle success">
            <i className="fas fa-check"></i>
          </div>
        </div>

        <h2>Thank You for Registering!</h2>
        
        <div className="complete-team-info">
          {teamData.teamLogo && (
            <img src={teamData.teamLogo} alt={teamData.teamName} className="complete-team-logo" />
          )}
          <h3>{teamData.teamName}</h3>
          <span className="complete-category">
            {teamData.category === 'open-age' ? 'Open Age' : 'Under 17'} Category
          </span>
        </div>

        <div className="complete-message">
          <p className="main-message">
            Your registration for <strong>Muqawama 2026</strong> has been successfully submitted!
          </p>
          <p className="sub-message">
            Our team will shortly get in touch with you to follow up with the next steps. 
            Please keep an eye on your email and phone for updates.
          </p>
        </div>

        <div className="complete-details">
          <h4>What Happens Next?</h4>
          <ul className="next-steps-list">
            <li>
              <i className="fas fa-envelope"></i>
              <span>You'll receive a confirmation email at <strong>{teamData.captainEmail}</strong></span>
            </li>
            <li>
              <i className="fas fa-phone"></i>
              <span>Our team will contact you within 24-48 hours</span>
            </li>
            <li>
              <i className="fas fa-calendar-check"></i>
              <span>Fixture details will be shared before the tournament</span>
            </li>
            <li>
              <i className="fas fa-id-card"></i>
              <span>Player ID cards will be issued at the venue</span>
            </li>
          </ul>
        </div>

        <div className="complete-contact">
          <p>Questions? Reach out to us:</p>
          <div className="contact-links">
            <a href="mailto:info@sio-abulfazal.org">
              <i className="fas fa-envelope"></i> info@sio-abulfazal.org
            </a>
            <a href="https://instagram.com/muqawama2026" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i> @muqawama2026
            </a>
          </div>
        </div>

        <div className="complete-actions">
          <button type="button" className="primary-btn" onClick={handleBackToHome}>
            <i className="fas fa-home"></i> Back to Tournament Page
          </button>
        </div>
      </div>
    </div>
  );
}

