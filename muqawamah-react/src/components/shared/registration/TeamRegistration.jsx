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
    resetForm
  } = useRegistration();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    let mounted = true;
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);
      if (sessionUser) {
        hydrateExistingRegistration(sessionUser);
      } else {
        resetForm();
      }
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (!sessionUser) {
        resetForm();
        setStep(1);
      } else {
        await hydrateExistingRegistration(sessionUser);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [resetForm, setStep, setPlayers, setTeamData, setExistingTeamId]);

  const hydrateExistingRegistration = async (sessionUser) => {
    try {
      const { data, error } = await supabaseClient
        .from('team_registrations')
        .select('*, team_players(*)')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setExistingTeamId(data.id);
        setReadOnlyMode(true);
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
      } else {
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
      setGlobalError(err.message);
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
          <p>Complete all steps to confirm your team. Registration is locked after submission.</p>
        </div>
        <div className="header-actions">
          <span className="user-email">{user.email}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </div>
      {globalError && <p className="auth-error">{globalError}</p>}
      {!readOnlyMode && <Stepper />}
      {readOnlyMode ? (
        <div className="registration-form">
          <h3>Your submitted team</h3>
          <p>
            You have already registered this team. Contact the organizers if you need additional changes.
          </p>
          <RegistrationSummary readOnly />
        </div>
      ) : (
        renderStep()
      )}
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

