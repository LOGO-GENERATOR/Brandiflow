"use client";

import { X, Download, Copy, Check, Scissors, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import BrandKit from './BrandKit';

interface Logo {
    id: string;
    image_url: string;
    prompt: string;
    created_at: string;
    storage_path: string;
}

interface LogoDetailModalProps {
    logo: Logo | null;
    isOpen: boolean;
    onClose: () => void;
}

export function LogoDetailModal({ logo, isOpen, onClose }: LogoDetailModalProps) {
    const [copied, setCopied] = useState(false);
    const [isRemovingBg, setIsRemovingBg] = useState(false);
    const [isVectorizing, setIsVectorizing] = useState(false);
    const [transparentUrl, setTransparentUrl] = useState<string | null>(null);
    const [vectorUrl, setVectorUrl] = useState<string | null>(null);

    // Reset state when logo changes
    useEffect(() => {
        setTransparentUrl(null);
        setVectorUrl(null);
    }, [logo]);

    if (!isOpen || !logo) return null;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(logo.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (url: string, suffix: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `brandiflow-${logo.id.slice(0, 8)}-${suffix}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRemoveBg = async () => {
        setIsRemovingBg(true);
        try {
            const response = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId: logo.id, imageUrl: logo.image_url }),
            });

            const data = await response.json();
            if (data.success) {
                setTransparentUrl(data.transparentUrl);
                toast.success("Background removed!");
            } else {
                toast.error("Failed to remove background");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error removing background");
        } finally {
            setIsRemovingBg(false);
        }
    };

    const handleVectorize = async () => {
        setIsVectorizing(true);
        try {
            // Use transparent URL if available for cleaner trace, else original
            const targetUrl = transparentUrl || logo.image_url;

            const response = await fetch('/api/vectorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId: logo.id, imageUrl: targetUrl }),
            });

            const data = await response.json();
            if (data.success) {
                setVectorUrl(data.vectorUrl);
                toast.success("Logo vectorized to SVG!");
                // Auto download
                window.open(data.vectorUrl, '_blank');
            } else {
                toast.error("Vectorization failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error vectorizing logo");
        } finally {
            setIsVectorizing(false);
        }
    };

    const handleUpscale = async () => {
        const toastId = toast.loading("Upscaling to 4K...");
        try {
            const response = await fetch('/api/upscale', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId: logo.id, imageUrl: transparentUrl || logo.image_url }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Upscale Complete!", { id: toastId });
                // Auto download
                window.open(data.upscaledUrl, '_blank');
            } else {
                toast.error("Upscale failed", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error upscaling logo", { id: toastId });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                {/* Left: Image Viewer */}
                <div className="relative flex-1 bg-black flex items-center justify-center md:min-h-[500px] p-8 overflow-hidden">
                    {/* Grid Background for transparency */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: `url('/grid.svg')`, backgroundSize: '20px 20px' }}
                    />

                    <img
                        src={transparentUrl || logo.image_url}
                        alt={logo.prompt}
                        className="relative max-w-full max-h-full object-contain shadow-2xl"
                    />

                    {/* Loading Overlays */}
                    {(isRemovingBg || isVectorizing) && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            <p className="text-white font-medium">
                                {isRemovingBg ? "Removing Background..." : "Vectorizing to SVG..."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Details & Actions */}
                <div className="w-full md:w-[350px] bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">

                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="text-xl font-bold text-white leading-tight">Logo Details</h3>
                            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Generated {new Date(logo.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
                        {logo.prompt}
                    </div>

                    {/* Brand Kit Section */}
                    <div className="border-t border-slate-800 pt-6">
                        <BrandKit imageUrl={transparentUrl || logo.image_url} />
                    </div>

                    {/* Actions Grid */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <button
                            onClick={() => handleDownload(transparentUrl || logo.image_url, 'hd')}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                        >
                            <Download className="w-5 h-5" />
                            Download HD
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleRemoveBg}
                                disabled={isRemovingBg || !!transparentUrl}
                                className={`w-full flex flex-col items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all border ${transparentUrl
                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                                    }`}
                            >
                                <Scissors className="w-5 h-5" />
                                <span className="text-xs">{transparentUrl ? 'Done' : 'Remove BG'}</span>
                            </button>

                            <button
                                onClick={handleVectorize}
                                disabled={isVectorizing}
                                className="w-full flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-3 rounded-xl font-medium transition-all border border-slate-700 active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span className="text-xs">SVG Vector</span>
                            </button>

                            <button
                                onClick={handleUpscale}
                                className="col-span-2 w-full flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-3 rounded-xl font-medium transition-colors border border-slate-700"
                            >
                                <span className="text-lg font-bold">4K</span>
                                <span className="text-xs">Upscale to 4K</span>
                            </button>
                        </div>

                        <button
                            onClick={() => window.location.href = `/dashboard/edit/${logo.id}`}
                            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                        >
                            <span>🎨 Customize / Edit</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
