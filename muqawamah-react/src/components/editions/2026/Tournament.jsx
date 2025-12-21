import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '../../../lib/supabaseClient';
import StandingsTable from '../2025/tournament/StandingsTable';
import Fixtures from '../2025/tournament/Fixtures';
import Statistics from '../2025/tournament/Statistics';

function Tournament2026() {
  const urlCategory = window.location.pathname.includes('/u17/') ? 'u17' : 'open-age';
  const [category, setCategory] = useState(urlCategory);
  const [activeTab, setActiveTab] = useState('standings');
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const edition = '2026';

  useEffect(() => {
    fetchTournamentData();
    
    // Subscribe to real-time updates
    const subscription = supabaseClient
      .channel('tournament_2026_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams', filter: `category=eq.${category}` }, 
        () => {
          console.log('[2026 Tournament] Teams updated, refreshing...');
          fetchTournamentData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `category=eq.${category}` },
        () => {
          console.log('[2026 Tournament] Matches updated, refreshing...');
          fetchTournamentData();
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [category]);

  const fetchTournamentData = async () => {
    setLoading(true);
    try {
      // Fetch teams standings
      const { data: teamsData, error: teamsError } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('points', { ascending: false })
        .order('goals_for', { ascending: false })
        .order('goals_against', { ascending: true });

      if (teamsError) {
        console.error('[2026 Tournament] Error fetching teams:', teamsError);
        throw teamsError;
      }

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:home_team_id(id, name, crest_url),
          away_team:away_team_id(id, name, crest_url)
        `)
        .eq('category', category)
        .order('match_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (matchesError) {
        console.error('[2026 Tournament] Error fetching matches:', matchesError);
      }

      // Calculate form for each team from completed matches
      const calculateTeamForm = (teamId) => {
        const completedMatches = (matchesData || [])
          .filter(match => 
            match.status === 'completed' && 
            (match.home_team_id === teamId || match.away_team_id === teamId)
          )
          .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
          .slice(0, 5);

        return completedMatches
          .map(match => {
            const isHome = match.home_team_id === teamId;
            const teamScore = isHome ? match.home_score : match.away_score;
            const opponentScore = isHome ? match.away_score : match.home_score;
            
            if (teamScore > opponentScore) return 'W';
            if (teamScore < opponentScore) return 'L';
            return 'D';
          })
          .join('');
      };

      // Calculate goal difference and form for each team
      const teamsWithGDAndForm = (teamsData || []).map(team => ({
        ...team,
        gd: team.goals_for - team.goals_against,
        form: calculateTeamForm(team.id)
      }));

      setTeams(teamsWithGDAndForm);
      setFixtures(matchesData || []);
      
      console.log('[2026 Tournament] Loaded:', {
        teams: teamsWithGDAndForm.length,
        matches: matchesData?.length || 0,
        category
      });
    } catch (error) {
      console.error('[2026 Tournament] Error fetching tournament data:', error);
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
          <p>Live Tournament Standings & Fixtures</p>
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
              {activeTab === 'standings' && (
                <>
                  {teams.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-users-slash"></i>
                      <h3>No Teams Yet</h3>
                      <p>Teams will appear here as they register and get confirmed for the tournament.</p>
                      <a href={`/muqawamah/${edition}/register/`} className="register-btn">
                        Register Your Team
                      </a>
                    </div>
                  ) : (
                    <StandingsTable teams={teams} category={category} />
                  )}
                </>
              )}
              {activeTab === 'fixtures' && (
                <>
                  {fixtures.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-calendar-times"></i>
                      <h3>Fixtures Coming Soon</h3>
                      <p>Match fixtures will be published once all teams are confirmed.</p>
                    </div>
                  ) : (
                    <Fixtures fixtures={fixtures} />
                  )}
                </>
              )}
              {activeTab === 'stats' && (
                <>
                  {teams.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-chart-line"></i>
                      <h3>Statistics Coming Soon</h3>
                      <p>Player and team statistics will be available once matches begin.</p>
                    </div>
                  ) : (
                    <Statistics category={category} />
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Tournament2026;

