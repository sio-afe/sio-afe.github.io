# Match Lineups & Formation Display Guide

## 🎯 Overview

When users click on a match, they'll see:
- ✅ Both teams' formations side-by-side
- ✅ Player lineups with photos
- ✅ Starting XI positioned on football field
- ✅ Substitutes list
- ✅ Match score and goals

---

## 📊 Data Flow

### **Registration → Tournament**

```
Registration Phase:
team_registrations
  ├── formation: "1-3-2-1"
  └── team_players
       ├── player_name
       ├── position: "GK", "CB", etc.
       ├── is_substitute: true/false
       ├── player_image: "photo.jpg"
       ├── position_x: 50 (%)
       └── position_y: 30 (%)

      ↓ Admin confirms ↓

Tournament Phase:
teams
  ├── formation: "1-3-2-1"
  └── players (copied from team_players)
       ├── name
       ├── position
       ├── is_substitute
       ├── player_image
       ├── position_x
       ├── position_y
       └── registration_player_id (link back)
```

---

## 🗄️ Enhanced Schema

### **Teams Table**
```sql
teams
  ├── id
  ├── name
  ├── crest_url
  ├── formation         ← NEW! e.g., "1-3-2-1"
  ├── captain
  ├── registration_id   ← NEW! Links to team_registrations
  ├── played, won, points, etc.
  └── category
```

### **Players Table (Enhanced)**
```sql
players
  ├── id
  ├── team_id
  ├── name
  ├── number
  ├── position              ← "GK", "CB", "LB", etc.
  ├── is_substitute         ← NEW! true/false
  ├── player_image          ← NEW! Photo URL
  ├── position_x            ← NEW! X coordinate (0-100)
  ├── position_y            ← NEW! Y coordinate (0-100)
  └── registration_player_id ← NEW! Links to team_players
```

---

## 🔄 Setup Steps

### **1. Run Enhanced Schema**
```sql
-- File: docs/database-schema-safe.sql (already updated)
```

This creates `teams` and `players` tables with formation support.

### **2. Run Enhanced Confirmation Function**
```sql
-- File: docs/confirm-registration-enhanced.sql
```

This copies:
- ✅ Team formation
- ✅ Player names
- ✅ Player positions
- ✅ Player photos
- ✅ Formation coordinates (x, y)
- ✅ Substitute flags

### **3. Run Match Lineup Functions**
```sql
-- File: docs/match-lineup-functions.sql
```

This adds helper functions:
- `get_match_details(match_uuid)` - Full match with both lineups
- `get_team_lineup(team_uuid)` - Single team lineup

---

## 🎮 Frontend Usage

### **Fetch Match Details**

```javascript
// In MatchDetails component
const fetchMatchDetails = async (matchId) => {
  const { data, error } = await supabaseClient
    .rpc('get_match_details', { match_uuid: matchId });
  
  if (error) throw error;
  
  return data;
  // Returns:
  // {
  //   match: { id, date, venue, home_score, away_score, ... },
  //   home_team: { 
  //     name, crest_url, formation, 
  //     players: [{ name, position, image, x, y, is_substitute }, ...]
  //   },
  //   away_team: { ... },
  //   goals: [{ scorer_name, minute, team_name }, ...]
  // }
};
```

### **Display Formation**

```jsx
function MatchLineup({ matchData }) {
  return (
    <div className="match-lineup">
      {/* Home Team */}
      <div className="team-formation">
        <h3>{matchData.home_team.name}</h3>
        <p>Formation: {matchData.home_team.formation}</p>
        
        <div className="football-field">
          {matchData.home_team.players
            .filter(p => !p.is_substitute)
            .map(player => (
              <div 
                key={player.id}
                className="player-marker"
                style={{ 
                  left: `${player.position_x}%`, 
                  top: `${player.position_y}%` 
                }}
              >
                {player.player_image ? (
                  <img src={player.player_image} alt={player.name} />
                ) : (
                  <span>{player.position}</span>
                )}
                <span className="player-name">{player.name}</span>
              </div>
            ))
          }
        </div>
        
        <div className="substitutes">
          <h4>Substitutes</h4>
          {matchData.home_team.players
            .filter(p => p.is_substitute)
            .map(player => (
              <div key={player.id} className="sub-player">
                {player.player_image && (
                  <img src={player.player_image} alt={player.name} />
                )}
                <span>{player.name}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* VS Divider */}
      <div className="vs-divider">
        <span>{matchData.match.home_score} - {matchData.match.away_score}</span>
      </div>

      {/* Away Team (same structure) */}
      <div className="team-formation">
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 📋 Example Workflow

### **1. Team Registers**
```sql
-- User fills form with:
-- - Team name: "Arsenal FC"
-- - Formation: "1-3-2-1"
-- - 7 players with photos and positions
-- - 3 substitutes

