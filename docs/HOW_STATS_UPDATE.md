# How Team Statistics Update

## 📊 Overview

Your teams table has these statistics that need to be kept up-to-date:

```sql
teams table:
- played        -- Number of matches played
- won           -- Number of wins
- drawn         -- Number of draws
- lost          -- Number of losses
- goals_for     -- Goals scored (GF)
- goals_against -- Goals conceded (GA)
- points        -- Total points (3 per win, 1 per draw)
```

**Goal Difference (GD)** = `goals_for - goals_against` (calculated on the fly)

---

## 🔄 Current System: Match Recorder Updates

### When Stats Update:

Stats update **automatically** when you complete a match in the Match Recorder.

**Path**: `/admin/matches` → Select match → Record result → Mark as "Completed"

### What Happens:

```javascript
// When you save a match with status = "completed"
1. Match scores saved to database
2. updateTeamStats() function runs
3. Both team records updated with new stats
```

### Example: Team A (3) vs Team B (1)

**Before match:**
```
Team A: P:5, W:3, D:1, L:1, GF:12, GA:6, Pts:10
Team B: P:5, W:2, D:2, L:1, GF:8,  GA:5, Pts:8
```

**After recording the match:**
```
Team A: P:6, W:4, D:1, L:1, GF:15, GA:7, Pts:13  (+3 pts, +1 win, +3 GF, +1 GA)
Team B: P:6, W:2, D:2, L:2, GF:9,  GA:8, Pts:8   (+0 pts, +1 loss, +1 GF, +3 GA)
```

### The Calculation:

```javascript
// For a match: Home 3 - 1 Away

// HOME TEAM gets:
played: +1
goals_for: +3 (their score)
goals_against: +1 (opponent's score)
won: +1 (because 3 > 1)
points: +3 (3 points for a win)

// AWAY TEAM gets:
played: +1
goals_for: +1 (their score)
goals_against: +3 (opponent's score)  
lost: +1 (because 1 < 3)
points: +0 (0 points for a loss)
```

### Special Cases:

#### 1. Draw (2-2)
```javascript
// BOTH TEAMS get:
played: +1
goals_for: +2
goals_against: +2
drawn: +1
points: +1 (1 point each for draw)
```

#### 2. Re-recording a Match
If you update a match that was already "completed":
```javascript
1. Reverse the OLD stats (subtract old result)
2. Apply the NEW stats (add new result)
```

**Example:**
- Original result: Home 2-1 Away (Home got +3 points)
- New result: Home 2-2 Away (should be +1 point each)

**What happens:**
1. Reverse: Home -3 points, Away +0 points
2. Apply: Home +1 point, Away +1 point
3. Net change: Home -2 points, Away +1 point ✅

#### 3. Canceling a Match
If you change status from "completed" to "scheduled":
```javascript
// The match stats are REVERSED (subtracted)
- All stats from that match are removed from both teams
```

---

## 🛠️ Method 2: Stats Recalculator (Manual Fix)

If stats ever get out of sync, use the **Stats Recalculator** utility.

**Path**: `/admin/utilities` → Stats Recalculator

### What It Does:

```javascript
1. Reset ALL teams to zero:
   played: 0, won: 0, drawn: 0, lost: 0,
   goals_for: 0, goals_against: 0, points: 0

2. Loop through ALL completed matches

3. For each match, recalculate and add stats

4. Final result = fresh, accurate standings
```

### When To Use:

- ✅ Stats look wrong after bulk operations
- ✅ You manually edited the database
- ✅ After importing data
- ✅ After deleting goals/matches
- ✅ General debugging

### How To Use:

1. Go to `/admin/utilities`
2. Click "Recalculate Team Statistics"
3. Confirm the action
4. Wait for process to complete
5. Check standings page

**Time**: ~5 seconds for 100 matches

---

## 📋 Step-by-Step: Recording Your First Match

Let's record an actual match with stats update:

### Step 1: Create Match (If Not Done)
```
/admin/fixtures
- Home Team: Team Alpha
- Away Team: Team Beta
- Date: 2025-12-05
- Status: scheduled
```

### Step 2: Record Match Result
```
/admin/matches
- Select the match
- Set Home Score: 3
- Set Away Score: 1
- Click "Record Result"
```

### Step 3: What Updates Automatically

**Match record:**
```sql
UPDATE matches SET
  home_score = 3,
  away_score = 1,
  status = 'completed'
WHERE id = 'match-id';
```

**Team Alpha (Home):**
```sql
UPDATE teams SET
  played = played + 1,      -- Now: 1
  won = won + 1,            -- Now: 1
  goals_for = goals_for + 3,-- Now: 3
  goals_against = goals_against + 1, -- Now: 1
  points = points + 3       -- Now: 3
WHERE id = 'team-alpha-id';
```

