// Get the initialized Supabase client
const supabaseClient = window.supabaseClient;

// Ensure client is initialized
if (!supabaseClient) {
    console.error('Supabase client not initialized');
}

// Export the initialized client and functions
export { supabaseClient };

// Function to check if user is admin
export async function isAdmin() {
    try {
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

// New function to check if user is super admin
export async function isSuperAdmin() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabaseClient
            .from('admin_users')
            .select('role')
            .eq('email', user.email)
            .maybeSingle();

        if (error) {
            console.error('Error checking super admin status:', error);
            return false;
        }

        return data?.role === 'super_admin';
    } catch (error) {
        console.error('Error checking super admin status:', error);
        return false;
    }
}
// Function to get teams
export async function getTeams(category) {
    try {
        const { data, error } = await supabaseClient
            .from('teams')
            .select('*')
            .eq('category', category)
            .order('points', { ascending: false })
        
        if (error) throw error
        return { data, error }
    } catch (error) {
        console.error('Error fetching teams:', error)
        throw error
    }
}

// Function to get matches
export async function getMatches(category) {
    try {
        const { data, error } = await supabaseClient
            .from('matches')
            .select(`
                *,
                home_team:teams!matches_home_team_id_fkey(*),
                away_team:teams!matches_away_team_id_fkey(*)
            `)
            .eq('category', category)
            .order('match_date', { ascending: true })
        
        if (error) throw error
        return { data, error }
    } catch (error) {
        console.error('Error fetching matches:', error)
        throw error
    }
}

// Function to get match goals
export async function getMatchGoals(matchId) {
    try {
        const { data, error } = await supabaseClient
            .from('goals')
            .select('*')
            .eq('match_id', matchId)
            .order('minute', { ascending: true })
        
        if (error) throw error
        return { data, error }
    } catch (error) {
        console.error('Error fetching goals:', error)
        throw error
    }
}

// Function to get top scorers
export async function getTopScorers(category) {
    try {
        const { data, error } = await supabaseClient
            .rpc('get_top_scorers', { category_param: category })
        
        if (error) throw error
        return { data, error }
    } catch (error) {
        console.error('Error fetching top scorers:', error)
        throw error
    }
}

// Auth functions
export async function signIn(email, password) {
    try {
        
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