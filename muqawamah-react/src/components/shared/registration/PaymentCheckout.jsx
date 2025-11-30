import React, { useState, useRef } from 'react';
import { useRegistration } from './RegistrationContext';
import { supabaseClient } from '../../../lib/supabaseClient';
import RegistrationComplete from './RegistrationComplete';

// Pricing and QR code configuration
const PRICING = {
  'open-age': {
    label: 'Open Age',
    amount: 2200,
    qrCode: '/assets/img/Muqawama/qr-2200.svg'
  },
  'u17': {
    label: 'Under 17',
    amount: 2000,
    qrCode: '/assets/img/Muqawama/qr-2000.svg'
  }
};

export default function PaymentCheckout() {
  const {
    teamData,
    players,
    setStep,
    loading,
    setLoading,
    error,
    setError,
    existingTeamId,
    setExistingTeamId,
    setSuccessTeamId,
    paymentStatus,
    setPaymentStatus
  } = useRegistration();

  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const category = teamData.category || 'open-age';
  const pricing = PRICING[category];
  const totalAmount = pricing.amount;

  // Handle screenshot selection
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setScreenshot(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert file to base64 for storage
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const submitPayment = async () => {
    if (!screenshot) {
      setError('Please upload the payment screenshot');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to proceed.');
      }

      setUploadProgress(20);

      // Convert screenshot to base64
      const screenshotBase64 = await fileToBase64(screenshot);
      setUploadProgress(40);

      let teamId = existingTeamId;
      
      if (!existingTeamId) {
        // Create new registration
        const { data: insertTeam, error: teamError } = await supabaseClient
          .from('team_registrations')
          .insert({
            user_id: user.id,
            team_name: teamData.teamName,
            category: teamData.category,
            team_logo: teamData.teamLogo,
            captain_name: teamData.captainName,
            captain_email: teamData.captainEmail,
            captain_phone: teamData.captainPhone,
            formation: teamData.formation,
            status: 'pending_verification', // Pending admin verification
            payment_amount: totalAmount,
            payment_screenshot: screenshotBase64,
            payment_status: 'pending_verification',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (teamError) throw teamError;
        teamId = insertTeam.id;
        setExistingTeamId(teamId);
      } else {
        // Update existing registration
        const { error: updateError } = await supabaseClient
          .from('team_registrations')
          .update({
            team_name: teamData.teamName,
            category: teamData.category,
            team_logo: teamData.teamLogo,
            captain_name: teamData.captainName,
            captain_email: teamData.captainEmail,
            captain_phone: teamData.captainPhone,
            formation: teamData.formation,
            status: 'pending_verification',
            payment_amount: totalAmount,
            payment_screenshot: screenshotBase64,
            payment_status: 'pending_verification',
            submitted_at: new Date().toISOString()
          })
          .eq('id', existingTeamId);
        
        if (updateError) throw updateError;
      }

      setUploadProgress(60);

      // Save players
      await supabaseClient.from('team_players').delete().eq('team_id', teamId);
      
      const payload = players.map((player) => ({
        team_id: teamId,
        player_name: player.name || '',
        player_age: player.age ? parseInt(player.age) : null,
        aadhar_no: player.aadhar_no || null,
        position: player.position || 'SUB',
        is_substitute: player.isSubstitute || false,
        player_image: player.image || null,
        position_x: typeof player.x === 'number' && !isNaN(player.x) ? player.x : 50,
        position_y: typeof player.y === 'number' && !isNaN(player.y) ? player.y : 50
      }));

      setUploadProgress(80);

      const { error: playersError } = await supabaseClient.from('team_players').insert(payload);
      if (playersError) throw playersError;

      setUploadProgress(100);

      // Show success page
      setSuccessTeamId(teamId);
      setPaymentStatus('success');
      setStep(6);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // If payment was already completed, show the thank you page
  if (paymentStatus === 'success') {
    return <RegistrationComplete />;
  }

  return (
    <div className="registration-form payment-checkout">
      <h3>Step 5 · Payment</h3>
      <p className="step-description">Scan the QR code, pay and upload the screenshot.</p>

      {/* Order Summary */}
      <section className="checkout-section">
        <h4><i className="fas fa-receipt"></i> Order Summary</h4>
        
        <div className="order-summary-card">
          <div className="order-item">
            <div className="order-item-info">
              <span className="item-name">Team Registration</span>
              <span className="item-detail">{teamData.teamName} • {pricing.label}</span>
            </div>
            <span className="item-price">₹{pricing.amount}</span>
          </div>

          <div className="order-total">
            <span>Total Amount</span>
            <span className="total-price">₹{totalAmount}</span>
          </div>
        </div>
      </section>

      {/* QR Code Payment */}
      <section className="checkout-section qr-section">
        <h4><i className="fas fa-qrcode"></i> Scan & Pay</h4>
        
        <div className="qr-payment-container">
          <div className="qr-code-wrapper">
            <img 
              src={pricing.qrCode} 
              alt={`Pay ₹${totalAmount} via UPI`}
              className="qr-code-image"
            />
          </div>
          
          <a 
            href={pricing.qrCode} 
            download={`muqawama-payment-qr-${totalAmount}.svg`}
            className="download-qr-btn"
          >
            <i className="fas fa-download"></i> Download QR Code
          </a>
          
          <div className="qr-instructions">
            <div className="instruction-step">
              <span className="step-number">1</span>
              <span>Open any UPI app (GPay, PhonePe, Paytm, etc.)</span>
            </div>
            <div className="instruction-step">
              <span className="step-number">2</span>
              <span>Scan the QR code and pay <strong>₹{totalAmount}</strong></span>
            </div>
            <div className="instruction-step">
              <span className="step-number">3</span>
              <span>Take a screenshot of the payment confirmation</span>
            </div>
            <div className="instruction-step">
              <span className="step-number">4</span>
              <span>Upload the screenshot below</span>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Upload */}
      <section className="checkout-section">
        <h4><i className="fas fa-upload"></i> Upload Payment Screenshot</h4>
        
        <div className="screenshot-upload-container">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleScreenshotChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          {screenshotPreview ? (
            <div className="screenshot-preview">
              <img src={screenshotPreview} alt="Payment Screenshot" />
              <button 
                type="button" 
                className="remove-screenshot-btn"
                onClick={() => {
                  setScreenshot(null);
                  setScreenshotPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <i className="fas fa-times"></i> Remove
              </button>
            </div>
          ) : (
            <div 
              className="screenshot-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <p>Click to upload payment screenshot</p>
              <span>JPG, PNG up to 5MB</span>
            </div>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>Uploading... {uploadProgress}%</span>
          </div>
        )}
      </section>

      {/* Team Summary */}
      <section className="checkout-section">
        <h4><i className="fas fa-users"></i> Registration Details</h4>
        
        <div className="checkout-team-summary">
          <div className="team-mini-card">
            {teamData.teamLogo && (
              <img src={teamData.teamLogo} alt={teamData.teamName} className="team-mini-logo" />
            )}
            <div className="team-mini-info">
              <span className="team-mini-name">{teamData.teamName}</span>
              <span className="team-mini-category">{pricing.label} • {players.length} Players</span>
            </div>
          </div>
          <div className="captain-info">
            <span><i className="fas fa-user"></i> {teamData.captainName}</span>
            <span><i className="fas fa-envelope"></i> {teamData.captainEmail}</span>
          </div>
        </div>
      </section>

      {error && <p className="auth-error"><i className="fas fa-exclamation-circle"></i> {error}</p>}

      <div className="form-actions">
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setStep(4)}
          disabled={loading}
        >
          Back to Review
        </button>
        <button
          type="button"
          className="primary-btn pay-btn"
          onClick={submitPayment}
          disabled={loading || !screenshot}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Submit Registration
            </>
          )}
        </button>
      </div>

      <p className="terms-note">
        <i className="fas fa-info-circle"></i> Your registration will be verified within 24 hours after payment confirmation.
      </p>
    </div>
  );
}
