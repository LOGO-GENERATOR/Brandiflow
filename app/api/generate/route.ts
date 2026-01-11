import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Constants for limits (could be moved to a config)
const FREE_LIMIT = 5;

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, projectId } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 1. Get User Profile & Usage
        // We need the user's UUID from the 'profiles' table which matches the email or auth ID.
        // Assuming next-auth session.user.id maps to profiles.id or we lookup by email.
        // For this implementation, let's look up profile by email if ID isn't direct.

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, billing_plan')
            .eq('email', session.user.email)
            .single();

        if (profileError || !profile) {
            // Fallback: If creation of profile happens on webhook, it might be missing. 
            // For MVP, return error.
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const { data: usage, error: usageError } = await supabaseAdmin
            .from('usage_tracking')
            .select('logos_generated_count_month')
            .eq('user_id', profile.id)
            .single();

        // Initialize usage if not exists
        let currentUsage = 0;
        if (usage) {
            currentUsage = usage.logos_generated_count_month;
        } else {
            await supabaseAdmin.from('usage_tracking').insert({ user_id: profile.id, logos_generated_count_month: 0 });
        }

        // Check Limits (Simple logic)
        if (profile.billing_plan === 'FREE' && currentUsage >= FREE_LIMIT) {
            return NextResponse.json({ error: 'Free limit reached. Please upgrade.' }, { status: 403 });
        }

        // 2. Call Hyperbolic API
        const response = await fetch('https://api.hyperbolic.xyz/v1/image/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
            },
            body: JSON.stringify({
                model_name: "SDXL1.0-base",
                prompt: prompt,
                height: 1024,
                width: 1024,
                steps: 30,
                cfg_scale: 7.5
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hyperbolic Error:', errorText);
            return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
        }

        const result = await response.json();
        // Assuming result.images[0] is the base64 string
        const base64Image = result.images?.[0];

        if (!base64Image) {
            return NextResponse.json({ error: 'No image returned' }, { status: 500 });
        }

        // 3. Upload to Supabase Storage
        const buffer = Buffer.from(base64Image, 'base64');
        const fileName = `${profile.id}/${Date.now()}-logo.png`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('logos')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (uploadError) {
            console.error('Storage Upload Error:', uploadError);
            return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
        }

        // ... existing upload code ...

        // Get Public URL
        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('logos')
            .getPublicUrl(fileName);

        let finalProjectId = projectId;
        if (!finalProjectId || finalProjectId === '00000000-0000-0000-0000-000000000000') {
            // Find or create default project
            const { data: existingProject } = await supabaseAdmin
                .from('projects')
                .select('id')
                .eq('user_id', profile.id)
                .eq('name', 'Default Project')
                .single();

            if (existingProject) {
                finalProjectId = existingProject.id;
            } else {
                const { data: newProject, error: projectError } = await supabaseAdmin
                    .from('projects')
                    .insert({ user_id: profile.id, name: 'Default Project' })
                    .select('id')
                    .single();

                if (projectError || !newProject) {
                    return NextResponse.json({ error: 'Failed to create default project' }, { status: 500 });
                }
                finalProjectId = newProject.id;
            }
        }

        // 4. Save to Database
        const { data: logoRecord, error: dbError } = await supabaseAdmin
            .from('logos')
            .insert({
                project_id: finalProjectId,
                prompt: prompt,
                image_url: publicUrl,
                storage_path: fileName,
                model_used: 'SDXL1.0-base'
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            return NextResponse.json({ error: 'Failed to record logo' }, { status: 500 });
        }

        // 5. Update Usage
        await supabaseAdmin
            .from('usage_tracking')
            .upsert({
                user_id: profile.id,
                logos_generated_count_month: currentUsage + 1,
                last_reset_date: new Date().toISOString() // Simplification: keeps updating date
            });

        return NextResponse.json({ success: true, logo: logoRecord });

    } catch (error) {
        console.error('Generate Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
