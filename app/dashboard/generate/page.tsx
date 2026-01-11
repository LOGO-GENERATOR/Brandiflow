"use client";

import { useState } from 'react';
import { Wand2, Loader2, Download, Maximize2, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLogos, setGeneratedLogos] = useState<any[]>([]); // Store array of logos

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedLogos([]);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    projectId: '00000000-0000-0000-0000-000000000000'
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to generate');

            // Handle Batch Response
            if (data.logos && Array.isArray(data.logos)) {
                setGeneratedLogos(data.logos);
                toast.success(`Generated ${data.logos.length} variants!`);
            } else if (data.logo) {
                // Fallback for single
                setGeneratedLogos([data.logo]);
                toast.success('Logo generated successfully!');
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Generate Logo Batch</h2>
                <p className="text-slate-500">Describe your vision and get 2 unique variants instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls (Left Side) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prompt</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-40 resize-none shadow-sm"
                            placeholder="Minimalist geometric fox head, orange gradient, tech startup style..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating 2 Variants...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Generate Batch (2x)
                            </>
                        )}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                        Generates 2 high-quality variants. Takes ~15-20 seconds.
                    </p>
                </div>

                {/* Results (Right Side Grid) */}
                <div className="lg:col-span-8">
                    {generatedLogos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {generatedLogos.map((logo, index) => (
                                <div key={logo.id || index} className="group bg-slate-100 dark:bg-slate-900 rounded-2xl aspect-square flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 relative hover:border-blue-500 transition-colors shadow-sm hover:shadow-xl">
                                    <div className="relative flex-1 bg-[url('/grid.svg')] bg-center p-6 flex items-center justify-center">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={logo.image_url}
                                                alt={`Variant ${index + 1}`}
                                                fill
                                                className="object-contain drop-shadow-xl"
                                            />
                                        </div>

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <button
                                                onClick={() => window.open(logo.image_url, '_blank')}
                                                className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                                            >
                                                <Maximize2 className="w-4 h-4" /> View
                                            </button>
                                            <button
                                                onClick={() => router.push(`/dashboard`)} // In real app, maybe open modal directly
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                Details & Edit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">Variant {index + 1}</span>
                                        <span className="text-xs text-slate-400">SDXL 1.0</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Wand2 className="w-8 h-8 opacity-40" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-lg text-slate-600 dark:text-slate-300">Ready to Create</p>
                                <p className="text-sm">Enter a prompt to generate 2 unique logo concepts.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
