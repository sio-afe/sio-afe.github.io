// Initialize Supabase client
const supabaseUrl = 'https://efirvmzdioizosdcnasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaXJ2bXpkaW9pem9zZGNuYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTk4MTAsImV4cCI6MjA1MTkzNTgxMH0.uckyGkQeUm6e5SvOu3BC_zdrzUVcLr2e9ItlaUuKFCg';

window.supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey); 