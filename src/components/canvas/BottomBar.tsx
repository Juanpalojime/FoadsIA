
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, MousePointer, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface BottomBarProps {
    zoom: number;
    setZoom: (zoom: number) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ zoom, setZoom }) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border border-border px-4 py-2 rounded-full shadow-2xl flex items-center gap-6 z-20">
            <div className="flex items-center gap-2 border-r border-border pr-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                    <MousePointer size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                    <Hand size={14} />
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost" size="icon"
                    onClick={() => setZoom(Math.max(10, zoom - 10))}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <ZoomOut size={16} />
                </Button>

                <div className="flex items-center gap-3 w-[120px]">
                    <Slider
                        value={[zoom]}
                        min={10} max={200} step={1}
                        onValueChange={(val) => setZoom(val[0])}
                        className="flex-1"
                    />
                    <span className="text-xs font-mono font-bold text-foreground w-8 text-right">{zoom}%</span>
                </div>

                <Button
                    variant="ghost" size="icon"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <ZoomIn size={16} />
                </Button>
            </div>

            <div className="border-l border-border pl-4">
                <Button
                    variant="ghost" size="icon"
                    onClick={() => setZoom(100)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Maximize size={16} />
                </Button>
            </div>
        </div>
    );
};

export default BottomBar;
