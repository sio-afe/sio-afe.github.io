import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient as sharedSupabaseClient } from '../../../../lib/supabaseClient';

function Fixtures({ fixtures }) {
  const [filter, setFilter] = useState('all'); // all, completed, upcoming
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const groupFixturesByDate = (fixtures) => {
    const grouped = {};
    fixtures.forEach((fixture) => {
      const dateObj = fixture.match_time
        ? new Date(fixture.match_time)
        : new Date(fixture.match_date);
      const date = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(fixture);
    });
    return grouped;
  };

  const filterFixtures = (fixtures) => {
    if (filter === 'all') return fixtures;
    if (filter === 'completed') return fixtures.filter((f) => f.status === 'completed');
    if (filter === 'upcoming') return fixtures.filter((f) => f.status !== 'completed');
    return fixtures;
  };

  const filteredFixtures = filterFixtures(fixtures);
  const groupedFixtures = groupFixturesByDate(filteredFixtures);

  const getStatusBadge = (fixture) => {
    if (fixture.status === 'completed') {
      return <span className="status-badge completed">FT</span>;
    } else if (fixture.status === 'live') {
      return <span className="status-badge live">LIVE</span>;
    } else {
      const timeSource = fixture.match_time || fixture.match_date;
      const time = new Date(timeSource).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return <span className="status-badge upcoming">{time}</span>;
    }
  };

  const handleMatchClick = async (fixture) => {
    // Only show details for completed matches
    if (fixture.status !== 'completed') {
      return;
    }

    setSelectedMatch(fixture);
    setLoadingDetails(true);

    try {
      const supabase = window.supabaseClient || sharedSupabaseClient;

      if (supabase) {
        const { data, error } = await supabase
          .rpc('get_match_details', { match_uuid: fixture.id });
        
        if (error) {
          console.error('Error fetching match details:', error);
          // Use basic fixture data if function doesn't exist
          setMatchDetails(fixture);
        } else {
          const payload = Array.isArray(data) ? data[0] : data;
          const parsed =
            typeof payload === 'string' ? safeJSONParse(payload) : payload;
          setMatchDetails(parsed || fixture);
        }
      } else {
        setMatchDetails(fixture);
      }
    } catch (error) {
      console.error('Error:', error);
      setMatchDetails(fixture);
    } finally {
      setLoadingDetails(false);
    }
  };

  const safeJSONParse = (value) => {
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn('Unable to parse JSON payload', err);
      return null;
    }
  };

  const normalizePlayers = (players) => {
    if (!players) return [];
    if (typeof players === 'string') {
      const parsed = safeJSONParse(players);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(players) ? players : [];
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setMatchDetails(null);
  };

  return (
    <div className="fixtures-container">
      {/* Filter Buttons */}
      <div className="fixtures-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Matches
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
      </div>

      {/* Fixtures List */}
      <div className="fixtures-list">
        {Object.keys(groupedFixtures).length === 0 ? (
          <div className="no-fixtures">
            <i className="fas fa-calendar-times"></i>
            <p>No fixtures found</p>
          </div>
        ) : (
          Object.entries(groupedFixtures).map(([date, dateFixtures], dateIndex) => (
            <div key={date} className="fixture-date-group">
              <div className="fixture-date-header">
                <i className="fas fa-calendar-day"></i>
                <h3>{date}</h3>
              </div>

              <div className="fixture-cards">
                {dateFixtures.map((fixture, index) => (
                  <motion.div
                    key={fixture.id}
                    className={`fixture-card ${fixture.status} ${fixture.status === 'completed' ? 'clickable' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleMatchClick(fixture)}
                    style={{ cursor: fixture.status === 'completed' ? 'pointer' : 'default' }}
                  >
                    <div className="fixture-header">
                      {getStatusBadge(fixture)}
                      {fixture.venue && (
                        <span className="fixture-venue">
                          <i className="fas fa-map-marker-alt"></i>
                          {fixture.venue}
                        </span>
                      )}
                    </div>

                    <div className="fixture-teams">
                      {/* Home Team */}
                      <div className="fixture-team home">
                        <img
                          src={fixture.home_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}
                          alt={fixture.home_team?.name}
                          className="fixture-team-crest"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/assets/data/open-age/team-logos/default.png';
                          }}
                        />
                        <span className="fixture-team-name">{fixture.home_team?.name || 'TBD'}</span>
                      </div>

                      {/* Score or VS */}
                      <div className="fixture-score">
                        {fixture.status === 'completed' || fixture.status === 'live' ? (
                          <>
                            <span className={`score-display ${fixture.home_score > fixture.away_score ? 'winner' : ''}`}>
                              {fixture.home_score || 0}
                            </span>
                            <span className="score-separator">-</span>
                            <span className={`score-display ${fixture.away_score > fixture.home_score ? 'winner' : ''}`}>
                              {fixture.away_score || 0}
                            </span>
                          </>
                        ) : (
                          <span className="vs-text">VS</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="fixture-team away">
                        <span className="fixture-team-name">{fixture.away_team?.name || 'TBD'}</span>
                        <img
                          src={fixture.away_team?.crest_url || '/assets/data/open-age/team-logos/default.png'}
                          alt={fixture.away_team?.name}
                          className="fixture-team-crest"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/assets/data/open-age/team-logos/default.png';
                          }}
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    {fixture.status === 'completed' && fixture.winner && (
                      <div className="fixture-footer">
                        <span className="winner-badge">
                          <i className="fas fa-trophy"></i>
                          Winner: {fixture.winner}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Match Details Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            className="match-details-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="match-details-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-modal-btn" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>

              {loadingDetails ? (
                <div className="loading-details">
                  <div className="loading-spinner"></div>
                  <p>Loading match details...</p>
                </div>
              ) : matchDetails ? (
                <div className="match-details-content">
                  {/* Match Header */}
                    <div className="match-details-header">
                    <div className="match-date-time">
                      <i className="fas fa-calendar-alt"></i>
                      {new Date(selectedMatch.match_time || selectedMatch.match_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {selectedMatch.venue && (
                      <div className="match-venue">
                        <i className="fas fa-map-marker-alt"></i>
                        {selectedMatch.venue}
                      </div>
                    )}
                  </div>

                  {/* Match Score */}
                  <div className="match-score-display">
                    {(() => {
                      const meta = matchDetails?.match || {};
                      const homeScore = meta.home_score ?? selectedMatch.home_score ?? 0;
                      const awayScore = meta.away_score ?? selectedMatch.away_score ?? 0;
                      const homeTeamInfo = matchDetails?.home_team || {};
                      const awayTeamInfo = matchDetails?.away_team || {};
                      const homePlayers = normalizePlayers(homeTeamInfo.players);
                      const awayPlayers = normalizePlayers(awayTeamInfo.players);

                      return (
                        <>
                          <div className="team-display home">
                            <img
                              src={
                                selectedMatch.home_team?.crest_url ||
                                homeTeamInfo.crest_url ||
                                '/assets/data/open-age/team-logos/default.png'
                              }
                              alt={selectedMatch.home_team?.name || homeTeamInfo.name}
                              className="team-crest-large"
                            />
                            <h3>{selectedMatch.home_team?.name || homeTeamInfo.name}</h3>
                            {homeTeamInfo.formation && (
                              <span className="formation-badge">{homeTeamInfo.formation}</span>
                            )}
                          </div>

                          <div className="score-display-large">
                            <span
                              className={`score-number ${homeScore > awayScore ? 'winner' : ''}`}
                            >
                              {homeScore}
                            </span>
                            <span className="score-separator">-</span>
                            <span
                              className={`score-number ${awayScore > homeScore ? 'winner' : ''}`}
                            >
                              {awayScore}
                            </span>
                          </div>

                          <div className="team-display away">
                            <img
                              src={
                                selectedMatch.away_team?.crest_url ||
                                awayTeamInfo.crest_url ||
                                '/assets/data/open-age/team-logos/default.png'
                              }
                              alt={selectedMatch.away_team?.name || awayTeamInfo.name}
                              className="team-crest-large"
                            />
                            <h3>{selectedMatch.away_team?.name || awayTeamInfo.name}</h3>
                            {awayTeamInfo.formation && (
                              <span className="formation-badge">{awayTeamInfo.formation}</span>
                            )}
                          </div>

                          {homePlayers.length > 0 && awayPlayers.length > 0 ? (
                            <div className="match-lineups-section">
                              <h4>
                                <i className="fas fa-users"></i> Match Lineups
                              </h4>
                              <div className="lineups-grid">
                                <div className="lineup-column">
                                  <h5>{selectedMatch.home_team?.name || homeTeamInfo.name}</h5>
                                  <ul className="player-list">
                                    {homePlayers.slice(0, 7).map((player) => (
                                      <li key={player.id || player.name}>
                                        <span className="player-position">{player.position}</span>
                                        <span className="player-name">{player.name}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="lineup-column">
                                  <h5>{selectedMatch.away_team?.name || awayTeamInfo.name}</h5>
                                  <ul className="player-list">
                                    {awayPlayers.slice(0, 7).map((player) => (
                                      <li key={player.id || player.name}>
                                        <span className="player-position">{player.position}</span>
                                        <span className="player-name">{player.name}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="no-lineups">
                              <i className="fas fa-info-circle"></i>
                              <p>Detailed lineups not available for this match yet.</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Fixtures;

