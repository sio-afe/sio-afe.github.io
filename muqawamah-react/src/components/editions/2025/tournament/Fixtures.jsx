import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient as sharedSupabaseClient } from '../../../../lib/supabaseClient';

function Fixtures({ fixtures }) {
  const [filter, setFilter] = useState('all'); // all, completed, upcoming
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
  const [playerStats, setPlayerStats] = useState({ home: [], away: [] });
  const [playerStatsLoading, setPlayerStatsLoading] = useState(false);

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
    setActiveDetailTab('overview');
    setLoadingDetails(true);
    setPlayerStats({ home: [], away: [] });
    setPlayerStatsLoading(true);

    try {
      const supabase = window.supabaseClient || sharedSupabaseClient;

      if (supabase) {
        // Fetch goals for this match directly
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select(`
            id,
            minute,
            team_id,
            goal_type,
            scorer_id,
            assister_id,
            scorer:team_players!goals_scorer_id_fkey(player_name, player_image),
            assister:team_players!goals_assister_id_fkey(player_name, player_image)
          `)
          .eq('match_id', fixture.id)
          .order('minute');

        if (goalsError) {
          console.error('Error fetching goals:', goalsError);
        }

        // Prepare match details with goals
        const detailsWithGoals = {
          ...fixture,
          goals: goalsData || [],
          home_team: fixture.home_team,
          away_team: fixture.away_team
        };

        setMatchDetails(detailsWithGoals);
        await loadPlayerStats(fixture, supabase);
      } else {
        setMatchDetails(fixture);
        setPlayerStatsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setMatchDetails(fixture);
      setPlayerStatsLoading(false);
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

  const normalizeGoals = (goals) => {
    if (!goals) return [];
    if (typeof goals === 'string') {
      const parsed = safeJSONParse(goals);
      return Array.isArray(parsed) ? parsed : [];
    }
    return Array.isArray(goals) ? goals : [];
  };

  const loadPlayerStats = async (details, supabase) => {
    if (!supabase || !details) {
      setPlayerStats({ home: [], away: [] });
      setPlayerStatsLoading(false);
      return;
    }

    const homeTeam = details.home_team || details.homeTeam;
    const awayTeam = details.away_team || details.awayTeam;

    if (!homeTeam?.id || !awayTeam?.id) {
      setPlayerStats({ home: [], away: [] });
      setPlayerStatsLoading(false);
      return;
    }

    try {
      // Fetch goals for ALL matches in the tournament (for tournament stats)
      const { data: tournamentGoals, error: tournamentError } = await supabase
        .from('goals')
        .select(`
          team_id,
          scorer_id,
          assister_id,
          scorer:team_players!goals_scorer_id_fkey(player_name),
          assister:team_players!goals_assister_id_fkey(player_name)
        `)
        .in('team_id', [homeTeam.id, awayTeam.id]);

      if (tournamentError) throw tournamentError;
      
      const data = tournamentGoals;

      const aggregateForTeam = (team) => {
        if (!team?.id) return [];
        const playerMap = {};
        const basePlayers = normalizePlayers(team.players || []);

        basePlayers.forEach((player) => {
          if (!player?.name) return;
          const key = player.name.toLowerCase();
          playerMap[key] = {
            id: player.id || key,
            name: player.name,
            position: player.position || '',
            player_image: player.player_image,
            goals: 0,
            assists: 0,
          };
        });

        (data || []).forEach((event) => {
          if (event.team_id !== team.id) return;
          if (event.scorer?.player_name) {
            const key = event.scorer.player_name.toLowerCase();
            if (!playerMap[key]) {
              playerMap[key] = {
                id: event.scorer_id || key,
                name: event.scorer.player_name,
                position: '',
                goals: 0,
                assists: 0,
              };
            }
            playerMap[key].goals += 1;
          }

          if (event.assister?.player_name) {
            const key = event.assister.player_name.toLowerCase();
            if (!playerMap[key]) {
              playerMap[key] = {
                id: event.assister_id || key,
                name: event.assister.player_name,
                position: '',
                goals: 0,
                assists: 0,
              };
            }
            playerMap[key].assists += 1;
          }
        });

        return Object.values(playerMap).sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists));
      };

      setPlayerStats({
        home: aggregateForTeam(homeTeam),
        away: aggregateForTeam(awayTeam),
      });
    } catch (error) {
      console.error('Error loading player stats:', error);
      setPlayerStats({ home: [], away: [] });
    } finally {
      setPlayerStatsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setMatchDetails(null);
    setActiveDetailTab('overview');
    setPlayerStats({ home: [], away: [] });
  };

  const renderHighlights = (goalsList, homeName, awayName) => {
    if (!goalsList.length) {
      return (
        <div className="empty-highlights">
          <i className="fas fa-info-circle"></i>
          <p>No goals recorded for this match.</p>
        </div>
      );
    }

    return goalsList.map((goal) => {
      // Handle both old format (scorer_name) and new format (scorer.player_name)
      const scorerName = goal.scorer?.player_name || goal.scorer_name || 'Unknown';
      const assisterName = goal.assister?.player_name || goal.assist_name;
      
      return (
        <div
          key={goal.id || `${scorerName}-${goal.minute}`}
          className={`highlight-card ${goal.team_name === homeName ? 'home' : 'away'}`}
        >
          <div className="highlight-minute">{goal.minute}&rsquo;</div>
          <div className="highlight-details">
            <span className="highlight-player">{scorerName}</span>
            {assisterName && (
              <span className="highlight-assist">Assist: {assisterName}</span>
            )}
          </div>
        </div>
      );
    });
  };

  const renderFieldPlayers = (players, isAway = false) => {
    if (!players.length) return null;

    return players.map((player) => {
      const posX = typeof player.position_x === 'number' ? player.position_x : 50;
      const posY = typeof player.position_y === 'number' ? player.position_y : 50;
      
      let adjustedX;
      let adjustedY;
      
      if (isAway) {
        // Away team: face downward by mirroring the horizontal axis and occupying top half
        adjustedX = 100 - posX;
        adjustedY = 52.5 + (posY * 0.45); // Scale 0-100 to 52.5-97.5
      } else {
        // Home team: occupy bottom half attacking upward
        adjustedX = posX;
        adjustedY = 47.5 - (posY * 0.45); // Scale 0-100 to 47.5-2.5
      }
      
      const safeX = Math.min(95, Math.max(5, adjustedX));
      const safeY = Math.min(97.5, Math.max(2.5, adjustedY));

      return (
        <div
          key={player.id || `${player.name}-${player.position}`}
          className="field-player"
          style={{ left: `${safeX}%`, top: `${safeY}%` }}
        >
          <div className="field-player-avatar">
            <img
              src={player.player_image || '/assets/data/open-age/team-logos/default.png'}
              alt={player.name}
              loading="lazy"
              onError={(e) => {
                e.target.src = '/assets/data/open-age/team-logos/default.png';
              }}
            />
          </div>
          <span className="field-player-name">{player.name}</span>
        </div>
      );
    });
  };

  const renderSubstitutes = (label, substitutes, teamCrest) => (
    <div className="team-subs-card">
      <div className="team-subs-header">
        <img src={teamCrest} alt="" className="subs-team-crest" />
        <h5>{label}</h5>
      </div>
      {substitutes.length ? (
        <div className="substitutes-grid">
          {substitutes.map((player) => (
            <div key={player.id || `${player.name}-sub`} className="substitute-item">
              <div className="substitute-avatar">
                <img
                  src={player.player_image || '/assets/data/open-age/team-logos/default.png'}
                  alt={player.name}
                  onError={(e) => {
                    e.target.src = '/assets/data/open-age/team-logos/default.png';
                  }}
                />
                {player.number && <span className="sub-number">#{player.number}</span>}
              </div>
              <div className="substitute-info">
                <span className="sub-name">{player.name}</span>
                <span className="sub-position">{player.position}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">No substitutes listed.</p>
      )}
    </div>
  );

  const renderPlayerStats = (label, crest, stats) => (
    <div className="player-stats-card">
      <div className="player-stats-heading">
        {crest && (
          <img
            src={crest}
            alt={label}
            onError={(e) => {
              e.target.src = '/assets/data/open-age/team-logos/default.png';
            }}
          />
        )}
        <div>
          <p className="label">{label}</p>
          <p className="caption">Tournament totals</p>
        </div>
      </div>

      {playerStatsLoading ? (
        <div className="player-stats-loading">
          <div className="loading-spinner small"></div>
          <p>Loading player contributions...</p>
        </div>
      ) : stats.length ? (
        <div className="player-stat-list">
          {stats.map((player) => (
            <div key={player.id} className="player-stat-row">
              <div className="player-stat-info">
                <div className="player-avatar-mini">
                  <img
                    src={player.player_image || '/assets/data/open-age/team-logos/default.png'}
                    alt={player.name}
                    onError={(e) => {
                      e.target.src = '/assets/data/open-age/team-logos/default.png';
                    }}
                  />
                </div>
                <div>
                  <p className="player-name">{player.name}</p>
                  <span className="player-role">{player.position || 'Player'}</span>
                </div>
              </div>
              <div className="player-stat-metrics">
                <span>
                  <i className="fas fa-futbol"></i>
                  {player.goals || 0}
                </span>
                <span>
                  <i className="fas fa-hands-helping"></i>
                  {player.assists || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="player-stats-empty">
          <p>No recorded goals or assists yet.</p>
        </div>
      )}
    </div>
  );

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
                  {(() => {
                    const meta = matchDetails?.match || {};
                    const homeTeamInfo = matchDetails?.home_team || selectedMatch.home_team || {};
                    const awayTeamInfo = matchDetails?.away_team || selectedMatch.away_team || {};
                    const homePlayers = normalizePlayers(homeTeamInfo.players);
                    const awayPlayers = normalizePlayers(awayTeamInfo.players);
                    const goalsList = normalizeGoals(matchDetails?.goals);
                    const matchDate = new Date(selectedMatch.match_time || selectedMatch.match_date);
                    const homeScore = meta.home_score ?? selectedMatch.home_score ?? 0;
                    const awayScore = meta.away_score ?? selectedMatch.away_score ?? 0;

                    return (
                      <>
                        <div className="match-details-header">
                          <div>
                            <span className={`match-status-pill ${
                              selectedMatch.status === 'completed' ? 'status-completed' : 
                              selectedMatch.status === 'live' ? 'status-live' : 
                              'status-scheduled'
                            }`}>
                              {selectedMatch.status === 'completed' ? 'FULL TIME' : 
                               selectedMatch.status === 'live' ? 'LIVE' : 
                               'SCHEDULED'}
                            </span>
                            <h2>{(homeTeamInfo.name || selectedMatch.home_team?.name || 'Home')} vs {(awayTeamInfo.name || selectedMatch.away_team?.name || 'Away')}</h2>
                            <p className="match-date">
                              <i className="fas fa-calendar-alt"></i>
                              {matchDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          {selectedMatch.venue && (
                            <div className="match-meta-chip">
                              <i className="fas fa-map-marker-alt"></i>
                              {selectedMatch.venue}
                            </div>
                          )}
                        </div>

                        <div className="match-details-tabs">
                          <button
                            className={activeDetailTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveDetailTab('overview')}
                          >
                            Overview
                          </button>
                          <button
                            className={activeDetailTab === 'lineups' ? 'active' : ''}
                            onClick={() => setActiveDetailTab('lineups')}
                          >
                            Lineups
                          </button>
                          <button
                            className={activeDetailTab === 'players' ? 'active' : ''}
                            onClick={() => setActiveDetailTab('players')}
                          >
                            Players
                          </button>
                        </div>

                        <div className="match-tab-content">
                          {activeDetailTab === 'overview' && (
                            <div className="match-overview">
                              <div className="scoreboard-card scoreboard-google">
                                <div className="score-meta-row">
                                  <span className="score-competition">
                                    {selectedMatch.category === 'u17' ? 'U17 Division' : 'Open Age Division'}
                                  </span>
                                </div>
                                <div className="score-line">
                                  <img
                                    className="score-crest"
                                    src={
                                      homeTeamInfo.crest_url ||
                                      selectedMatch.home_team?.crest_url ||
                                      '/assets/data/open-age/team-logos/default.png'
                                    }
                                    alt={homeTeamInfo.name || selectedMatch.home_team?.name}
                                  />
                                  <span className={`score-digit ${homeScore > awayScore ? 'winner' : ''}`}>
                                    {homeScore}
                                  </span>
                                  <span className="score-hyphen">-</span>
                                  <span className={`score-digit ${awayScore > homeScore ? 'winner' : ''}`}>
                                    {awayScore}
                                  </span>
                                  <img
                                    className="score-crest"
                                    src={
                                      awayTeamInfo.crest_url ||
                                      selectedMatch.away_team?.crest_url ||
                                      '/assets/data/open-age/team-logos/default.png'
                                    }
                                    alt={awayTeamInfo.name || selectedMatch.away_team?.name}
                                  />
                                </div>
                                {(selectedMatch.match_type || selectedMatch.match_number) && (
                                  <div className="score-stage-row">
                                    {selectedMatch.match_type
                                      ? selectedMatch.match_type.replace(/-/g, ' ')
                                      : `Match ${selectedMatch.match_number}`}
                                  </div>
                                )}
                              </div>

                              <div className="goal-highlights-card">
                                <div className="card-header">
                                  <p>Highlights</p>
                                  <span>Goals & key moments</span>
                                </div>
                                <div className="highlight-list">
                                  {renderHighlights(goalsList, homeTeamInfo.name, awayTeamInfo.name)}
                                </div>
                              </div>
                            </div>
                          )}

                          {activeDetailTab === 'lineups' && (
                            homePlayers.length || awayPlayers.length ? (
                              <div className="lineups-section-modern">
                                <div className="match-lineup-field-svg">
                                  <svg
                                    viewBox="0 0 74 111"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="football-field-svg"
                                    preserveAspectRatio="xMidYMid meet"
                                  >
                                    <rect width="74" height="111" fill="#00a000" />
                                    <g fill="none" stroke="#fff" strokeWidth="0.5" transform="translate(3 3)">
                                      <path d="M 0 0 h 68 v 105 h -68 Z" />
                                      <path d="M 0 52.5 h 68" />
                                      <circle r="9.15" cx="34" cy="52.5" />
                                      <circle r="0.75" cx="34" cy="52.5" fill="#fff" stroke="none" />
                                      <g>
                                        <path d="M 13.84 0 v 16.5 h 40.32 v -16.5" />
                                        <path d="M 24.84 0 v 5.5 h 18.32 v -5.5" />
                                        <circle r="0.75" cx="34" cy="10.94" fill="#fff" stroke="none" />
                                        <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0" />
                                      </g>
                                      <g transform="rotate(180,34,52.5)">
                                        <path d="M 13.84 0 v 16.5 h 40.32 v -16.5" />
                                        <path d="M 24.84 0 v 5.5 h 18.32 v -5.5" />
                                        <circle r="0.75" cx="34" cy="10.94" fill="#fff" stroke="none" />
                                        <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0" />
                                      </g>
                                      <path d="M 0 2 a 2 2 0 0 0 2 -2M 66 0 a 2 2 0 0 0 2 2M 68 103 a 2 2 0 0 0 -2 2M 2 105 a 2 2 0 0 0 -2 -2" />
                                    </g>
                                  </svg>
                                  <div className="field-label home-label">
                                    {homeTeamInfo.name || selectedMatch.home_team?.name}
                                  </div>
                                  <div className="field-label away-label">
                                    {awayTeamInfo.name || selectedMatch.away_team?.name}
                                  </div>
                                  {renderFieldPlayers(homePlayers.filter((player) => !player.is_substitute), false)}
                                  {renderFieldPlayers(awayPlayers.filter((player) => !player.is_substitute), true)}
                                </div>

                                <div className="substitutes-wrapper">
                                  {renderSubstitutes(
                                    `${homeTeamInfo.name || selectedMatch.home_team?.name} substitutes`, 
                                    homePlayers.filter((player) => player.is_substitute),
                                    homeTeamInfo.crest_url || selectedMatch.home_team?.crest_url
                                  )}
                                  {renderSubstitutes(
                                    `${awayTeamInfo.name || selectedMatch.away_team?.name} substitutes`, 
                                    awayPlayers.filter((player) => player.is_substitute),
                                    awayTeamInfo.crest_url || selectedMatch.away_team?.crest_url
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="no-lineups">
                                <i className="fas fa-info-circle"></i>
                                <p>Detailed lineups not available for this match yet.</p>
                              </div>
                            )
                          )}

                          {activeDetailTab === 'players' && (
                            <div className="player-stats-section">
                              {renderPlayerStats(homeTeamInfo.name || selectedMatch.home_team?.name || 'Home Team', homeTeamInfo.crest_url || selectedMatch.home_team?.crest_url, playerStats.home)}
                              {renderPlayerStats(awayTeamInfo.name || selectedMatch.away_team?.name || 'Away Team', awayTeamInfo.crest_url || selectedMatch.away_team?.crest_url, playerStats.away)}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
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

