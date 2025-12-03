# How to Reload Supabase Schema Cache

## 🚨 When You Need This

If you get errors like:
```
Could not find the 'assist_name' column of 'goals' in the schema cache
```

This means Supabase is using an **old cached version** of your database schema.

## ✅ Solution: Reload Schema Cache

### Method 1: Via SQL (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Tell PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

-- Verify it worked (should show current timestamp)
SELECT NOW() as schema_reloaded_at;
```

### Method 2: Via Supabase Dashboard

1. Go to **Supabase Dashboard**
2. Select your project
3. Click **Settings** (gear icon in left sidebar)
4. Go to **API** section
5. Find **"Schema Cache"** section
6. Click **"Reload Schema"** or **"Refresh"** button

### Method 3: Restart Project (Nuclear Option)

If nothing else works:

1. Go to **Supabase Dashboard**
2. Click **Settings** → **General**
3. Scroll to **"Pause Project"**
4. Click **Pause** and wait 30 seconds
5. Click **Resume**
6. Wait for project to restart (~2-3 minutes)

## 🔍 Verify Schema is Correct

Run this to see actual columns:

```sql
-- Check goals table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;
```

**Expected columns:**
- ✅ `id` (uuid)
- ✅ `match_id` (uuid)
- ✅ `team_id` (uuid)
- ✅ `scorer_id` (uuid)
- ✅ `assister_id` (uuid)
- ✅ `minute` (integer)
- ✅ `goal_type` (text)
- ✅ `created_at` (timestamp)

**Should NOT see:**
- ❌ `scorer_name`
- ❌ `assist_name`

## 🌐 Also Clear Browser Cache

After reloading schema:

1. **Hard Reload Browser**
   - Chrome/Edge: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5`

2. **Clear Application Cache**
   - Open DevTools (F12)
   - Go to **Application** tab
   - Click **Clear site data**
   - Reload page

## 🧪 Test After Reload

### Test 1: Add Goal from Goals Manager
```bash
1. Go to /admin/goals
2. Click "Add Goal"
3. Fill form and submit
4. Should work! ✅
```

### Test 2: Add Goal from Match Recorder
```bash
1. Go to /admin/matches  
2. Select match
3. Add goal
4. Should work! ✅
```

### Test 3: View Statistics
```bash
1. Go to /admin/statistics
2. Should show data without errors ✅
```

## 📋 Why This Happens

When you change database schema:

1. **Database updates** immediately ✅
2. **PostgREST (Supabase API)** caches old schema ❌
3. **API requests fail** because columns don't match ❌

The schema cache improves performance but needs manual reload after schema changes.

## 🎯 After Successful Reload

You should see:
- ✅ No more "column not found" errors
- ✅ Goals add successfully
- ✅ Statistics display correctly
- ✅ All admin features working

## 💡 Prevention Tips

### Always After Schema Changes:

1. Run SQL migrations
2. **Immediately reload schema cache**
3. Clear browser cache
4. Test in incognito window first

### In Development:

Consider disabling schema cache (not recommended for production):

```sql
-- Check current cache settings
SHOW pgrst.db_schemas;

-- For development only (requires restart)
-- ALTER SYSTEM SET pgrst.db_schema = 'public';
```

## 🚀 Quick Command Sequence

```sql
-- 1. Verify schema is correct
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'goals';

-- 2. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 3. Confirm reload
SELECT NOW() as reloaded_at;
```

Then refresh your browser and test!

---

**Status:** This should fix 99% of schema cache issues  
**Time to Fix:** 30 seconds  
**Difficulty:** Easy (just run one SQL command)

