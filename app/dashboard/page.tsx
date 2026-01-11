import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back to your creative studio.</p>
                </div>
                <Link
                    href="/dashboard/generate"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-5 h-5" />
                    Create New Logo
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Projects', value: '12', color: 'from-blue-500 to-cyan-400' },
                    { label: 'Logos Generated', value: '45', color: 'from-purple-500 to-pink-400' },
                    { label: 'Plan Usage', value: '85%', color: 'from-amber-500 to-orange-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:opacity-20`} />
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                        <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Projects */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Recent Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder Items */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all hover:border-blue-500/30">
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                                {/* Image Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    Logo Preview {i}
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white">Project Alpha</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Generated 2 hours ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
