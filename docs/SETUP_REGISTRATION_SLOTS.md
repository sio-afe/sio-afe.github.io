# Setup Guide: Registration Slots & Tournament Database

## Quick Start

### 1. Run the Enhanced Schema

Execute the enhanced schema in your Supabase SQL editor:

```bash
# File: docs/muqawamah-enhanced-schema.sql
```

This will:
- ✅ Create `tournament_config` table
- ✅ Create `registration_slots` view
- ✅ Add slot tracking functions
- ✅ Set up triggers for automatic slot enforcement
- ✅ Initialize both categories with 12 slots each

### 2. Verify Setup

Run these queries in Supabase SQL editor:

```sql
-- Check tournament configuration
SELECT * FROM tournament_config;
-- Should show: open-age (12 slots), u17 (12 slots)

-- Check registration slots view
SELECT * FROM registration_slots;
-- Should show: available_slots, registered_teams, fill_percentage

-- Test slot availability function
SELECT check_slots_available('open-age');
-- Should return: true (if slots available)
```

### 3. Add Slots Component to Homepage

#### Option A: Add to existing 2026 page

```jsx
// In muqawamah-react/src/components/editions/2026/AboutSection.jsx
import RegistrationSlots from '../../shared/RegistrationSlots';

// Add before or after the registration button
<RegistrationSlots />
```

#### Option B: Create dedicated section

```jsx
// In muqawamah-react/src/App.jsx or main page component
import RegistrationSlots from './components/shared/RegistrationSlots';
import '../styles/RegistrationSlots.css';

function TournamentPage() {
  return (
    <>
      <Hero />
      <RegistrationSlots /> {/* Add here */}
      <AboutSection />
      <FixturesSection />
    </>
  );
}
```

### 4. Import CSS

Add to your main CSS or component:

```jsx
import '../styles/RegistrationSlots.css';
```

---

## Testing the System

### Test Slot Tracking

1. **Register a team**
   - Go to registration page
   - Complete form and submit
   - Check homepage - counter should decrease

2. **Check real-time updates**
   - Open homepage in two browser windows
   - Register a team in one window
   - Watch counter update in other window (real-time!)

3. **Test slot limit**
   - Try to register when slots are full
   - Should see error: "No slots available"

### Test Queries

```sql
-- Get current registration stats
SELECT * FROM get_registration_stats();

-- See all submitted registrations
SELECT 
  team_name, 
  category, 
  captain_name, 
  status, 
  submitted_at 
FROM team_registrations 
WHERE status = 'submitted'
ORDER BY submitted_at ASC;

-- Confirm a registration (admin action)
SELECT confirm_registration_to_tournament('your-registration-uuid-here');
```

---

## Admin Workflow

### Confirming Registrations

When a team submits registration:

1. **Review submission** in Supabase dashboard
   ```sql
   SELECT * FROM team_registrations WHERE status = 'submitted';
   ```

2. **Verify team details**
   - Check team name, captain info
   - Review player list
   - Validate team logo

3. **Confirm registration**
   ```sql
   SELECT confirm_registration_to_tournament('registration-uuid');
   ```
   
   This will:
   - Create tournament team in `teams` table
   - Link registration to tournament team
   - Update status to 'confirmed'
   - Send confirmation email (if configured)

4. **Reject if needed**
   ```sql
   UPDATE team_registrations 
   SET status = 'rejected' 
   WHERE id = 'registration-uuid';
   ```

### Managing Slots

```sql
-- Close registration for a category
UPDATE tournament_config 
SET registration_open = false 
WHERE category = 'open-age';

-- Extend deadline
UPDATE tournament_config 
SET registration_deadline = '2026-01-31 23:59:59' 
WHERE category = 'u17';

-- Change slot count (if needed)
UPDATE tournament_config 
SET total_slots = 16 
WHERE category = 'open-age';
```

---

## Real-time Updates

The `RegistrationSlots` component automatically subscribes to database changes:

```javascript
// Listens for any changes to team_registrations table
supabaseClient
  .channel('registration-slots')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'team_registrations'
  }, () => {
    fetchSlots(); // Refresh slot data
  })
  .subscribe();
```

**Result**: Homepage slot counter updates instantly when:
- New team registers
- Registration is confirmed
- Registration is rejected
- Admin changes slot configuration

---

## Troubleshooting

### Slots not updating?

1. **Check RLS policies**
   ```sql
   -- Ensure view is accessible
   CREATE POLICY "Registration slots viewable by everyone"
     ON tournament_config FOR SELECT
     USING (true);
   ```

2. **Verify real-time is enabled**
   - Go to Supabase Dashboard → Database → Replication
   - Enable replication for `team_registrations` table

3. **Check browser console**
   - Look for subscription errors
   - Verify Supabase client is initialized

### Registration blocked incorrectly?

```sql
-- Check actual slot count
SELECT * FROM registration_slots;

-- Manually reset if needed
UPDATE tournament_config 
SET total_slots = 12 
WHERE category = 'open-age';

-- Recalculate stats
REFRESH MATERIALIZED VIEW registration_slots; -- if using materialized view
```

### Can't confirm registration?

```sql
-- Check if already confirmed
SELECT tournament_team_id, status 
FROM team_registrations 
WHERE id = 'your-uuid';

-- Check if slots available
SELECT check_slots_available('open-age');

-- Force confirm (admin only, use carefully)
UPDATE team_registrations 
SET status = 'confirmed', confirmed_at = NOW() 
WHERE id = 'your-uuid';
```

---

## Database Maintenance

### Backup Before Tournament

```sql
-- Export registrations
COPY (
  SELECT * FROM team_registrations 
  WHERE status = 'confirmed'
) TO '/tmp/confirmed_teams.csv' WITH CSV HEADER;

-- Export tournament teams
COPY (
  SELECT * FROM teams 
  WHERE category IN ('open-age', 'u17')
) TO '/tmp/tournament_teams.csv' WITH CSV HEADER;
```

### Reset for Next Year

```sql
-- Archive old registrations
CREATE TABLE team_registrations_2026 AS 
SELECT * FROM team_registrations;

-- Clear current registrations
TRUNCATE team_registrations CASCADE;

-- Reset tournament config
UPDATE tournament_config 
SET registration_open = true,
    registration_deadline = NULL;

-- Reset tournament tables
TRUNCATE teams, matches, goals, players CASCADE;
```

---

## Performance Tips

1. **Add indexes** (already in enhanced schema)
   ```sql
   CREATE INDEX idx_team_registrations_category_status 
     ON team_registrations(category, status);
   ```

2. **Use connection pooling** in production
   ```javascript
   const supabase = createClient(url, key, {
     db: { schema: 'public' },
     auth: { persistSession: true },
     realtime: { 
       params: { eventsPerSecond: 10 } 
     }
   });
   ```

3. **Cache slot data** (optional)
   - Update every 30 seconds instead of real-time
   - Reduces database load
   - Still feels instant to users

---

## Next Steps

1. ✅ Run enhanced schema
2. ✅ Add `RegistrationSlots` component to homepage
3. ✅ Test registration flow
4. ✅ Set up admin confirmation workflow
5. ✅ Configure email notifications (optional)
6. ✅ Test with multiple users
7. ✅ Monitor slot tracking in production

---

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify RLS policies
3. Test queries in SQL editor
4. Check browser console for errors
5. Ensure real-time subscriptions are enabled

For more details, see:
- `docs/DATABASE_DESIGN.md` - Design rationale
- `docs/muqawamah-enhanced-schema.sql` - Full schema
- `docs/muqawamah-registration-schema.sql` - Original schema

