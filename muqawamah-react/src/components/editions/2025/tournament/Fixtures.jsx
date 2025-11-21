import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Fixtures({ fixtures }) {
  const [filter, setFilter] = useState('all'); // all, completed, upcoming

  const groupFixturesByDate = (fixtures) => {
    const grouped = {};
    fixtures.forEach((fixture) => {
      const date = new Date(fixture.match_time).toLocaleDateString('en-US', {
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
      const time = new Date(fixture.match_time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return <span className="status-badge upcoming">{time}</span>;
    }
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
                    className={`fixture-card ${fixture.status}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
    </div>
  );
}

export default Fixtures;

