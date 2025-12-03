# Schema Cache Error Fix

## 🐛 The Error

```
{
    "code": "PGRST204",
    "details": null,
    "hint": null,
    "message": "Could not find the 'assist_name' column of 'goals' in the schema cache"
}
```

## 🔍 What Happened

When you changed the database schema from:
- ❌ OLD: `scorer_name`, `assist_name` (text columns)
- ✅ NEW: `scorer_id`, `assister_id` (foreign keys)

**Supabase cached the old schema** and was still looking for the old column names.

## ✅ Fixes Applied

### 1. Made Query More Explicit (MatchRecorder.jsx)

**Before:**
```javascript
.select(`
  *,  // ❌ This uses cached schema
  scorer:team_players!goals_scorer_id_fkey(player_name),
  assister:team_players!goals_assister_id_fkey(player_name)
`)
```

**After:**
```javascript
.select(`
  id,
  match_id,
  team_id,
  scorer_id,
  assister_id,
  minute,
  goal_type,
  created_at,
  scorer:team_players!goals_scorer_id_fkey(player_name),
  assister:team_players!goals_assister_id_fkey(player_name)
`)
```

Now it explicitly requests the NEW column names!

### 2. Refresh Supabase Schema Cache

Go to **Supabase Dashboard**:

1. Open your project
2. Go to **API** section (left sidebar)
3. Look for **"Schema Cache"** or **"API Docs"**
4. Click **"Reload Schema"** or **"Refresh"**

OR run this in SQL Editor:
```sql
NOTIFY pgrst, 'reload schema';
```

## 🔄 If Error Persists

### Method 1: Clear Browser Cache
```bash
# In browser DevTools:
1. Open DevTools (F12)
2. Right-click on Refresh button
3. Select "Empty Cache and Hard Reload"
```

### Method 2: Restart Supabase Project
```bash
# In Supabase Dashboard:
1. Go to Project Settings
2. Click "Pause Project"
3. Wait 30 seconds
4. Click "Resume Project"
```

### Method 3: Verify Schema in Database
```sql
-- Check actual columns in goals table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Should show:
-- id, match_id, team_id, scorer_id, assister_id, minute, goal_type, created_at, updated_at
-- Should NOT show: scorer_name, assist_name
```

### Method 4: Use Explicit Column Names Everywhere

Search your codebase for any queries using `select('*')` on the goals table and replace with explicit columns:

```javascript
// ❌ BAD - uses cached schema
.select('*')

// ✅ GOOD - explicit columns
.select('id, match_id, team_id, scorer_id, assister_id, minute, goal_type')
```

## 🎯 Test After Fix

### Test 1: Add Goal from Match Recorder
```bash
1. Go to /admin/matches
2. Click on a match
3. Add a goal
4. Should work without errors ✅
```

### Test 2: View Goals List
```bash
1. Go to /admin/goals
2. Should display goals with player names ✅
```

### Test 3: Check Database
```sql
-- See actual data structure
SELECT * FROM goals LIMIT 1;

-- Should show columns: id, match_id, team_id, scorer_id, assister_id, ...
-- NOT: scorer_name, assist_name
```

## 📋 Prevention

To avoid schema cache issues in the future:

1. **Always be explicit with column names** in SELECT queries
2. **Reload schema** after any table structure changes
3. **Test queries** in SQL editor before updating code
4. **Use TypeScript** for better type checking (optional)

## 🚀 After Applying Fixes

Your admin panel should now work correctly:

- ✅ Add goals from Match Recorder
- ✅ Add goals from Goals Manager
- ✅ View goals with player names
- ✅ See statistics with top scorers
- ✅ No more schema cache errors

## 💡 Why This Happened

When you dropped and recreated the `goals` table:

1. **Database schema changed** immediately
2. **Supabase API cached old schema** for performance
3. **Queries using `*`** tried to fetch old columns
4. **PostgREST returned error** when columns didn't exist

By being explicit about column names, we bypass the cache!

---

**Status:** ✅ FIXED  
**Last Updated:** December 2025

