"use client";

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Check, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Make sure to adding this env var in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async (priceId: string, planName: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, planName }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Payment initialization failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Upgrade Your Workspace</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Unlock professional features like Batch Generation, Brand Kits, and 4K Upscaling.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* Starter Plan */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden flex flex-col h-full">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Brandiflow Starter</h3>
                    <p className="text-3xl font-extrabold mt-4 text-slate-900 dark:text-white">$2.99 <span className="text-sm font-medium text-slate-500">/mo</span></p>
                    <p className="text-sm text-slate-500 mt-2">Good for hobbyists.</p>

                    <ul className="mt-6 space-y-3 flex-1">
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> 50 Logos / month
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> Standard Res
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('price_1SoSmgRrx4ZlQJlKEgMdyyJA', 'STARTER')}
                        disabled={isLoading}
                        className="mt-6 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-semibold py-3 rounded-xl transition-all"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Subscribe'}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-500/30 p-6 shadow-xl relative overflow-hidden ring-2 ring-blue-500/50 flex flex-col h-full transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>

                    <h3 className="text-xl font-bold text-white">Professional</h3>
                    <p className="text-3xl font-extrabold mt-4 text-white">$9.99 <span className="text-sm font-medium text-slate-400">/mo</span></p>
                    <p className="text-sm text-slate-400 mt-2">For serious creators.</p>

                    <ul className="mt-6 space-y-3 flex-1">
                        <li className="flex items-center gap-2 text-sm text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                            <strong>500 Logos / month</strong>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                            Batch Gen (2x)
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                            Vector & Upscale
                        </li>
                        <li className="flex items-center gap-2 text-sm text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                            Brand Kits
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('price_1SoSmhRrx4ZlQJlKOmsEWLhq', 'PRO')}
                        disabled={isLoading}
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Upgrade to Pro
                    </button>
                </div>

                {/* Business Plan */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden flex flex-col h-full">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business</h3>
                    <p className="text-3xl font-extrabold mt-4 text-slate-900 dark:text-white">$39.99 <span className="text-sm font-medium text-slate-500">/mo</span></p>
                    <p className="text-sm text-slate-500 mt-2">High volume agency use.</p>

                    <ul className="mt-6 space-y-3 flex-1">
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> 5,000 Logos / month
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> Priority Support
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> Commercial Rights
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Check className="w-4 h-4 text-green-500" /> API Access (Beta)
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('price_1SoSmiRrx4ZlQJlK8BFl7vgz', 'BUSINESS')}
                        disabled={isLoading}
                        className="mt-6 w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold py-3 rounded-xl transition-all"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Go Business'}
                    </button>
                </div>

            </div>
        </div>
    );
}
