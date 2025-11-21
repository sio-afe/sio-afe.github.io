import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StandingsTable from './tournament/StandingsTable';
import Fixtures from './tournament/Fixtures';
import Statistics from './tournament/Statistics';

function Tournament() {
  const urlCategory = window.location.pathname.includes('/u17/') ? 'u17' : 'open-age';
  const [category, setCategory] = useState(urlCategory);
  const [activeTab, setActiveTab] = useState('standings');
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detect edition from URL (2025, 2026, etc.)
  const edition = window.location.pathname.match(/\/muqawamah\/(\d{4})\//)?.[1] || '2025';

  useEffect(() => {
    fetchTournamentData();
    
    // Subscribe to real-time updates if Supabase is available
    if (window.supabaseClient) {
      const subscription = window.supabaseClient
        .channel('tournament_updates')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'teams' }, 
          () => fetchTournamentData()
        )
        .subscribe();
      
      return () => subscription.unsubscribe();
    }
  }, [category]);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      if (!window.supabaseClient) {
        console.error('Supabase client not available');
        setLoading(false);
        return;
      }

      // Fetch teams standings
      const { data: teamsData, error: teamsError } = await window.supabaseClient
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('points', { ascending: false })
        .order('gd', { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch fixtures
      const { data: fixturesData, error: fixturesError } = await window.supabaseClient
        .from('fixtures')
        .select(`
          *,
          home_team:teams!fixtures_home_team_id_fkey(id, name, crest_url),
          away_team:teams!fixtures_away_team_id_fkey(id, name, crest_url)
        `)
        .eq('category', category)
        .order('match_time', { ascending: true });

      if (fixturesError) throw fixturesError;

      setTeams(teamsData || []);
      setFixtures(fixturesData || []);
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    // Update URL without reload
    const newUrl = `/muqawamah/${edition}/${newCategory}/`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className="tournament-page">
      {/* Header with Back Button and Category Selector */}
      <div className="tournament-header">
        <a href={`/muqawamah/${edition}/`} className="back-button">
          <i className="fas fa-arrow-left"></i>
          <span>Back to Muqawama</span>
        </a>
        
        <div className="tournament-title">
          <h1>MUQAWAMA {edition}</h1>
          <p>Tournament Results & Statistics</p>
        </div>

        <div className="category-selector-tournament">
          <button
            className={`category-btn ${category === 'open-age' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('open-age')}
          >
            <i className="fas fa-users"></i>
            Open Age
          </button>
          <button
            className={`category-btn ${category === 'u17' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('u17')}
          >
            <i className="fas fa-user-friends"></i>
            U17
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation-tournament">
        <button
          className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          <i className="fas fa-trophy"></i>
          <span>Standings</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'fixtures' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixtures')}
        >
          <i className="fas fa-calendar-alt"></i>
          <span>Fixtures & Results</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="fas fa-chart-bar"></i>
          <span>Statistics</span>
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="tournament-content"
        >
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading tournament data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'standings' && <StandingsTable teams={teams} category={category} />}
              {activeTab === 'fixtures' && <Fixtures fixtures={fixtures} />}
              {activeTab === 'stats' && <Statistics category={category} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Tournament;

