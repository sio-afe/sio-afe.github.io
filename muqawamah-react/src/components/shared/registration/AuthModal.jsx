import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';

const modes = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  RESET: 'reset'
};

export default function AuthModal({ onSuccess }) {
  const [mode, setMode] = useState(modes.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === modes.LOGIN) {
        const { data, error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        setMessage('Logged in successfully');
        onSuccess(data.user);
      } else if (mode === modes.SIGNUP) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/muqawamah/2026/register/',
            emailRedirectToForToken: window.location.origin + '/muqawamah/2026/register/',
            data: { skip_confirmation: true }
          }
        });
        if (signUpError) throw signUpError;
        setMessage('Account created successfully.');
        if (data.user) onSuccess(data.user);
      } else {
        const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(email);
        if (resetError) throw resetError;
        setMessage('Password reset email sent.');
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      popup?.close();
    };
  }, [popup]);

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
      if (data?.url) {
        const authWindow = window.open(
          data.url,
          '_blank',
          'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=480, height=720'
        );
        setPopup(authWindow);
      }
    } catch (oauthError) {
      setError(
        `Google sign-in is not available yet. Please enable the Google provider in Supabase or use email/phone login. (${oauthError.message})`
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-card">
        <h2>{mode === modes.LOGIN ? 'Login' : mode === modes.SIGNUP ? 'Create Account' : 'Reset Password'}</h2>
        <p className="auth-subtitle">Use your email to authenticate and manage your team registration.</p>

        <div className="auth-alternative">
          <button type="button" className="auth-oauth-btn" onClick={handleGoogleSignIn} disabled={googleLoading}>
            <i className="fab fa-google"></i> Continue with Google
          </button>
        </div>

        <div className="auth-divider">
          <span>or email</span>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {mode !== modes.RESET && (
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}

          {mode === modes.SIGNUP && (
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === modes.LOGIN ? 'Login' : mode === modes.SIGNUP ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-switcher">
          {mode !== modes.LOGIN && (
            <button onClick={() => setMode(modes.LOGIN)}>Already have an account? Login</button>
          )}
          {mode !== modes.SIGNUP && (
            <button onClick={() => setMode(modes.SIGNUP)}>Need an account? Sign Up</button>
          )}
          {mode !== modes.RESET && (
            <button onClick={() => setMode(modes.RESET)}>Forgot password?</button>
          )}
        </div>
      </div>
    </div>
  );
}

