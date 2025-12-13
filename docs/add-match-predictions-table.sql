-- ============================================
-- MATCH PREDICTIONS TABLE
-- ============================================
-- Stores user predictions for match outcomes (home win, draw, away win)

CREATE TABLE IF NOT EXISTS public.match_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Browser fingerprint or session ID
    prediction TEXT NOT NULL CHECK (prediction IN ('home', 'draw', 'away')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, user_identifier) -- One prediction per user per match
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_match_predictions_match_id ON public.match_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_match_predictions_prediction ON public.match_predictions(prediction);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read predictions
CREATE POLICY "Anyone can read match predictions" ON public.match_predictions
    FOR SELECT USING (true);

-- Allow anyone to insert predictions
CREATE POLICY "Anyone can insert match predictions" ON public.match_predictions
    FOR INSERT WITH CHECK (true);

-- Allow anyone to update their own predictions
CREATE POLICY "Anyone can update match predictions" ON public.match_predictions
    FOR UPDATE USING (true);

-- Allow anyone to delete their own predictions
CREATE POLICY "Anyone can delete match predictions" ON public.match_predictions
    FOR DELETE USING (true);

