import { getClient } from '../supabase-client.js';


// Start a match
export async function startMatch(matchId) {
    try {
        const supabaseClient = await getClient();

        const { data, error } = await supabaseClient
            .from('matches')
            .update({ status: 'in_progress' })
            .eq('id', matchId)
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error starting match:', error);
        return { data: null, error };
    }
}

// Complete a match
export async function completeMatch(matchId) {
    try {
        const supabaseClient = await getClient();

        const { data, error } = await supabaseClient
            .from('matches')
            .update({ status: 'completed' })
            .eq('id', matchId)
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error completing match:', error);
        return { data: null, error };
    }
}

// Add a match event (goal)
export async function addMatchEvent(matchId, eventData) {
    try {
        const supabaseClient = await getClient();

        // Add goal record
        const { error: goalError } = await supabaseClient
            .from('goals')
            .insert([{
                match_id: matchId,
                team_id: eventData.teamId,
                scorer_name: eventData.playerName,
                assist_name: eventData.assistName || null,
                minute: eventData.minute
            }]);

        if (goalError) throw goalError;

        // Update match score
        const scoreField = eventData.isHome ? 'home_score' : 'away_score';
        const { data: match, error: updateError } = await supabaseClient
            .from('matches')
            .update({ [scoreField]: eventData.newScore })
            .eq('id', matchId)
            .select()
            .single();

        if (updateError) throw updateError;

        return { data: match, error: null };
    } catch (error) {
        console.error('Error adding match event:', error);
        return { data: null, error };
    }
}

// Get match details
export async function getMatchDetails(matchId) {
    try {
        const supabaseClient = await getClient();

        const { data, error } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(id, name, crest_url),
                away_team:teams!matches_away_team_id_fkey(id, name, crest_url)
            `)
            .eq('id', matchId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching match details:', error);
        return { data: null, error };
    }
}

// Get match events (goals)
export async function getMatchEvents(matchId) {
    try {
        const supabaseClient = await getClient();

        const { data, error } = await supabaseClient
            .from('goals')
            .select(`
                *,
                team:teams(name)
            `)
            .eq('match_id', matchId)
            .order('minute');

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error getting match events:', error);
        return { data: null, error };
    }
}

// Subscribe to match updates
export async function subscribeToMatch(matchId, onUpdate) {
    const supabaseClient = await getClient();

    return supabaseClient
        .channel(`match:${matchId}`)
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'matches',
                filter: `id=eq.${matchId}`
            }, 
            onUpdate
        )
        .subscribe();
}

// Subscribe to match events
export async function subscribeToMatchEvents(matchId, onUpdate) {
    const supabaseClient = await getClient();

    return supabaseClient
        .channel(`match_events:${matchId}`)
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'goals',
                filter: `match_id=eq.${matchId}`
            }, 
            onUpdate
        )
        .subscribe();
}

// Add match event (goal)
export async function addMatchEventToDb(matchId, eventData) {
    try {
        const supabaseClient = await getClient();

        // First add the goal
        const { error: goalError } = await supabaseClient
            .from('goals')
            .insert([{
                match_id: matchId,
                team_id: eventData.teamId,
                scorer_name: eventData.playerName,
                assist_name: eventData.assistName || null,
                minute: eventData.minute
            }]);

        if (goalError) throw goalError;

        // Then update the match score and get the updated match with team info
        const { data: match, error: matchError } = await supabaseClient
            .from('matches')
            .update({
                home_score: eventData.isHome ? eventData.newScore : undefined,
                away_score: !eventData.isHome ? eventData.newScore : undefined
            })
            .eq('id', matchId)
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(
                    id, name, crest_url, 
                    played, won, drawn, lost, 
                    goals_for, goals_against, points
                ),
                away_team:teams!matches_away_team_id_fkey(
                    id, name, crest_url, 
                    played, won, drawn, lost, 
                    goals_for, goals_against, points
                )
            `)
            .single();

        if (matchError) throw matchError;

        // Get updated team stats
        const client = await getClient();
        const [scorersResult, assistsResult] = await Promise.all([
            client.rpc('get_top_scorers', { category_param: match.category }),
            client.rpc('get_top_assists', { category_param: match.category })
        ]);

        return { data: match, error: null };
    } catch (error) {
        console.error('Error adding match event:', error);
        return { data: null, error };
    }
} 