
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import DesignEditor from '@/components/DesignEditor';
import { notFound, redirect } from 'next/navigation';

interface EditorPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditorPage(props: EditorPageProps) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/api/auth/signin');
    }

    const userId = (session.user as any).id;
    const logoId = params.id;

    // Fetch the logo
    const { data: logo, error } = await supabaseAdmin
        .from('logos')
        .select('*')
        .eq('id', logoId)
        .single();

    if (error || !logo) {
        console.error("Editor Access Error:", error);
        return notFound();
    }

    // Check ownership
    const { data: project } = await supabaseAdmin
        .from('projects')
        .select('user_id')
        .eq('id', logo.project_id)
        .single();

    if (!project || project.user_id !== userId) {
        return notFound();
    }

    return (
        <div className="h-full">
            <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Design Editor</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Customize your logo: {logo.prompt.slice(0, 50)}...</p>
            </div>

            <DesignEditor logoUrl={logo.image_url} logoId={logo.id} />
        </div>
    );
}
