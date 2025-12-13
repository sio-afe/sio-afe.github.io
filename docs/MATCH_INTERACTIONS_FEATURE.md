# Match Interactions Feature

## Overview
Added user interaction features to the match details page, allowing users to vote for which team will win and like/heart matches.

## Features

### 1. Vote for Winner
- Users can vote for which team they think will win a match
- Vote buttons appear next to each team's name in the match header
- Only visible for matches that haven't finished yet
- Shows vote count for each team
- Users can change their vote by clicking the other team's button
- Visual feedback when a team is voted for (gradient background, checkmark icon)

### 2. Like/Heart Button
- Heart button at the bottom of the match detail page
- Users can click to like/unlike a match
- Shows total like count
- Animated heart icon when liked
- Smooth hover effects and transitions

## Database Tables

### `match_votes`
Stores user votes for which team will win:
- `id` - Primary key
- `match_id` - Reference to matches table
- `team_id` - Reference to teams table (the team user voted for)
- `user_identifier` - Browser fingerprint/session ID
- `created_at` - Timestamp
- Unique constraint: one vote per user per match

### `match_likes`
Stores likes/hearts for matches:
- `id` - Primary key
- `match_id` - Reference to matches table
- `user_identifier` - Browser fingerprint/session ID
- `created_at` - Timestamp
- Unique constraint: one like per user per match (can be removed to allow multiple likes)

## User Identification
- Uses browser fingerprinting to identify users without requiring authentication
- Fingerprint stored in localStorage for persistence
- Based on: user agent, language, screen dimensions, timezone, canvas fingerprint

## Implementation Files

### SQL Migration
- `docs/add-match-interactions.sql` - Creates tables and RLS policies

### React Component
- `muqawamah-react/src/components/editions/2026/fixtures/MatchDetail.jsx`
  - Added state for votes and likes
  - Added `fetchInteractions()` function
  - Added `handleVote()` function
  - Added `handleLike()` function
  - Added vote buttons in team headers
  - Added like button in footer

### CSS Styles
- `muqawamah-react/src/styles/Fixtures.css`
  - `.vote-button` - Vote button styles
  - `.vote-button.voted` - Active vote state
  - `.match-like-button` - Like button styles
  - `.match-like-button.liked` - Liked state
  - Responsive styles for mobile devices

## Usage

### Running the Migration
Execute the SQL migration in Supabase SQL Editor:
```sql
-- Run docs/add-match-interactions.sql
```

### How It Works
1. When a user visits a match detail page, the system:
   - Generates or retrieves a user identifier from localStorage
   - Fetches vote counts and like count for the match
   - Checks if the user has already voted/liked

2. When a user votes:
   - If no previous vote: creates a new vote record
   - If previous vote exists: updates to the new team
   - Refreshes vote counts

3. When a user likes:
   - If not liked: creates a new like record
   - If already liked: removes the like record
   - Updates like count immediately

## Future Enhancements
- Allow users to see who voted for which team (optional)
- Add vote percentage display
- Add animation when vote count increases
- Add share functionality for liked matches
- Add analytics tracking for votes and likes

