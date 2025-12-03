# Fix Goals and Statistics Pages

## 🚨 The Problem

The Goals Manager and Statistics pages in your admin panel are not working because there's a **mismatch between your database schema and what the React code expects**.

### What's Wrong:

#### OLD Schema (Current):
```sql
CREATE TABLE goals (
    id uuid,
    match_id uuid,
    team_id uuid,
    scorer_name TEXT,      -- ❌ TEXT field
    assist_name TEXT,      -- ❌ TEXT field  
    minute integer
);
```

#### What Admin Panel Expects (NEW):
```sql
CREATE TABLE goals (
    id uuid,
    match_id uuid,
    team_id uuid,
    scorer_id UUID,        -- ✅ References team_players(id)
    assister_id UUID,      -- ✅ References team_players(id)
    minute integer,
    goal_type TEXT
);
```

### Why This Matters:

The admin panel React code tries to:
1. **Join goals with team_players** to show player names and images
2. **Query by player ID** to calculate top scorers
3. **Link goals to player records** for statistics

With text names, none of this works!

---

## 🔍 Step 1: Verify Your Current Structure

Run this in **Supabase SQL Editor**:

```sql
-- Run the verification script
\i docs/verify-database-structure.sql
```

Or copy/paste the contents of `verify-database-structure.sql`.

### What to Look For:

The script will tell you:
- ✅ **"DATABASE IS READY"** → Skip to testing
- ❌ **"DATABASE NEEDS MIGRATION"** → Continue to Step 2

---

## 🛠️ Step 2: Fix Your Database

### Option A: Fresh Start (Recommended if no important goals)

Run `complete-tournament-schema.sql` in Supabase SQL Editor:

```sql
-- This creates/updates all tournament tables with the correct structure
\i docs/complete-tournament-schema.sql
```

This will:
- ✅ Create/update teams, matches, goals tables
- ✅ Set up proper foreign keys
- ✅ Create helper views (standings, top_scorers, etc.)
- ✅ Enable RLS policies
- ❌ **Warning**: Will drop the old goals table!

### Option B: Just Fix Goals Table

If you only want to fix the goals table:

```sql
-- Run the focused migration
\i docs/fix-goals-schema.sql
```

This will:
- ✅ Backup old goals to `goals_backup`
- ✅ Create new goals table with proper structure
- ❌ **Warning**: Old goals won't be automatically migrated

---

## 🎯 Step 3: Understand the New Structure

### How Goals Connect to Players:

```
team_registrations
    ↓ (has many)
team_players
    ↓ (referenced by)
goals
    ↓ (belongs to)
matches
```

### Example Query (What Admin Panel Does):

```sql
-- Get goals with player info
SELECT 
    g.id,
    g.minute,
    g.goal_type,
    tp_scorer.player_name as scorer_name,
    tp_scorer.player_image as scorer_image,
    tp_assister.player_name as assister_name,
    tr.team_name
FROM goals g
JOIN team_players tp_scorer ON g.scorer_id = tp_scorer.id
LEFT JOIN team_players tp_assister ON g.assister_id = tp_assister.id
JOIN team_registrations tr ON tp_scorer.team_id = tr.id;
```

---

## 📝 Step 4: Test the Admin Panel

### Test Goals Manager (`/admin/goals`):

1. Navigate to Goals Manager
2. Click **"Add Goal"**
3. You should see:
   - ✅ Dropdown of matches
   - ✅ Dropdown of players (with team names)
   - ✅ Goal type selector
4. Add a test goal
5. Verify it appears in the table with player name

### Test Statistics (`/admin/statistics`):

1. Navigate to Statistics
2. You should see:
   - ✅ Top Scorers list (with player names and goals count)
   - ✅ Top Assisters list
   - ✅ Match statistics
   - ✅ Team standings

### Test Match Recorder (`/admin/matches`):

1. Navigate to Match Recorder
2. Select a match
3. Record a goal
4. Verify player dropdown shows actual players from both teams

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'player_name'"

**Cause**: Queries trying to access player_name from goals table

**Fix**: 
```sql
-- Run this to check if foreign keys exist
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'goals' 
AND constraint_type = 'FOREIGN KEY';
```

If no foreign keys shown, run `complete-tournament-schema.sql` again.

