// Initialize Supabase client
const supabaseUrl = 'https://efirvmzdioizosdcnasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaXJ2bXpkaW9pem9zZGNuYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTk4MTAsImV4cCI6MjA1MTkzNTgxMH0.uckyGkQeUm6e5SvOu3BC_zdrzUVcLr2e9ItlaUuKFCg';

// Create a promise that resolves when Supabase is ready
(function() {
    window.supabaseReady = new Promise((resolve, reject) => {
        const maxAttempts = 10;
        let attempts = 0;

        const initSupabase = () => {
            attempts++;
            console.log(`Attempting to initialize Supabase (attempt ${attempts}/${maxAttempts})...`);

            // Check if supabase is loaded
            if (typeof supabase === 'undefined') {
                if (attempts < maxAttempts) {
                    console.log('Supabase not loaded yet, retrying in 500ms...');
                    setTimeout(initSupabase, 500);
                } else {
                    const error = new Error('Failed to load Supabase after multiple attempts');
                    console.error(error);
                    reject(error);
                }
                return;
            }

            try {
                // Create the client
                const client = supabase.createClient(supabaseUrl, supabaseAnonKey);
                
                // Test the client with a simple query
                client.from('teams').select('count', { count: 'exact', head: true })
                    .then(() => {
                        console.log('Supabase client initialized and tested successfully');
                        window.supabaseClient = client;
                        resolve(client);
                    })
                    .catch(error => {
                        console.error('Error testing Supabase client:', error);
                        reject(error);
                    });
            } catch (error) {
                console.error('Error creating Supabase client:', error);
                reject(error);
            }
        };

        // Start initialization process
        initSupabase();
    });

    // Export a function to wait for Supabase initialization
    window.waitForSupabase = () => window.supabaseReady;
})(); 