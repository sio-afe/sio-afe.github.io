import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabaseClient } from './lib/supabaseClient';
import TeamDatabase from './components/editions/2026/teams/TeamDatabase';
import TeamDetail from './components/editions/2026/teams/TeamDetail';
import Footer from './components/shared/Footer';
import TournamentNavbar from './components/shared/TournamentNavbar';
import './styles/TeamDatabase.css';
import './styles/TournamentNavbar.css';

// Helper to create URL-safe slug from team name
const slugify = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function TeamsApp() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'

  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    // Check URL for team ID (format: /teams/?team={id})
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    
    if (teamId) {
      setSelectedTeamId(teamId);
      setView('detail');
      setLoading(false);
    } else {
      fetchTeams();
    }

    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePopState = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');
    
    if (teamId) {
      setSelectedTeamId(teamId);
      setView('detail');
    } else {
      setView('list');
      setSelectedTeamId(null);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('teams')
        .select('id, name, crest_url, captain, category')
        .eq('category', category)
        .order('name', { ascending: true });

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTeamDetail = (team) => {
    const newUrl = `/muqawamah/2026/${category}/teams/?team=${team.id}`;
    window.history.pushState({ teamId: team.id }, '', newUrl);
    setSelectedTeamId(team.id);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const goBackToList = () => {
    window.history.pushState({}, '', `/muqawamah/2026/${category}/teams/`);
    setView('list');
    setSelectedTeamId(null);
  };

  if (loading) {
    return (
      <div className="teams-loading">
        <div className="teams-loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
          </div>
          <p>Loading teams...</p>
        </div>
      </div>
    );
  }

  // Show team detail view
  if (view === 'detail' && selectedTeamId) {
    return (
      <TeamDetail 
        teamId={selectedTeamId} 
        onBack={goBackToList}
        onNavigateToPlayer={(playerId, playerName) => {
          window.location.href = `/muqawamah/2026/${category}/players/?player=${playerId}`;
        }}
      />
    );
  }

  // Show teams list view
  return (
    <>
      <TournamentNavbar />
      <TeamDatabase teams={teams} onTeamClick={openTeamDetail} />
      <Footer edition="2026" />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('teams-root')).render(
  <React.StrictMode>
    <TeamsApp />
  </React.StrictMode>
);

