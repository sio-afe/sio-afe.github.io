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

      const scorersMap = {};
      const assistsMap = {};

      (goalsData || []).forEach((goalEvent) => {
        if (goalEvent.scorer?.player_name) {
          const scorerKey = `${goalEvent.scorer.player_name}-${goalEvent.team_id}`;
          if (!scorersMap[scorerKey]) {
            scorersMap[scorerKey] = {
              player_name: goalEvent.scorer.player_name,
              player_image: goalEvent.scorer.player_image,
              team: goalEvent.team,
              goals: 0,
            };
          }
          scorersMap[scorerKey].goals += 1;
        }

        if (goalEvent.assister?.player_name) {
          const assistKey = `${goalEvent.assister.player_name}-${goalEvent.team_id}`;
          if (!assistsMap[assistKey]) {
            assistsMap[assistKey] = {
              player_name: goalEvent.assister.player_name,
              player_image: goalEvent.assister.player_image,
              team: goalEvent.team,
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

