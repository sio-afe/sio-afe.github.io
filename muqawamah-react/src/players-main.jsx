import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Helper to convert image URL to webp format
const getWebpImageUrl = (url) => {
  if (!url) return null;
  
  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    // Add webp transformation parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}format=webp&quality=80`;
  }
  
  // For other URLs, just return as is (assuming they're already optimized)
  return url;
};

// Lazy loading image component
function LazyImage({ src, alt, className, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const webpSrc = getWebpImageUrl(src);

  return (
    <div ref={imgRef} className={className} style={{ position: 'relative' }}>
      {!isLoaded && placeholder}
      {isInView && webpSrc && (
        <img
          src={webpSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
}

function PlayersApp() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'detail'

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

      console.log(`[Players] Found ${teamsData?.length || 0} teams in ${category}`);

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

      console.log(`[Players] Found ${playersData?.length || 0} total players`);
      console.log(`[Players] Filtered to ${filteredPlayers.length} players in ${category}`);

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
    window.history.pushState({}, '', `/muqawamah/2026/${category}/players/`);
    setView('list');
    setSelectedPlayerId(null);
  };

  const getPositionLabel = (position) => {
    return positionLabels[position] || position;
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name?.toLowerCase().includes(searchTerm.toLowerCase());
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
        {filteredPlayers.map((player) => {
          const positionLabel = getPositionLabel(player.position);
          const positionColor = positionColors[positionLabel] || '#666';
          const team = player.team;

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
                  <LazyImage 
                    src={player.player_image} 
                    alt={player.name}
                    className="player-photo"
                    placeholder={
                      <div className="player-photo-placeholder">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                    }
                  />
                ) : (
                  <div className="player-photo-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>

              <div className="player-info-bar">
                <div className="team-logo-small">
                  {team?.crest_url ? (
                    <LazyImage 
                      src={team.crest_url} 
                      alt={team.name}
                      className="team-logo-img"
                      placeholder={null}
                    />
                  ) : (
                    <span>{team?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <span className="player-name-db">{player.name}</span>
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
