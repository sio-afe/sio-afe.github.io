// Get the initialized Supabase client
let supabaseClient = null;

// Initialize Supabase client with retries
async function initSupabase(maxRetries = 10, retryDelay = 100) {
    let retries = 0;
    
    while (retries < maxRetries) {
        if (window.supabaseClient) {
            supabaseClient = window.supabaseClient;
            console.log('Supabase client initialized from window');
            return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retries++;
    }
    
    console.error(`Supabase client not initialized after ${maxRetries} attempts`);
    return false;
}

// Initialize when the script loads
initSupabase();

// Also try to initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => initSupabase());

// Export the initialized client and functions
export { supabaseClient };

// Function to ensure client is initialized
export async function ensureInitialized() {
    return new Promise((resolve) => {
        const check = async () => {
            if (await initSupabase()) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}

// Function to check if user is admin
export async function isAdmin() {
    try {
        await ensureInitialized();
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('role')
            .eq('email', user.email)
            .maybeSingle();

        if (error) {
            console.error('Error checking admin status:', error);
            return false;
        }

        // Return true for both admin and super_admin roles
        return data?.role === 'admin' || data?.role === 'super_admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Function to get teams
export async function getTeams(category) {
    try {
        await ensureInitialized();
        const { data, error } = await supabaseClient
            .from('teams')
            .select('*')
            .eq('category', category)
            .order('points', { ascending: false });
        
        if (error) throw error;
        return { data, error };
    } catch (error) {
        console.error('Error fetching teams:', error);
        throw error;
    }
}

// Function to get matches
export async function getMatches(category) {
    try {
        await ensureInitialized();
        const { data, error } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(*),
                away_team:teams!matches_away_team_id_fkey(*)
            `)
            .eq('category', category)
            .order('match_date', { ascending: true });
        
        if (error) throw error;
        return { data, error };
    } catch (error) {
        console.error('Error fetching matches:', error);
        throw error;
    }
}

// Function to get match goals
export async function getMatchGoals(matchId) {
    try {
        await ensureInitialized();
        const { data, error } = await supabaseClient
            .from('goals')
            .select('*')
            .eq('match_id', matchId)
            .order('minute', { ascending: true });
        
        if (error) throw error;
        return { data, error };
    } catch (error) {
        console.error('Error fetching goals:', error);
        throw error;
    }
}

// Function to get top scorers
export async function getTopScorers(category) {
    try {
        await ensureInitialized();
        const { data, error } = await supabaseClient
            .rpc('get_top_scorers', { category_param: category });
        
        if (error) throw error;
        return { data, error };
    } catch (error) {
        console.error('Error fetching top scorers:', error);
        throw error;
    }
}

// Auth functions
export async function signIn(email, password) {
    try {
        await ensureInitialized();
        
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw new Error(error.message || 'Failed to sign in');
        }

        if (!data?.user) {
            throw new Error('No user data returned');
        }
        console.log('Sign in successful:', data);
        return data;
    } catch (error) {
        throw error;
    }
}

export async function signOut() {
    try {
        await ensureInitialized();
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}