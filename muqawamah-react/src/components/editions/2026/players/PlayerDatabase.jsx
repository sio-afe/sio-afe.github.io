import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch teams with confirmed status
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('team_registrations')
        .select('id, team_name, team_logo, category')
        .eq('status', 'confirmed')
        .eq('category', 'open-age');

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch players for these teams
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
              className="filter-select"
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
            <div className="player-card-db" key={player.id}>
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
                    loading="lazy"
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
                    <img 
                      src={team.team_logo} 
                      alt={team.team_name}
                      loading="lazy"
                    />
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

