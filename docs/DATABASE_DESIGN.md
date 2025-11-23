# Muqawama 2026 Database Design

## Design Decision: Single Tables with Category Column ✅

### Overview
We use **one set of tables** with a `category` column to distinguish between Open Age and U17 tournaments, rather than creating separate tables for each category.

---

## Why Single Tables?

### ✅ Advantages

1. **DRY Principle (Don't Repeat Yourself)**
   - No code duplication
   - Single source of truth for schema
   - Easier to maintain and update

2. **Simplified Queries**
   - Simple filtering: `WHERE category = 'open-age'`
   - Easy cross-category analytics
   - Unified reporting

3. **Scalability**
   - Easy to add new categories (U15, U19, etc.)
   - No schema changes needed
   - Future-proof design

4. **Better Code Reusability**
   - Same functions work for all categories
   - Shared triggers and constraints
   - Unified API endpoints

5. **Efficient Indexing**
   - Composite indexes on (category, other_columns)
   - Better query performance
   - Smaller database footprint

6. **Atomic Operations**
   - Cross-category transactions
   - Easier data consistency
   - Simplified backup/restore

---

## Database Structure

### Core Tables

```
team_registrations
├── id (UUID, PK)
├── user_id (UUID, FK → auth.users)
├── team_name (VARCHAR)
├── category (VARCHAR) ← DISTINGUISHES CATEGORIES
├── team_logo (TEXT)
├── captain_name (VARCHAR)
├── captain_email (VARCHAR)
├── captain_phone (VARCHAR)
├── formation (VARCHAR)
├── status (VARCHAR)
├── tournament_team_id (UUID, FK → teams)
└── timestamps

team_players
├── id (UUID, PK)
├── team_id (UUID, FK → team_registrations)
├── player_name (VARCHAR)
├── position (VARCHAR)
├── is_substitute (BOOLEAN)
├── player_image (TEXT)
└── position_x, position_y (FLOAT)

teams (Tournament)
├── id (UUID, PK)
├── name (VARCHAR)
├── category (VARCHAR) ← DISTINGUISHES CATEGORIES
├── crest_url (TEXT)
├── captain (VARCHAR)
├── played, won, drawn, lost (INTEGER)
├── goals_for, goals_against (INTEGER)
├── points (INTEGER)
└── group_name (VARCHAR)

matches
├── id (UUID, PK)
├── home_team_id, away_team_id (UUID, FK → teams)
├── home_score, away_score (INTEGER)
├── category (VARCHAR) ← DISTINGUISHES CATEGORIES
├── match_type (VARCHAR) -- group, quarter-final, etc.
├── status (VARCHAR)
└── timestamps

tournament_config
├── id (UUID, PK)
├── category (VARCHAR, UNIQUE) ← ONE ROW PER CATEGORY
├── total_slots (INTEGER) -- 12 for each
├── registration_open (BOOLEAN)
└── registration_deadline (TIMESTAMP)
```

---

## Slot Tracking System

### How It Works

1. **Configuration Table**
   ```sql
   tournament_config
   - open-age: 12 slots
   - u17: 12 slots
   ```

2. **Real-time View**
   ```sql
   CREATE VIEW registration_slots AS
   SELECT 
     category,
     total_slots,
     COUNT(submitted/confirmed teams) as registered_teams,
     total_slots - registered_teams as available_slots,
     (registered_teams / total_slots * 100) as fill_percentage
   FROM tournament_config
   LEFT JOIN team_registrations
   GROUP BY category
   ```

3. **Automatic Enforcement**
   - Trigger checks available slots before allowing registration
   - Prevents overbooking
   - Real-time updates via Supabase subscriptions

---

## Key Features

### 1. Registration Flow
```
User Signs Up with Google
    ↓
Fills Registration Form
    ↓
Submits (if slots available)
    ↓
Status: 'submitted'
    ↓
Admin Reviews
    ↓
Confirms → Creates Tournament Team
    ↓
Status: 'confirmed'
    ↓
Tournament team_id linked
```

### 2. Slot Counter (Homepage)
- Real-time updates
- Shows: X/12 teams registered
- Color-coded status:
  - 🟢 Green: >50% available
  - 🟠 Orange: 25-50% available
  - 🔴 Red: <25% available or full

### 3. Separate Management
- **Fixtures**: Filtered by category
- **Stats**: Category-specific queries
- **Standings**: Ordered by category + points
- **Matches**: Separate schedules per category

---

## Sample Queries

### Get Available Slots
```sql
SELECT * FROM registration_slots;
-- Returns: category, total_slots, registered_teams, available_slots, fill_percentage
```

### Check if Registration Allowed
```sql
SELECT check_slots_available('open-age');
-- Returns: true/false
```

### Get Category Standings
```sql
SELECT * FROM teams 
WHERE category = 'open-age' 
ORDER BY points DESC, (goals_for - goals_against) DESC;
```

### Get Category Fixtures
```sql
SELECT * FROM matches 
WHERE category = 'u17' AND status = 'scheduled'
ORDER BY match_date, scheduled_time;
```

### Confirm Registration
```sql
SELECT confirm_registration_to_tournament('registration-uuid');
-- Creates tournament team, links it, updates status
```

---

## Frontend Integration

### React Component Usage

```jsx
import RegistrationSlots from './components/shared/RegistrationSlots';

// In homepage
<RegistrationSlots />
```

Features:
- Real-time slot updates via Supabase subscriptions
- Progress bars with animations
- Color-coded status indicators
- Responsive design

---

## Performance Considerations

### Indexes
```sql
-- Registration queries
CREATE INDEX idx_team_registrations_category_status 
  ON team_registrations(category, status);

-- Tournament standings
CREATE INDEX idx_teams_category_points 
  ON teams(category, points DESC);

-- Match schedules
CREATE INDEX idx_matches_category_type_status 
  ON matches(category, match_type, status);
```

### Query Optimization
- Category filtering is highly efficient with indexes
- Views are materialized for complex aggregations
- Real-time subscriptions use PostgreSQL LISTEN/NOTIFY

---

## Security (RLS Policies)

```sql
-- Users can only view/edit their own registrations
CREATE POLICY "Users can view own teams" 
  ON team_registrations FOR SELECT 
  USING (auth.uid() = user_id);

-- Prevent updates after confirmation
CREATE POLICY "Users can update own teams" 
  ON team_registrations FOR UPDATE 
  USING (auth.uid() = user_id AND status IN ('draft', 'submitted'));

-- Everyone can view tournament data
CREATE POLICY "Tournament data is public" 
  ON teams FOR SELECT 
  USING (true);
```

---

## Migration Path

### From Registration to Tournament

1. **Registration Phase**
   - Teams register via form
   - Status: 'submitted'
   - Stored in `team_registrations`

2. **Admin Confirmation**
   - Admin reviews submissions
   - Calls `confirm_registration_to_tournament(id)`
   - Creates entry in `teams` table
   - Links via `tournament_team_id`

3. **Tournament Phase**
   - Fixtures created in `matches` table
   - Stats tracked in `teams` table
   - Goals recorded in `goals` table

---

## Future Enhancements

### Easy to Add:
- ✅ New age categories (U15, U19, Women's)
- ✅ Multiple tournaments per year
- ✅ Knockout-only tournaments
- ✅ League format tournaments
- ✅ Cross-category statistics

### No Schema Changes Needed:
- Just add new category values
- Reuse existing functions
- Same frontend components

---

## Summary

**Single tables with category column** is the optimal choice because:
1. ✅ Simpler to maintain
2. ✅ More scalable
3. ✅ Better performance with proper indexes
4. ✅ Easier to query and report
5. ✅ Future-proof design
6. ✅ Industry best practice

This design handles all requirements:
- ✅ Separate fixtures per category
- ✅ Separate stats per category
- ✅ Separate standings per category
- ✅ 12 slots per category with tracking
- ✅ Real-time slot counter on homepage
- ✅ One registration per user
- ✅ Smooth registration-to-tournament flow

