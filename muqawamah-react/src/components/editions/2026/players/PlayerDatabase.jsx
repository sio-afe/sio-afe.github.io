import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import SmartImg from '../../../shared/SmartImg';

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

export default function PlayerDatabase() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  // Keep initial render small so the browser doesn't fetch/decode too many images at once.
  const [visibleCount, setVisibleCount] = useState(24);

  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    fetchData();
  }, [category]);

  const teamById = useMemo(() => {
    const map = new Map();
    for (const t of teams) map.set(String(t.id), t);
    return map;
  }, [teams]);

  const fetchData = async () => {
    try {
      // Fetch teams with confirmed status
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('team_registrations')
        // Logos are now Storage URLs (small strings), safe to fetch up-front.
        .select('id, team_name, category, team_logo')
        .eq('status', 'confirmed')
        .eq('category', category);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch players for these teams
      if (teamsData && teamsData.length > 0) {
        const teamIds = teamsData.map(t => t.id);
        const { data: playersData, error: playersError } = await supabaseClient
          .from('team_players')
          // Player images are now Storage URLs (small strings), safe to fetch up-front.
          .select('id, player_name, position, team_id, player_image')
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

  const getPositionLabel = (position) => {
    return positionLabels[position] || position;
  };

  const filteredPlayers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const selectedTeamId = String(selectedTeam);

    return players.filter((player) => {
      const matchesSearch = !search || player.player_name?.toLowerCase().includes(search);
      const matchesTeam = selectedTeamId === 'all' || String(player.team_id) === selectedTeamId;
      const positionLabel = getPositionLabel(player.position);
      const matchesPosition = selectedPosition === 'all' || positionLabel === selectedPosition;
      return matchesSearch && matchesTeam && matchesPosition;
    });
  }, [players, searchTerm, selectedTeam, selectedPosition]);

  useEffect(() => {
    // Reset progressive render window when filters change.
    setVisibleCount(24);
  }, [searchTerm, selectedTeam, selectedPosition]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedPosition('all');
  };

  const displayedPlayers = useMemo(() => {
    return filteredPlayers.slice(0, visibleCount);
  }, [filteredPlayers, visibleCount]);

  const loadMoreRef = useRef(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (visibleCount >= filteredPlayers.length) return;

    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + 24, filteredPlayers.length));
        }
      },
      // Prefetch next chunk ahead of scroll without overloading the network.
      { rootMargin: '900px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filteredPlayers.length]);

  const PlayerCard = React.memo(function PlayerCard({ player, index }) {
    const positionLabel = getPositionLabel(player.position);
    const positionColor = positionColors[positionLabel] || '#666';
    const team = teamById.get(String(player.team_id));
    const playerImgSrc = player?.player_image || null;
    const teamLogoSrc = team?.team_logo || null;
    const isAboveFold = index < 8;

    return (
      <div className="player-card-db">
        <div
          className="position-tag"
          style={{ backgroundColor: positionColor }}
        >
          {positionLabel.toUpperCase()}
        </div>

        <div className="player-photo-container">
          {playerImgSrc ? (
            <SmartImg
              src={playerImgSrc}
              preset="playerCard"
              alt={player.player_name}
              className="player-photo"
              loading={isAboveFold ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={isAboveFold ? 'high' : 'auto'}
            />
          ) : (
            <div className="player-photo-placeholder">
              <i className="fas fa-user"></i>
            </div>
          )}
        </div>

        <div className="player-info-bar">
          <div className="team-logo-small">
            {teamLogoSrc ? (
              <SmartImg
                src={teamLogoSrc}
                preset="crestSm"
                alt={team?.team_name}
                loading={isAboveFold ? 'eager' : 'lazy'}
                decoding="async"
                fetchpriority={isAboveFold ? 'high' : 'auto'}
              />
            ) : (
              <span>{team?.team_name?.charAt(0) || '?'}</span>
            )}
          </div>
          <span className="player-name-db">{player.player_name}</span>
        </div>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="players-loading">
        <div className="players-loading-content">
          <div className="loading-spinner-db"></div>
          <p>Loading players...</p>
        </div>
      </div>
    );
  }

  return (
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
          <PlayerCard key={player.id} player={player} index={idx} />
        ))}
      </div>

      {visibleCount < filteredPlayers.length && (
        <div className="players-load-more">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((c) => Math.min(c + 24, filteredPlayers.length))}
          >
            LOAD MORE
          </button>
          <div ref={loadMoreRef} className="load-more-sentinel" />
        </div>
      )}

      {filteredPlayers.length === 0 && (
        <div className="no-players">
          <i className="fas fa-users-slash"></i>
          <p>No players found matching your criteria</p>
        </div>
      )}

      {/* Footer */}
      <footer className="player-db-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/assets/img/Muqawama/title_invert.png" alt="Muqawama" />
          </div>
          <p className="footer-edition">
            <a href="/muqawamah/2026/">Muqawama 2026</a>
          </p>
          <div className="footer-links">
            <a href="/muqawamah/about/">About</a>
            <a href="/muqawamah/terms-and-conditions/">Rules</a>
            <a href="/muqawamah/contact/">Contact</a>
          </div>
          <p className="footer-copyright">© 2025 SIO Abul Fazal Enclave. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

