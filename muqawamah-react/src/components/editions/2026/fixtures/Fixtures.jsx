import React, { useState, useEffect, useMemo } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMatchday, setActiveMatchday] = useState(1);
  
  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  useEffect(() => {
    fetchMatches();
  }, [category]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch all matches for the category
      const { data: matchesData, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
        `)
        .eq('category', category)
        .order('match_number', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (matchesError) throw matchesError;

      setMatches(matchesData || []);
      
      // Find the latest matchday with results or upcoming matches
      if (matchesData && matchesData.length > 0) {
        const matchdays = [...new Set(matchesData.map(m => m.match_number).filter(Boolean))];
        const latestCompleted = matchesData
          .filter(m => m.status === 'completed')
          .map(m => m.match_number)
          .sort((a, b) => b - a)[0];
        
        if (latestCompleted) {
          // Show the latest completed matchday, or the next one if all completed
          const hasUpcoming = matchdays.some(md => md > latestCompleted);
          setActiveMatchday(hasUpcoming ? latestCompleted + 1 : latestCompleted);
        } else {
          setActiveMatchday(matchdays[0] || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group matches by matchday
  const matchesByDay = useMemo(() => {
    const grouped = {};
    matches.forEach(match => {
      const day = match.match_number || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(match);
    });
    return grouped;
  }, [matches]);

  // Get unique matchdays
  const matchdays = useMemo(() => {
    const days = [...new Set(matches.map(m => m.match_number).filter(Boolean))];
    return days.sort((a, b) => a - b);
  }, [matches]);

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    if (timeString.length >= 5) {
      return timeString.substring(0, 5);
    }
    return timeString;
  };

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="fixtures-loading">
          <div className="fixtures-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/MuqawamaLogo.png" alt="Muqawama" className="logo-pulse" />
            </div>
            <p>Loading fixtures...</p>
          </div>
        </div>
        <Footer edition="2026" />
      </>
    );
  }

  const currentMatches = matchesByDay[activeMatchday] || [];

  return (
    <>
      <TournamentNavbar />
      <div className="fixtures-page-v2">
        <div className="fixtures-container-v2">
          {/* Header */}
          <div className="fixtures-header-v2">
            <h1>Fixtures & Results</h1>
            <hr className="fixtures-divider" />
          </div>

          {/* Matchday Tabs */}
          {matchdays.length > 0 && (
            <div className="matchday-tabs-v2">
              {matchdays.map(day => (
                <button
                  key={day}
                  className={`matchday-tab-v2 ${activeMatchday === day ? 'active' : ''}`}
                  onClick={() => setActiveMatchday(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {/* Matches List */}
          <div className="matches-list-v2">
            {currentMatches.length > 0 ? (
              currentMatches.map((match) => {
                const isFinished = match.status === 'completed';
                const homeScore = match.home_score ?? 0;
                const awayScore = match.away_score ?? 0;
                
                return (
                  <div className="match-card-v2" key={match.id}>
                    {/* Time - Mobile */}
                    <div className="match-time-mobile">
                      <span className="time-text">{formatTime(match.scheduled_time)}</span>
                    </div>

                    {/* Match Row */}
                    <div className="match-row-v2">
                      {/* Time - Desktop */}
                      <div className="match-time-desktop">
                        <span className="time-text">{formatTime(match.scheduled_time)}</span>
                      </div>

                      {/* Home Team */}
                      <div className="match-team-v2 home">
                        <span className="team-name-v2">{match.home_team?.name || 'TBD'}</span>
                        <div className="team-logo-v2">
                          {match.home_team?.crest_url ? (
                            <img src={match.home_team.crest_url} alt={match.home_team.name} />
                          ) : (
                            <span>{match.home_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="match-score-v2">
                        {isFinished ? (
                          <span className="score-display">{homeScore} - {awayScore}</span>
                        ) : (
                          <span className="vs-display">vs</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="match-team-v2 away">
                        <div className="team-logo-v2">
                          {match.away_team?.crest_url ? (
                            <img src={match.away_team.crest_url} alt={match.away_team.name} />
                          ) : (
                            <span>{match.away_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <span className="team-name-v2">{match.away_team?.name || 'TBD'}</span>
                      </div>

                      {/* Venue - Desktop */}
                      {match.venue && (
                        <div className="match-venue-desktop">
                          <span>{match.venue}</span>
                        </div>
                      )}
                    </div>

                    {/* Venue - Mobile */}
                    {match.venue && (
                      <div className="match-venue-mobile">
                        <span>{match.venue}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-matches-v2">
                <i className="fas fa-calendar-times"></i>
                <p>No fixtures scheduled for Matchday {activeMatchday}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}
