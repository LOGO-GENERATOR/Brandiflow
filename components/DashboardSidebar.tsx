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
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-2">Credits Used</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
                        <div className="bg-blue-500 h-2 rounded-full w-[40%]"></div>
                    </div>
                    <p className="text-xs text-right text-slate-400">2/5 Free</p>
                </div>
            </div>
        </div>
    );
}
