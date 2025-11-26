import React from 'react';
import { useRegistration } from './RegistrationContext';
import { supabaseClient } from '../../../lib/supabaseClient';
import RegistrationComplete from './RegistrationComplete';

// Pricing configuration
const PRICING = {
  'open-age': {
    label: 'Open Age',
    amount: 2500,
    earlyBird: 2200,
    earlyBirdDeadline: '2025-12-15'
  },
  'u17': {
    label: 'Under 17',
    amount: 2300,
    earlyBird: 2000,
    earlyBirdDeadline: '2025-12-15'
  }
};

const CONVENIENCE_FEE_PERCENT = 2.5; // Easebuzz convenience fee

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

  const category = teamData.category || 'open-age';
  const pricing = PRICING[category];
  
  // Check if early bird is active
  const isEarlyBird = new Date() < new Date(pricing.earlyBirdDeadline);
  const baseAmount = isEarlyBird ? pricing.earlyBird : pricing.amount;
  
  // Calculate totals
  const subtotal = baseAmount;
  const convenienceFee = Math.round((subtotal * CONVENIENCE_FEE_PERCENT) / 100);
  const totalAmount = subtotal + convenienceFee;

  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user }
      } = await supabaseClient.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to proceed with payment.');
      }

      // TEST MODE: Skip Easebuzz, directly confirm registration
      let teamId = existingTeamId;
      
      if (!existingTeamId) {
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
            status: 'confirmed', // TEST: Direct confirm
            payment_amount: totalAmount,
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
            status: 'confirmed', // TEST: Direct confirm
            payment_amount: totalAmount,
            submitted_at: new Date().toISOString()
          })
          .eq('id', existingTeamId);
        
        if (updateError) throw updateError;
      }

      // Save players
      await supabaseClient.from('team_players').delete().eq('team_id', teamId);
      
      const payload = players.map((player) => ({
        team_id: teamId,
        player_name: player.name,
        player_age: player.age ? parseInt(player.age) : null,
        position: player.position,
        is_substitute: player.isSubstitute,
        player_image: player.image,
        position_x: player.x,
        position_y: player.y
      }));

      const { error: playersError } = await supabaseClient.from('team_players').insert(payload);
      if (playersError) throw playersError;

      // TEST MODE: Show success page directly instead of Easebuzz redirect
      setPaymentStatus('success');
      setStep(6);

      /* 
      // REAL PAYMENT CODE - Uncomment when Easebuzz is ready
      const txnId = `MUQ${Date.now()}${teamId}`;

      const { data: paymentData, error: paymentError } = await supabaseClient.functions.invoke(
        'easebuzz-initiate',
        {
          body: {
            txnid: txnId,
            amount: totalAmount,
            productinfo: `Muqawama 2026 - ${pricing.label} Registration`,
            firstname: teamData.captainName,
            email: teamData.captainEmail,
            phone: teamData.captainPhone || '9999999999',
            teamId: teamId,
            category: category
          }
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Failed to initiate payment');
      }

      if (paymentData.status === 1 && paymentData.payUrl) {
        window.location.href = paymentData.payUrl;
      } else {
        throw new Error(paymentData.error || 'Payment initiation failed');
      }
      */
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If payment was already completed, show the thank you page
  if (paymentStatus === 'success') {
    return <RegistrationComplete />;
  }

  return (
    <div className="registration-form payment-checkout">
      <h3>Step 5 · Payment</h3>
      <p className="step-description">Complete your registration by making the payment.</p>

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

          {isEarlyBird && (
            <div className="order-item discount">
              <div className="order-item-info">
                <span className="item-name">🎁 Early Bird Discount</span>
                <span className="item-detail">Valid until {new Date(pricing.earlyBirdDeadline).toLocaleDateString()}</span>
              </div>
              <span className="item-price">-₹{pricing.amount - pricing.earlyBird}</span>
            </div>
          )}

          <div className="order-item subtotal">
            <span className="item-name">Subtotal</span>
            <span className="item-price">₹{subtotal}</span>
          </div>

          <div className="order-item fee">
            <div className="order-item-info">
              <span className="item-name">Payment Gateway Fee</span>
              <span className="item-detail">{CONVENIENCE_FEE_PERCENT}%</span>
            </div>
            <span className="item-price">₹{convenienceFee}</span>
          </div>

          <div className="order-total">
            <span>Total Amount</span>
            <span className="total-price">₹{totalAmount}</span>
          </div>
        </div>
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

      {/* Payment Methods Info */}
      <section className="checkout-section">
        <h4><i className="fas fa-credit-card"></i> Payment Methods</h4>
        <div className="payment-methods">
          <div className="payment-method">
            <i className="fas fa-mobile-alt"></i>
            <span>UPI</span>
          </div>
          <div className="payment-method">
            <i className="fas fa-credit-card"></i>
            <span>Cards</span>
          </div>
          <div className="payment-method">
            <i className="fas fa-university"></i>
            <span>Net Banking</span>
          </div>
          <div className="payment-method">
            <i className="fas fa-wallet"></i>
            <span>Wallets</span>
          </div>
        </div>
        <p className="payment-secure-note">
          <i className="fas fa-lock"></i> Secured by Easebuzz Payment Gateway
        </p>
      </section>

      {error && <p className="auth-error">{error}</p>}

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
          onClick={initiatePayment}
          disabled={loading}
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <i className="fas fa-lock"></i> Pay ₹{totalAmount}
            </>
          )}
        </button>
      </div>

      <p className="terms-note">
        By proceeding, you agree to our{' '}
        <a href="/muqawamah/terms-and-conditions/" target="_blank" rel="noreferrer">
          Terms & Conditions
        </a>{' '}
        and{' '}
        <a href="/muqawamah/refund-policy/" target="_blank" rel="noreferrer">
          Refund Policy
        </a>
      </p>
    </div>
  );
}

