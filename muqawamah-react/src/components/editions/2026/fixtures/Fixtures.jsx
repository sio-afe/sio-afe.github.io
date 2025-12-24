import React, { useState, useEffect, useMemo } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import SmartImg from '../../../shared/SmartImg';

export default function Fixtures({ onMatchClick }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMatchday, setActiveMatchday] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Determine category from URL
  const getCategory = () => {
    const path = window.location.pathname;
    if (path.includes('/u17/')) return 'u17';
    return 'open-age';
  };

  const [category] = useState(getCategory());

  // Format match type for display
  const getMatchTypeLabel = (matchType) => {
    if (!matchType) return null;
    const type = matchType.toLowerCase();
    if (type === 'group') return 'Group Stage';
    if (type === 'quarter-final' || type === 'quarterfinal') return 'Quarter Final';
    if (type === 'semi-final' || type === 'semifinal') return 'Semi Final';
    if (type === 'final') return 'Final';
    if (type === 'third-place' || type === 'thirdplace') return '3rd Place';
    return matchType.charAt(0).toUpperCase() + matchType.slice(1);
  };

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

  const getMatchStatus = (match) => {
    if (match.status === 'completed') {
      return { label: 'FT', className: 'status-completed' };
    } else if (match.status === 'live') {
      return { label: 'LIVE', className: 'status-live' };
    } else if (match.status === 'scheduled') {
      return { label: formatTime(match.scheduled_time), className: 'status-scheduled' };
    }
    return { label: 'TBD', className: 'status-scheduled' };
  };

  // Get current matches for the active matchday
  const currentMatches = matchesByDay[activeMatchday] || [];

  // Filter matches based on search query
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return currentMatches;
    const query = searchQuery.toLowerCase().trim();
    return currentMatches.filter(match => 
      match.home_team?.name?.toLowerCase().includes(query) ||
      match.away_team?.name?.toLowerCase().includes(query)
    );
  }, [currentMatches, searchQuery]);

  // Get all matches filtered by search (for "all" view)
  const allFilteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    const query = searchQuery.toLowerCase().trim();
    return matches.filter(match => 
      match.home_team?.name?.toLowerCase().includes(query) ||
      match.away_team?.name?.toLowerCase().includes(query)
    );
  }, [matches, searchQuery]);

  if (loading) {
    return (
      <>
        <TournamentNavbar />
        <div className="fixtures-loading">
          <div className="fixtures-loading-content">
            <div className="logo-loader">
              <div className="logo-ring"></div>
              <img src="/assets/img/muq_invert.png" alt="Muqawama" className="logo-pulse" />
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
      <div className="fixtures-page-v2">
        <div className="fixtures-container-v2">
          {/* Header */}
          <div className="fixtures-header-v2">
            <h1>Fixtures & Results</h1>
            <hr className="fixtures-divider" />
          </div>

          {/* View Toggle & Search */}
          <div className="fixtures-controls">
            <div className="view-toggle-fixtures">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <i className="fas fa-list"></i>
                <span>Matchday</span>
              </button>
              <button 
                className={`view-btn ${viewMode === 'all' ? 'active' : ''}`}
                onClick={() => setViewMode('all')}
                title="All Matches"
              >
                <i className="fas fa-th-list"></i>
                <span>All</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="fixtures-search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by team name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery('')}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* List View - Matchday Tabs */}
          {viewMode === 'list' && matchdays.length > 0 && (
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
            {(viewMode === 'all' ? allFilteredMatches : filteredMatches).length > 0 ? (
              (viewMode === 'all' ? allFilteredMatches : filteredMatches).map((match) => {
                const isFinished = match.status === 'completed';
                const isLive = match.status === 'live';
                const hasScore = isFinished || isLive;
                const homeScore = match.home_score ?? 0;
                const awayScore = match.away_score ?? 0;
                const matchStatus = getMatchStatus(match);
                
                return (
                  <div 
                    className="match-card-v2 clickable" 
                    key={match.id}
                    onClick={() => onMatchClick && onMatchClick(match.id)}
                    style={{ cursor: onMatchClick ? 'pointer' : 'default' }}
                  >
                    {/* Status Badge - Mobile */}
                    <div className="match-status-mobile">
                      <span className={`status-badge ${matchStatus.className}`}>
                        {matchStatus.label}
                      </span>
                    </div>

                    {/* Match Row */}
                    <div className="match-row-v2">
                      {/* Status Badge - Desktop */}
                      <div className="match-status-desktop">
                        <span className={`status-badge ${matchStatus.className}`}>
                          {matchStatus.label}
                        </span>
                      </div>

                      {/* Home Team */}
                      <div className="match-team-v2 home">
                        <span className="team-name-v2">{match.home_team?.name || 'TBD'}</span>
                        <div className="team-logo-v2">
                          {match.home_team?.crest_url ? (
                            <SmartImg
                              src={match.home_team.crest_url}
                              preset="crestSm"
                              alt={match.home_team.name}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span>{match.home_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="match-score-v2">
                        {hasScore ? (
                          <span className={`score-display ${isLive ? 'live' : ''}`}>{homeScore} - {awayScore}</span>
                        ) : (
                          <span className="vs-display">vs</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="match-team-v2 away">
                        <div className="team-logo-v2">
                          {match.away_team?.crest_url ? (
                            <SmartImg
                              src={match.away_team.crest_url}
                              preset="crestSm"
                              alt={match.away_team.name}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span>{match.away_team?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <span className="team-name-v2">{match.away_team?.name || 'TBD'}</span>
                      </div>

                      {/* Venue & Match Type - Desktop */}
                      <div className="match-venue-desktop">
                        <span>
                          {match.venue || ''}
                          {match.venue && getMatchTypeLabel(match.match_type) && ' | '}
                          {getMatchTypeLabel(match.match_type)}
                        </span>
                      </div>
                    </div>

                    {/* Venue & Match Type - Mobile */}
                    <div className="match-venue-mobile">
                      <span>
                        {match.venue || ''}
                        {match.venue && getMatchTypeLabel(match.match_type) && ' | '}
                        {getMatchTypeLabel(match.match_type)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-matches-v2">
                <i className="fas fa-calendar-times"></i>
                <p>
                  {searchQuery 
                    ? `No matches found for "${searchQuery}"` 
                    : `No fixtures scheduled for Matchday ${activeMatchday}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer edition="2026" />

      <style>{`
        .fixtures-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .view-toggle-fixtures {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 10px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-btn:hover {
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .view-btn.active {
          background: linear-gradient(135deg, #4f8cff, #6fb1fc);
          color: #fff;
        }

        .view-btn i {
          font-size: 14px;
        }

        .fixtures-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 16px;
          min-width: 250px;
          transition: all 0.2s;
        }

        .fixtures-search:focus-within {
          border-color: #4f8cff;
          background: rgba(79, 140, 255, 0.05);
        }

        .fixtures-search i {
          color: rgba(255, 255, 255, 0.4);
        }

        .fixtures-search input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
        }

        .fixtures-search input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .clear-search {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .clear-search:hover {
          color: #fff;
        }

        @media (max-width: 768px) {
          .fixtures-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .view-toggle-fixtures {
            justify-content: center;
          }

          .fixtures-search {
            min-width: 100%;
          }

          .view-btn span {
            display: none;
          }

          .view-btn {
            padding: 10px 14px;
          }
        }
      `}</style>
    </>
  );
}
