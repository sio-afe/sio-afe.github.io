-- ============================================
-- FIX GOALS TABLE SCHEMA
-- Changes goals table from using text names to player IDs
-- This matches what the admin panel React code expects
-- ============================================

-- Step 1: Create a backup of existing goals (if any)
CREATE TABLE IF NOT EXISTS goals_backup AS 
SELECT * FROM goals;

-- Step 2: Drop the old goals table
DROP TABLE IF EXISTS goals CASCADE;

-- Step 3: Create the new goals table with proper foreign keys
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    scorer_id UUID NOT NULL REFERENCES team_players(id) ON DELETE CASCADE,
    assister_id UUID REFERENCES team_players(id) ON DELETE SET NULL,
    minute INTEGER CHECK (minute >= 0 AND minute <= 120),
    goal_type TEXT DEFAULT 'open_play' CHECK (goal_type IN ('open_play', 'penalty', 'free_kick', 'header', 'own_goal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_goals_match_id ON goals(match_id);
CREATE INDEX idx_goals_team_id ON goals(team_id);
CREATE INDEX idx_goals_scorer_id ON goals(scorer_id);
CREATE INDEX idx_goals_assister_id ON goals(assister_id);

-- Step 5: Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
-- Allow public to view goals
CREATE POLICY "Goals are viewable by everyone"
    ON goals FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to manage goals
CREATE POLICY "Goals are manageable by authenticated users"
    ON goals FOR ALL
    USING (auth.role() = 'authenticated');

-- Step 7: Create trigger to update timestamps
CREATE OR REPLACE FUNCTION update_goals_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_updated_at_trigger
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_goals_timestamp();

-- ============================================
-- VERIFY THE NEW STRUCTURE
-- ============================================

-- Check the new table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Show foreign key relationships
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'goals';

-- ============================================
-- NOTES
-- ============================================

-- This migration will:
-- ✅ Create proper foreign key relationships between goals and team_players
-- ✅ Add goal_type field for different goal types
-- ✅ Add proper constraints and indexes
-- ✅ Enable RLS for security
-- ✅ Match what the admin React code expects

-- After running this:
-- 1. The Goals Manager page will work correctly
-- 2. Statistics page will show top scorers/assisters
-- 3. You can record goals with proper player references
-- 4. All admin features will function as expected

-- ⚠️ WARNING: This will delete existing goal data!
-- If you have important goals recorded, you'll need to manually migrate them
-- from goals_backup table using a custom script that maps names to player IDs.


