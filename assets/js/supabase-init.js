// Initialize Supabase client
const supabaseUrl = 'https://efirvmzdioizosdcnasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaXJ2bXpkaW9pem9zZGNuYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTk4MTAsImV4cCI6MjA1MTkzNTgxMH0.uckyGkQeUm6e5SvOu3BC_zdrzUVcLr2e9ItlaUuKFCg';

// Initialize Supabase immediately when this script loads
const initSupabase = async () => {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempting to initialize Supabase (attempt ${attempts}/${maxAttempts})...`);

        if (typeof supabase === 'undefined') {
            console.log('Supabase not loaded yet, retrying in 500ms...');
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
        }

        try {
            window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
            console.log('Supabase client initialized successfully');
            return window.supabaseClient;
        } catch (error) {
            console.error('Error creating Supabase client:', error);
            if (attempts === maxAttempts) throw error;
        }
    }
    throw new Error('Failed to load Supabase after multiple attempts');
};

// Create a promise that resolves when Supabase is ready
window.supabaseReady = initSupabase();

// Export a function to wait for Supabase initialization
window.waitForSupabase = () => window.supabaseReady;

// Export the client for modules that need direct access
export default window.supabaseReady; 