"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image as ImageIcon, CreditCard, Settings, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate Logo', href: '/dashboard/generate', icon: ImageIcon },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white w-64">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Brandiflow
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <CreditsDisplay />
            </div>
        </div>
    );
}

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

function CreditsDisplay() {
    const { data: session } = useSession();
    const [usage, setUsage] = useState({ used: 0, limit: 5, plan: 'Free' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            fetch('/api/user/usage')
                .then(res => res.json())
                .then(data => {
                    setUsage(data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [session]);

    const isUnlimited = (usage as any).role === 'admin' || (usage as any).role === 'super_admin';

    if (loading) return <div className="animate-pulse h-12 bg-slate-800 rounded-lg"></div>;

    if (isUnlimited) {
        return (
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-lg p-4">
                <p className="text-xs text-amber-500 font-bold mb-1">SUPER ADMIN</p>
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">Unlimited Access</span>
                </div>
            </div>
        );
    }

    const percentage = Math.min((usage.used / usage.limit) * 100, 100);

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 transition-all">
            <p className="text-xs text-slate-400 mb-2 flex justify-between">
                <span>Credits Used</span>
                <span className="text-white font-medium">{usage.plan}</span>
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
                <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-right text-slate-400">{usage.used} / {usage.limit}</p>
        </div>
    );
}
