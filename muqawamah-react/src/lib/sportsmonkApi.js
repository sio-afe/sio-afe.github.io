/**
 * SportsMonk API Service
 * Documentation: https://docs.sportmonks.com/football/tutorials-and-guides/tutorials/odds-and-predictions/predictions
 * 
 * Note: You'll need to:
 * 1. Sign up for SportsMonk API at https://www.sportmonks.com/
 * 2. Get your API token
 * 3. Add it to your environment variables or config
 */

const SPORTSMONK_API_BASE = 'https://api.sportmonks.com/v3/football';
// TODO: Replace with your actual API token from environment variables
const SPORTSMONK_API_TOKEN = process.env.REACT_APP_SPORTSMONK_API_TOKEN || '';

/**
 * Get match predictions from SportsMonk
 * @param {number} sportmonkMatchId - The SportsMonk match ID
 * @returns {Promise<Object>} Prediction data with probabilities
 */
export async function getMatchPredictions(sportmonkMatchId) {
  if (!SPORTSMONK_API_TOKEN) {
    console.warn('SportsMonk API token not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${SPORTSMONK_API_BASE}/predictions/probabilities/fixtures/${sportmonkMatchId}?api_token=${SPORTSMONK_API_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`SportsMonk API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SportsMonk predictions:', error);
    return null;
  }
}

/**
 * Search for a match in SportsMonk by team names
 * @param {string} homeTeamName - Home team name
 * @param {string} awayTeamName - Away team name
 * @param {string} matchDate - Match date (YYYY-MM-DD format)
 * @returns {Promise<number|null>} SportsMonk match ID or null
 */
export async function findSportsMonkMatchId(homeTeamName, awayTeamName, matchDate) {
  if (!SPORTSMONK_API_TOKEN) {
    console.warn('SportsMonk API token not configured');
    return null;
  }

  try {
    // Search for fixtures by date
    const dateStr = matchDate.split('T')[0]; // Extract date part
    const response = await fetch(
      `${SPORTSMONK_API_BASE}/fixtures/date/${dateStr}?api_token=${SPORTSMONK_API_TOKEN}&include=participants`
    );

    if (!response.ok) {
      throw new Error(`SportsMonk API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find matching fixture by team names
    if (data.data) {
      const match = data.data.find(fixture => {
        const participants = fixture.participants || [];
        const homeTeam = participants.find(p => p.meta?.location === 'home');
        const awayTeam = participants.find(p => p.meta?.location === 'away');
        
        const homeMatch = homeTeam?.name?.toLowerCase().includes(homeTeamName.toLowerCase()) ||
                         homeTeamName.toLowerCase().includes(homeTeam?.name?.toLowerCase());
        const awayMatch = awayTeam?.name?.toLowerCase().includes(awayTeamName.toLowerCase()) ||
                         awayTeamName.toLowerCase().includes(awayTeam?.name?.toLowerCase());
        
        return homeMatch && awayMatch;
      });

      return match?.id || null;
    }

    return null;
  } catch (error) {
    console.error('Error searching SportsMonk match:', error);
    return null;
  }
}

/**
 * Get predictions with fallback to mock data if API fails
 * @param {string} homeTeamName - Home team name
 * @param {string} awayTeamName - Away team name
 * @param {string} matchDate - Match date
 * @returns {Promise<Object>} Prediction data with home/away/draw probabilities
 */
export async function getPredictions(homeTeamName, awayTeamName, matchDate) {
  // Try to find match ID first
  const matchId = await findSportsMonkMatchId(homeTeamName, awayTeamName, matchDate);
  
  if (matchId) {
    const predictions = await getMatchPredictions(matchId);
    if (predictions && predictions.data) {
      return formatPredictions(predictions.data);
    }
  }

  // Fallback to mock predictions if API fails or match not found
  console.warn('Using fallback predictions - SportsMonk API not available or match not found');
  return getMockPredictions();
}

/**
 * Format SportsMonk prediction data
 * @param {Object} data - Raw prediction data from SportsMonk
 * @returns {Object} Formatted prediction data
 */
function formatPredictions(data) {
  // SportsMonk returns probabilities in different formats
  // Adjust based on actual API response structure
  const predictions = data.predictions || data;
  
  return {
    homeWin: predictions.home_win || predictions.home || 0,
    awayWin: predictions.away_win || predictions.away || 0,
    draw: predictions.draw || 0,
    source: 'sportsmonk'
  };
}

/**
 * Mock predictions for when API is unavailable
 * @returns {Object} Mock prediction data
 */
function getMockPredictions() {
  // Generate random probabilities that sum to 100
  const home = Math.floor(Math.random() * 40) + 30; // 30-70%
  const away = Math.floor(Math.random() * 40) + 20; // 20-60%
  const draw = 100 - home - away;
  
  return {
    homeWin: Math.max(0, home),
    awayWin: Math.max(0, away),
    draw: Math.max(0, draw),
    source: 'mock'
  };
}

