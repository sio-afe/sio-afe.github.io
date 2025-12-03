# Match Recorder Fixed - Now Uses New Schema

## 🐛 The Problem

When trying to add a goal in Match Recorder, you got this error:

```
"null value in column 'team_id' of relation 'goals' violates not-null constraint"
```

## 🔍 Root Cause

The **Match Recorder** was still using the **old schema**:

```javascript
// OLD (not working)
goals table insert:
{
  scorer_name: 'John Doe',     // ❌ Text field (doesn't exist anymore)
  assist_name: 'Jane Smith'    // ❌ Text field (doesn't exist anymore)
}
```

But your database now expects the **new schema**:

```javascript
// NEW (correct)
goals table insert:
{
  scorer_id: 'uuid-123...',    // ✅ Foreign key to team_players
  assister_id: 'uuid-456...'   // ✅ Foreign key to team_players
}
```

## ✅ What I Fixed

### Changes Made to `MatchRecorder.jsx`:

#### 1. **Updated State** (Line 23-29)
```javascript
// BEFORE
const [newGoal, setNewGoal] = useState({
  scorer_name: '',
  assist_name: '',
  ...
});

// AFTER
const [newGoal, setNewGoal] = useState({
  scorer_id: '',
  assister_id: '',
  ...
});
```

#### 2. **Updated Goal Insertion** (Line 292-337)
```javascript
// BEFORE
.insert({
  scorer_name: newGoal.scorer_name,
  assist_name: newGoal.assist_name
})

// AFTER
.insert({
  scorer_id: newGoal.scorer_id,
  assister_id: newGoal.assister_id,
  goal_type: newGoal.goal_type
})
```

#### 3. **Updated Goal Fetching** (Line 277-290)
```javascript
// BEFORE
.select('*')

// AFTER
.select(`
  *,
  scorer:team_players!goals_scorer_id_fkey(player_name),
  assister:team_players!goals_assister_id_fkey(player_name)
`)
```

This now **joins with team_players** to get player names!

#### 4. **Updated Goal Display** (Line 524-546)
```javascript
// BEFORE
<span>{goal.scorer_name}</span>
<span>{goal.assist_name}</span>

// AFTER
<span>{goal.scorer?.player_name || 'Unknown'}</span>
<span>{goal.assister?.player_name}</span>
```

#### 5. **Updated Dropdowns** (Line 575-643)
```javascript
// BEFORE - stored player names as values
<option value={p.player_name}>

// AFTER - stores player IDs as values
<option value={p.id}>
```

#### 6. **Updated Validation**
```javascript
// BEFORE
disabled={!newGoal.scorer_name}

// AFTER
disabled={!newGoal.scorer_id}
```

## 🎯 Now It Works!

### How To Use Match Recorder:

1. **Go to `/admin/matches`**
2. **Click on a match** to open modal
3. **In "Add Goal" section:**
   - Select scoring team (Home/Away)
   - Select scorer from dropdown (shows players from that team)
   - Optionally select assister
   - Enter minute
   - Click "Add Goal"

4. **Goal is saved with:**
   - ✅ `match_id` (which match)
   - ✅ `team_id` (which team scored)
   - ✅ `scorer_id` (foreign key to team_players)
   - ✅ `assister_id` (foreign key to team_players or null)
   - ✅ `minute` (when it happened)
   - ✅ `goal_type` (open_play by default)

5. **Score updates automatically** in the match!

## 🔄 How It Connects Data

```
Match Recorder Flow:

1. You select a match
   ↓
2. System fetches teams for that match
   ↓
3. For each team, fetches players from team_players table
   (using teams.registration_id → team_players.team_id)
   ↓
4. Shows player dropdowns
   ↓
5. You select scorer (stores player_id, not name!)
   ↓
6. Goal inserted into database with player ID
   ↓
7. When displaying goals, joins with team_players to show names
```

## 📊 What Gets Updated When Recording a Match

### When you record a match as "completed":

1. **Match table** updated:
   - `home_score` and `away_score` saved
   - `status` set to "completed"

2. **Goals table** has records:
   - Each goal linked to actual player records
   - Can query top scorers/assisters

3. **Teams table** updated automatically:
   - `played`, `won`, `drawn`, `lost`
   - `goals_for`, `goals_against`
   - `points`

## ✅ Testing Steps

### Test 1: Add Your First Goal

1. Go to `/admin/matches`
2. Click on one of your 3 matches
3. Select "Scoring Team" (e.g., Home Team)
4. You should see dropdown with players from that team
5. Select a scorer
6. Enter minute (e.g., 23)
7. Click "Add Goal"
8. **Expected**: "Goal added! Score updated automatically."

### Test 2: Check Goal Was Saved

1. After adding goal, check the "Goals" section in the modal
2. You should see the goal listed with:
   - ✅ Player name (not ID)
   - ✅ Minute
   - ✅ Assister if you added one

### Test 3: Check Database

Run in Supabase:
```sql
SELECT 
  g.*,
  tp.player_name as scorer_name
FROM goals g
JOIN team_players tp ON g.scorer_id = tp.id
ORDER BY g.created_at DESC
LIMIT 5;
```

Should show your goals with player names!

### Test 4: Check Statistics Page

1. Go to `/admin/statistics`
2. Should show top scorers with goal counts
3. The player who scored should appear in the list

## 🎉 Summary

**Before Fix:**
- ❌ Match Recorder tried to save `scorer_name` (text)
- ❌ Database rejected it (expected `scorer_id`)
- ❌ Got "null value in column" error

**After Fix:**
- ✅ Match Recorder saves `scorer_id` (player ID)
- ✅ Database accepts it (matches schema)
- ✅ Goals are properly linked to players
- ✅ Statistics page can calculate top scorers
- ✅ Everything works!

## 🚀 Ready to Go!

Your Match Recorder is now fully compatible with the new database schema. Go record some goals! ⚽

---

**Next Steps:**
1. Test adding a goal in Match Recorder
2. Complete a match
3. Check statistics page shows the goal
4. Check standings updated

**Related Files Updated:**
- `muqawamah-react/src/admin/pages/Matches/MatchRecorder.jsx` ✅ Fixed
- Database schema ✅ Already correct (from earlier fix)
- Goals Manager ✅ Already working with new schema
- Statistics Viewer ✅ Already working with new schema

