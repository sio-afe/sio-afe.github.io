import React from 'react';
import SmartImg from '../../../../shared/SmartImg';

export default function MatchHeader({ match, animateScore = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    }).toUpperCase();
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString.substring(0, 5);
  };

  const getMatchStatusBadge = () => {
    if (match.status === 'completed') {
      return { label: 'FULL TIME', className: 'status-completed' };
    } else if (match.status === 'live') {
      return { label: 'LIVE', className: 'status-live' };
    } else if (match.status === 'scheduled') {
      return { label: 'SCHEDULED', className: 'status-scheduled' };
    }
    return { label: 'UPCOMING', className: 'status-scheduled' };
  };

  const getMatchTypeLabel = () => {
    const matchType = match.match_type?.toLowerCase();
    if (!matchType || matchType === 'group') return 'Group Stage';
    if (matchType === 'quarter-final' || matchType === 'quarterfinal') return 'Quarter Final';
    if (matchType === 'semi-final' || matchType === 'semifinal') return 'Semi Final';
    if (matchType === 'final') return 'Final';
    if (matchType === 'third-place' || matchType === 'thirdplace') return '3rd Place';
    return matchType.charAt(0).toUpperCase() + matchType.slice(1);
  };

  const isFinished = match.status === 'completed';
  const isLive = match.status === 'live';
  const hasScore = isFinished || isLive;
  const statusBadge = getMatchStatusBadge();

  return (
    <section className="match-header-section">
      <div className="match-header-content">
        <div className="match-datetime">
          <p className="match-date">{formatDate(match.match_date)}</p>
          <p className="match-time">{formatTime(match.scheduled_time)}</p>
        </div>

        <div className="match-teams-header">
          {/* Home Team */}
          <div className="header-team home">
            <div className="team-logo-large">
              {match.home_team?.crest_url ? (
                <SmartImg
                  src={match.home_team.crest_url} 
                  preset="matchCrest"
                  alt={match.home_team.name}
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              ) : (
                <span>{match.home_team?.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <h4 className="team-name-header">{match.home_team?.name || 'TBD'}</h4>
          </div>

          {/* Score */}
          <div className="match-score-header">
            {hasScore ? (
              <span className={`score-big ${isLive ? 'live' : ''} ${animateScore ? 'value-flash' : ''}`}>
                {match.home_score ?? 0} - {match.away_score ?? 0}
              </span>
            ) : (
              <span className="score-vs">VS</span>
            )}
            {/* Match Type Label */}
            <span className="match-type-label">{getMatchTypeLabel()}</span>
            {/* Match Status Badge */}
            <span className={`match-status-badge-detail ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Away Team */}
          <div className="header-team away">
            <div className="team-logo-large">
              {match.away_team?.crest_url ? (
                <SmartImg
                  src={match.away_team.crest_url} 
                  preset="matchCrest"
                  alt={match.away_team.name}
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              ) : (
                <span>{match.away_team?.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <h4 className="team-name-header">{match.away_team?.name || 'TBD'}</h4>
          </div>
        </div>

        <div className="match-meta">
          <p className="matchday-label">MATCHDAY {match.match_number || 1}</p>
          {match.venue && <p className="venue-label">{match.venue}</p>}
        </div>
      </div>
    </section>
  );
}

