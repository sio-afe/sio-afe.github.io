import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AuthModal from './AuthModal';
import FormationBuilder from './FormationBuilder';
import PlayersForm from './PlayersForm';
import RegistrationSummary from './RegistrationSummary';
import TeamDetailsForm from './TeamDetailsForm';
import { RegistrationProvider, useRegistration, defaultPlayers, initialTeamData } from './RegistrationContext';

const steps = [
  { id: 1, label: 'Team' },
  { id: 2, label: 'Players' },
  { id: 3, label: 'Formation' },
  { id: 4, label: 'Review' }
];

function Stepper() {
  const { step } = useRegistration();
  return (
    <div className="registration-stepper">
      {steps.map((s, index) => (
        <div key={s.id} className={`step ${step === s.id ? 'active' : ''} ${step > s.id ? 'complete' : ''}`}>
          <span className="step-number">{index + 1}</span>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function RegistrationFlow() {
  const {
    step,
    setStep,
    setTeamData,
    setPlayers,
    setExistingTeamId,
    readOnlyMode,
    setReadOnlyMode,
    resetForm,
    existingTeamId
  } = useRegistration();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [hydrating, setHydrating] = useState(false);
  const hasHydratedRef = React.useRef(false);

  useEffect(() => {
    let mounted = true;
    setGlobalError('');

    const bootstrapUser = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getUser();
        if (!mounted) return;
        if (error && error.message !== 'Auth session missing!') {
          throw error;
        }
        const sessionUser = data.user ?? null;
        console.log('[Registration] User retrieved:', sessionUser ? sessionUser.email : 'No user');
        setUser(sessionUser);

        if (sessionUser) {
          await hydrateExistingRegistration(sessionUser, { force: true });
        } else {
          resetForm();
        }
      } catch (err) {
        console.error('[Registration] User fetch error:', err);
        if (mounted) {
          setGlobalError('Unable to verify your login. Please refresh and try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapUser();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      
      if (!sessionUser) {
        resetForm();
        setStep(1);
        hasHydratedRef.current = false;
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await hydrateExistingRegistration(sessionUser, { force: true });
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const hydrateExistingRegistration = async (sessionUser, { force = false } = {}) => {
    if (hasHydratedRef.current && !force) return;
    hasHydratedRef.current = true;
    console.log('[Registration] Starting hydration from database...');
    setHydrating(true);
    setGlobalError('');
    try {
      const { data, error } = await supabaseClient
        .from('team_registrations')
        .select('*, team_players(*)')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (error) {
        console.error('[Registration] Database error:', error);
        if (error.code !== 'PGRST116') throw error;
      }

      if (data) {
        console.log('[Registration] Found existing registration, loading data...');
        setExistingTeamId(data.id);
        setReadOnlyMode(false); // Allow editing
        setTeamData({
          teamName: data.team_name || '',
          category: data.category || 'open-age',
          teamLogo: data.team_logo,
          captainName: data.captain_name || '',
          captainEmail: data.captain_email || sessionUser.email || '',
          captainPhone: data.captain_phone || '',
          formation: data.formation || '1-3-2-1'
        });

        const mappedPlayers =
          data.team_players?.map((p, index) => ({
            id: p.id || `player-${index}`,
            name: p.player_name || '',
            position: p.position || 'SUB',
            isSubstitute: p.is_substitute,
            image: p.player_image,
            x: p.position_x ?? 50,
            y: p.position_y ?? 50
          })) || defaultPlayers();

        setPlayers(mappedPlayers);
        setStep(4); // Go directly to review step for existing registrations
      } else {
        console.log('[Registration] No existing registration found, starting fresh');
        setExistingTeamId(null);
        setReadOnlyMode(false);
        setTeamData({
          ...initialTeamData,
          captainEmail: sessionUser.email || ''
        });
        setPlayers(defaultPlayers());
        setStep(1);
      }
    } catch (err) {
      console.error('[Registration] Hydration error:', err);
      console.warn('[Registration] Database might be unreachable or RLS policies might be blocking access');
      setGlobalError('Could not load your saved registration. You can continue and submitting will overwrite the previous data.');
      // Still initialize form even if hydration fails
      console.log('[Registration] Initializing fresh form despite error');
      setExistingTeamId(null);
      setReadOnlyMode(false);
      setTeamData({
        ...initialTeamData,
        captainEmail: sessionUser.email || ''
      });
      setPlayers(defaultPlayers());
      setStep(1);
    } finally {
      setHydrating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <TeamDetailsForm />;
      case 2:
        return <PlayersForm />;
      case 3:
        return <FormationBuilder />;
      case 4:
        return <RegistrationSummary />;
      default:
        return <TeamDetailsForm />;
    }
  };

  if (loading) {
    return <p className="auth-message">Checking session...</p>;
  }

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setStep(1);
  };

  if (!user) {
    return <AuthModal onSuccess={setUser} />;
  }

  return (
    <>
      <div className="registration-header">
        <div>
          <h1>Muqawama 2026 · Team Registration</h1>
          <p>{existingTeamId ? 'Edit your team registration and update any details.' : 'Complete all steps to confirm your team registration.'}</p>
        </div>
        <div className="header-actions">
          <span className="user-email">{user.email}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </div>
      {hydrating && <p className="auth-message subtle">Loading your saved registration…</p>}
      {globalError && <p className="auth-error">{globalError}</p>}
      <Stepper />
      {renderStep()}
    </>
  );
}

export default function TeamRegistration() {
  useEffect(() => {
    document.body.classList.add('registration-body');
    return () => document.body.classList.remove('registration-body');
  }, []);

  return (
    <RegistrationProvider>
      <div className="registration-container">
        <RegistrationFlow />
      </div>
    </RegistrationProvider>
  );
}

