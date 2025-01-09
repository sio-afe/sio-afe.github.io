// Initialize Supabase client with retries
async function initSupabase(maxRetries = 20, retryDelay = 100) {
    for (let i = 0; i < maxRetries; i++) {
        if (window.supabaseClient) {
            console.log('Supabase client found in window');
            return window.supabaseClient;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    throw new Error(`Supabase client not initialized after ${maxRetries} attempts`);
}

// Get the initialized client
let supabaseClientPromise = initSupabase();

// Export the functions that will wait for initialization
export async function getClient() {
    return await supabaseClientPromise;
}

// Function to ensure client is initialized
export async function ensureInitialized() {
    await supabaseClientPromise;
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

        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }

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

// Auth functions
export async function signIn(email, password) {
    try {
        const client = await getClient();
        
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        if (!data?.user) throw new Error('No user data returned');
        
        return { data, error: null };
    } catch (error) {
        console.error('Error signing in:', error);
        return { data: null, error };
    }
}

export async function signOut() {
    try {
        const client = await getClient();
        const { error } = await client.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error);
        return { error };
    }
}