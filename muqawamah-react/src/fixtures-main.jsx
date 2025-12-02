import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Fixtures from './components/editions/2026/fixtures/Fixtures';
import MatchDetail from './components/editions/2026/fixtures/MatchDetail';
import './styles/Fixtures.css';
import './styles/TournamentNavbar.css';

function FixturesApp() {
  const [view, setView] = useState('list');
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  useEffect(() => {
    // Check URL for match ID (format: ?match={id})
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    
    if (matchId) {
      setSelectedMatchId(matchId);
      setView('detail');
    }

    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePopState = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('match');
    
    if (matchId) {
      setSelectedMatchId(matchId);
      setView('detail');
    } else {
      setView('list');
      setSelectedMatchId(null);
    }
  };

  const openMatchDetail = (matchId) => {
    const basePath = window.location.pathname;
    const newUrl = `${basePath}?match=${matchId}`;
    window.history.pushState({ matchId }, '', newUrl);
    setSelectedMatchId(matchId);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const goBackToList = () => {
    const basePath = window.location.pathname;
    window.history.pushState({}, '', basePath);
    setView('list');
    setSelectedMatchId(null);
  };

  // Show match detail view
  if (view === 'detail' && selectedMatchId) {
    return (
      <MatchDetail 
        matchId={selectedMatchId} 
        onBack={goBackToList}
      />
    );
  }

  // Show fixtures list view
  return <Fixtures onMatchClick={openMatchDetail} />;
}

ReactDOM.createRoot(document.getElementById('fixtures-root')).render(
  <React.StrictMode>
    <FixturesApp />
  </React.StrictMode>
);
