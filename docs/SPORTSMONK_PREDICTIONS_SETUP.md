# SportsMonk Predictions Integration

## Overview
The match detail page now includes AI-powered predictions using the SportsMonk API. This replaces the voting system with machine learning-based win probability predictions.

## Setup Instructions

### 1. Get SportsMonk API Token
1. Sign up at https://www.sportmonks.com/
2. Navigate to your dashboard
3. Get your API token from the API section
4. The token is required for accessing predictions

### 2. Configure API Token

#### Option A: Environment Variables (Recommended for Production)
Create a `.env` file in the `muqawamah-react` directory:
```env
REACT_APP_SPORTSMONK_API_TOKEN=your_api_token_here
```

#### Option B: Direct Configuration (Development Only)
Edit `muqawamah-react/src/lib/sportsmonkApi.js`:
```javascript
const SPORTSMONK_API_TOKEN = 'your_api_token_here';
```

### 3. API Endpoints Used

#### Predictions Endpoint
```
GET https://api.sportmonks.com/v3/football/predictions/probabilities/fixtures/{fixture_id}?api_token={token}
```

#### Fixtures Search Endpoint
```
GET https://api.sportmonks.com/v3/football/fixtures/date/{date}?api_token={token}&include=participants
```

## How It Works

1. **Match Lookup**: When a match detail page loads, the system:
   - Extracts team names and match date
   - Searches SportsMonk API for matching fixtures
   - Finds the SportsMonk match ID

2. **Prediction Fetching**: 
   - Uses the match ID to fetch predictions
   - Gets win probabilities for home, away, and draw
   - Formats the data for display

3. **Fallback System**:
   - If API fails or match not found, uses mock predictions
   - Shows "Demo" badge when using fallback data
   - Ensures UI always works even without API access

## Prediction Bar Display

The prediction bar shows:
- **Home Team Win Probability**: Blue gradient bar
- **Draw Probability**: Centered percentage
- **Away Team Win Probability**: Red gradient bar
- **AI Prediction Badge**: Indicates ML-powered predictions
- **Demo Badge**: Shows when using fallback data

## API Response Format

SportsMonk returns predictions in this format:
```json
{
  "data": {
    "predictions": {
      "home_win": 45.5,
      "away_win": 30.2,
      "draw": 24.3
    }
  }
}
```

## Notes

- Predictions only show for matches that haven't finished
- The system gracefully handles API failures
- Team name matching is flexible (partial matches allowed)
- Predictions update when match data changes

## Troubleshooting

### Predictions Not Showing
1. Check API token is configured correctly
2. Verify team names match SportsMonk database
3. Check browser console for API errors
4. Ensure match hasn't finished (predictions hidden for completed matches)

### API Errors
- 401: Invalid API token
- 404: Match not found in SportsMonk database
- 429: Rate limit exceeded (upgrade plan)
- 500: SportsMonk server error

### Fallback to Mock Data
If you see "Demo" badge, the system is using mock predictions because:
- API token not configured
- Match not found in SportsMonk
- API request failed

