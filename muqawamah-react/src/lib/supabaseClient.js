import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzieoxfqkglcoistswxq.supabase.co';
// This is the anon/public key - get from Supabase Dashboard > Settings > API
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWVveGZxa2dsY29pc3Rzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQwODIsImV4cCI6MjA3OTMyMDA4Mn0.iXOQmg_xIfRJaUI7HACjnCk9JAMcs0X9a770XUP5cb8';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'muqawama-2026'
    }
  }
});

