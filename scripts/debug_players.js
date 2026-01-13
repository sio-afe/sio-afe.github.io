const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://uzieoxfqkglcoistswxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWVveGZxa2dsY29pc3Rzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQwODIsImV4cCI6MjA3OTMyMDA4Mn0.iXOQmg_xIfRJaUI7HACjnCk9JAMcs0X9a770XUP5cb8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
    const targetId = 'c2924024-8adc-4b3f-9723-ef918f72839e';
    console.log(`Checking ID ${targetId} in tables...`);

    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', targetId);
        
    if (team && team.length) {
        console.log('Found in TEAMS table:', team[0]);
    } else {
        console.log('Not found in TEAMS table.');
    }

    const { data: reg, error: regError } = await supabase
        .from('team_registrations')
        .select('id, team_name, tournament_team_id')
        .eq('id', targetId);

    if (reg && reg.length) {
        console.log('Found in TEAM_REGISTRATIONS table:', reg[0]);
    } else {
        console.log('Not found in TEAM_REGISTRATIONS table.');
    }
}

checkData();
