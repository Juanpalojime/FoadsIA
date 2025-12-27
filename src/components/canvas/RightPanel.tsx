
import React from 'react';
import { Layer } from '../../types';
import { Eye, EyeOff, Lock, Unlock, Plus, Image as ImageIcon, Type, Layout, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        <aside className="w-80 bg-card border-l border-border flex flex-col h-full overflow-hidden shrink-0">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">Capas</h2>
                <Button variant="ghost" size="icon" onClick={onAddLayer} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <Plus size={16} />
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-2">
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-all group"
                        >
                            <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                {getIcon(layer.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold text-foreground truncate block uppercase tracking-tighter">
                                    {layer.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground uppercase font-medium">
                                    {layer.type}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToggleVisibility(layer.id)}
                                    className={cn("h-7 w-7", !layer.visible && "text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive")}
                                >
                                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToggleLock(layer.id)}
                                    className={cn("h-7 w-7", layer.locked && "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 hover:text-yellow-500")}
                                >
                                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 bg-muted/20 border-t border-border">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">VRAM Usage</span>
                        <span className="text-[10px] font-mono text-primary">1.2 GB / 16 GB</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '12%' }}></div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
