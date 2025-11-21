import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
      if (!window.supabaseClient) {
        console.error('Supabase client not available');
        setLoading(false);
        return;
      }

      // Fetch top scorers - group by player_name and count goals
      const { data: scorersData, error: scorersError } = await window.supabaseClient
        .from('match_events')
        .select('player_name, team_id, teams(name, crest_url)')
        .eq('category', category)
        .eq('event_type', 'goal');

      if (scorersError) throw scorersError;

      // Process scorers data
      const scorersMap = {};
      scorersData?.forEach((event) => {
        const key = `${event.player_name}-${event.team_id}`;
        if (!scorersMap[key]) {
          scorersMap[key] = {
            player_name: event.player_name,
            team: event.teams,
            goals: 0,
          };
        }
        scorersMap[key].goals++;
      });

      const processedScorers = Object.values(scorersMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 15);

      // Fetch top assists
      const { data: assistsData, error: assistsError } = await window.supabaseClient
        .from('match_events')
        .select('assist_name, team_id, teams(name, crest_url)')
        .eq('category', category)
        .not('assist_name', 'is', null);

      if (assistsError) throw assistsError;

      // Process assists data
      const assistsMap = {};
      assistsData?.forEach((event) => {
        const key = `${event.assist_name}-${event.team_id}`;
        if (!assistsMap[key]) {
          assistsMap[key] = {
            player_name: event.assist_name,
            team: event.teams,
            assists: 0,
          };
        }
        assistsMap[key].assists++;
      });

      const processedAssists = Object.values(assistsMap)
        .sort((a, b) => b.assists - a.assists)
        .slice(0, 15);

      setTopScorers(processedScorers);
      setTopAssists(processedAssists);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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

