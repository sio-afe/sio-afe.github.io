# 🛡️ Muqawama Admin Panel Setup Guide

Complete guide to setting up and using the Muqawama Tournament Admin Panel.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Features](#features)
4. [Accessing the Admin Panel](#accessing-the-admin-panel)
5. [Admin Workflow](#admin-workflow)
6. [Database Management](#database-management)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Muqawama Admin Panel is a comprehensive dashboard for managing all aspects of the tournament, including:

- Team registrations
- Player management
- Match fixtures and results
- Goals and assists tracking
- Statistics and standings
- System settings

### Architecture

- **Frontend**: React with modular components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Authentication**: Email-based super admin access
- **Routing**: Client-side with Jekyll integration

---

## Authentication

### Super Admin Access

The admin panel uses **email-based authentication** with a predefined list of super admin emails.

#### Default Admin Email

```
admin@sio-abulfazal.org
```

#### Adding More Admins

Edit `/muqawamah-react/src/admin/config/adminConfig.js`:

```javascript
export const SUPER_ADMIN_EMAILS = [
  'admin@sio-abulfazal.org',
  'another-admin@example.com',
  'moderator@example.com'
];
```

After editing, rebuild the project:

```bash
cd muqawamah-react
npm run build:jekyll
```

### Creating Admin Account

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Users**
3. Click **Invite User** or **Add User**
4. Enter the admin email (must match `SUPER_ADMIN_EMAILS`)
5. Set a secure password
6. Confirm the user account

---

## Features

### 1. Dashboard (`/admin/`)

**Overview of tournament statistics:**
- Total registrations
- Confirmed teams
- Total players
- Pending payments
- Upcoming matches
- Total goals

**Quick Actions:**
- View Registrations
- Create Fixture
- Record Match Result
- Manage Teams

### 2. Registrations Management (`/admin/registrations`)

**Features:**
- View all team registrations
- Filter by status (submitted, pending payment, confirmed, cancelled)
- Search by team name, captain name, or email
- View detailed registration information
- Change registration status
- Delete registrations

**Actions:**
- Click **View** to see full registration details
- Click **Delete** to remove a registration (also deletes associated players)
- Change status from the detail modal

### 3. Players Management (`/admin/players`)

**Features:**
- View all players from all teams
- Filter by position (GK, CB, LB, etc.)
- Search by player name or team name
- Edit player details
- Delete players

**Editable Fields:**
- Player Name
- Position
- Age

### 4. Teams Management (`/admin/teams`)

**Features:**
- View all confirmed tournament teams
- Filter by category (Open Age, U17)
- Search by team name or captain
- View team statistics (played, won, drawn, lost, goals, points)
- Delete teams from tournament

**Displayed Data:**
- Team name and crest
- Captain name
- Formation
- Match statistics
- Points and goal difference

### 5. Fixtures Management (`/admin/fixtures`)

**Features:**
- View all match fixtures
- Create new fixtures
- Delete fixtures
- Navigate to match recorder

**Creating a Fixture:**
1. Click **Create Fixture**
2. Select category (Open Age / U17)
3. Choose home team
4. Choose away team
5. Set match date and time
6. Enter venue
7. Specify matchweek number
8. Click **Create Fixture**

### 6. Match Result Recorder (`/admin/matches`)

**Features:**
- View all matches (past and upcoming)
- Record match results
- Update match status
- Automatic team stats update

**Recording a Result:**
1. Click **Edit** on a match
2. Enter home team score
3. Enter away team score
4. Set match status (Completed, Live, Postponed, etc.)
5. Click **Save Result**

**Automatic Updates:**
- Team played count
- Win/Draw/Loss records
- Goals for/against
- Points (3 for win, 1 for draw)

### 7. Goals & Stats Management (`/admin/goals`)

**Features:**
- View all goals
- Add new goals
- Track scorers and assisters
- Record goal minute and type

**Adding a Goal:**
1. Click **Add Goal**
2. Select match
3. Select goal scorer
4. Optionally select assister
5. Enter goal minute
6. Choose goal type (Open Play, Penalty, Free Kick, Header, Own Goal)
7. Click **Add Goal**

### 8. Statistics Viewer (`/admin/statistics`)

**Features:**
- Match overview statistics
- Top scorers leaderboard
- Top assisters leaderboard
- Complete team standings table
- Filter by category

**Displayed Stats:**
- Total matches and completed matches
- Total goals and average goals per match
- Top 10 scorers
- Top 10 assisters
- Full standings table with all team stats

### 9. Settings Panel (`/admin/settings`)

**Tabs:**

#### General Settings
- Registration status toggle
- Tournament year
- Registration fees

#### Data Management
- Export data to JSON (registrations, teams, players, matches, goals)
- **Danger Zone**:
  - Reset all team standings
  - Clear all goals

#### Admin Info
- List of super admin emails
- Admin panel version
- Configuration file location

---

## Accessing the Admin Panel

### Local Development

1. Start the Jekyll server:
```bash
make serve
```

2. Navigate to:
```
http://localhost:4000/admin/
```

3. Sign in with admin credentials

### Production

```
https://yoursite.com/admin/
```

### Direct Page Access

All admin pages have their own URLs:

- `/admin/` - Dashboard
- `/admin/registrations` - Registrations
- `/admin/players` - Players
- `/admin/teams` - Teams
- `/admin/fixtures` - Fixtures
- `/admin/matches` - Match Recorder
- `/admin/goals` - Goals Manager
- `/admin/statistics` - Statistics
- `/admin/settings` - Settings

---

## Admin Workflow

### Complete Tournament Setup Workflow

#### 1. **Registration Phase**
- Teams register through `/muqawamah/2026/open-age/register`
- Admin monitors registrations in `/admin/registrations`
- Admin approves registrations by changing status to "Confirmed"

#### 2. **Team Setup**
- Confirmed teams appear in `/admin/teams`
- Verify team details and formations

#### 3. **Fixture Creation**
- Go to `/admin/fixtures`
- Create match fixtures for all matchweeks
- Assign dates, times, and venues

#### 4. **Match Day**
- Before match: Verify fixture details
- After match: Go to `/admin/matches`
- Record final score
- System automatically updates team standings

#### 5. **Goal Tracking**
- Go to `/admin/goals`
- Add individual goals with scorers and assisters
- This populates player statistics

#### 6. **Statistics Monitoring**
- View `/admin/statistics` for tournament overview
- Export data if needed from `/admin/settings`

---

## Database Management

### Data Export

Export data for backup or analysis:

1. Go to `/admin/settings`
2. Click **Data Management** tab
3. Click export buttons for:
   - Registrations
   - Teams
   - Players
   - Matches
   - Goals

### Data Reset

**⚠️ Use with extreme caution!**

From `/admin/settings` → **Danger Zone**:

- **Reset All Standings**: Sets all team stats to 0
- **Clear All Goals**: Deletes all goal records

---

## Troubleshooting

### Cannot Access Admin Panel

**Problem**: Redirected to home page or shows "Unauthorized"

**Solutions**:
1. Verify your email is in `SUPER_ADMIN_EMAILS` list
2. Ensure you're signed in
3. Clear browser cache and cookies
4. Check browser console for errors

### Stats Not Updating

**Problem**: Team standings not updating after recording match result

**Solutions**:
1. Refresh the page
2. Verify match status is set to "Completed"
3. Check browser console for errors
4. Verify Supabase connection

### Cannot Create Fixture

**Problem**: Error when creating new fixture

**Solutions**:
1. Ensure both teams are selected
2. Verify teams are from the same category
3. Check that home and away teams are different
4. Verify date is in correct format

### Build Errors

**Problem**: Admin panel not building correctly

**Solutions**:
```bash
cd muqawamah-react
npm install
npm run build:jekyll
```

---

## Technical Details

### File Structure

```
muqawamah-react/src/admin/
├── config/
│   └── adminConfig.js          # Configuration
├── utils/
│   └── authCheck.js            # Authentication utilities
├── components/
│   ├── AdminLayout.jsx         # Layout wrapper
│   ├── AdminSidebar.jsx        # Navigation
│   ├── AdminHeader.jsx         # Header
│   └── ProtectedRoute.jsx      # Route protection
├── pages/
│   ├── Dashboard.jsx
│   ├── Registrations/
│   ├── Players/
│   ├── Teams/
│   ├── Fixtures/
│   ├── Matches/
│   ├── Goals/
│   ├── Statistics/
│   └── Settings/
└── styles/
    ├── admin.css
    ├── admin-auth.css
    ├── admin-tables.css
    ├── admin-modals.css
    └── admin-settings.css
```

### Building for Production

```bash
cd muqawamah-react
npm run build:jekyll
```

This will:
1. Build React admin app
2. Copy assets to Jekyll directory
3. Create Jekyll markdown pages for all routes

---

## Security Considerations

1. **Always use strong passwords** for admin accounts
2. **Limit super admin access** to trusted individuals
3. **Regularly backup data** using export features
4. **Monitor registration activity** for suspicious entries
5. **Use HTTPS** in production
6. **Enable Supabase RLS policies** for all tables

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for errors
3. Check Supabase dashboard for database issues
4. Review `/muqawamah-react/src/admin/README.md` for component details

---

**Admin Panel Version**: 1.0.0  
**Last Updated**: November 2025

