import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchweek, setSelectedMatchweek] = useState(1);
  const [maxMatchweek, setMaxMatchweek] = useState(5);

  useEffect(() => {
    fetchMatches();
  }, [selectedMatchweek]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch matches for selected matchweek
      const { data: matchesData, error: matchesError } = await supabaseClient
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
          away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
        `)
        .eq('matchweek', selectedMatchweek)
        .eq('category', 'open-age')
        .order('match_date', { ascending: true })
        .order('match_time', { ascending: true });

      if (matchesError) throw matchesError;
      
      // Get max matchweek
      const { data: maxMW } = await supabaseClient
        .from('matches')
        .select('matchweek')
        .eq('category', 'open-age')
        .order('matchweek', { ascending: false })
        .limit(1);
      
      if (maxMW && maxMW.length > 0) {
        setMaxMatchweek(maxMW[0].matchweek);
      }

      setMatches(matchesData || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    // Format time from HH:MM:SS to HH:MM
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  return (
    <>
      <TournamentNavbar />
      <div className="fixtures-page">
        <div className="fixtures-container">
          <h1 className="fixtures-title">FIXTURES & RESULTS</h1>
          
          {/* Season/Matchweek Selector */}
          <div className="matchweek-selector">
            <span className="season-label">SEASON 2</span>
            <div className="matchweek-tabs">
              {[...Array(maxMatchweek)].map((_, idx) => {
                const mw = idx + 1;
                return (
                  <button
                    key={mw}
                    className={`matchweek-tab ${selectedMatchweek === mw ? 'active' : ''}`}
                    onClick={() => setSelectedMatchweek(mw)}
                  >
                    {mw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matches List */}
          <div className="matches-list">
            {matches.length > 0 ? (
              matches.map((match) => {
                const isFinished = match.status === 'finished';
                const homeScore = match.home_score ?? '-';
                const awayScore = match.away_score ?? '-';
                
                return (
                  <div className="match-card" key={match.id}>
                    <div className="match-time">
                      {isFinished ? formatDate(match.match_date) : formatTime(match.match_time)}
                    </div>
                    
                    <div className="match-content">
                      <div className="match-team home-team">
                        <span className="team-name">{match.home_team?.name || 'TBD'}</span>
                        <div className="team-logo">
                          {match.home_team?.crest_url ? (
                            <img src={match.home_team.crest_url} alt={match.home_team.name} />
                          ) : (
                            <span>{match.home_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                      </div>

                      <div className="match-score">
                        <span className="score-value">{homeScore}</span>
                        <span className="score-separator">-</span>
                        <span className="score-value">{awayScore}</span>
                      </div>

                      <div className="match-team away-team">
                        <div className="team-logo">
                          {match.away_team?.crest_url ? (
                            <img src={match.away_team.crest_url} alt={match.away_team.name} />
                          ) : (
                            <span>{match.away_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <span className="team-name">{match.away_team?.name || 'TBD'}</span>
                      </div>
                    </div>

                    {match.venue && (
                      <div className="match-venue">
                        <i className="fas fa-map-marker-alt"></i> {match.venue}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-matches-found">
                <i className="fas fa-calendar-times"></i>
                <p>No fixtures scheduled for this matchweek</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer edition="2026" />
    </>
  );
}


