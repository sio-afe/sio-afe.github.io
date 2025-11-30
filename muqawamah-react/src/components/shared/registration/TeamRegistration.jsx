import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../../lib/supabaseClient';
import AuthModal from './AuthModal';
import FormationBuilder from './FormationBuilder';
import PaymentCheckout from './PaymentCheckout';
import PlayersForm from './PlayersForm';
import RegistrationSummary from './RegistrationSummary';
import TeamDetailsForm from './TeamDetailsForm';
import { RegistrationProvider, useRegistration, defaultPlayers, initialTeamData } from './RegistrationContext';
import RegistrationComplete from './RegistrationComplete';

const steps = [
  { id: 1, label: 'Team' },
  { id: 2, label: 'Players' },
  { id: 3, label: 'Formation' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Payment' },
  { id: 6, label: 'Complete' }
];

function Stepper() {
  const { step } = useRegistration();
  // Only show steps 1-5 in stepper (Complete is shown as result, not a step)
  const visibleSteps = steps.slice(0, 5);
  
  // Hide stepper if on complete step
  if (step === 6) return null;
  
  return (
    <div className="registration-stepper">
      {visibleSteps.map((s, index) => (
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
    existingTeamId,
    setPaymentStatus,
    setLastSavedStep
  } = useRegistration();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [hydrating, setHydrating] = useState(false);
  const hasHydratedRef = React.useRef(false);

  // Check for payment return status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentResult = urlParams.get('payment');
    
    if (paymentResult === 'success') {
      setPaymentStatus('success');
      setStep(5);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentResult === 'failed') {
      setPaymentStatus('failed');
      setStep(5);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setGlobalError('');

    const bootstrapUser = async () => {
      try {
        console.log('[Registration] Checking for existing session...');
        
        // Get user from Supabase with timeout
        const { data, error } = await Promise.race([
          supabaseClient.auth.getUser(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getUser timeout')), 3000)
          )
        ]);
        
        if (!mounted) return;
        
        if (error) {
          if (error.message === 'getUser timeout') {
            console.warn('[Registration] getUser timed out, assuming no session');
            setUser(null);
            resetForm();
            setLoading(false);
            return;
          }
          if (error.message !== 'Auth session missing!') {
            throw error;
          }
        }
        
        const sessionUser = data?.user ?? null;
        console.log('[Registration] User retrieved:', sessionUser ? sessionUser.email : 'No user');
        
        if (sessionUser) {
          setUser(sessionUser);
          // Wait for hydration to complete before showing UI
          await hydrateExistingRegistration(sessionUser, { force: true });
        } else {
          setUser(null);
          resetForm();
        }
      } catch (err) {
        console.error('[Registration] Bootstrap error:', err);
        if (mounted) {
          setUser(null);
          resetForm();
        }
      } finally {
        if (mounted) {
          console.log('[Registration] Bootstrap complete');
          setLoading(false);
        }
      }
    };

    bootstrapUser();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('[Registration] Auth state changed:', event);
      const sessionUser = session?.user ?? null;
      
      if (!sessionUser) {
        setUser(null);
        resetForm();
        setStep(1);
        hasHydratedRef.current = false;
      } else if (event === 'SIGNED_IN') {
        setUser(sessionUser);
        setLoading(true); // Show loading while hydrating
        await hydrateExistingRegistration(sessionUser, { force: true });
        setLoading(false);
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
          captainPhone: data.captain_phone 
            ? data.captain_phone.replace(/^\+91\s?/, '').trim()
            : '',
          formation: data.formation || '1-3-2-1'
        });

        // If there are saved players, map them; otherwise use defaults
        const savedPlayers = data.team_players && data.team_players.length > 0
          ? data.team_players.map((p, index) => ({
              id: p.id || `player-${index}`,
              name: p.player_name || '',
              age: p.player_age || '',
              aadhar_no: p.aadhar_no || '',
              position: p.position || 'SUB',
              isSubstitute: p.is_substitute,
              image: p.player_image,
              x: p.position_x ?? 50,
              y: p.position_y ?? 50
            }))
          : defaultPlayers();

        setPlayers(savedPlayers);
        
        // Check registration status and set appropriate step
        if (data.status === 'confirmed') {
          // Already confirmed, show completion
          setPaymentStatus('confirmed');
          setStep(6);
        } else if (data.status === 'pending_verification') {
          // Payment submitted, awaiting verification
          setPaymentStatus('pending_verification');
          setStep(6);
        } else if (data.status === 'pending_payment') {
          // Was in payment, go back to review
          setStep(4);
        } else {
          // Status is 'submitted' or 'draft' - resume from where they left off
          const savedStep = data.last_saved_step || 1;
          setLastSavedStep(savedStep);
          // Go to the next step after their last saved step, or review if complete
          const nextStep = savedStep >= 3 ? 4 : savedStep + 1;
          setStep(nextStep);
        }
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
      case 5:
        return <PaymentCheckout />;
      case 6:
        return <RegistrationComplete />;
      default:
        return <TeamDetailsForm />;
    }
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    setStep(1);
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
          </div>
          <p>Loading your registration...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not logged in
  if (!user) {
    return <AuthModal onSuccess={setUser} />;
  }

  return (
    <>
      <div className="header-actions">
        <span className="user-email">{user.email}</span>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt" /> Logout
        </button>
      </div>
      <div className="registration-header">
        <div className="registration-header-logo">
          <img src="/assets/img/title.png" alt="Muqawama 2026" />
          <h2 className="registration-header-title">Team Registration</h2>
          <p>{existingTeamId ? 'Edit your team registration and update any details.' : 'Complete all steps to confirm your team registration.'}</p>
        </div>
      </div>
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