### Issue: "Relation 'goals' does not exist"

**Cause**: Goals table not created yet

**Fix**: Run `complete-tournament-schema.sql`

### Issue: "Insert violates foreign key constraint"

**Cause**: Trying to insert a goal for a player that doesn't exist in team_players

**Fix**: 
1. Check player exists:
```sql
SELECT * FROM team_players WHERE id = 'your-player-id';
```
2. If not, the player needs to be added to team_players first

### Issue: Statistics page shows no data

**Cause**: No goals recorded, or views not created

**Fix**:
1. Record at least one test goal
2. Run this to create views:
```sql
\i docs/complete-tournament-schema.sql
```

---

## 🎓 Understanding the Schema

### Tables:

1. **`team_registrations`** (Registration Phase)
   - User-submitted team registration
   - Has captain contact info
   - Status: draft → submitted → confirmed

2. **`team_players`** (Registration Phase)
   - 10 players per registration (7 starters + 3 subs)
   - Has player_name, position, player_image
   - This is the source of truth for player data

3. **`teams`** (Tournament Phase)
   - Confirmed teams in the tournament
   - Stores standings data (played, won, points, etc.)
   - Created when registration is confirmed

4. **`matches`** (Tournament Phase)
   - Fixtures and results
   - References teams table

5. **`goals`** (Tournament Phase)
   - Match events
   - **References team_players** (not teams!)
   - This is key: goals link to the player records

### Why Goals Reference team_players:

```
Goal → team_players → team_registrations → teams
```

- **Goals track individual player performance** (who scored, who assisted)
- **team_players has the player roster** with names and images
- **teams table is just for team-level statistics**

So when recording a goal, you select:
1. The match (from matches table)
2. The player (from team_players table)
3. The team (from teams table - which team scored)

---

## 📋 Checklist: After Migration

- [ ] Run `verify-database-structure.sql` → Shows "DATABASE IS READY"
- [ ] Goals Manager page loads without errors
- [ ] Can add a new goal using the form
- [ ] Goal appears in the table with player name
- [ ] Statistics page loads without errors
- [ ] Top scorers list shows player names
- [ ] Match recorder can record goals
- [ ] Clear statistics buttons work (from your new feature)

---

## 🚀 Quick Fix Commands

### 1. Check Current State:
```bash
# In Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goals';
```

### 2. Fix Everything:
```bash
# In Supabase SQL Editor  
-- Copy and paste contents of:
-- docs/complete-tournament-schema.sql
```

### 3. Verify:
```bash
# Should see "DATABASE IS READY"
-- Copy and paste contents of:
-- docs/verify-database-structure.sql
```

### 4. Test:
- Visit `/admin/goals`
- Click "Add Goal"
- Select match and player
- Save

---

## 💡 Pro Tips

1. **Always test with real data**: Create 2 teams, 1 match, 2 goals
2. **Use the views**: Query `top_scorers` view instead of writing complex joins
3. **Check player images**: Make sure team_players has player_image URLs
4. **Backup before migration**: The scripts create `goals_backup` table

---

## 📞 Still Having Issues?

### Debug Steps:

1. **Check if tables exist**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('teams', 'matches', 'goals', 'team_players');
```

2. **Check if you have players**:
```sql
SELECT COUNT(*) FROM team_players;
```

3. **Check if goals table is correct**:
```sql
SELECT 
    column_name,
    data_type,
    (SELECT COUNT(*) 
     FROM information_schema.key_column_usage kcu
     WHERE kcu.table_name = 'goals' 
     AND kcu.column_name = c.column_name) as is_foreign_key
FROM information_schema.columns c
WHERE table_name = 'goals'
ORDER BY ordinal_position;
```

### Expected Output:
- `scorer_id` should show `is_foreign_key = 1`
- `assister_id` should show `is_foreign_key = 1`

---

## 🎉 Success Criteria

After fixing, you should be able to:

✅ View all goals with player names and images  
✅ Add new goals by selecting players from dropdown  
✅ See top scorers with accurate goal counts  
✅ See top assisters with accurate assist counts  
✅ Filter goals by match  
✅ Clear goals for specific matches  
✅ Clear all statistics  
✅ View match statistics (total goals, average per match)  

---

**Ready to fix it? Start with Step 1: Verify!** 🚀

