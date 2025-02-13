// Initialize Supabase client
const supabaseUrl = 'https://efirvmzdioizosdcnasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaXJ2bXpkaW9pem9zZGNuYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTk4MTAsImV4cCI6MjA1MTkzNTgxMH0.uckyGkQeUm6e5SvOu3BC_zdrzUVcLr2e9ItlaUuKFCg';

let client = null;

export async function initSupabase() {
    if (client) return client;

    try {
        // Wait for Supabase to be available
        let attempts = 0;
        while (typeof supabase === 'undefined' && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }
        
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase library not loaded');
        }
        
        // Create client
        client = supabase.createClient(supabaseUrl, supabaseAnonKey);
        console.log('Supabase client initialized successfully');
        return client;
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        throw error;
    }
}

// Initialize immediately and export the promise
export const supabaseReady = initSupabase(); 