INSERT INTO team_registrations (...);
INSERT INTO team_players (...); -- 10 players
```

### **2. Admin Confirms**
```sql
SELECT confirm_registration_to_tournament('reg-uuid');

-- This automatically:
-- ✓ Creates team in `teams` table with formation
-- ✓ Copies all 10 players to `players` table
-- ✓ Preserves photos, positions, coordinates
-- ✓ Links back to registration
```

### **3. Admin Creates Match**
```sql
INSERT INTO matches (
  home_team_id, 
  away_team_id, 
  category, 
  match_type,
  match_date,
  venue
) VALUES (
  'arsenal-uuid',
  'chelsea-uuid',
  'open-age',
  'group',
  '2026-03-15 14:00',
  'Main Field'
);
```

### **4. User Clicks Match**
```javascript
// Frontend fetches:
const matchData = await supabaseClient
  .rpc('get_match_details', { match_uuid: 'match-uuid' });

// Displays:
// - Arsenal FC (1-3-2-1) vs Chelsea FC (1-4-2-1)
// - Both formations on football fields
// - Player photos and names
// - Substitutes
// - Match score and goals
```

---

## 🎨 UI Components to Create

### **1. MatchDetails Modal**
```jsx
// File: MatchDetails.jsx
- Shows full match information
- Two football fields side-by-side
- Player lineups with photos
- Goals timeline
- Match statistics
```

### **2. FormationDisplay Component**
```jsx
// File: FormationDisplay.jsx
- Reuse existing FormationPreview
- Add read-only mode
- Show player photos instead of position labels
- Display team formation (e.g., "1-3-2-1")
```

### **3. PlayerCard Component**
```jsx
// File: PlayerCard.jsx
- Show player photo
- Display name and position
- Show jersey number (if available)
- Click to see player stats
```

---

## 🔍 Sample Queries

### **Get Match with Lineups**
```sql
SELECT * FROM get_match_details('match-uuid');
```

### **Get Team Lineup**
```sql
SELECT * FROM get_team_lineup('team-uuid');
```

### **Get All Matches with Teams**
```sql
SELECT 
  m.id,
  m.match_date,
  m.home_score,
  m.away_score,
  ht.name as home_team,
  ht.formation as home_formation,
  at.name as away_team,
  at.formation as away_formation
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
WHERE m.category = 'open-age'
ORDER BY m.match_date;
```

### **Get Starting XI for a Team**
```sql
SELECT 
  p.name,
  p.position,
  p.player_image,
  p.position_x,
  p.position_y
FROM players p
WHERE p.team_id = 'team-uuid'
  AND p.is_substitute = false
ORDER BY p.position;
```

---

## ✅ Summary

**Data Preserved from Registration:**
- ✅ Team formation (e.g., "1-3-2-1")
- ✅ Player names
- ✅ Player photos
- ✅ Player positions (GK, CB, etc.)
- ✅ Formation coordinates (x, y)
- ✅ Substitute flags

**Available for Match Display:**
- ✅ Both teams' formations
- ✅ Player lineups with photos
- ✅ Starting XI on football field
- ✅ Substitutes list
- ✅ Match score and goals

**Functions Available:**
- ✅ `get_match_details(match_uuid)` - Full match data
- ✅ `get_team_lineup(team_uuid)` - Team lineup
- ✅ `confirm_registration_to_tournament(reg_uuid)` - Copy all data

---

## 🚀 Next Steps

1. ✅ Run `database-schema-safe.sql` (updated with formation fields)
2. ✅ Run `confirm-registration-enhanced.sql` (copies all player data)
3. ✅ Run `match-lineup-functions.sql` (helper functions)
4. 🔜 Create `MatchDetails` component
5. 🔜 Add click handler to match cards
6. 🔜 Display formations side-by-side
7. 🔜 Show player photos on field

**All the data you need is preserved and ready to use!** 🎉

