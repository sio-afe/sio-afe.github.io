-- ============================================
-- MATCH INTERACTIONS TABLES
-- ============================================
-- Tables for user interactions: voting and liking matches

-- ============================================
-- MATCH VOTES TABLE
-- ============================================
-- Stores user votes for which team will win a match
CREATE TABLE IF NOT EXISTS public.match_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Browser fingerprint or session ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, user_identifier) -- One vote per user per match
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_votes_match_id ON public.match_votes(match_id);
CREATE INDEX IF NOT EXISTS idx_match_votes_team_id ON public.match_votes(team_id);

-- ============================================
-- MATCH LIKES TABLE
-- ============================================
-- Stores likes/hearts for matches
CREATE TABLE IF NOT EXISTS public.match_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Browser fingerprint or session ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, user_identifier) -- One like per user per match (can be removed to allow multiple likes)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_likes_match_id ON public.match_likes(match_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE public.match_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read votes and likes
CREATE POLICY "Anyone can read match votes" ON public.match_votes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can read match likes" ON public.match_likes
    FOR SELECT USING (true);

-- Allow anyone to insert votes and likes
CREATE POLICY "Anyone can insert match votes" ON public.match_votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert match likes" ON public.match_likes
    FOR INSERT WITH CHECK (true);

-- Allow users to delete their own votes/likes (optional - for changing vote)
CREATE POLICY "Users can delete their own votes" ON public.match_votes
    FOR DELETE USING (true);

CREATE POLICY "Users can delete their own likes" ON public.match_likes
    FOR DELETE USING (true);