**Team Beta (Away):**
```sql
UPDATE teams SET
  played = played + 1,      -- Now: 1
  lost = lost + 1,          -- Now: 1
  goals_for = goals_for + 1,-- Now: 1
  goals_against = goals_against + 3, -- Now: 3
  points = points + 0       -- Now: 0
WHERE id = 'team-beta-id';
```

### Step 4: Verify
```
/admin/statistics
- Check Team Alpha: 1P, 1W, 3GF, 1GA, +2GD, 3Pts
- Check Team Beta: 1P, 1L, 1GF, 3GA, -2GD, 0Pts
```

---

## 🔍 How Points Are Calculated

The standard football points system:

```
Win:  3 points
Draw: 1 point
Loss: 0 points
```

**Formula:**
```javascript
points = (wins × 3) + (draws × 1)
```

**Examples:**
```
Team with 5W, 3D, 2L:
points = (5 × 3) + (3 × 1) = 15 + 3 = 18 points

Team with 3W, 6D, 1L:
points = (3 × 3) + (6 × 1) = 9 + 6 = 15 points

Team with 0W, 2D, 8L:
points = (0 × 3) + (2 × 1) = 0 + 2 = 2 points
```

---

## 🏆 How Standings Are Sorted

Teams are ranked by (in order):

1. **Points** (highest first)
2. **Goal Difference** (GF - GA, highest first)
3. **Goals For** (highest first)
4. **Team Name** (alphabetically)

**Example Standings:**
```
Rank | Team    | P | W | D | L | GF | GA | GD  | Pts
-----|---------|---|---|---|---|----|----|-----|----
1    | Alpha   | 6 | 5 | 0 | 1 | 18 | 5  | +13 | 15
2    | Beta    | 6 | 4 | 2 | 0 | 15 | 6  | +9  | 14
3    | Charlie | 6 | 4 | 2 | 0 | 12 | 5  | +7  | 14  (Same pts as Beta but worse GD)
4    | Delta   | 6 | 3 | 1 | 2 | 11 | 8  | +3  | 10
```

This is handled by the `standings` view:
```sql
SELECT * FROM standings
WHERE category = 'open-age'
ORDER BY points DESC, (goals_for - goals_against) DESC, goals_for DESC;
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Stats Don't Match Reality

**Symptoms:**
- Team has 10 points but should have 12
- Goals for/against are wrong
- Played count is incorrect

**Solution:**
1. Go to `/admin/utilities`
2. Run "Recalculate Team Statistics"
3. This rebuilds everything from completed matches

### Issue 2: Match Updated But Stats Didn't Change

**Cause:** Match status might not be "completed"

**Solution:**
1. Go to match in Match Recorder
2. Check status dropdown
3. Make sure it's set to "completed"
4. Re-save the match

### Issue 3: Duplicate Stats After Manual Edit

**Cause:** Edited database directly AND used Match Recorder

**Solution:**
1. Run Stats Recalculator to reset everything
2. From now on, ONLY use Match Recorder OR database (not both)

### Issue 4: Negative Stats

**Cause:** Match was "un-completed" or reversed incorrectly

**Solution:**
1. Run Stats Recalculator
2. This resets to 0 and rebuilds (can't go negative)

---

## 🎯 Best Practices

### DO:
✅ Always use Match Recorder to complete matches  
✅ Set status to "completed" when recording final scores  
✅ Run Stats Recalculator after bulk operations  
✅ Check standings page after recording matches  

### DON'T:
❌ Edit team stats directly in database  
❌ Mark matches as completed without scores  
❌ Delete matches without recalculating stats  
❌ Mix manual database edits with Match Recorder  

---

## 🚀 Quick Reference

### To Record a Match:
```
1. /admin/matches
2. Select match
3. Enter scores
4. Set status: "completed"
5. Save
→ Stats update automatically ✅
```

### To Fix Wrong Stats:
```
1. /admin/utilities
2. "Recalculate Team Statistics"
3. Confirm
4. Wait for completion
→ Stats rebuilt from matches ✅
```

### To Check Stats:
```
1. /admin/statistics
   → See top scorers, team standings
2. Query database:
   SELECT * FROM standings WHERE category = 'open-age';
```

---

## 📝 Summary

**Your current system:**
- ✅ **Automatic updates** via Match Recorder (lines 167-218 in MatchRecorder.jsx)
- ✅ **Manual recalculation** via Stats Recalculator utility
- ✅ **Smart handling** of re-recording and canceling matches
- ❌ **No database triggers** (not needed - React handles it)

**Stats update when:**
1. You mark a match as "completed" in Match Recorder
2. You update an already-completed match
3. You run the Stats Recalculator utility

**Stats DON'T update when:**
- Match status is "scheduled" or "in_progress"
- You only add goals without completing the match
- You edit teams table directly

---

**Need to add database-level triggers?** See `docs/add-automatic-stats-triggers.sql` (optional, not recommended unless needed)

