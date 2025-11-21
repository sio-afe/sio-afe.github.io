# Muqawama URL Structure

## Overview
The Muqawama site now uses a year-based URL structure to organize different editions of the tournament.

## URL Structure

### Main Pages

| URL | Description |
|-----|-------------|
| `/muqawamah/` | Redirects to `/muqawamah/2025/` |
| `/muqawamah/2025/` | Main landing page for Muqawama 2025 |
| `/muqawamah/2026/` | Coming soon page for Muqawama 2026 |

### Tournament Results Pages (2025)

| URL | Description |
|-----|-------------|
| `/muqawamah/2025/open-age/` | Open Age category standings, fixtures, and statistics |
| `/muqawamah/2025/u17/` | Under 17 category standings, fixtures, and statistics |

## Features

### 2025 Edition
- **Hero Section**: Auto-rotating highlight images, tournament stats, team logos
- **About**: Tournament values and philosophy
- **Tournament Categories**: Links to Open Age and U17 results
- **Rules**: Tournament rules and regulations
- **Sponsors**: Tournament sponsors showcase
- **Gallery**: Tournament photo gallery
- **Social**: Social media links

### Tournament Results Pages
Each tournament category page includes:
- **Standings Table**: Sortable team standings with:
  - Position, Team, Played, Won, Drawn, Lost, Goals For/Against, Goal Difference, Points
  - Form indicators (last 5 matches)
  - Click on any team to see detailed statistics
- **Fixtures & Results**: 
  - Filter by all matches, completed, or upcoming
  - Grouped by date
  - Shows match scores, venues, and winners
- **Statistics**:
  - Top Scorers leaderboard
  - Top Assists leaderboard
  - Medal system for top 3 players

### 2026 Edition
- Coming soon page with:
  - Announcement placeholder
  - Teaser information
  - Back link to 2025 edition

## Navigation

### Edition Switching
- Toggle switch in navbar to switch between 2025 and 2026
- Clicking the toggle navigates to the respective edition page
- 2026 shows "Soon" indicator when viewing 2025

### Tournament Navigation
- Back button on tournament pages returns to main edition page
- Category selector switches between Open Age and U17
- Tab navigation for Standings, Fixtures, and Statistics

## File Structure

```
muqawamah/
├── redirect.md          → /muqawamah/ (redirects to 2025)
├── index.md             → /muqawamah/2025/ (main 2025 page)
├── open-age.md          → /muqawamah/2025/open-age/
├── u17.md               → /muqawamah/2025/u17/
└── 2026.md              → /muqawamah/2026/ (coming soon)
```

## React Components

### Main App (`/muqawamah/2025/`)
- `src/main.jsx` - Entry point
- `src/App.jsx` - Root component with edition switching
- `src/components/shared/Navbar.jsx` - Navigation with edition toggle
- `src/components/editions/2025/Edition2025.jsx` - 2025 content wrapper
- `src/components/editions/2026/Edition2026.jsx` - 2026 content wrapper

### Tournament App (`/muqawamah/2025/open-age/`, `/muqawamah/2025/u17/`)
- `src/tournament-main.jsx` - Entry point
- `src/components/editions/2025/Tournament.jsx` - Main tournament page
- `src/components/editions/2025/tournament/StandingsTable.jsx` - Standings component
- `src/components/editions/2025/tournament/Fixtures.jsx` - Fixtures component
- `src/components/editions/2025/tournament/Statistics.jsx` - Statistics component

## Deployment

To rebuild and deploy:

```bash
cd muqawamah-react
npm run build:jekyll
cd ..
make build
make serve  # Test locally
```

## Future Editions

To add a new edition (e.g., 2027):

1. Create `/muqawamah/2027.md` with the appropriate content
2. Create tournament pages: `/muqawamah/2027/open-age.md`, etc.
3. Add edition components: `src/components/editions/2027/`
4. Update `src/App.jsx` to include the new edition
5. Update the edition toggle in Navbar to include 2027
6. Rebuild and deploy

## Notes

- All React apps share the same CSS (`src/styles/App.css`)
- Assets are stored in `/assets/muqawamah-react/`
- The main app and tournament app are built separately but use shared components
- Supabase integration provides real-time updates for tournament data
- Mobile-responsive design with collapsible navigation
- SPL-inspired modern design with glass-morphism and gradients

