
import React from 'react';
import { MousePointer2, Move, Type, Brush, Sparkles } from 'lucide-react';
import { ToolType } from '../../types';
import clsx from 'clsx';

interface ToolbarProps {
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
    const tools = [
        { id: 'select' as ToolType, icon: MousePointer2, label: 'Seleccionar' },
        { id: 'move' as ToolType, icon: Move, label: 'Mover' },
        { id: 'text' as ToolType, icon: Type, label: 'Texto' },
        { id: 'brush' as ToolType, icon: Brush, label: 'Pincel' },
        { id: 'ai' as ToolType, icon: Sparkles, label: 'IA Magic' },
    ];

    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border-light)] p-2 rounded-2xl shadow-2xl z-20">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    title={tool.label}
                    className={clsx(
                        "p-3 rounded-xl transition-all group",
                        activeTool === tool.id
                            ? "bg-[var(--primary)] text-white shadow-[var(--shadow-glow)]"
                            : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]"
                    )}
                >
                    <tool.icon size={20} className={clsx(activeTool === tool.id ? "scale-110" : "group-hover:scale-110")} />
                </button>
            ))}
        </div>
    );
};

export default Toolbar;
