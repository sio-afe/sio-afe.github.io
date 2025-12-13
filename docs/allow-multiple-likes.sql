-- ============================================
-- ALLOW MULTIPLE LIKES PER USER
-- ============================================
-- Remove unique constraint to allow users to like multiple times

-- Drop the unique constraint if it exists
ALTER TABLE public.match_likes 
DROP CONSTRAINT IF EXISTS match_likes_match_id_user_identifier_key;

-- Note: Users can now like the same match multiple times
-- Each like will be a separate record in the database

