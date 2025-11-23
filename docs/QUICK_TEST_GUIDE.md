# Quick Test Guide - Complete Workflow

## 🚀 Complete Setup (Run in Order)

### **1. Database Schema**
```sql
-- File: docs/muqawamah-migration.sql
-- Creates: team_registrations, team_players, tournament_config, slot tracking
```

### **2. Tournament Tables**
```sql
-- File: docs/database-schema-safe.sql
-- Creates: teams, matches, goals, players
```

### **3. Enhanced Functions**
```sql
-- File: docs/confirm-registration-enhanced.sql
-- Creates: confirm_registration_to_tournament() with player copying
```

### **4. Helper Functions**
```sql
-- File: docs/match-lineup-functions.sql
-- Creates: get_match_details(), get_team_lineup()
```

### **5. Views (Optional but Recommended)**
```sql
-- File: docs/simplified-team-connection.sql
-- Creates: standings view, team_complete_info view, auto-sync
```

### **6. Test Data**
```sql
-- File: docs/COMPLETE_TEST_SETUP.sql
-- Creates: 2 registrations → confirms to standings → creates match
```

---

## 📊 What Test Data Creates

### **Registrations → Standings Flow:**

```
STEP 1: Create Registrations
┌─────────────────────────────────────┐
│  team_registrations                 │
│  ├── Arsenal FC (submitted)         │
│  └── Chelsea FC (submitted)         │
└─────────────────────────────────────┘

STEP 2: Admin Confirms
┌─────────────────────────────────────┐
│  confirm_registration_to_tournament()│
│  ├── Creates teams in standings     │
│  ├── Copies all players             │
│  └── Links via tournament_team_id   │
└─────────────────────────────────────┘

STEP 3: Teams in Standings
┌─────────────────────────────────────┐
│  teams (standings table)            │
│  ├── Arsenal FC (Group A)           │
│  │   ├── Formation: 1-3-2-1         │
│  │   ├── 7 starters + 3 subs        │
│  │   └── Stats: 1W, 3pts            │
│  └── Chelsea FC (Group A)           │
│      ├── Formation: 1-4-2-1         │
│      ├── 7 starters + 3 subs        │
│      └── Stats: 1L, 0pts            │
└─────────────────────────────────────┘

STEP 4: Match Created
┌─────────────────────────────────────┐
│  matches                            │
│  Arsenal 2-1 Chelsea                │
│  ├── Date: 2026-03-15 15:00         │
│  ├── Venue: Emirates Stadium        │
│  └── Status: Completed              │
└─────────────────────────────────────┘

STEP 5: Goals Recorded
┌─────────────────────────────────────┐
│  goals                              │
│  ├── 23' Saka (Arsenal)             │
│  ├── 45' Palmer (Chelsea)           │
│  └── 78' Gabriel (Arsenal)          │
└─────────────────────────────────────┘
```

---

## 🎯 Testing Checklist

### **Backend (SQL)**

- [ ] Run all 6 SQL files in order
- [ ] Check registrations: `SELECT * FROM team_registrations;`
- [ ] Check standings: `SELECT * FROM teams ORDER BY points DESC;`
- [ ] Check players: `SELECT * FROM players;`
- [ ] Check match: `SELECT * FROM matches;`
- [ ] Check goals: `SELECT * FROM goals;`
- [ ] Test function: `SELECT get_match_details('99999999-9999-9999-9999-999999999999');`

### **Frontend**

- [ ] Visit `/muqawamah/2026/open-age/`
- [ ] See Arsenal (3 pts) and Chelsea (0 pts) in standings
- [ ] Click "Fixtures & Results" tab
- [ ] See Arsenal vs Chelsea match
- [ ] Click match card
- [ ] See formation display modal
- [ ] Verify both teams shown on one field
- [ ] Verify player names and positions
- [ ] Verify goals timeline

---

## 📋 Expected Results

### **Standings Table**

```
Position | Team       | P | W | D | L | GF | GA | GD | Pts | Formation
---------|------------|---|---|---|---|----|----|----|----|----------
1        | Arsenal FC | 1 | 1 | 0 | 0 | 2  | 1  | +1 | 3  | 1-3-2-1
2        | Chelsea FC | 1 | 0 | 0 | 1 | 1  | 2  | -1 | 0  | 1-4-2-1
```

