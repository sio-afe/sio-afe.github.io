import React, { useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';

export default function AuthModal({ onSuccess }) {
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { data, error: oauthError } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/muqawamah/2026/register/'
        }
      });
      if (oauthError) throw oauthError;
      // Let Supabase handle the redirect in the same window
      // The session will be established when the user is redirected back
    } catch (oauthError) {
      setError(
        `Google sign-in failed: ${oauthError.message}. Please contact support.`
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/assets/img/title.png" alt="Muqawama 2026" />
        </div>
        <h2>Welcome to Muqawama 2026</h2>
        <p className="auth-subtitle">Sign in with your Google account to register your team and manage your registration.</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-alternative">
          <button type="button" className="auth-oauth-btn google-btn" onClick={handleGoogleSignIn} disabled={googleLoading}>
            {googleLoading ? (
              <>
                <div className="spinner-small"></div> Signing in...
              </>
            ) : (
              <>
                <i className="fab fa-google"></i> Continue with Google
              </>
            )}
          </button>
        </div>

        <p className="auth-note">
          <i className="fas fa-info-circle"></i> Your Google account will be used to authenticate and save your team registration.
        </p>
      </div>
    </div>
  );
}

