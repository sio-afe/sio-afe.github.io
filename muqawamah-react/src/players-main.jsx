import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabaseClient } from './lib/supabaseClient';
import PlayerDetail from './components/editions/2026/players/PlayerDetail';
import Footer from './components/shared/Footer';
import TournamentNavbar from './components/shared/TournamentNavbar';
import './styles/PlayerDatabase.css';
import './styles/TournamentNavbar.css';

const positionLabels = {
  'GK': 'Goalkeeper',
  'CB': 'Defender',
  'LB': 'Defender',
  'RB': 'Defender',
  'CDM': 'Midfielder',
  'CM': 'Midfielder',
  'CAM': 'Midfielder',
  'LM': 'Midfielder',
  'RM': 'Midfielder',
  'CF': 'Striker',
  'ST': 'Striker',
  'SUB': 'Substitute'
};

const positionColors = {
  'Goalkeeper': '#4CAF50',
  'Defender': '#2196F3',
  'Midfielder': '#FF9800',
  'Striker': '#f44336',
  'Substitute': '#9e9e9e'
};

// Helper to create URL-safe slug from player name
const slugify = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

function PlayersApp() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'

  useEffect(() => {
    // Check URL for player ID in query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player');
    
    if (playerId) {
      setSelectedPlayerId(playerId);
      setView('detail');
      setLoading(false);
    } else {
      fetchData();
    }

    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePopState = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player');
    
    if (playerId) {
      setSelectedPlayerId(playerId);
      setView('detail');
    } else {
      setView('list');
      setSelectedPlayerId(null);
    }
  };

  const fetchData = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('team_registrations')
        .select('id, team_name, team_logo, category')
        .eq('status', 'confirmed')
        .eq('category', 'open-age');

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      if (teamsData && teamsData.length > 0) {
        const teamIds = teamsData.map(t => t.id);
        const { data: playersData, error: playersError } = await supabaseClient
          .from('team_players')
          .select('*, team_registrations(id, team_name, team_logo)')
          .in('team_id', teamIds);

        if (playersError) throw playersError;
        setPlayers(playersData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPlayerDetail = (player) => {
    const newUrl = `/muqawamah/2026/open-age/players/?player=${player.id}`;
    window.history.pushState({ playerId: player.id }, '', newUrl);
    setSelectedPlayerId(player.id);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const goBackToList = () => {
    window.history.pushState({}, '', '/muqawamah/2026/open-age/players/');
    setView('list');
    setSelectedPlayerId(null);
  };

  const getPositionLabel = (position) => {
    return positionLabels[position] || position;
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.player_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || player.team_id === selectedTeam;
    const positionLabel = getPositionLabel(player.position);
    const matchesPosition = selectedPosition === 'all' || positionLabel === selectedPosition;
    return matchesSearch && matchesTeam && matchesPosition;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
  };

  if (loading) {
    return (
      <div className="players-loading">
        <div className="players-loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
          </div>
          <p>Loading players...</p>
        </div>
      </div>
    );
  }

  // Show player detail view
  if (view === 'detail' && selectedPlayerId) {
    return (
      <PlayerDetail 
        playerId={selectedPlayerId} 
        onBack={goBackToList}
        onNavigateToPlayer={(playerId, playerName) => {
          const newUrl = `/muqawamah/2026/open-age/players/?player=${playerId}`;
          window.history.pushState({ playerId }, '', newUrl);
          setSelectedPlayerId(playerId);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  // Show player list view
  return (
    <>
      <TournamentNavbar />
      <div className="player-database">
        <div className="player-database-header">
          <h1 className="player-database-title">Player Database</h1>
        
        <div className="player-filters">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Write a player name and hit enter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="filter-select"
            >
              <option value="all">ALL TEAMS</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.team_name}</option>
              ))}
            </select>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="filter-select filter-select-wide"
            >
              <option value="all">ALL POSITIONS</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Striker">Striker</option>
              <option value="Substitute">Substitute</option>
            </select>

            <button className="reset-btn" onClick={resetFilters}>
              RESET
            </button>
          </div>
        </div>
      </div>

      <div className="players-count">
        <span>{filteredPlayers.length} players found</span>
      </div>

      <div className="players-grid">
        {filteredPlayers.map((player) => {
          const positionLabel = getPositionLabel(player.position);
          const positionColor = positionColors[positionLabel] || '#666';
          const team = player.team_registrations;

          return (
            <div 
              className="player-card-db" 
              key={player.id}
              onClick={() => openPlayerDetail(player)}
              style={{ cursor: 'pointer' }}
            >
              <div 
                className="position-tag"
                style={{ backgroundColor: positionColor }}
              >
                {positionLabel.toUpperCase()}
              </div>
              
              <div className="player-photo-container">
                {player.player_image ? (
                  <img 
                    src={player.player_image} 
                    alt={player.player_name}
                    className="player-photo"
                  />
                ) : (
                  <div className="player-photo-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>

              <div className="player-info-bar">
                <div className="team-logo-small">
                  {team?.team_logo ? (
                    <img src={team.team_logo} alt={team.team_name} />
                  ) : (
                    <span>{team?.team_name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <span className="player-name-db">{player.player_name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="no-players">
          <i className="fas fa-users-slash"></i>
          <p>No players found matching your criteria</p>
        </div>
      )}

      <div className="back-to-tournament">
        <a href="/muqawamah/2026/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Tournament
        </a>
      </div>

      <Footer edition="2026" />
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('players-root')).render(
  <React.StrictMode>
    <PlayersApp />
  </React.StrictMode>
);