### **Match Details**

```
Arsenal FC 2-1 Chelsea FC
Date: March 15, 2026 at 15:00
Venue: Emirates Stadium
Status: Completed

Goals:
23' ⚽ Bukayo Saka (Arsenal) - Assist: Martin Ødegaard
45' ⚽ Cole Palmer (Chelsea) - Assist: Enzo Fernández
78' ⚽ Gabriel Magalhães (Arsenal) - Assist: Declan Rice
```

### **Formation Display**

```
┌─────────────────────────────────────────┐
│  Arsenal FC (1-3-2-1) 2-1 Chelsea FC (1-4-2-1) │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         CHELSEA (TOP - RED)             │
│                                         │
│           GK: Sánchez                   │
│  RB: James  CB: Silva  CB: Colwill  LB: Chilwell │
│      CM: Fernández  CM: Caicedo        │
│           ST: Palmer ⚽                 │
│                                         │
│ ──────────── HALFWAY ──────────────    │
│                                         │
│           ST: Saka ⚽                   │
│      CM: Rice  CM: Ødegaard 🅰️        │
│  CB: White  CB: Saliba  CB: Gabriel ⚽ │
│           GK: Raya                      │
│                                         │
│        ARSENAL (BOTTOM - BLUE)          │
└─────────────────────────────────────────┘
```

---

## 🔍 Verification Queries

### **Check Registration → Tournament Link**

```sql
SELECT 
  tr.team_name,
  tr.status,
  t.name as tournament_name,
  t.points
FROM team_registrations tr
LEFT JOIN teams t ON tr.tournament_team_id = t.id
WHERE tr.team_name IN ('Arsenal FC', 'Chelsea FC');
```

### **Check Players Copied**

```sql
SELECT 
  'Registration' as source,
  team_id,
  COUNT(*) as player_count
FROM team_players
WHERE team_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
GROUP BY team_id

UNION ALL

SELECT 
  'Tournament' as source,
  team_id,
  COUNT(*) as player_count
FROM players
WHERE team_id IN (SELECT id FROM teams WHERE name IN ('Arsenal FC', 'Chelsea FC'))
GROUP BY team_id;
```

### **Check Match Stats Updated**

```sql
-- Before match: Both teams have 0 points
-- After match: Arsenal 3 pts, Chelsea 0 pts
-- Trigger automatically updated standings!

SELECT 
  name,
  played,
  won,
  lost,
  goals_for,
  goals_against,
  points
FROM teams
WHERE name IN ('Arsenal FC', 'Chelsea FC');
```

---

## 🎨 Frontend Components Needed

### **1. MatchDetails Modal**
```jsx
// File: muqawamah-react/src/components/shared/MatchDetails.jsx
// Already created: MatchFormationDisplay.jsx
```

### **2. Add Click Handler to Fixtures**
```jsx
// In Fixtures.jsx
const [selectedMatch, setSelectedMatch] = useState(null);

<div onClick={() => handleMatchClick(match.id)}>
  {/* Match card */}
</div>

{selectedMatch && (
  <Modal>
    <MatchFormationDisplay matchData={matchDetails} />
  </Modal>
)}
```

---

## 🧹 Cleanup (Start Over)

```sql
-- Delete test data in reverse order
DELETE FROM goals WHERE match_id = '99999999-9999-9999-9999-999999999999';
DELETE FROM matches WHERE id = '99999999-9999-9999-9999-999999999999';
DELETE FROM players WHERE team_id IN (SELECT id FROM teams WHERE name IN ('Arsenal FC', 'Chelsea FC'));
DELETE FROM teams WHERE name IN ('Arsenal FC', 'Chelsea FC');
DELETE FROM team_players WHERE team_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
DELETE FROM team_registrations WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
```

---

## ✅ Summary

**Complete Workflow:**
1. ✅ Teams register via form
2. ✅ Admin confirms → moves to standings
3. ✅ Players copied automatically
4. ✅ Admin creates match
5. ✅ Admin updates score
6. ✅ Standings auto-update
7. ✅ Users click match → see formations

**Test Data:**
- ✅ 2 registered teams
- ✅ 2 teams in standings
- ✅ 20 players (10 each)
- ✅ 1 completed match
- ✅ 3 goals with assists

**Ready to test the full system!** 🚀

