"use client";

import { useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, IText } from 'fabric';
import { Loader2, Download } from 'lucide-react';

interface DesignEditorProps {
    logoUrl: string;
    logoId: string;
}

export default function DesignEditor({ logoUrl, logoId }: DesignEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        // Initialize Fabric Canvas
        const initCanvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 800,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });

        setCanvas(initCanvas);

        // Load the logo (Async in v6+)
        const loadLogo = async () => {
            try {
                const img = await FabricImage.fromURL(logoUrl, { crossOrigin: 'anonymous' });

                // Scale image to fit canvas with padding
                const padding = 50;
                const maxWidth = initCanvas.width! - padding * 2;
                const maxHeight = initCanvas.height! - padding * 2;

                img.scaleToWidth(maxWidth);

                // Center it
                img.set({
                    originX: 'center',
                    originY: 'center',
                    left: initCanvas.width! / 2,
                    top: initCanvas.height! / 2
                });

                initCanvas.add(img);
                initCanvas.setActiveObject(img);
                initCanvas.renderAll();
                setIsReady(true);
            } catch (err) {
                console.error("Failed to load image", err);
            }
        };

        loadLogo();

        // Cleanup
        return () => {
            initCanvas.dispose();
        };
    }, [logoUrl]);

    // Tools
    const addText = () => {
        if (!canvas) return;

        const text = new IText('Brand Name', {
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            fontFamily: 'sans-serif',
            fill: '#000000',
            fontSize: 60,
            fontWeight: 'bold',
            originX: 'center',
            originY: 'center',
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const handleExport = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4,
        });

        const link = document.createElement('a');
        link.download = `brandiflow-edit-${logoId.slice(0, 8)}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm flex gap-4">
                <button
                    onClick={addText}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    <span className="text-lg font-serif font-bold">T</span> Add Text
                </button>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Add Shape</button>
                <div className="flex-1"></div>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Download Design
                </button>
            </div>

            {/* Canvas Area */}
            <div ref={containerRef} className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 relative">
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {/* Canvas Container */}
                <div className="shadow-2xl rounded-lg overflow-hidden">
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}
