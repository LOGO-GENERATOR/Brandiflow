import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Constants for limits
const PLAN_LIMITS = {
    FREE: 5,
    STARTER: 50,
    PRO: 500,
    BUSINESS: 5000
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const prompt = body.prompt;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // 1. Get or Create Profile
        let { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, billing_plan, role')
            .eq('email', session.user.email)
            .single();

        if (!profile) {
            console.log("Profile missing, creating fallback...");
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: (session.user as any).id,
                    email: session.user.email,
                    full_name: session.user.name,
                    avatar_url: session.user.image,
                    role: 'user',
                    billing_plan: 'FREE'
                })
                .select()
                .single();

            if (createError || !newProfile) {
                return NextResponse.json({ error: 'Profile sync failed' }, { status: 500 });
            }
            profile = newProfile;
        }

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found and creation failed' }, { status: 500 });
        }

        const role = profile.role || 'user';
        const plan = profile.billing_plan || 'FREE';
        const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.FREE;

        // 2. Check Usage
        const { data: usage } = await supabaseAdmin
            .from('usage_tracking')
            .select('logos_generated_count_month')
            .eq('user_id', profile.id)
            .single();

        const currentUsage = usage?.logos_generated_count_month || 0;

        // Batch size is 2. Check if user has enough credits (needs 2 credits? or counts as 1 generation event?)
        // Let's count them as N logos.
        const BATCH_SIZE = 2;

        if (role !== 'admin' && (currentUsage + BATCH_SIZE) > limit) {
            return NextResponse.json({
                error: `Limit reached. You need ${BATCH_SIZE} credits but have ${limit - currentUsage} left.`,
                limit,
                currentUsage
            }, { status: 403 });
        }

        // 3. Prepare Parallel Calls
        if (!process.env.HYPERBOLIC_API_KEY) {
            throw new Error("Missing Hyperbolic API Key");
        }

        const generateVariant = async (index: number) => {
            // Slight variation in seed or just prompt noise could be useful, but SDXL is non-deterministic enough usually.
            // We can add "Variant X" to prompt or just rely on random seed.
            const response = await fetch('https://api.hyperbolic.xyz/v1/image/generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
                },
                body: JSON.stringify({
                    model_name: 'SDXL1.0-base',
                    prompt: `${prompt}, isolated on white background, vector style, minimal, clean edges`,
                    negative_prompt: "complex background, busy, text, watermark, signature, blurry, low quality, gradient background, realistic photo",
                    steps: 30,
                    cfg_scale: 7,
                    width: 1024,
                    height: 1024,
                    backend: 'auto',
                }),
            });

            if (!response.ok) throw new Error(`Hyperbolic API Failed: ${response.statusText}`);
            const json = await response.json();
            return json.images[0]; // Assuming 1 image per request
        };

        // Execute batch
        console.log(`Generating batch of ${BATCH_SIZE} logos...`);
        const imageResults = await Promise.all([
            generateVariant(0),
            generateVariant(1)
        ]);

        // 4. Process Results & Save
        const logoRecords = [];

        // Determine Project ID once
        let finalProjectId = body.projectId;
        if (!finalProjectId || finalProjectId === '00000000-0000-0000-0000-000000000000') {
            const { data: defaultProject } = await supabaseAdmin
                .from('projects')
                .select('id')
                .eq('user_id', profile.id)
                .eq('name', 'Default Project')
                .single();

            if (defaultProject) {
                finalProjectId = defaultProject.id;
            } else {
                const { data: newProject } = await supabaseAdmin
                    .from('projects')
                    .insert({ user_id: profile.id, name: 'Default Project' })
                    .select()
                    .single();
                finalProjectId = newProject?.id;
            }
        }

        for (const imgData of imageResults) {
            let base64Image;
            if (typeof imgData === 'string') base64Image = imgData;
            else if (imgData.image) base64Image = imgData.image;
            else if (imgData.buffer) base64Image = imgData.buffer;
            else if (imgData.base64) base64Image = imgData.base64;

            if (!base64Image) continue;

            const buffer = Buffer.from(base64Image, 'base64');
            const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.png`;

            // Upload
            await supabaseAdmin.storage.from('LOGOS').upload(fileName, buffer, { contentType: 'image/png' });

            // Get URL
            const { data: publicUrlData } = supabaseAdmin.storage.from('LOGOS').getPublicUrl(fileName);

            // DB Insert
            const { data: logoRecord } = await supabaseAdmin
                .from('logos')
                .insert({
                    project_id: finalProjectId,
                    prompt: prompt,
                    image_url: publicUrlData.publicUrl,
                    storage_path: fileName,
                    model_used: 'SDXL1.0-base'
                })
                .select()
                .single();

            if (logoRecord) logoRecords.push(logoRecord);
        }

        // 6. Update Usage
        await supabaseAdmin
            .from('usage_tracking')
            .upsert({
                user_id: profile.id,
                logos_generated_count_month: currentUsage + logoRecords.length,
                last_reset_date: new Date().toISOString()
            });

        return NextResponse.json({ success: true, logos: logoRecords }); // Return ARRAY 'logos'

    } catch (error: any) {
        console.error('GENERATE BATCH ERROR:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
