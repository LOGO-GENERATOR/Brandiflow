import { DashboardSidebar } from '@/components/DashboardSidebar';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        // redirect('/api/auth/signin'); // Uncomment to enforce auth
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-black">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
