import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabaseClient as sharedSupabaseClient } from '../../../../lib/supabaseClient';

function Statistics({ category }) {
  const [activeStatTab, setActiveStatTab] = useState('scorers');
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [category]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const supabase = window.supabaseClient || sharedSupabaseClient;
      if (!supabase) {
        console.error('[Statistics] Supabase client not available');
        setTopScorers([]);
        setTopAssists([]);
        return;
      }

      // Get match IDs for the current category
      const { data: matchRows, error: matchesError } = await supabase
        .from('matches')
        .select('id')
        .eq('category', category);

      if (matchesError) throw matchesError;

      if (!matchRows || matchRows.length === 0) {
        setTopScorers([]);
        setTopAssists([]);
        return;
      }

      const matchIds = matchRows.map((match) => match.id);

      // First, get all teams for this category
      const { data: categoryTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('category', category);

      const teamIds = categoryTeams?.map(t => t.id) || [];

      const { data: goalsData, error: goalsError} = await supabase
        .from('goals')
        .select(`
          scorer_id,
          assister_id,
          team_id,
          team:teams(name, crest_url),
          scorer:team_players!goals_scorer_id_fkey(player_name, player_image),
          assister:team_players!goals_assister_id_fkey(player_name, player_image)
        `)
        .in('match_id', matchIds);

      if (goalsError) throw goalsError;

      // Fetch all players from players table for this category to get proper player data
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, name, player_image, registration_player_id, team_id, team:teams(name, crest_url)')
        .in('team_id', teamIds);

      // Create mapping from registration_player_id to players table data
      const registrationToPlayerMap = {};
      (allPlayers || []).forEach(p => {
        if (p.registration_player_id) {
          registrationToPlayerMap[p.registration_player_id] = p;
        }
      });

      const scorersMap = {};
      const assistsMap = {};

      (goalsData || []).forEach((goalEvent) => {
        // Try to get player from players table first, fallback to team_players
        let scorerPlayer = null;
        let assisterPlayer = null;

        if (goalEvent.scorer_id) {
          scorerPlayer = registrationToPlayerMap[goalEvent.scorer_id];
          if (!scorerPlayer && goalEvent.scorer) {
            // Fallback to team_players data
            scorerPlayer = {
              name: goalEvent.scorer.player_name,
              player_image: goalEvent.scorer.player_image,
              team: goalEvent.team
            };
          }
        }

        if (goalEvent.assister_id) {
          assisterPlayer = registrationToPlayerMap[goalEvent.assister_id];
          if (!assisterPlayer && goalEvent.assister) {
            // Fallback to team_players data
            assisterPlayer = {
              name: goalEvent.assister.player_name,
              player_image: goalEvent.assister.player_image,
              team: goalEvent.team
            };
          }
        }

        // Count goals - use players table data if available
        if (scorerPlayer) {
          const playerName = scorerPlayer.name || scorerPlayer.player_name || '';
          const teamId = scorerPlayer.team_id || goalEvent.team_id;
          const scorerKey = `${playerName}-${teamId}`;
          
          if (!scorersMap[scorerKey]) {
            scorersMap[scorerKey] = {
              player_name: playerName,
              player_image: scorerPlayer.player_image,
              team: scorerPlayer.team || goalEvent.team,
              goals: 0,
            };
          }
          scorersMap[scorerKey].goals += 1;
        }

        // Count assists - use players table data if available
        if (assisterPlayer) {
          const playerName = assisterPlayer.name || assisterPlayer.player_name || '';
          const teamId = assisterPlayer.team_id || goalEvent.team_id;
          const assistKey = `${playerName}-${teamId}`;
          
          if (!assistsMap[assistKey]) {
            assistsMap[assistKey] = {
              player_name: playerName,
              player_image: assisterPlayer.player_image,
              team: assisterPlayer.team || goalEvent.team,
              assists: 0,
            };
          }
          assistsMap[assistKey].assists += 1;
        }
      });

      const processedScorers = Object.values(scorersMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 15);

      const processedAssists = Object.values(assistsMap)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 15);

      setTopScorers(processedScorers);
      setTopAssists(processedAssists);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setTopScorers([]);
      setTopAssists([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStatsList = (data, type) => {
    if (data.length === 0) {
      return (
        <div className="no-stats">
          <i className="fas fa-chart-line"></i>
          <p>No statistics available yet</p>
        </div>
      );
    }

    return (
      <div className="stats-list">
        {data.map((item, index) => {
          const statValue = type === 'scorers' ? item.goals : item.assists;
          const positionClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

          return (
            <motion.div
              key={`${item.player_name}-${index}`}
              className={`stat-card ${positionClass}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="stat-position">
                {index < 3 ? (
                  <div className="medal-icon">
                    <i className={`fas fa-medal ${positionClass}`}></i>
                  </div>
                ) : (
                  <span className="position-number">{index + 1}</span>
                )}
              </div>

              <div className="stat-player-info">
                <div className="player-name">{item.player_name}</div>
                <div className="player-team">
                  <img
                    src={item.team?.crest_url || '/assets/data/open-age/team-logos/default.png'}
                    alt={item.team?.name}
                    className="team-crest-mini"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/assets/data/open-age/team-logos/default.png';
                    }}
                  />
                  <span>{item.team?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="stat-value">
                <span className="value-number">{statValue}</span>
                <span className="value-label">{type === 'scorers' ? 'Goals' : 'Assists'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="statistics-container">
      {/* Stats Tab Selector */}
      <div className="stats-tab-selector">
        <button
          className={`stats-tab-btn ${activeStatTab === 'scorers' ? 'active' : ''}`}
          onClick={() => setActiveStatTab('scorers')}
        >
          <i className="fas fa-futbol"></i>
          Top Scorers
        </button>
        <button
          className={`stats-tab-btn ${activeStatTab === 'assists' ? 'active' : ''}`}
          onClick={() => setActiveStatTab('assists')}
        >
          <i className="fas fa-hands-helping"></i>
          Top Assists
        </button>
      </div>

      {/* Stats Content */}
      <div className="stats-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading statistics...</p>
          </div>
        ) : (
          <>
            {activeStatTab === 'scorers' && renderStatsList(topScorers, 'scorers')}
            {activeStatTab === 'assists' && renderStatsList(topAssists, 'assists')}
          </>
        )}
      </div>
    </div>
  );
}

export default Statistics;

