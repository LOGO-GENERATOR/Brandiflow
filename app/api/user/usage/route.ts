import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Profile & Usage
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, billing_plan, role')
        .eq('email', session.user.email)
        .single();

    console.log('[API Usage] Session Email:', session.user.email);
    console.log('[API Usage] Profile Found:', profile ? profile.id : 'NONE');

    if (!profile) return NextResponse.json({ used: 0, limit: 5, plan: 'FREE' });

    const { data: usage } = await supabaseAdmin
        .from('usage_tracking')
        .select('logos_generated_count_month')
        .eq('user_id', profile.id)
        .single();

    const currentUsage = usage?.logos_generated_count_month || 0;

    const PLAN_LIMITS = {
        FREE: 5,
        STARTER: 50,
        PRO: 500,
        BUSINESS: 5000
    };

    const limit = PLAN_LIMITS[profile.billing_plan as keyof typeof PLAN_LIMITS] || 5;

    return NextResponse.json({
        used: currentUsage,
        limit: limit,
        plan: profile.billing_plan || 'FREE',
        role: profile.role
    });
}
