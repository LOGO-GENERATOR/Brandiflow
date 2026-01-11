"use client";

import { Plus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { LogoDetailModal } from '@/components/LogoDetailModal';

// Define strict types for props
interface Logo {
    id: string;
    image_url: string;
    prompt: string;
    created_at: string;
    storage_path: string;
    projects: {
        user_id: string;
        name: string;
    };
}

interface DashboardClientProps {
    sessionUser: {
        name?: string | null;
        image?: string | null;
    };
    stats: {
        projectCount: number;
        totalLogos: number;
        monthlyUsage: number;
    };
    recentLogos: Logo[];
}

export default function DashboardClient({ sessionUser, stats, recentLogos }: DashboardClientProps) {
    const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (logo: Logo) => {
        setSelectedLogo(logo);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedLogo(null), 200); // Clear after animation
    };

    return (
        <div className="space-y-8">
            <LogoDetailModal
                logo={selectedLogo}
                isOpen={isModalOpen}
                onClose={closeModal}
            />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, {sessionUser.name}</p>
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
                    { label: 'Total Projects', value: stats.projectCount, color: 'from-blue-500 to-cyan-400' },
                    { label: 'Logos Generated', value: stats.totalLogos, color: 'from-purple-500 to-pink-400' },
                    { label: 'Monthly Usage', value: stats.monthlyUsage, color: 'from-amber-500 to-orange-400' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-6 -mt-6 transition-all group-hover:opacity-20`} />
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</h3>
                        <p className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Creations */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Recent Creations</h3>

                {!recentLogos || recentLogos.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-slate-500">No logos generated yet.</p>
                        <Link href="/dashboard/generate" className="text-blue-600 hover:underline mt-2 inline-block">Start creating</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentLogos.map((logo) => (
                            <div
                                key={logo.id}
                                onClick={() => openModal(logo)}
                                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all hover:border-blue-500/30 cursor-pointer"
                            >
                                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    <Image
                                        src={logo.image_url}
                                        alt={logo.prompt || "Generated Logo"}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                                            View & Download
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate" title={logo.prompt}>{logo.prompt || 'Untitled Logo'}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(logo.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
