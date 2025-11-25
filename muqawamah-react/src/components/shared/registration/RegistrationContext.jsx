import React, { createContext, useContext, useMemo, useState } from 'react';

const RegistrationContext = createContext(null);

export const useRegistration = () => {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return ctx;
};

export const defaultPlayers = () => {
  const basePositions = ['GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'ST'];
  const substitutes = ['SUB1', 'SUB2', 'SUB3', 'SUB4'];
  const defaults = basePositions.map((pos, index) => ({
    id: `${pos}-${index}`,
    name: '',
    position: pos,
    isSubstitute: false,
    image: null,
    x: 50,
    y: 50
  }));
  const subs = substitutes.map((pos, index) => ({
    id: `${pos}-${index}`,
    name: '',
    position: 'SUB',
    isSubstitute: true,
    image: null,
    x: 10 + index * 20,
    y: 90
  }));
  return [...defaults, ...subs];
};

export const initialTeamData = {
  teamName: '',
  category: 'open-age',
  teamLogo: null,
  teamLogoFileName: null,
  captainName: '',
  captainEmail: '',
  captainPhone: '',
  formation: '1-3-2-1'
};

export const RegistrationProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [teamData, setTeamData] = useState(initialTeamData);
  const [players, setPlayers] = useState(defaultPlayers());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successTeamId, setSuccessTeamId] = useState(null);
  const [existingTeamId, setExistingTeamId] = useState(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'
  const [transactionId, setTransactionId] = useState(null);

  const resetForm = () => {
    setTeamData(initialTeamData);
    setPlayers(defaultPlayers());
    setSuccessTeamId(null);
    setExistingTeamId(null);
    setPaymentStatus(null);
    setTransactionId(null);
    setStep(1);
  };

  const value = useMemo(
    () => ({
      step,
      setStep,
      teamData,
      setTeamData,
      players,
      setPlayers,
      loading,
      setLoading,
      error,
      setError,
      successTeamId,
      setSuccessTeamId,
      existingTeamId,
      setExistingTeamId,
      readOnlyMode,
      setReadOnlyMode,
      paymentStatus,
      setPaymentStatus,
      transactionId,
      setTransactionId,
      resetForm
    }),
    [step, teamData, players, loading, error, successTeamId, existingTeamId, readOnlyMode, paymentStatus, transactionId]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};

