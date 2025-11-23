# Quick Start: Registration Slots System

## ✅ What's Done

1. **RegistrationSlots component** added to 2026 homepage
2. **CSS styles** imported in main.jsx
3. **Build completed** successfully
4. **Safe migration script** created

---

## 🚀 Next Steps (In Order)

### Step 1: Run the Migration Script

Go to your Supabase SQL Editor and run:

```sql
-- File: docs/muqawamah-migration.sql
```

**This script is SAFE to run on existing database!**
- ✅ Won't delete any data
- ✅ Won't break existing tables
- ✅ Adds new features without disruption
- ✅ Uses `IF NOT EXISTS` checks
- ✅ Can be run multiple times safely

### Step 2: Verify the Setup

After running the migration, test these queries:

```sql
-- Check slot configuration
SELECT * FROM tournament_config;
-- Expected: 2 rows (open-age: 12 slots, u17: 12 slots)

-- Check registration slots view
SELECT * FROM registration_slots;
-- Expected: Shows available_slots, registered_teams, etc.

-- Test slot function
SELECT check_slots_available('open-age');
-- Expected: true (if slots available)
```

### Step 3: Test on Homepage

1. **Hard-refresh** your 2026 page (`Ctrl+Shift+R`)
2. You should see:
   - Registration button (existing)
   - **NEW**: Slot tracker cards below it
   - Two cards: "Open Age" and "Under 17"
   - Progress bars showing X/12 teams
   - Real-time updates

### Step 4: Test Registration Flow

1. Register a test team
2. Watch the homepage slot counter decrease
3. Open homepage in another browser tab
4. Register another team
5. Watch BOTH tabs update in real-time! 🎉

---

## 📊 What You'll See on Homepage

```
┌─────────────────────────────────────────┐
│  Muqawama 2026 Registration             │
│  [Register Your Team Button]            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  👥 Registration Status                  │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │  Open Age    │  │  Under 17    │    │
│  │  Available   │  │  Available   │    │
│  │              │  │              │    │
│  │ ████░░░░░░   │  │ ██░░░░░░░░   │    │
│  │ 4/12 teams   │  │ 2/12 teams   │    │
│  │              │  │              │    │
│  │ ✓ 4 Reg      │  │ ✓ 2 Reg      │    │
│  │ ⏰ 8 Left    │  │ ⏰ 10 Left   │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🎨 Features

### Slot Cards
- ✅ Real-time counter (updates instantly)
- ✅ Progress bar with animation
- ✅ Color-coded status:
  - 🟢 Green: >50% slots available
  - 🟠 Orange: 25-50% slots available
  - 🔴 Red: <25% slots or full
- ✅ Shows registered vs remaining teams
- ✅ Beautiful gradient design
- ✅ Responsive (mobile-friendly)

### Automatic Features
- ✅ Blocks registration when category is full
- ✅ Real-time updates via Supabase subscriptions
- ✅ No page refresh needed
- ✅ Works across multiple browser tabs

---

## 🔧 Troubleshooting

### "Cannot read property 'total_slots' of undefined"

**Problem**: View not created yet
**Solution**: Run the migration script in Supabase

### Slots showing 0/0

**Problem**: tournament_config not initialized
**Solution**: Run this in Supabase:

```sql
INSERT INTO tournament_config (category, total_slots, registration_open)
VALUES 
  ('open-age', 12, true),
  ('u17', 12, true)
ON CONFLICT (category) DO NOTHING;
```

### Slots not updating in real-time

**Problem**: Supabase Realtime not enabled
**Solution**:
1. Go to Supabase Dashboard
2. Database → Replication
3. Enable replication for `team_registrations` table

### Component not showing on homepage

**Problem**: Build or import issue
**Solution**:
1. Check browser console for errors
2. Verify `RegistrationSlots.css` is imported
3. Hard-refresh (`Ctrl+Shift+R`)
4. Check if component is in AboutSection.jsx

---

## 📝 Database Schema Summary

### What the Migration Adds:

1. **tournament_config table**
   - Stores slot configuration (12 per category)
   - Registration open/closed status
   - Deadline dates

2. **registration_slots view**
   - Real-time calculation of available slots
   - Fill percentage
   - Registered team count

3. **Functions**
   - `check_slots_available()` - Check if category has slots
   - `get_registration_stats()` - Get full stats
   - `confirm_registration_to_tournament()` - Promote to tournament

4. **Triggers**
   - Automatic slot enforcement
   - Prevents overbooking
   - Updates timestamps

5. **Indexes**
   - Fast queries on category + status
   - Optimized for slot counting

---

## 🎯 Admin Actions

### View All Registrations
```sql
SELECT 
  team_name, 
  category, 
  captain_name, 
  captain_email,
  status, 
  submitted_at 
FROM team_registrations 
ORDER BY submitted_at DESC;
```

### Confirm a Registration
```sql
SELECT confirm_registration_to_tournament('registration-uuid-here');
```

### Close Registration for Category
```sql
UPDATE tournament_config 
SET registration_open = false 
WHERE category = 'open-age';
```

### Change Slot Count
```sql
UPDATE tournament_config 
SET total_slots = 16 
WHERE category = 'u17';
```

---

## ✅ Checklist

- [ ] Run migration script in Supabase
- [ ] Verify tournament_config has 2 rows
- [ ] Test registration_slots view
- [ ] Hard-refresh homepage
- [ ] See slot tracker cards
- [ ] Register a test team
- [ ] Watch counter decrease
- [ ] Test in multiple browser tabs
- [ ] Verify real-time updates work

---

## 📚 Related Files

- `docs/muqawamah-migration.sql` - Safe migration script ⭐ RUN THIS FIRST
- `docs/muqawamah-enhanced-schema.sql` - Full schema (alternative)
- `docs/DATABASE_DESIGN.md` - Design explanation
- `docs/SETUP_REGISTRATION_SLOTS.md` - Detailed setup guide
- `src/components/shared/RegistrationSlots.jsx` - React component
- `src/styles/RegistrationSlots.css` - Component styles

---

## 🎉 You're Ready!

Just run the migration script and hard-refresh your homepage. The slot tracker will appear automatically with real-time updates! 🚀

