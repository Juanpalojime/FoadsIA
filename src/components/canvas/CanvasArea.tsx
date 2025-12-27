
import React, { useState, useRef } from 'react';
import { Layer, Selection } from '../../types';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CanvasAreaProps {
    zoom: number;
    layers: Layer[];
    onGenerate: (selection: Selection) => void;
    isGenerating: boolean;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ zoom, layers, onGenerate, isGenerating }) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<Selection | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current || isGenerating) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        setIsSelecting(true);
        setSelection({ x, y, width: 0, height: 0 });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || !selection || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / (zoom / 100);
        const y = (e.clientY - rect.top) / (zoom / 100);

        setSelection({
            ...selection,
            width: x - selection.x,
            height: y - selection.y
        });
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
    };

    return (
        <div className="flex-1 overflow-hidden bg-muted/40 relative flex items-center justify-center cursor-crosshair">
            <div
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                    transform: `scale(${zoom / 100})`,
                    width: '1080px',
                    height: '1080px'
                }}
                className="bg-white shadow-2xl relative origin-center transition-transform duration-200"
            >
                {/* Render Layers */}
                {[...layers].reverse().map((layer) => (
                    <div
                        key={layer.id}
                        className={cn(
                            "absolute inset-0 transition-opacity",
                            !layer.visible && "opacity-0 invisible"
                        )}
                    >
                        {layer.type === 'background' && (
                            <div style={{ background: layer.content }} className="w-full h-full" />
                        )}
                        {layer.type === 'image' && (
                            <img src={layer.content} alt={layer.name} className="w-full h-full object-cover" />
                        )}
                        {layer.type === 'text' && (
                            <div className="flex items-center justify-center h-full">
                                <h1 className="text-8xl font-black text-black text-center px-20 select-none drop-shadow-lg">{layer.content}</h1>
                            </div>
                        )}
                        {layer.type === 'ai' && (
                            <div className="w-full h-full relative">
                                {layer.isProcessing ? (
                                    <div className="w-full h-full bg-primary/10 flex flex-col items-center justify-center gap-4">
                                        <Loader2 size={64} className="text-primary animate-spin" />
                                        <span className="text-primary font-bold uppercase tracking-widest text-sm">IA Procesando...</span>
                                    </div>
                                ) : (
                                    <img src={layer.content} alt={layer.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Selection Area */}
                {selection && (
                    <div
                        style={{
                            left: Math.min(selection.x, selection.x + selection.width),
                            top: Math.min(selection.y, selection.y + selection.height),
                            width: Math.abs(selection.width),
                            height: Math.abs(selection.height),
                        }}
                        className="absolute border-2 border-primary bg-primary/20 z-40"
                    >
                        {!isSelecting && Math.abs(selection.width) > 10 && (
                            <Button
                                onClick={() => onGenerate(selection)}
                                className="absolute -bottom-12 left-1/2 -translate-x-1/2 shadow-xl gap-2 font-bold hover:scale-105 transition-transform"
                            >
                                <Sparkles size={16} /> Generar Aquí
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CanvasArea;
