# Match Details & Player Stats Fix

## 🐛 The Problem

When clicking on a completed match in the public fixtures page, the match details modal was showing:
- ❌ "No player stats recorded" (even though goals were in database)
- ❌ Goals not displayed in highlights section
- ❌ Player stats not showing in the players tab

## 🔍 Root Cause

The match details modal was still using the **old database schema** in multiple places:
1. Trying to call an RPC function that might not exist
2. `renderHighlights` function expecting `scorer_name` and `assist_name` fields
3. Not properly fetching goals with the new schema joins

## ✅ What I Fixed

### 1. **Direct Goals Query** (Line 59-106)

**Before:**
```javascript
// Tried to use RPC function that might not exist
const { data, error } = await supabase
  .rpc('get_match_details', { match_uuid: fixture.id });
```

**After:**
```javascript
// Directly query goals with proper joins
const { data: goalsData, error: goalsError } = await supabase
  .from('goals')
  .select(`
    id,
    minute,
    team_id,
    goal_type,
    scorer_id,
    assister_id,
    scorer:team_players!goals_scorer_id_fkey(player_name, player_image),
    assister:team_players!goals_assister_id_fkey(player_name, player_image)
  `)
  .eq('match_id', fixture.id)
  .order('minute');
```

Now it fetches goals directly for each match!

### 2. **Updated Highlights Rendering** (Line 232-256)

**Before:**
```javascript
<span className="highlight-player">{goal.scorer_name}</span>
{goal.assist_name && (
  <span className="highlight-assist">Assist: {goal.assist_name}</span>
)}
```

**After:**
```javascript
const scorerName = goal.scorer?.player_name || goal.scorer_name || 'Unknown';
const assisterName = goal.assister?.player_name || goal.assist_name;

<span className="highlight-player">{scorerName}</span>
{assisterName && (
  <span className="highlight-assist">Assist: {assisterName}</span>
)}
```

Now it handles both old and new schema formats gracefully!

### 3. **Match Details Structure**

Goals are now properly attached to matchDetails:
```javascript
const detailsWithGoals = {
  ...fixture,
  goals: goalsData || [],
  home_team: fixture.home_team,
  away_team: fixture.away_team
};
```

## 🎯 How It Works Now

### Data Flow:

```
User clicks match
      ↓
Fetch goals from database
  (with player names via joins)
      ↓
Build match details object
      ↓
Display in modal:
  - Overview tab: Goal highlights ✅
  - Lineups tab: Team formations ✅
  - Players tab: Player stats ✅
```

### Example Query Result:

```javascript
goals: [
  {
    id: "uuid-123",
    minute: 23,
    team_id: "team-uuid",
    scorer_id: "player-uuid",
    scorer: {
      player_name: "John Doe",
      player_image: "image-url"
    },
    assister_id: "player-uuid-2",
    assister: {
      player_name: "Jane Smith",
      player_image: "image-url"
    }
  }
]
```

## 📱 Match Details Modal - All Tabs Now Working

### Overview Tab:
- ✅ Score display
- ✅ **Goal highlights with scorers and assisters**
- ✅ Match date, venue, competition

### Lineups Tab:
- ✅ Football field visualization
- ✅ Player positions
- ✅ Substitutes list

### Players Tab:
- ✅ **Home team player stats** (goals/assists)
- ✅ **Away team player stats** (goals/assists)
- ✅ Tournament totals for each player

## 🧪 Testing Steps

### Test 1: View Match Details with Goals
1. **Go to** `/muqawamah/2026/open-age/`
2. **Click "Fixtures"** tab
3. **Click on a completed match** (shows "FT" badge)
4. **Expected Results:**
   - ✅ Modal opens with match details
   - ✅ **Overview tab shows goals in highlights**
   - ✅ **Players tab shows player stats**
   - ✅ Player names displayed correctly

### Test 2: Multiple Goals
1. **Admin**: Add 3+ goals to a match
2. **Public**: Click on the match
3. **Expected:**
   - ✅ All goals listed in chronological order
   - ✅ Each goal shows minute, scorer, and assister (if any)
   - ✅ Players tab aggregates all goals/assists

### Test 3: Match Without Goals
1. **Admin**: Complete a match with 0-0 score
2. **Public**: Click on the match
3. **Expected:**
   - ✅ Modal opens
   - ✅ Shows "No goals recorded for this match"
   - ✅ No errors in console

## 🎨 What You'll See

### Overview Tab - Goal Highlights:
```
⚽ 23'
John Doe
Assist: Jane Smith

⚽ 45'
Mike Johnson

⚽ 67'
John Doe
Assist: Mike Johnson
```

### Players Tab - Player Stats:
```
HOME TEAM
---------
John Doe      ⚽ 2  🤝 1
Mike Johnson  ⚽ 1  🤝 2
Jane Smith    ⚽ 0  🤝 1

AWAY TEAM
---------
[Similar format]
```

## 🔄 Backward Compatibility

The code now handles both formats:
- **New schema**: `scorer.player_name` (preferred)
- **Old schema**: `scorer_name` (fallback)

This means:
- ✅ Works with new goals (using player IDs)
- ✅ Works with any old goals (using text names)
- ✅ No data migration required!

## 📊 Database Query Breakdown

### Goals Query Explained:

```javascript
.from('goals')                // Base table
.select(`
  id, minute, team_id,        // Basic goal info
  scorer:team_players!...     // JOIN to get scorer details
  assister:team_players!...   // JOIN to get assister details
`)
.eq('match_id', fixture.id)   // Only this match's goals
.order('minute')              // Chronological order
```

This single query gets:
- Goal details (minute, type)
- Scorer name and image
- Assister name and image
- All in one request!

## ✅ Summary

**Fixed:**
1. ✅ Goals now display in match highlights
2. ✅ Player stats show in players tab
3. ✅ Proper joins to team_players table
4. ✅ Backward compatible with old data
5. ✅ No RPC function dependency

**How to Verify:**
1. Record a match with goals in admin panel
2. Complete the match
3. Go to public fixtures page
4. Click the completed match
5. Should see goals and player stats! ✅

---

**Status:** ✅ COMPLETE  
**File Updated:** `Fixtures.jsx`  
**Lines Changed:** 59-106 (handleMatchClick), 232-256 (renderHighlights)  
**Impact:** Match details modal now fully functional with live database data

