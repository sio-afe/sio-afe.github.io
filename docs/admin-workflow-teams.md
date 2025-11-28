# 📋 Admin Workflow: Two Teams Tables

## Understanding the Two Systems

### 🔵 **`team_registrations`** Table
**Purpose**: Registration & Payment Management  
**Location**: `/muqawamah/admin/registrations`

**Contains:**
- All team registration submissions
- Payment information
- Registration status tracking

**Statuses:**
- `submitted` - Team saved registration draft
- `pending_payment` - Waiting for payment
- `confirmed` - Payment completed
- `cancelled` - Registration cancelled

**Columns Include:**
- `team_name`, `team_logo`
- `captain_name`, `captain_email`, `captain_phone`
- `category` (open-age / u17)
- `formation`
- `status`, `payment_status`
- `payment_amount`, `transaction_id`
- `user_id` (linked to auth user)
- Associated `team_players` data

---

### 🟢 **`teams`** Table
**Purpose**: Tournament Management (Fixtures, Matches, Standings)  
**Location**: `/muqawamah/admin/teams`

**Contains:**
- Only active tournament teams
- Match statistics and standings
- Tournament performance data

**Columns Include:**
- `name`, `crest_url`
- `captain`
- `category` (open-age / u17)
- `formation`
- `played`, `won`, `drawn`, `lost`
- `goals_for`, `goals_against`, `points`
- `group_name`
- `registration_id` (links back to `team_registrations`)

---

## 🔄 Workflow: Registration → Tournament Team

### Step 1: Registration Phase
1. Team registers at `/muqawamah/2026/open-age/register`
2. Entry created in `team_registrations` with status `submitted`
3. Players added to `team_players` table

### Step 2: Payment Confirmation
1. Admin reviews in **Registrations** page
2. Payment verified (or manually marked as `confirmed`)
3. `team_registrations.status` = `confirmed`

### Step 3: Add to Tournament
**Manual Process** (current):
```sql
-- Copy confirmed registration to teams table
INSERT INTO teams (
  name, 
  crest_url, 
  captain, 
  category, 
  formation,
  registration_id
)
SELECT 
  team_name,
  team_logo,
  captain_name,
  category,
  formation,
  id
FROM team_registrations
WHERE status = 'confirmed' 
  AND id NOT IN (SELECT registration_id FROM teams WHERE registration_id IS NOT NULL);
```

### Step 4: Tournament Management
1. Team now appears in **Teams** page
2. Admin can create fixtures
3. Record match results
4. Stats auto-update in `teams` table

---

## 🎯 Key Differences

| Aspect | team_registrations | teams |
|--------|-------------------|-------|
| **Purpose** | Registration management | Tournament operations |
| **Statuses** | submitted, pending, confirmed, cancelled | Always active |
| **Stats** | No match stats | Full match statistics |
| **Linked To** | Auth users, payments | Matches, goals, fixtures |
| **Players** | team_players table | Can query via registration_id |
| **Admin Page** | Registrations | Teams |
| **When Created** | User registration | Admin adds to tournament |

---

## 💡 Best Practices

### 1. **Never Delete from `team_registrations`**
- Keep for payment records
- Keep for audit trail
- Set status to `cancelled` instead

### 2. **Only Confirmed Teams → Tournament**
- Verify payment first
- Check team details are complete
- Ensure no duplicate team names in category

### 3. **Link Registration to Team**
- Always set `teams.registration_id` when creating tournament team
- Allows tracing back to original registration
- Helps with player data lookup

### 4. **Handle Team Name Changes**
- If team name changes after tournament creation
- Update in `teams` table, not `team_registrations`
- Keep registration data as historical record

---

## 🔧 SQL Helpers

### Check Confirmed Teams Not Yet in Tournament
```sql
SELECT 
  tr.id,
  tr.team_name,
  tr.captain_name,
  tr.category,
  tr.confirmed_at
FROM team_registrations tr
LEFT JOIN teams t ON t.registration_id = tr.id
WHERE tr.status = 'confirmed'
  AND t.id IS NULL
ORDER BY tr.confirmed_at;
```

### Get Team's Players via Registration
```sql
SELECT 
  tp.player_name,
  tp.position,
  tp.player_age
FROM teams t
JOIN team_players tp ON tp.team_id = t.registration_id
WHERE t.id = 'team-uuid-here';
```

### View Registration Status Summary
```sql
SELECT 
  category,
  status,
  COUNT(*) as count
FROM team_registrations
GROUP BY category, status
ORDER BY category, status;
```

---

## 🚀 Future Enhancement Ideas

1. **Auto-Convert Button**
   - Add button in Registrations page: "Add to Tournament"
   - One-click conversion of confirmed teams

2. **Sync Status Indicator**
   - Show badge if confirmed registration is not in tournament yet
   - Show badge if team is already in tournament

3. **Bulk Import**
   - Select multiple confirmed registrations
   - Batch add to tournament

4. **Player Sync**
   - Automatically link `team_players` to tournament team
   - Allow viewing players from Teams page

---

This document clarifies the two-table system and provides a clear workflow for managing both registration and tournament operations.

