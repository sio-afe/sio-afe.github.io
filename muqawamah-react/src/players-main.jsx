import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { supabaseClient } from './lib/supabaseClient';
import PlayerDetail from './components/editions/2026/players/PlayerDetail';
import Footer from './components/shared/Footer';
import TournamentNavbar from './components/shared/TournamentNavbar';
import SmartImg from './components/shared/SmartImg';
import './styles/PlayerDatabase.css';
import './styles/TournamentNavbar.css';

const PAGE_SIZE = 15;

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

const getPositionLabel = (position) => positionLabels[position] || position;

const getInitialPage = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const p = parseInt(urlParams.get('page') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  } catch {
    return 1;
  }
};

// Memoized player card for performance
const PlayerCard = React.memo(function PlayerCard({ player, team, onClick, index }) {
  const positionLabel = getPositionLabel(player.position);
  const positionColor = positionColors[positionLabel] || '#666';
  const isAboveFold = index < 10;

  return (
    <div 
      className="player-card-db" 
      onClick={onClick}
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
          <SmartImg 
            src={player.player_image} 
            preset="playerCard"
            alt={player.name}
            className="player-photo"
            loading={isAboveFold ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={isAboveFold ? 'high' : 'auto'}
          />
        ) : (
          <img
            src="/assets/img/player-placeholder.svg"
            alt=""
            className="player-photo player-photo-placeholder-img"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className="player-info-bar">
        <div className="team-logo-small">
          {team?.crest_url ? (
            <SmartImg 
              src={team.crest_url} 
              preset="crestSm"
              alt={team.name}
              className="team-logo-img"
              loading={isAboveFold ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={isAboveFold ? 'high' : 'auto'}
            />
          ) : (
            <span>{team?.name?.charAt(0) || '?'}</span>
          )}
        </div>
        <span className="player-name-db">{player.name}</span>
      </div>
    </div>
  );
});

function PlayersApp() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [page, setPage] = useState(getInitialPage());

  // Detect category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };
  
  const [category] = useState(getCategory());

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
      // Restore page from URL
      const pageParam = urlParams.get('page');
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (Number.isFinite(p) && p > 0) setPage(p);
      }
    }
  };

  const fetchData = async () => {
    try {
      // Fetch teams from the tournament teams table (not registrations)
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('teams')
        .select('id, name, crest_url, category')
        .eq('category', category)
        .order('name', { ascending: true });

      if (teamsError) throw teamsError;

      // Fetch players from tournament players table (not registration players)
      const { data: playersData, error: playersError } = await supabaseClient
        .from('players')
        .select('*, team:teams(id, name, crest_url, category)')
        .order('name', { ascending: true });

      if (playersError) throw playersError;

      // Filter players by category through their team
      const filteredPlayers = (playersData || []).filter(player => {
        return player.team && player.team.category === category;
      });

      // Map teams data to match expected structure
      const mappedTeams = (teamsData || []).map(team => ({
        id: team.id,
        team_name: team.name,
        team_logo: team.crest_url,
        category: team.category
      }));

      setTeams(mappedTeams);
      setPlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPlayerDetail = (player) => {
    const newUrl = `/muqawamah/2026/${category}/players/?player=${player.id}`;
    window.history.pushState({ playerId: player.id }, '', newUrl);
    setSelectedPlayerId(player.id);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const goBackToList = () => {
    // Go back to clean URL without query params (page 1 is the default)
    const baseUrl = `/muqawamah/2026/${category}/players/`;
    window.history.pushState({}, '', baseUrl);
    setView('list');
    setSelectedPlayerId(null);
    setPage(1);
  };

  // Filtered players based on search/filter criteria
  const filteredPlayers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return players.filter(player => {
      const matchesSearch = !search || player.name?.toLowerCase().includes(search);
      const matchesTeam = selectedTeam === 'all' || player.team_id === selectedTeam;
      const positionLabel = getPositionLabel(player.position);
      const matchesPosition = selectedPosition === 'all' || positionLabel === selectedPosition;
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [players, searchTerm, selectedTeam, selectedPosition]);

  // Reset to page 1 when filters change (don't update URL - page 1 is default)
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedTeam, selectedPosition]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
  };

  // Pagination logic
  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE)), [filteredPlayers.length]);
  const clampedPage = Math.min(Math.max(page, 1), totalPages);

  useEffect(() => {
    if (page !== clampedPage) setPage(clampedPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedPage]);

  const displayedPlayers = useMemo(() => {
    const start = (clampedPage - 1) * PAGE_SIZE;
    return filteredPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredPlayers, clampedPage]);

  const goToPage = (nextPage) => {
    const p = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(p);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', String(p));
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationItems = () => {
    const items = [];
    const add = (v) => items.push(v);

    add(1);
    const left = Math.max(2, clampedPage - 1);
    const right = Math.min(totalPages - 1, clampedPage + 1);

    if (left > 2) add('…');
    for (let p = left; p <= right; p++) add(p);
    if (right < totalPages - 1) add('…');
    if (totalPages > 1) add(totalPages);

    // De-dupe consecutive duplicates
    return items.filter((v, idx) => idx === 0 || v !== items[idx - 1]);
  };

  if (loading) {
    return (
      <div className="players-loading">
        <div className="players-loading-content">
          <div className="logo-loader">
            <div className="logo-ring"></div>
            <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
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
          const newUrl = `/muqawamah/2026/${category}/players/?player=${playerId}`;
          window.history.pushState({ playerId }, '', newUrl);
          setSelectedPlayerId(playerId);
          window.scrollTo(0, 0);
        }}
        onNavigateToMatch={(matchId) => {
          window.location.href = `/muqawamah/2026/${category}/fixtures/?match=${matchId}`;
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
        {displayedPlayers.map((player, idx) => (
          <PlayerCard 
            key={player.id}
            player={player}
            team={player.team}
            onClick={() => openPlayerDetail(player)}
            index={idx}
          />
        ))}
      </div>

      {filteredPlayers.length > 0 && (
        <div className="players-pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(clampedPage - 1)}
            disabled={clampedPage <= 1}
            aria-label="Previous page"
          >
            «
          </button>

          {getPaginationItems().map((item, idx) => (
            item === '…' ? (
              <span className="pagination-ellipsis" key={`ellipsis-${idx}`}>…</span>
            ) : (
              <button
                key={`page-${item}`}
                className={`pagination-btn ${item === clampedPage ? 'active' : ''}`}
                onClick={() => goToPage(item)}
                aria-current={item === clampedPage ? 'page' : undefined}
              >
                {item}
              </button>
            )
          ))}

          <button
            className="pagination-btn"
            onClick={() => goToPage(clampedPage + 1)}
            disabled={clampedPage >= totalPages}
            aria-label="Next page"
          >
            »
          </button>
        </div>
      )}

      {filteredPlayers.length === 0 && (
        <div className="no-players">
          <i className="fas fa-users-slash"></i>
          <p>No players found matching your criteria</p>
        </div>
      )}

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
