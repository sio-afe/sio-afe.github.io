import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzieoxfqkglcoistswxq.supabase.co';
// This is the anon/public key - get from Supabase Dashboard > Settings > API
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWVveGZxa2dsY29pc3Rzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQwODIsImV4cCI6MjA3OTMyMDA4Mn0.iXOQmg_xIfRJaUI7HACjnCk9JAMcs0X9a770XUP5cb8';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Create client configuration
const clientOptions = {
  auth: {
    persistSession: isBrowser,
    detectSessionInUrl: isBrowser,
    autoRefreshToken: isBrowser,
    storage: isBrowser ? window.localStorage : undefined
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'muqawama-2026'
    }
  }
};

// Export the client - initialized immediately
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

