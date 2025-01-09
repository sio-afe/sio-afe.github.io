export let supabaseClient = null;

// Export the async getter function
export async function getClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    throw new Error('Supabase client not initialized');
}

// Function to ensure client is initialized
export async function ensureInitialized() {
    return await getClient();
}

// Function to check if user is admin
export async function isAdmin() {
    try {
        const client = await getClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) return false;

        const { data, error } = await client
            .from('admin_users')
            .select('role')
            .eq('email', user.email)
            .maybeSingle();

        if (error) throw error;
        return data?.role === 'admin' || data?.role === 'super_admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Function to get teams
export async function getTeams(category) {
    try {
        const client = await getClient();
        const { data, error } = await client
            .from('teams')
            .select('*')
            .eq('category', category)
            .order('points', { ascending: false });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching teams:', error);
        return { data: null, error };
    }
}

// Function to get matches
export async function getMatches(category) {
    try {
        const client = await getClient();
        const { data, error } = await client
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(*),
                away_team:teams!matches_away_team_id_fkey(*)
            `)
            .eq('category', category)
            .order('match_date', { ascending: true });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching matches:', error);
        return { data: null, error };
    }
}

// Function to get match goals
export async function getMatchGoals(matchId) {
    try {
        const client = await getClient();
        const { data, error } = await client
            .from('goals')
            .select('*')
            .eq('match_id', matchId)
            .order('minute', { ascending: true });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching goals:', error);
        return { data: null, error };
    }
}

// Function to get top scorers
export async function getTopScorers(category) {
    try {
        const client = await getClient();
        const { data, error } = await client
            .rpc('get_top_scorers', { category_param: category });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching top scorers:', error);
        return { data: null, error };
    }
}

// Export auth-related functions
export async function signIn(email, password) {
    const client = await getClient();
    return client.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    const client = await getClient();
    return client.auth.signOut();
}

// State management
const state = {
    currentData: null,
    subscribers: new Set(),
};

// Subscribe to real-time changes
function subscribeToChannel(channel, callback) {
    const subscription = window.supabaseClient
        .channel(channel)
        .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
            state.currentData = payload.new;
            notifySubscribers();
            if (callback) callback(payload);
        })
        .subscribe();
    
    return subscription;
}

// State management methods
function notifySubscribers() {
    state.subscribers.forEach(callback => callback(state.currentData));
}

function subscribe(callback) {
    state.subscribers.add(callback);
    return () => state.subscribers.delete(callback);
}

// Export methods
window.dynamicClient = {
    subscribeToChannel,
    subscribe,
    state
};

export default supabaseClient;