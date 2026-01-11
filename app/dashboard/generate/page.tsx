"use client";

import { useState } from 'react';
import { Wand2, Loader2, Download, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function GeneratePage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Fake mock for now if API fails or isn't set up with keys
    // but we will try to hit the real endpoint

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    projectId: '00000000-0000-0000-0000-000000000000' // Placeholder ID
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to generate');

            // Assuming data.logo.image_url is the helper
            // If we returned { success: true, logo: ... }
            if (data.logo?.image_url) {
                setGeneratedImage(data.logo.image_url);
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Generate Logo</h2>
                <p className="text-slate-500">Describe your vision and let AI create the perfect logo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prompt</label>
                        <textarea
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
                            placeholder="Minimalist geometric fox head, orange gradient, tech startup style..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-5 h-5" />
                                Generate Logo
                            </>
                        )}
                    </button>
                </div>

                {/* Preview */}
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl aspect-square flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 relative group">
                    {generatedImage ? (
                        <>
                            <img
                                src={generatedImage}
                                alt="Generated Logo"
                                className="w-full h-full object-contain p-4"
                            />

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors tooltip" title="Upscale 4x">
                                    <Maximize2 className="w-6 h-6" />
                                </button>
                                <button className="p-3 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors" title="Download">
                                    <Download className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Wand2 className="w-8 h-8 opacity-50" />
                            </div>
                            <p>Your creation will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
