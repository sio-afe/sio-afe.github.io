# Database Setup - Correct Order

## ⚠️ Important: Run in This Exact Order!

The scripts have dependencies on each other. Follow this order to avoid errors.

---

## 🔢 Step-by-Step Setup

### **Step 1: Registration System**
```sql
-- File: docs/muqawamah-migration.sql
-- Creates:
--   - team_registrations table
--   - team_players table
--   - tournament_config table
--   - registration_slots view
--   - Slot tracking functions
```

**What it does:**
- Sets up the registration system
- Adds slot tracking (12 slots per category)
- Creates views for real-time slot availability

---

### **Step 2: Tournament Tables**
```sql
-- File: docs/database-schema-safe.sql
-- Creates:
--   - teams table (standings)
--   - matches table
--   - goals table
--   - players table (tournament players)
--   - All triggers and RLS policies
```

**What it does:**
- Creates tournament-specific tables
- Sets up auto-update triggers for standings
- Adds RLS policies for security

**⚠️ Note:** This already includes `registration_id` column in teams table!

---

### **Step 3: Database Cleanup & Sync (If Upgrading)** ⭐
```sql
-- File: docs/database-cleanup-sync.sql
-- ONLY RUN IF: You're upgrading an existing database or see "column does not exist" errors
```

**What it does:**
- Drops redundant tables/views (e.g. `fixtures`, `standings` as a table)
- Adds any missing columns to `teams` and `players`
- Recreates helper views (`standings`, `team_complete_info`, `registration_slots`)
- Verifies foreign keys between registration and tournament tables
- Safe to run multiple times (idempotent) and doubles as a cleanup script

**⚠️ Run this if you see errors like:**
- `column t.formation does not exist`
- `column is_substitute does not exist`
- `column registration_id does not exist`
- Duplicate tables such as `fixtures` or `standings`

---

### **Step 4: Enhanced Confirmation Function**
```sql
-- File: docs/confirm-registration-enhanced.sql
-- Creates:
--   - confirm_registration_to_tournament() function
```

**What it does:**
- Copies registration to teams table
- Copies all players with positions and images
- Links registration to tournament team
- Updates registration status to 'confirmed'

**⚠️ Depends on:**
- team_registrations (Step 1)
- teams (Step 2)
- registration_id column (Step 2 or 3)

---

### **Step 5: Match Lineup Functions**
```sql
-- File: docs/match-lineup-functions.sql
-- Creates:
--   - get_team_lineup() function
--   - get_match_details() function
```

**What it does:**
- Fetches team lineup with player positions
- Gets complete match details with both teams
- Used for formation display

**⚠️ Depends on:**
- teams, players, matches (Step 2)

---

### **Step 6: Views & Auto-Sync (Optional)**
```sql
-- File: docs/simplified-team-connection.sql
-- Creates:
--   - team_complete_info view
--   - standings view
--   - sync_registration_to_tournament() trigger
```

**What it does:**
- Simplifies queries with views
- Auto-syncs logo/formation changes
- Makes frontend queries easier

**⚠️ Depends on:**
- teams, team_registrations (Steps 1 & 2)
- registration_id column (Step 2 or 3)

---

### **Step 7: Test Data**
```sql
-- File: docs/COMPLETE_TEST_SETUP.sql
-- Creates:
--   - 2 test registrations (Arsenal & Chelsea)
--   - 20 players (10 each)
--   - Confirms both to standings
--   - 1 match between them
--   - 3 goals
```

**What it does:**
- Creates complete test scenario
- Tests full workflow
- Provides data for frontend testing

**⚠️ Depends on:**
- ALL previous steps

---

## 🚀 Quick Setup (Copy & Paste)

### **Option A: Run All at Once**
```bash
# In Supabase SQL Editor, run each file in order:
1. muqawamah-migration.sql
2. database-schema-safe.sql
3. database-cleanup-sync.sql (only if you're upgrading / fixing issues)
4. confirm-registration-enhanced.sql
5. match-lineup-functions.sql
6. simplified-team-connection.sql (optional)
7. COMPLETE_TEST_SETUP.sql (for testing)
```

### **Option B: One Command (if using psql)**
```bash
psql $DATABASE_URL << EOF
\i docs/muqawamah-migration.sql
\i docs/database-schema-safe.sql
\i docs/database-cleanup-sync.sql
\i docs/confirm-registration-enhanced.sql
\i docs/match-lineup-functions.sql
\i docs/simplified-team-connection.sql
\i docs/COMPLETE_TEST_SETUP.sql
EOF
```

---

## ❌ Common Errors & Fixes

### **Error 1: "column registration_id does not exist"**
```
Error: column t.registration_id does not exist
```

**Fix:** Run `database-cleanup-sync.sql`

**Why:** The teams table was created without the registration_id column.

---

### **Error 2: "relation team_registrations does not exist"**
```
Error: relation "team_registrations" does not exist
```

**Fix:** Run `muqawamah-migration.sql` first

**Why:** You're trying to run Step 4+ before Step 1.

---

### **Error 3: "function confirm_registration_to_tournament does not exist"**
```
Error: function confirm_registration_to_tournament(uuid) does not exist
```

**Fix:** Run `confirm-registration-enhanced.sql`

**Why:** Test data needs this function to move teams to standings.

---

### **Error 4: "function get_match_details does not exist"**
```
Error: function get_match_details(uuid) does not exist
```

**Fix:** Run `match-lineup-functions.sql`

**Why:** Frontend needs this function to fetch match lineups.

---

## ✅ Verification

After running all scripts, verify setup:

```sql
-- 1. Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'team_registrations',
    'team_players',
    'tournament_config',
    'teams',
    'matches',
    'goals',
    'players'
  )
ORDER BY table_name;

-- Should return 7 tables

-- 2. Check registration_id column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'teams'
  AND column_name = 'registration_id';

-- Should return: registration_id | uuid

-- 3. Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'confirm_registration_to_tournament',
    'get_match_details',
    'get_team_lineup',
    'get_registration_stats'
  )
ORDER BY routine_name;

-- Should return 4 functions

-- 4. Check views exist
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'registration_slots',
    'standings',
    'team_complete_info'
  )
ORDER BY table_name;

-- Should return 3 views

-- 5. Check test data
SELECT name, category, points
FROM teams
WHERE name IN ('Arsenal FC', 'Chelsea FC');

-- Should return 2 teams if you ran test data
```

---

## 🎯 Summary

**Correct Order:**
1. ✅ Registration system (migration)
2. ✅ Tournament tables (schema-safe)
3. ⚠️ Database cleanup & sync (if upgrading)
4. ✅ Confirmation function
5. ✅ Match lineup functions
6. ✅ Views & auto-sync (optional)
7. ✅ Test data

**Key Dependencies:**
- Steps 4-7 need Steps 1-2
- Step 6 needs `registration_id` column
- Step 7 needs Step 4

**If you get errors:**
- Check you ran previous steps
- Run `database-cleanup-sync.sql` if migrating an older schema
- Verify with queries above

**Ready to go!** 🚀

