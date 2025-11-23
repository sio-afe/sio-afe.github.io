## 🎯 Single-Field Formation Display Guide

### **Visual Layout**

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCH HEADER                             │
│  ┌──────────┐                           ┌──────────┐        │
│  │ Arsenal  │         2  -  1           │ Chelsea  │        │
│  │  Logo    │      (1-3-2-1) (1-4-2-1)  │  Logo    │        │
│  └──────────┘                           └──────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  FOOTBALL FIELD (VERTICAL)                  │
│                                                             │
│  ╔═══════════════════════════════════════════════════╗     │
│  ║                                                   ║     │
│  ║  CHELSEA (AWAY - TOP HALF) - RED MARKERS          ║     │
│  ║                                                   ║     │
│  ║              ⭕ Sánchez (GK)                      ║     │
│  ║                                                   ║     │
│  ║  ⭕ James  ⭕ Silva  ⭕ Colwill  ⭕ Chilwell       ║     │
│  ║                                                   ║     │
│  ║        ⭕ Fernández    ⭕ Caicedo                 ║     │
│  ║                                                   ║     │
│  ║              ⭕ Palmer (⚽ 45')                    ║     │
│  ║                                                   ║     │
│  ║ ─────────────── HALFWAY LINE ─────────────────── ║     │
│  ║                                                   ║     │
│  ║              ⭕ Saka (⚽ 23')                      ║     │
│  ║                                                   ║     │
│  ║        ⭕ Rice    ⭕ Ødegaard (🅰️)                ║     │
│  ║                                                   ║     │
│  ║  ⭕ White  ⭕ Saliba  ⭕ Gabriel (⚽ 78')          ║     │
│  ║                                                   ║     │
│  ║              ⭕ Raya (GK)                         ║     │
│  ║                                                   ║     │
│  ║  ARSENAL (HOME - BOTTOM HALF) - BLUE MARKERS      ║     │
│  ╚═══════════════════════════════════════════════════╝     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      SUBSTITUTES                            │
│  ┌─────────────────────┐   ┌─────────────────────┐         │
│  │ Arsenal Subs        │   │ Chelsea Subs        │         │
│  │ • Gabriel Jesus     │   │ • Nicolas Jackson   │         │
│  │ • Thomas Partey     │   │ • Conor Gallagher   │         │
│  │ • Aaron Ramsdale    │   │ • Đorđe Petrović    │         │
│  └─────────────────────┘   └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      GOALS TIMELINE                         │
│  23' ⚽ Bukayo Saka (Arsenal) - Assist: Martin Ødegaard     │
│  45' ⚽ Cole Palmer (Chelsea) - Assist: Enzo Fernández      │
│  78' ⚽ Gabriel (Arsenal) - Assist: Declan Rice             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 How It Works

### **1. Teams in Standings Table**

```sql
SELECT * FROM teams 
WHERE category = 'open-age' 
ORDER BY points DESC;
```

**Result:**
```
┌─────────────┬────────┬─────┬────────┬───────────┐
│ name        │ played │ won │ points │ formation │
├─────────────┼────────┼─────┼────────┼───────────┤
│ Arsenal FC  │   2    │  2  │   6    │  1-3-2-1  │
│ Chelsea FC  │   2    │  1  │   4    │  1-4-2-1  │
└─────────────┴────────┴─────┴────────┴───────────┘
```

### **2. Create Match Between Teams**

```sql
INSERT INTO matches (
  home_team_id, 
  away_team_id, 
  category, 
  match_type,
  match_date,
  venue
) VALUES (
  'arsenal-uuid',  -- From teams table
  'chelsea-uuid',  -- From teams table
  'open-age',
  'group',
  '2026-03-15 15:00',
  'Emirates Stadium'
);
```

### **3. Fetch Match Details**

```javascript
const { data } = await supabaseClient
  .rpc('get_match_details', { 
    match_uuid: 'match-uuid' 
  });

// Returns:
{
  match: { date, venue, home_score, away_score },
  home_team: {
    name: "Arsenal FC",
    formation: "1-3-2-1",
    crest_url: "logo.jpg",
    players: [
      { name: "Raya", position: "GK", x: 50, y: 95, ... },
      { name: "White", position: "CB", x: 70, y: 75, ... },
      // ... 5 more starters
    ]
  },
  away_team: {
    name: "Chelsea FC",
    formation: "1-4-2-1",
    players: [ ... ]
  },
  goals: [ ... ]
}
```

### **4. Display Component**

```jsx
import MatchFormationDisplay from './MatchFormationDisplay';

<MatchFormationDisplay matchData={data} />
```

---

## 🎨 Key Features

### **Single Field Layout**
- ✅ ONE football field (vertical orientation)
- ✅ Home team at bottom (blue markers)
- ✅ Away team at top (red markers)
- ✅ Teams face each other across halfway line
- ✅ Player positions mirrored for away team

### **Player Display**
- ✅ Circular markers with photos or position labels
- ✅ Player name below marker
- ✅ Position label (GK, CB, etc.)
- ✅ Hover effect to highlight
- ✅ Goal scorers marked with ⚽

### **Match Information**
- ✅ Team crests and names
- ✅ Formation labels (1-3-2-1 vs 1-4-2-1)
- ✅ Match score
- ✅ Substitutes list
- ✅ Goals timeline with assists

---

## 🔄 Position Mapping

### **Home Team (Bottom Half)**
```javascript
// Use positions as-is from database
style={{
  left: `${player.position_x}%`,  // 0-100
  top: `${player.position_y}%`     // 50-100 (bottom half)
}}
```

### **Away Team (Top Half)**
```javascript
// Mirror and flip positions
style={{
  left: `${100 - player.position_x}%`,  // Mirror horizontally
  top: `${100 - player.position_y}%`    // Flip to top half (0-50)
}}
```

**Example:**
- Home GK at (50, 95) → Stays at (50, 95) - bottom center
- Away GK at (50, 95) → Becomes (50, 5) - top center (mirrored)

---

## 📝 Test Data Setup

### **Run in Order:**

1. **Migration Script**  
```sql
-- File: docs/muqawamah-migration.sql
```

2. **Tournament Schema**  
```sql
-- File: docs/database-schema-safe.sql
```

3. **Enhanced Confirmation**  
```sql
-- File: docs/confirm-registration-enhanced.sql
```

4. **Seed Sample Data**  
```sql
-- File: docs/COMPLETE_TEST_SETUP.sql
```

### **What Test Data Creates:**

✅ **2 Teams in Standings:**
- Arsenal FC (1-3-2-1) - 6 points
- Chelsea FC (1-4-2-1) - 4 points

✅ **7 Players Each:**
- 1 GK, 3-4 defenders, 2 midfielders, 1 forward
- With positions and coordinates

✅ **3 Substitutes Each:**
- Listed separately

✅ **1 Match:**
- Arsenal 2-1 Chelsea
- Completed status
- 3 goals with scorers and assists

---

## 🎯 Frontend Integration

### **Add to Fixtures Component**

```jsx
// In Fixtures.jsx
import MatchFormationDisplay from '../shared/MatchFormationDisplay';

const [selectedMatch, setSelectedMatch] = useState(null);
const [matchDetails, setMatchDetails] = useState(null);

const handleMatchClick = async (matchId) => {
  const { data } = await supabaseClient
    .rpc('get_match_details', { match_uuid: matchId });
  
  setMatchDetails(data);
  setSelectedMatch(matchId);
};

return (
  <>
    {/* Match cards */}
    {fixtures.map(match => (
      <div 
        key={match.id} 
        onClick={() => handleMatchClick(match.id)}
        className="match-card"
      >
        {/* Match info */}
      </div>
    ))}

    {/* Modal with formation */}
    {selectedMatch && (
      <Modal onClose={() => setSelectedMatch(null)}>
        <MatchFormationDisplay matchData={matchDetails} />
      </Modal>
    )}
  </>
);
```

---

## ✅ Summary

**Teams ARE in Standings:**
- `teams` table = standings table
- Sorted by points, goal difference

**Formation Display:**
- ✅ ONE field (not two)
- ✅ Vertical orientation
- ✅ Home team bottom (blue)
- ✅ Away team top (red)
- ✅ Teams face each other
- ✅ Player photos + names
- ✅ Substitutes below
- ✅ Goals timeline

**Test Data:**
- ✅ 2 teams in standings
- ✅ 1 match between them
- ✅ Full lineups with positions
- ✅ Goals with scorers

**Run COMPLETE_TEST_SETUP.sql to see it in action!** 🚀

