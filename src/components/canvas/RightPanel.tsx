
import React from 'react';
import { Layer } from '../../types';
import { Eye, EyeOff, Lock, Unlock, Plus, Image as ImageIcon, Type, Layout, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface RightPanelProps {
    layers: Layer[];
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onAddLayer: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ layers, onToggleVisibility, onToggleLock, onAddLayer }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return <ImageIcon size={14} />;
            case 'text': return <Type size={14} />;
            case 'background': return <Layout size={14} />;
            case 'ai': return <Sparkles size={14} className="text-blue-400" />;
            default: return null;
        }
    };

    return (
        <aside className="w-80 bg-[var(--bg-card)] border-l border-[var(--border-light)] flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-main)]/30">
                <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-[var(--text-secondary)]">Capas</h2>
                <button
                    onClick={onAddLayer}
                    className="p-1.5 hover:bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg transition-colors border border-[var(--primary)]/20"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-light)] hover:border-[var(--primary)]/50 transition-all group"
                    >
                        <div className="p-2 bg-[var(--bg-main)] rounded-lg text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors">
                            {getIcon(layer.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-white truncate block uppercase tracking-tighter">
                                {layer.name}
                            </span>
                            <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-medium">
                                {layer.type}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onToggleVisibility(layer.id)}
                                className={clsx("p-1.5 rounded transition-colors", layer.visible ? "text-[var(--text-secondary)] hover:text-white" : "text-red-500 bg-red-500/10")}
                            >
                                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button
                                onClick={() => onToggleLock(layer.id)}
                                className={clsx("p-1.5 rounded transition-colors", layer.locked ? "text-yellow-500 bg-yellow-500/10" : "text-[var(--text-secondary)] hover:text-white")}
                            >
                                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-light)]">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">VRAM Usage</span>
                        <span className="text-[10px] font-mono text-[var(--primary)]">1.2 GB / 16 GB</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)]" style={{ width: '12%' }}></div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
