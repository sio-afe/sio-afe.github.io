-- ============================================
-- FIX MATCH LIKES UNIQUE CONSTRAINT
-- ============================================
-- This fixes the 409 Conflict error by removing the unique constraint
-- that prevents multiple likes from the same user

-- First, check if the constraint exists and drop it
DO $$ 
BEGIN
    -- Drop the unique constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'match_likes_match_id_user_identifier_key'
    ) THEN
        ALTER TABLE public.match_likes 
        DROP CONSTRAINT match_likes_match_id_user_identifier_key;
        RAISE NOTICE 'Dropped unique constraint: match_likes_match_id_user_identifier_key';
    END IF;
    
    -- Also check for any other unique constraints on these columns
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname LIKE '%match_likes%unique%'
    ) THEN
        -- Get constraint name dynamically
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT conname INTO constraint_name
            FROM pg_constraint
            WHERE conrelid = 'public.match_likes'::regclass
            AND contype = 'u'
            AND array_length(conkey, 1) = 2
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE format('ALTER TABLE public.match_likes DROP CONSTRAINT %I', constraint_name);
                RAISE NOTICE 'Dropped unique constraint: %', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- Verify the constraint is removed
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.match_likes'::regclass
AND contype = 'u';

-- Note: After running this, users can like the same match multiple times
-- Each like will be a separate record in the database

