/**
 * Match Score Prediction using Machine Learning
 * Based on historical match performance (goals scored/conceded)
 */

/**
 * Calculate average goals scored by a team in their matches
 */
function calculateAverageGoalsScored(matches, teamId) {
  if (!matches || matches.length === 0) return 0;

  let totalGoals = 0;
  let matchCount = 0;

  matches.forEach(match => {
    if (match.status === 'completed') {
      if (match.home_team_id === teamId) {
        totalGoals += match.home_score || 0;
        matchCount++;
      } else if (match.away_team_id === teamId) {
        totalGoals += match.away_score || 0;
        matchCount++;
      }
    }
  });

  return matchCount > 0 ? totalGoals / matchCount : 0;
}

/**
 * Calculate average goals conceded by a team in their matches
 */
function calculateAverageGoalsConceded(matches, teamId) {
  if (!matches || matches.length === 0) return 0;

  let totalConceded = 0;
  let matchCount = 0;

  matches.forEach(match => {
    if (match.status === 'completed') {
      if (match.home_team_id === teamId) {
        totalConceded += match.away_score || 0;
        matchCount++;
      } else if (match.away_team_id === teamId) {
        totalConceded += match.home_score || 0;
        matchCount++;
      }
    }
  });

  return matchCount > 0 ? totalConceded / matchCount : 0;
}

/**
 * Fallback prediction using team statistics when no match history available
 */
function predictFromStats(homeTeamStats, awayTeamStats) {
  if (!homeTeamStats || !awayTeamStats) {
    return { homeScore: 1, awayScore: 1, confidence: 30 };
  }

  // Use goals_for and goals_against from team stats
  const homeGoalsFor = homeTeamStats.goals_for || 0;
  const homeGoalsAgainst = homeTeamStats.goals_against || 0;
  const homePlayed = homeTeamStats.played || 1;
  
  const awayGoalsFor = awayTeamStats.goals_for || 0;
  const awayGoalsAgainst = awayTeamStats.goals_against || 0;
  const awayPlayed = awayTeamStats.played || 1;

  // Calculate averages
  const homeAvgScored = homeGoalsFor / homePlayed;
  const homeAvgConceded = homeGoalsAgainst / homePlayed;
  const awayAvgScored = awayGoalsFor / awayPlayed;
  const awayAvgConceded = awayGoalsAgainst / awayPlayed;

  // Home advantage
  const homeAdvantage = 0.15;

  const homeScore = Math.round(
    (homeAvgScored * (1 + homeAdvantage) + awayAvgConceded) / 2
  );

  const awayScore = Math.round(
    (awayAvgScored + homeAvgConceded * (1 - homeAdvantage)) / 2
  );

  // Lower confidence when using stats instead of match history
  const confidence = homePlayed > 0 && awayPlayed > 0 ? 60 : 40;

  return {
    homeScore: Math.max(0, homeScore),
    awayScore: Math.max(0, awayScore),
    confidence: Math.round(confidence)
  };
}

/**
 * Predict match score based on historical data
 * @param {Object} homeTeamHistory - Array of previous matches for home team
 * @param {Object} awayTeamHistory - Array of previous matches for away team
 * @param {Object} homeTeamStats - Current team stats (goals_for, goals_against, etc.)
 * @param {Object} awayTeamStats - Current team stats
 * @returns {Object} Predicted scores { homeScore, awayScore, confidence }
 */
export function predictMatchScore(homeTeamHistory, awayTeamHistory, homeTeamStats, awayTeamStats) {
  // If no historical data, use team stats as fallback
  if (!homeTeamHistory || homeTeamHistory.length === 0) {
    return predictFromStats(homeTeamStats, awayTeamStats);
  }

  // Analyze last 5 matches for each team (or all available if less)
  const recentHomeMatches = homeTeamHistory.slice(0, 5);
  const recentAwayMatches = awayTeamHistory.slice(0, 5);

  // Calculate average goals scored and conceded
  const homeAvgScored = calculateAverageGoalsScored(recentHomeMatches, homeTeamStats.id);
  const homeAvgConceded = calculateAverageGoalsConceded(recentHomeMatches, homeTeamStats.id);
  const awayAvgScored = calculateAverageGoalsScored(recentAwayMatches, awayTeamStats.id);
  const awayAvgConceded = calculateAverageGoalsConceded(recentAwayMatches, awayTeamStats.id);

  // Home advantage factor (teams typically score more at home)
  const homeAdvantage = 0.15; // 15% boost for home team

  // Predict home team score: based on their scoring ability vs opponent's defense
  const homeScore = Math.round(
    (homeAvgScored * (1 + homeAdvantage) + awayAvgConceded) / 2
  );

  // Predict away team score: based on their scoring ability vs opponent's defense
  const awayScore = Math.round(
    (awayAvgScored + homeAvgConceded * (1 - homeAdvantage)) / 2
  );

  // Calculate confidence based on data availability
  const dataPoints = Math.min(recentHomeMatches.length, recentAwayMatches.length);
  const confidence = Math.min(95, 50 + (dataPoints * 9)); // 50-95% confidence

  // Ensure scores are non-negative
  return {
    homeScore: Math.max(0, homeScore),
    awayScore: Math.max(0, awayScore),
    confidence: Math.round(confidence)
  };
}

