
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectData() {
    console.log('--- INSPECTING DATABASE ---');

    // 1. Check Profiles
    const { data: profiles, error: errProfile } = await supabase.from('profiles').select('*');
    if (errProfile) console.error('Profiles Error:', errProfile);
    console.log(`\nProfiles (${profiles?.length || 0}):`);
    profiles?.forEach(p => console.log(` - ID: ${p.id} | Email: ${p.email} | Role: ${p.role}`));

    // 2. Check Projects
    const { data: projects, error: errProject } = await supabase.from('projects').select('*');
    if (errProject) console.error('Projects Error:', errProject);
    console.log(`\nProjects (${projects?.length || 0}):`);
    projects?.forEach(p => console.log(` - ID: ${p.id} | UserID: ${p.user_id} | Name: ${p.name}`));

    // 3. Check Logos
    const { data: logos, error: errLogo } = await supabase.from('logos').select('*');
    if (errLogo) console.error('Logos Error:', errLogo);
    console.log(`\nLogos (${logos?.length || 0}):`);
    logos?.forEach(l => console.log(` - ID: ${l.id} | ProjID: ${l.project_id} | URL: ${l.image_url?.substring(0, 30)}...`));

    // 4. Check Auth Users (Requires admin API usually, but we can try verifying by email match if profile id matches)
    console.log('\n--- VERIFICATION ---');
    if (profiles && projects) {
        profiles.forEach(profile => {
            const userProjects = projects.filter(p => p.user_id === profile.id);
            console.log(`User ${profile.email} owns ${userProjects.length} projects.`);
        });
    }
}

inspectData();
