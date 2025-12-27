
import React from 'react';
import { MousePointer2, Move, Type, Brush, Sparkles } from 'lucide-react';
import { ToolType } from '../../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-card border border-border p-2 rounded-2xl shadow-xl z-20">
            {tools.map((tool) => (
                <Button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    variant={activeTool === tool.id ? "default" : "ghost"}
                    size="icon"
                    title={tool.label}
                    className={cn(
                        "rounded-xl transition-all",
                        activeTool === tool.id ? "shadow-md" : ""
                    )}
                >
                    <tool.icon size={20} className={cn(activeTool === tool.id && "scale-110")} />
                </Button>
            ))}
        </div>
    );
};

export default Toolbar;
