
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, MousePointer, Hand } from 'lucide-react';

interface BottomBarProps {
    zoom: number;
    setZoom: (zoom: number) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ zoom, setZoom }) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-light)] px-4 py-2 rounded-full shadow-2xl flex items-center gap-6 z-20">
            <div className="flex items-center gap-2 border-r border-[var(--border-light)] pr-4">
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
                    <MousePointer size={14} />
                </button>
                <button className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
                    <Hand size={14} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setZoom(Math.max(10, zoom - 10))}
                    className="p-1 text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                    <ZoomOut size={18} />
                </button>

                <div className="flex items-center gap-2 min-w-[60px] justify-center">
                    <input
                        type="range"
                        min="10"
                        max="200"
                        value={zoom}
                        onChange={(e) => setZoom(parseInt(e.target.value))}
                        className="w-20 h-1 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                    />
                    <span className="text-xs font-mono font-bold text-white">{zoom}%</span>
                </div>

                <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="p-1 text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                    <ZoomIn size={18} />
                </button>
            </div>

            <div className="border-l border-[var(--border-light)] pl-4">
                <button
                    onClick={() => setZoom(100)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                >
                    <Maximize size={16} />
                </button>
            </div>
        </div>
    );
};

export default BottomBar;
