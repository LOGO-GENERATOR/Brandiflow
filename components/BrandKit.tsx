"use client";

import { useEffect, useState } from 'react';
import { Copy, Check, Type } from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandKitProps {
    imageUrl: string;
}

interface Palette {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export default function BrandKit({ imageUrl }: BrandKitProps) {
    const [palette, setPalette] = useState<Palette | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!imageUrl) return;

        const extractColors = async () => {
            try {
                setLoading(true);
                // Correct import for node-vibrant v4 browser env
                const { Vibrant } = await import('node-vibrant/browser');
                if (!Vibrant) throw new Error("Vibrant class not found in module");

                const v = new Vibrant(imageUrl);
                const p = await v.getPalette();

                // Map Vibrant swatches to our palette structure
                setPalette({
                    primary: p.Vibrant?.hex || '#000000',
                    secondary: p.Muted?.hex || '#666666',
                    accent: p.LightVibrant?.hex || '#3b82f6',
                    background: p.LightMuted?.hex || '#ffffff',
                    text: p.DarkMuted?.hex || '#1e293b',
                });
            } catch (err) {
                console.error("Failed to extract colors:", err);
                toast.error("Could not generate palette from this image.");
            } finally {
                setLoading(false);
            }
        };

        // Use a proxied URL or ensure CORS is handled if image is external
        // For Supabase, we need to ensure the image allows cross-origin access.
        // We might need to fetch blob first if direct URL fails CORS.
        extractColors();

    }, [imageUrl]);

    const copyColor = (color: string) => {
        navigator.clipboard.writeText(color);
        toast.success(`Copied ${color}`);
    };

    if (loading) return <div className="p-4 text-center text-slate-400">Analyzing brand colors...</div>;
    if (!palette) return null;

    return (
        <div className="space-y-6">
            {/* Color Palette Section */}
            <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Extracted Palette
                </h4>
                <div className="grid grid-cols-5 gap-2">
                    {Object.entries(palette).map(([name, hex]) => (
                        <button
                            key={name}
                            onClick={() => copyColor(hex)}
                            className="group relative aspect-square rounded-xl shadow-lg transition-transform hover:scale-105 hover:ring-2 ring-white/20"
                            style={{ backgroundColor: hex }}
                            title={`Copy ${name}: ${hex}`}
                        >
                            <span className="absolute inset-x-0 bottom-0 text-[10px] font-medium bg-black/50 text-white py-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase text-center backdrop-blur-sm rounded-b-xl">
                                {hex}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Typography Section */}
            <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-400" />
                    Suggested Typography
                </h4>
                <div className="space-y-2">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Heading Font</p>
                        <p className="text-white text-lg font-bold font-sans">Inter / Plus Jakarta Sans</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Body Font</p>
                        <p className="text-slate-300 font-serif">Merriweather / Roboto Slab</p>
                    </div>
                </div>
            </div>

            {/* Action */}
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                Download Brand Kit (ZIP)
            </button>
        </div>
    );
}
