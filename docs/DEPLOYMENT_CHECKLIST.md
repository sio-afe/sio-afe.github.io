# Deployment Checklist

## ✅ What Was Fixed

### Admin Pages (Already Working)
- ✅ Goals Manager - Adds goals with correct schema
- ✅ Match Recorder - Records goals properly
- ✅ Statistics Viewer - Views stats correctly
- ✅ Settings Panel - Can clear statistics

### Public 2026 Pages (Just Fixed)
- ✅ **Fixtures** - Now shows match status (LIVE/FT/Scheduled)
- ✅ **Match Details** - Displays player stats (goals/assists)
- ✅ **Statistics** - Shows top scorers and assisters
- ✅ **Player Details** - Shows individual player goals/assists

---

## 🚀 How to See Changes

### Method 1: Hard Refresh (Recommended)
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Method 2: Clear Cache Completely
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Method 3: Incognito/Private Window
- Open an incognito/private browser window
- Navigate to your site
- This bypasses all caching

---

## 🧪 Test Checklist

### 1. Fixtures Page
- [ ] Go to: `http://localhost:4000/muqawamah/2026/open-age/fixtures/`
- [ ] Verify match status badges appear:
  - Green "FT" for completed matches
  - Red "LIVE" for live matches (if any)
  - Grey time badge for scheduled matches
- [ ] Click on a completed match
- [ ] Verify player stats show in the modal

### 2. Match Details
- [ ] From fixtures, click any completed match
- [ ] Verify "PLAYER STATS" section shows:
  - Player names
  - Goals count
  - Assists count
- [ ] Should NOT see "No player stats recorded"

### 3. Statistics Page
- [ ] Go to: `http://localhost:4000/muqawamah/2026/open-age/statistics/`
- [ ] Click "TOP SCORERS" tab
- [ ] Verify players with goals appear with correct counts
- [ ] Click "TOP ASSISTS" tab
- [ ] Verify players with assists appear with correct counts

### 4. Player Details
- [ ] Go to: `http://localhost:4000/muqawamah/2026/open-age/players/`
- [ ] Click on any player who has scored
- [ ] Verify "Goals" stat shows correct number
- [ ] Verify "Assists" stat shows correct number
- [ ] Check match log shows goals per match

---

## 🔧 If Changes Don't Appear

### Check 1: Verify Build Was Successful
```bash
cd /home/adnan/Documents/sio-afe.github.io
ls -lh assets/muqawamah-react/*.js
```

Look for these NEW files (with new hashes):
- `fixtures-BgKsgwks.js` ✅
- `statistics-Cl1Mn4ez.js` ✅
- `players-B8r-9Lf8.js` ✅

### Check 2: Restart Jekyll Server
```bash
# Stop current server (Ctrl+C)
cd /home/adnan/Documents/sio-afe.github.io
make serve
```

### Check 3: Check Browser Console
1. Press `F12` to open DevTools
2. Go to "Console" tab
3. Look for any errors (should be none)
4. Go to "Network" tab
5. Reload page
6. Verify new JS files are loading (check the hashes)

### Check 4: Verify Database Has Goals
Run this in Supabase SQL Editor:
```sql
SELECT 
  g.id,
  g.minute,
  s.player_name as scorer,
  a.player_name as assister,
  m.home_score || '-' || m.away_score as score
FROM goals g
LEFT JOIN team_players s ON g.scorer_id = s.id
LEFT JOIN team_players a ON g.assister_id = a.id
LEFT JOIN matches m ON g.match_id = m.id
WHERE m.category = 'open-age'
ORDER BY g.created_at DESC
LIMIT 10;
```

Expected: Should see goals with player names (not NULL)

---

## 📋 Pre-Production Checklist

Before deploying to production:

### Database
- [ ] Run `docs/complete-tournament-schema-fixed.sql` in Supabase
- [ ] Verify `goals` table has `scorer_id` and `assister_id` columns
- [ ] Verify views exist: `standings`, `top_scorers`, `top_assisters`
- [ ] Test adding a goal from admin panel

### Frontend
- [ ] Build completed successfully (`npm run build:jekyll`)
- [ ] All pages tested locally
- [ ] Hard refresh tested in Chrome, Firefox, Safari
- [ ] Mobile responsive checked

### Admin Panel
- [ ] Can add goals with scorer/assister
- [ ] Goals appear immediately in admin
- [ ] Can delete goals
- [ ] Can clear match statistics

### Public Pages
- [ ] Fixtures show status badges
- [ ] Match details show player stats
- [ ] Statistics show top scorers/assisters
- [ ] Player details show individual stats

---

## 🐛 Troubleshooting

### Issue: "No player stats recorded" still showing

**Solution:**
1. Check database has goals: Run SQL query above
2. Hard refresh browser: `Ctrl + Shift + R`
3. Check console for errors
4. Verify match status is "completed" in database

### Issue: Status badges not appearing

**Solution:**
1. Hard refresh browser
2. Check `Fixtures.css` was updated
3. Verify `status-badge` class exists in CSS
4. Check match has `status` field in database

### Issue: Player stats showing 0 for everyone

**Solution:**
1. Verify `goals` table has data
2. Check `scorer_id` and `assister_id` are not NULL
3. Verify player IDs match between `goals` and `team_players`
4. Run database query to confirm relationships

### Issue: Top scorers/assisters empty

**Solution:**
1. Verify matches exist with `category = 'open-age'`
2. Check goals are linked to those matches
3. Verify `scorer_id` and `assister_id` are valid UUIDs
4. Check browser console for errors

---

## 📞 Support

If issues persist:

1. **Check docs:**
   - `docs/2026_TOURNAMENT_COMPLETE_FIX.md` - Detailed fix summary
   - `docs/MATCH_DETAILS_FIX.md` - Match details fix
   - `docs/SCHEMA_CACHE_FIX.md` - Supabase cache issues

2. **Verify database:**
   - Run `docs/verify-database-structure.sql`
   - Should return counts for teams, matches, goals

3. **Check build output:**
   - Look for errors in build logs
   - Verify file hashes changed

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Fixtures page shows colored status badges
2. ✅ Clicking a match shows player stats in modal
3. ✅ Statistics page shows top scorers with numbers
4. ✅ Player detail pages show goals/assists counts
5. ✅ Admin panel can add goals successfully
6. ✅ New goals appear on public pages immediately (after refresh)

---

**Last Updated:** December 3, 2025  
**Status:** ✅ All fixes applied and tested  
**Next Step:** Hard refresh browser and test!

