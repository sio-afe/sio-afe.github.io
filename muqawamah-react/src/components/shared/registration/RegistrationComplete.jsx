import React, { useState, useEffect } from 'react';
import { useRegistration } from './RegistrationContext';
import { supabaseClient } from '../../../lib/supabaseClient';

export default function RegistrationComplete() {
  const { teamData, resetForm, paymentStatus, successTeamId, setPaymentStatus } = useRegistration();
  const [loading, setLoading] = useState(true);

  // Fetch the latest status from database on mount
  useEffect(() => {
    const fetchStatus = async () => {
      if (!successTeamId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from('team_registrations')
          .select('status, payment_status')
          .eq('id', successTeamId)
          .single();

        if (error) throw error;

        if (data) {
          // Update the payment status from database
          if (data.status === 'confirmed' || data.payment_status === 'confirmed') {
            setPaymentStatus('confirmed');
          } else if (data.payment_status) {
            setPaymentStatus(data.payment_status);
          }
        }
      } catch (err) {
        console.error('Error fetching registration status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [successTeamId, setPaymentStatus]);

  const handleBackToHome = () => {
    resetForm();
    window.location.href = '/muqawamah/2026/';
  };

  // Check if registration is confirmed (only when admin has verified)
  const isConfirmed = paymentStatus === 'confirmed';

  if (loading) {
    return (
      <div className="registration-form registration-complete">
        <div className="complete-container">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading registration status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-form registration-complete">
      <div className="complete-container">
        <div className="complete-icon">
          <div className={`icon-circle ${isConfirmed ? 'confirmed' : 'pending'}`}>
            <i className={`fas ${isConfirmed ? 'fa-check' : 'fa-clock'}`}></i>
          </div>
        </div>

        <h2>{isConfirmed ? 'Registration Confirmed!' : 'Registration Submitted!'}</h2>
        
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
          {isConfirmed ? (
            <>
              <div className="confirmation-badge">
                <i className="fas fa-check-circle"></i>
                <span>Payment Verified</span>
              </div>
              <p className="main-message">
                Your registration for <strong>Muqawama 2026</strong> has been confirmed!
              </p>
              <p className="sub-message">
                Welcome to the tournament! Your team is now officially registered.
              </p>
            </>
          ) : (
            <>
              <div className="verification-badge">
                <i className="fas fa-hourglass-half"></i>
                <span>Payment Verification Pending</span>
              </div>
              <p className="main-message">
                Your registration for <strong>Muqawama 2026</strong> has been submitted successfully!
              </p>
              <p className="sub-message">
                We have received your payment screenshot and it is being verified by our team.
                You will receive confirmation within <strong>24 hours</strong>.
              </p>
            </>
          )}
        </div>

        <div className="complete-details">
          <h4>What Happens Next?</h4>
          <ul className="next-steps-list">
            {!isConfirmed && (
              <li>
                <i className="fas fa-search-dollar"></i>
                <span>Our team will verify your payment within 24 hours</span>
              </li>
            )}
            <li>
              <i className="fas fa-phone"></i>
              <span>The organisers will get in touch with you soon</span>
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

