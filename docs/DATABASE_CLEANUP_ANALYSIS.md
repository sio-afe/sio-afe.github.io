# Database Cleanup Analysis

## 📊 Current Database Tables Analysis

### ✅ **ACTIVE TABLES** (Currently in Use)

#### 1. **`goals`**
- **Status**: ✅ Active
- **Purpose**: Stores all goals scored in matches
- **Schema**: Uses `scorer_id`, `assister_id` (NEW schema)
- **Used By**: All tournament pages, admin panels, statistics
- **Foreign Keys**: 
  - `match_id` → `matches(id)`
  - `team_id` → `teams(id)`
  - `scorer_id` → `team_players(id)`
  - `assister_id` → `team_players(id)`

#### 2. **`matches`**
- **Status**: ✅ Active
- **Purpose**: Stores all tournament matches
- **Used By**: Fixtures, Match Recorder, Standings
- **Foreign Keys**: 
  - `home_team_id` → `teams(id)`
  - `away_team_id` → `teams(id)`

#### 3. **`players`**
- **Status**: ✅ Active
- **Purpose**: Tournament players (copied from team_players when added to tournament)
- **Used By**: Team pages, player statistics
- **Foreign Keys**: 
  - `team_id` → `teams(id)`
  - `registration_player_id` → `team_players(id)`

#### 4. **`team_players`**
- **Status**: ✅ Active
- **Purpose**: Registration players (original player data)
- **Used By**: Registration system, all player references via foreign keys
- **Foreign Keys**: 
  - `team_id` → `team_registrations(id)`

#### 5. **`team_registrations`**
- **Status**: ✅ Active
- **Purpose**: Team registration data
- **Used By**: Registration system, admin panel
- **Related**: Links to `team_players` and `teams`

#### 6. **`teams`**
- **Status**: ✅ Active
- **Purpose**: Tournament teams (active participants)
- **Used By**: All tournament pages, standings, matches
- **Foreign Keys**: 
  - `registration_id` → `team_registrations(id)`

#### 7. **`registration_slots`**
- **Status**: ✅ Active
- **Purpose**: Tracks available registration slots per category
- **Used By**: `RegistrationSlots.jsx` component (displays registration status)
- **Columns**: 
  - `category`, `total_slots`, `filled_slots`, `available_slots`
  - `registration_open`, `status`, `updated_at`

---

### ❌ **UNUSED TABLES** (Candidates for Deletion)

#### 1. **`goals_backup`**
- **Status**: ❌ Unused
- **Purpose**: Backup table from schema migration
- **Old Schema**: Used `scorer_name`, `assist_name` (text fields)
- **Current**: Replaced by `goals` table with `scorer_id`, `assister_id`
- **Recommendation**: **DELETE** - No longer needed after successful migration
- **Size**: Check size before deleting (might be large if many goals were scored)

#### 2. **`tournament_config`**
- **Status**: ❌ Unused
- **Purpose**: Tournament configuration settings
- **Problem**: Not referenced anywhere in the codebase
- **Overlap**: Similar functionality to `registration_slots`
- **Recommendation**: **DELETE** - Functionality covered by `registration_slots`
- **Note**: Check if any external services use this table

---

## 🔧 Action Required

### Immediate Actions:

1. **Review the Analysis**
   - Verify the unused tables list
   - Confirm no external services use `tournament_config`

2. **Run the Cleanup Script**
   ```bash
   # File: docs/cleanup-unused-tables.sql
   ```
   - Opens in Supabase SQL Editor
   - Drops `goals_backup` and `tournament_config`
   - Includes optional backup export commands

3. **Verify After Cleanup**
   - Check that all active features still work
   - Monitor for any errors in logs
   - Test registration page (uses `registration_slots`)

---

## 📝 Cleanup Steps

### Step 1: Backup (Optional but Recommended)
```sql
-- Export data before dropping
COPY goals_backup TO '/tmp/goals_backup_export.csv' WITH CSV HEADER;
COPY tournament_config TO '/tmp/tournament_config_export.csv' WITH CSV HEADER;
```

### Step 2: Drop Tables
```sql
DROP TABLE IF EXISTS goals_backup CASCADE;
DROP TABLE IF EXISTS tournament_config CASCADE;
```

### Step 3: Verify
```sql
-- Check remaining tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Step 4: Reload Schema Cache
```sql
NOTIFY pgrst, 'reload schema';
```

---

## 🎯 Expected Results After Cleanup

### Tables Remaining:
- ✅ `goals` (active)
- ✅ `matches` (active)
- ✅ `players` (active)
- ✅ `registration_slots` (active)
- ✅ `team_players` (active)
- ✅ `team_registrations` (active)
- ✅ `teams` (active)

### Benefits:
- 🚀 Reduced database size
- 🧹 Cleaner schema
- 📊 Easier database management
- 💰 Potentially lower storage costs

---

## ⚠️ Important Notes

1. **No Rollback**: Once tables are dropped, data is lost (unless backed up)
2. **Test Environment**: Consider running this in a test environment first
3. **Downtime**: This operation should be quick, but consider off-peak hours
4. **Dependencies**: Script uses `CASCADE` to drop dependent objects

---

## 🔍 How We Determined This

1. **Code Search**: Searched entire codebase for table references
   - `goals_backup`: 0 references
   - `tournament_config`: 0 references
   - `registration_slots`: 1 reference (RegistrationSlots.jsx)

2. **Schema Analysis**: Compared old vs new schemas
   - `goals_backup` uses old naming convention
   - Current `goals` table uses new schema

3. **Functional Overlap**: Identified duplicate functionality
   - `tournament_config` overlaps with `registration_slots`
   - Only `registration_slots` is actively used

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs for errors
2. Verify `registration_slots` table still works
3. Test registration page functionality
4. Check all tournament pages load correctly

---

**Created**: Dec 3, 2025  
**Last Updated**: Dec 3, 2025  
**Status**: Ready for execution


