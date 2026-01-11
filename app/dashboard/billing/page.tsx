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

            const stripe = await stripePromise;
            if (!stripe) throw new Error("Stripe failed to initialize");

            // Redirect to Checkout
            const { error } = await (stripe as any).redirectToCheckout({
                sessionId: data.sessionId,
            });

            if (error) throw error;

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Free Plan */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Starter</h3>
                    <p className="text-4xl font-extrabold mt-4 text-slate-900 dark:text-white">$0 <span className="text-lg font-medium text-slate-500">/mo</span></p>
                    <p className="text-slate-500 mt-2">Perfect for trying out the generator.</p>

                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <Check className="w-5 h-5 text-green-500" /> 5 Logos / month
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <Check className="w-5 h-5 text-green-500" /> Standard Resolution (1024px)
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <Check className="w-5 h-5 text-green-500" /> Basic Editor
                        </li>
                    </ul>

                    <button disabled className="mt-8 w-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed">
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-500/30 p-8 shadow-xl relative overflow-hidden ring-2 ring-blue-500/50">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>

                    <h3 className="text-xl font-bold text-white">Pro Studio</h3>
                    <p className="text-4xl font-extrabold mt-4 text-white">$9.99 <span className="text-lg font-medium text-slate-400">/mo</span></p>
                    <p className="text-slate-400 mt-2">Professional grade tools for less.</p>

                    <ul className="mt-8 space-y-4">
                        <li className="flex items-center gap-3 text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <strong>500 Logos / month</strong>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <strong>Batch Generation (2x)</strong>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <strong>SVG Vector Export</strong>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            <strong>4K Upscaling (High Res)</strong>
                        </li>
                        <li className="flex items-center gap-3 text-white">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-4 h-4 text-green-400" /></div>
                            Brand Kit (Colors & Fonts)
                        </li>
                    </ul>

                    <button
                        onClick={() => handleUpgrade('price_1SoSmhRrx4ZIQJlKOmSEWLhq', 'PRO')}
                        disabled={isLoading}
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        Upgrade to Pro
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-4">Secure payment via Stripe. Cancel anytime.</p>
                </div>
            </div>
        </div>
    );
}
