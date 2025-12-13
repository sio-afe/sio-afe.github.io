# Match Score Prediction Feature

## Overview
Replaced the voting system with an AI-powered match score prediction feature that uses machine learning to predict match outcomes based on historical performance data.

## Features

### 1. ML-Based Score Prediction
- Analyzes previous matches for both teams
- Calculates average goals scored and conceded
- Uses home advantage factor (15% boost for home team)
- Predicts scores based on:
  - Home team's scoring ability vs Away team's defense
  - Away team's scoring ability vs Home team's defense
  - Historical match data (last 5-10 matches)

### 2. Prediction Bar Display
- Shows predicted scores for both teams
- Displays confidence percentage (50-95%)
- Shows number of matches analyzed
- Only appears for scheduled/upcoming matches
- Loading state while analyzing data

### 3. Fallback System
- If no match history available, uses team statistics
- Calculates from goals_for and goals_against averages
- Lower confidence when using stats instead of match history

## Implementation

### Files Created/Modified

#### 1. `muqawamah-react/src/lib/matchPrediction.js`
- Core prediction algorithm
- Functions:
  - `predictMatchScore()` - Main prediction function
  - `calculateAverageGoalsScored()` - Calculate team's average goals
  - `calculateAverageGoalsConceded()` - Calculate team's average goals conceded
  - `predictFromStats()` - Fallback using team statistics

#### 2. `muqawamah-react/src/components/editions/2026/fixtures/MatchDetail.jsx`
- Removed all voting functionality
- Added prediction state management
- Added `fetchHistoricalMatches()` function
- Added prediction bar UI component

#### 3. `muqawamah-react/src/styles/Fixtures.css`
- Removed vote button styles
- Added prediction bar styles:
  - `.match-prediction-bar` - Main container
  - `.prediction-content` - Prediction display
  - `.prediction-scores` - Score display
  - `.predicted-number` - Large predicted score numbers
  - Responsive styles for mobile

## Prediction Algorithm

### Formula
```
Home Score = (Home Avg Scored × 1.15 + Away Avg Conceded) / 2
Away Score = (Away Avg Scored + Home Avg Conceded × 0.85) / 2
```

### Confidence Calculation
- Base confidence: 50%
- +9% per match analyzed (up to 95%)
- Lower confidence when using team stats instead of match history

### Data Sources
1. **Primary**: Last 5-10 completed matches for each team
2. **Fallback**: Team statistics (goals_for, goals_against, played)

## Usage

The prediction automatically appears for:
- Scheduled matches (not yet started)
- Upcoming matches

It does NOT appear for:
- Completed matches
- Live matches

## Future Enhancements
- Add more sophisticated ML models (neural networks, regression)
- Consider head-to-head history between teams
- Factor in recent form (last 3 matches weighted more)
- Add prediction accuracy tracking
- Show prediction history and accuracy over time
- Consider player availability/injuries
- Factor in match importance (knockout vs group stage)

