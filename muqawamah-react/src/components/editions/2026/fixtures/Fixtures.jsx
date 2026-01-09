import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabaseClient } from '../../../../lib/supabaseClient';
import TournamentNavbar from '../../../shared/TournamentNavbar';
import Footer from '../../../shared/Footer';
import SmartImg from '../../../shared/SmartImg';
import { useTournamentLiveUpdates } from '../../../../hooks/useTournamentLiveUpdates';
import { useFlashMap } from '../../../../hooks/useFlashMap';

export default function Fixtures({ onMatchClick }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bgRefreshing, setBgRefreshing] = useState(false);
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
  const prevMatchSigRef = useRef(new Map()); // matchId -> signature string
  const { isFlashing: isMatchFlashing, flashKeys: flashMatches } = useFlashMap(900);

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
    fetchMatches({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const refetchMatches = useCallback(() => {
    fetchMatches({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Live updates: websocket + fallback polling
  useTournamentLiveUpdates({
    enabled: true,
    channelKey: `fixtures:${category}`,
    tables: ['matches', 'teams'],
    filtersByTable: {
      matches: `category=eq.${category}`,
      teams: `category=eq.${category}`
    },
    debounceMs: 600,
    pollIntervalMs: 10_000,
    onUpdate: refetchMatches
  });

  const fetchMatches = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      else setBgRefreshing(true);
      
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

      const nextMatches = matchesData || [];

      // Detect changes (scores/status) and flash those match IDs
      const changedIds = [];
      nextMatches.forEach((m) => {
        const sig = `${m.status ?? ''}|${m.home_score ?? ''}|${m.away_score ?? ''}|${m.home_team?.id ?? ''}|${m.away_team?.id ?? ''}`;
        const prevSig = prevMatchSigRef.current.get(m.id);
        if (prevSig && prevSig !== sig) changedIds.push(m.id);
        prevMatchSigRef.current.set(m.id, sig);
      });
      if (silent && changedIds.length) flashMatches(changedIds);

      setMatches(nextMatches);
      
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
      if (!silent) setLoading(false);
      setBgRefreshing(false);
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
            <div className="fixtures-tabs-container">
              <div className="fixtures-tabs">
                <button 
                  className={`fixtures-tab ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <i className="fas fa-list"></i>
                  <span>Matchday</span>
                </button>
                <button 
                  className={`fixtures-tab ${viewMode === 'all' ? 'active' : ''}`}
                  onClick={() => setViewMode('all')}
                  title="All Matches"
                >
                  <i className="fas fa-th-list"></i>
                  <span>All</span>
                </button>
                <span 
                  className="fixtures-tab-slider" 
                  style={{ 
                    transform: `translateX(${viewMode === 'all' ? '100%' : '0%'})` 
                  }}
                />
              </div>
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
                    {/* Time & Date Header Row */}
                    <div className="match-header-row">
                      <span className="match-time-left">
                        <i className="fas fa-clock"></i>
                        {formatTime(match.scheduled_time)}
                      </span>
                      <span className={`status-badge ${matchStatus.className}`}>
                        {matchStatus.label}
                      </span>
                      <span className="match-date-right">
                        <i className="fas fa-calendar"></i>
                        {match.match_date ? new Date(match.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'TBD'}
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
                          <span className={`score-display ${isLive ? 'live' : ''} ${isMatchFlashing(match.id) ? 'value-flash' : ''}`}>
                            {homeScore} - {awayScore}
                          </span>
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
        .fixtures-header-v2 h1 {
          text-align: left;
        }

        .fixtures-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        /* Capsule Tab Navigation */
        .fixtures-tabs-container {
          display: flex;
          justify-content: center;
        }

        .fixtures-tabs {
          position: relative;
          display: inline-flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50px;
          padding: 6px;
          gap: 0;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(79, 140, 255, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .fixtures-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Oswald', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 14px 28px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.55);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 2;
          white-space: nowrap;
          border-radius: 50px;
        }

        .fixtures-tab i {
          font-size: 0.9rem;
        }

        .fixtures-tab:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .fixtures-tab.active {
          color: #fff;
        }

        .fixtures-tab-slider {
          position: absolute;
          top: 6px;
          left: 6px;
          width: calc(50% - 6px);
          height: calc(100% - 12px);
          background: linear-gradient(135deg, #4f8cff, #6ecdee);
          border-radius: 50px;
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          z-index: 1;
          box-shadow: 0 4px 12px rgba(79, 140, 255, 0.4);
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
            align-items: center;
          }

          .fixtures-tabs-container {
            width: 100%;
            justify-content: center;
          }

          .fixtures-search {
            width: 100%;
            min-width: 100%;
          }

          .fixtures-tab {
            padding: 12px 20px;
            font-size: 0.85rem;
          }

          .fixtures-tab span {
            display: none;
          }

          .fixtures-tab i {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
