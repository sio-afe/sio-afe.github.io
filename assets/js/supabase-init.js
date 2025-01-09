// Initialize Supabase client
const supabaseUrl = 'https://efirvmzdioizosdcnasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaXJ2bXpkaW9pem9zZGNuYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTk4MTAsImV4cCI6MjA1MTkzNTgxMH0.uckyGkQeUm6e5SvOu3BC_zdrzUVcLr2e9ItlaUuKFCg';

// Create a promise that resolves when Supabase is ready
window.supabaseReady = new Promise((resolve, reject) => {
    // Check if Supabase is already loaded
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase client initialized immediately');
        resolve(window.supabaseClient);
    } else {
        // If not loaded, wait for it
        const maxAttempts = 10;
        let attempts = 0;

        const checkSupabase = () => {
            attempts++;
            if (typeof supabase !== 'undefined') {
                window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
                console.log('Supabase client initialized after waiting');
                resolve(window.supabaseClient);
            } else if (attempts < maxAttempts) {
                setTimeout(checkSupabase, 500); // Try again in 500ms
            } else {
                const error = new Error('Supabase failed to load after multiple attempts');
                console.error(error);
                reject(error);
            }
        };

        // Start checking
        checkSupabase();
    }
});

// Export a function to wait for Supabase initialization
window.waitForSupabase = () => window.supabaseReady; 