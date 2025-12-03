# Clear Statistics Feature

## Overview
Added comprehensive functionality to clear tournament statistics from the admin panel. Administrators can now clear all statistics or target specific matches to remove their goals and related data.

## Features Added

### 1. Settings Panel - Enhanced Danger Zone

**Location:** `/admin/settings` → Data Management Tab → Danger Zone

#### New Buttons:

##### a) Clear All Statistics
- **What it does:** Deletes ALL goals AND resets ALL team standings in one action
- **Safety:** Double confirmation required
- **Use case:** Complete tournament reset or starting fresh
- **Warning:** This is the most destructive action - use with extreme caution

##### b) Clear Match Statistics
- **What it does:** Opens a modal to select a specific match and delete all its goals
- **Safety:** Single confirmation with goal count display
- **Use case:** Correcting errors in a specific match or re-recording match data
- **Features:**
  - Dropdown list of all matches with date and status
  - Shows match details before deletion
  - Displays count of goals to be deleted

### 2. Goals Manager - Enhanced Filtering

**Location:** `/admin/goals`

#### New Features:

##### Match Filter Section
- **Location:** Below the page header, above the goals table
- **Features:**
  - Dropdown filter to view goals from a specific match
  - Shows goal count for each match in the dropdown
  - Displays filtered count vs total count
  - Updates table dynamically when filter changes

##### Clear Match Goals Button
- **Visibility:** Only appears when a match is filtered
- **What it does:** Bulk delete all goals from the currently filtered match
- **Safety:** Confirmation with goal count
- **Use case:** Quick cleanup of match data without navigating to Settings

## Usage Examples

### Scenario 1: Correcting a Match's Goals
1. Go to **Goals Manager** (`/admin/goals`)
2. Use the **Filter by Match** dropdown to select the match
3. Review the goals displayed
4. Click **Clear Match Goals** button
5. Confirm the deletion
6. Re-record the correct goals using the **Add Goal** button

### Scenario 2: Resetting an Entire Tournament
1. Go to **Settings** (`/admin/settings`)
2. Navigate to **Data Management** tab
3. In the **Danger Zone**, click **Clear All Statistics**
4. Confirm twice (double confirmation required)
5. All goals deleted and all team standings reset to zero

### Scenario 3: Removing Goals from a Specific Match (Alternative Method)
1. Go to **Settings** (`/admin/settings`)
2. Navigate to **Data Management** tab
3. In the **Danger Zone**, click **Clear Match Statistics**
4. Select the match from the dropdown
5. Review match details and goal count
6. Click **Clear Statistics**
7. Confirm the deletion

## Technical Details

### Files Modified

1. **SettingsPanel.jsx**
   - Added state for match selection and modal visibility
   - Added `fetchMatches()` function
   - Added `handleClearAllStatistics()` function
   - Added `handleClearMatchStatistics()` function
   - Added match selection modal UI

2. **GoalsManager.jsx**
   - Added `matchFilter` state
   - Added `clearMatchGoals()` function
   - Added `filteredGoals` computed value
   - Added filter section UI
   - Modified table to use filtered goals

3. **admin-modals.css**
   - Added `.modal-warning` styles for warning boxes
   - Added `.form-select` styles
   - Enhanced `.btn-danger` styles

4. **admin-tables.css**
   - Added `.filter-section` styles
   - Added `.filter-group` styles
   - Added `.btn-danger-outline` styles

### Database Operations

#### Clear All Statistics
```javascript
// Delete all goals
DELETE FROM goals WHERE id != '00000000-0000-0000-0000-000000000000'

// Reset all team standings
UPDATE teams SET 
  played = 0, won = 0, drawn = 0, lost = 0,
  goals_for = 0, goals_against = 0, points = 0
WHERE id != '00000000-0000-0000-0000-000000000000'
```

#### Clear Match Statistics
```javascript
// Delete goals for specific match
DELETE FROM goals WHERE match_id = [selected_match_id]
```

## Safety Features

### Multiple Confirmations
- All destructive actions require explicit confirmation
- "Clear All Statistics" requires **double confirmation**
- Confirmation dialogs show what will be deleted

### Visual Warnings
- Danger Zone section has red/warning color scheme
- Warning icons and colors throughout
- Modal warnings for destructive actions

### Goal Count Display
- Shows how many goals will be deleted
- Helps admins make informed decisions

## Recommendations

### When to Use Each Feature

1. **Clear All Statistics**
   - Starting a new tournament season
   - Complete data reset needed
   - Testing and development

2. **Clear Match Statistics (Settings)**
   - Need to see all matches in one place
   - Want a structured interface for match selection
   - Clearing multiple matches in sequence

3. **Clear Match Goals (Goals Manager)**
   - Already viewing goals
   - Want immediate feedback
   - Quick corrections during match recording

### Best Practices

1. **Always export data before clearing**
   - Use the Export buttons in Settings before any major deletion
   - Keep backups of goals and standings

2. **Recalculate after clearing**
   - After clearing match goals, go to Utilities
   - Run "Recalculate Team Statistics" to update standings
   - Ensure data consistency

3. **Verify before confirming**
   - Double-check the match name and date
   - Review the goal count
   - Make sure you selected the right match

## Related Features

- **Utilities > Stats Recalculator** - Recalculate standings after manual deletions
- **Settings > Export Data** - Backup before clearing
- **Goals Manager** - Individual goal deletion for surgical corrections

## Future Enhancements (Potential)

- Undo functionality with a time window
- Soft delete with recovery option
- Batch operations for multiple matches
- Filtering by category before clearing
- Export before clear (automatic backup)

## Support

For issues or questions about this feature:
1. Check the confirmation dialogs carefully
2. Export data before destructive operations
3. Use Stats Recalculator after deletions
4. Contact admin support if data recovery needed

---

**Version:** 1.0.0  
**Date Added:** December 2025  
**Last Updated:** December 2025

