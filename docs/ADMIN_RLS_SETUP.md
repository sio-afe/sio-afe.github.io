# 🔒 Admin RLS Setup Instructions

## Problem

The admin dashboard is only showing 1 registration instead of all 3 because **Row Level Security (RLS)** policies are blocking access. The Supabase table editor shows all data because it uses the service role key, but the admin panel uses the authenticated user's permissions which respect RLS policies.

## Solution

Run the SQL script to give super admins full access to all tournament data.

---

## 📋 Steps to Fix

### 1. Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the RLS Fix Script

Copy and paste the contents of `docs/fix-admin-rls-policies.sql` into the SQL editor and click **Run**.

Or manually run this:

```sql
-- Create admin check function
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN ('admin@sio-abulfazal.org')
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update team_registrations policy
DROP POLICY IF EXISTS "Admins can view all registrations" ON team_registrations;

CREATE POLICY "Admins can view all registrations"
ON team_registrations
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_super_admin()
);
```

### 3. Verify the Fix

After running the SQL:

1. Refresh your admin dashboard at `/muqawamah/admin/`
2. You should now see:
   - **Total Registrations: 3** (or your actual count)
   - All teams visible in Registrations page
   - All players visible in Players page

---

## 🔐 What This Does

### Creates Admin Check Function

The `is_super_admin()` function checks if the current authenticated user's email matches the super admin list.

### Updates RLS Policies

**Before:**
- Users could only see their own registrations
- Admin couldn't see other teams' data

**After:**
- Users can still see their own registrations
- Super admins can see ALL registrations
- Super admins can manage all tournament data

### Policy Breakdown

| Table | Policy | Effect |
|-------|--------|--------|
| `team_registrations` | Admins can view all | See all registrations |
| `team_registrations` | Admins can update all | Change status, details |
| `team_registrations` | Admins can delete | Remove registrations |
| `team_players` | Admins can view/manage all | See/edit all players |
| `teams` | Public read, admin write | Everyone sees teams, admins manage |
| `matches` | Public read, admin write | Everyone sees fixtures, admins manage |
| `goals` | Public read, admin write | Everyone sees stats, admins manage |

---

## 🧪 Testing

Run this query to check if you're recognized as admin:

```sql
SELECT 
  is_super_admin() as am_i_admin,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as my_email;
```

**Expected Result:**
```
am_i_admin | my_email
-----------|-------------------------
true       | admin@sio-abulfazal.org
```

---

## 🔄 Adding More Admins

To add more super admin emails, update the function:

```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email FROM auth.users 
    WHERE id = auth.uid() 
    AND email IN (
      'admin@sio-abulfazal.org',
      'another-admin@example.com',
      'third-admin@example.com'
    )
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚨 Troubleshooting

### Still Only Seeing 1 Registration?

**Check 1: Are you logged in as the super admin?**
```sql
SELECT email FROM auth.users WHERE id = auth.uid();
```

**Check 2: Is RLS enabled on the table?**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'team_registrations';
```

Should return `rowsecurity = true`. If false:
```sql
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;
```

**Check 3: Do policies exist?**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'team_registrations';
```

Should show the "Admins can view all registrations" policy.

### Clear Browser Cache

After updating policies:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Or open in incognito/private window
3. Log out and log back in

---

## ✅ After Fix Checklist

- [ ] Ran SQL script in Supabase
- [ ] Dashboard shows correct registration count (3)
- [ ] Can view all teams in Registrations page
- [ ] Can view all players in Players page
- [ ] Can change team statuses
- [ ] Can delete registrations (be careful!)
- [ ] Can add teams to tournament
- [ ] Can create fixtures with all teams visible

---

This fix ensures your admin panel has full visibility and control over all tournament data! 🎉

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                