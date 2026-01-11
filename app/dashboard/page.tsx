import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return <div>Please log in to view your dashboard.</div>;
    }

    // Must fetch profile first to get ID (if using next_auth.users id vs profiles id, they should be same now)
    // But safely we use session.user.id
    const userId = (session.user as any).id;

    // Fetch Stats
    const { data: usage } = await supabaseAdmin
        .from('usage_tracking')
        .select('logos_generated_count_month')
        .eq('user_id', userId)
        .single();

    const { count: projectCount } = await supabaseAdmin
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    const { count: totalLogos } = await supabaseAdmin
        .from('logos')
        .select('*, projects!inner(user_id)', { count: 'exact', head: true })
        .eq('projects.user_id', userId);

    // Fetch Recent Logos
    const { data: recentLogos } = await supabaseAdmin
        .from('logos')
        .select(`
            *,
            projects!inner (
                user_id,
                name
            )
        `)
        .eq('projects.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6);

    const stats = {
        projectCount: projectCount || 0,
        totalLogos: totalLogos || 0,
        monthlyUsage: usage?.logos_generated_count_month || 0
    };

    return (
        <DashboardClient
            sessionUser={session.user}
            stats={stats}
            recentLogos={recentLogos || []}
        />
    );
}
