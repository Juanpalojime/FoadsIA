import { useState, useEffect } from 'react';
import { Cpu, Bell, User, Menu, Activity, Sparkles, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { useCreditsStore } from '../../store/useCreditsStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
    onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const [gpuStatus, setGpuStatus] = useState<any>(null);
    const { credits } = useCreditsStore();

    useEffect(() => {
        const checkGpu = async () => {
            try {
                const status = await api.getGpuStatus();
                setGpuStatus(status);
            } catch (err) {
                setGpuStatus({ status: 'offline', device: 'Disconnected' });
            }
        };
        checkGpu();
        const interval = setInterval(checkGpu, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-20 px-4 lg:px-8 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-[40]">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden"
                >
                    <Menu size={22} />
                </Button>

                {/* GPU Status Badge */}
                {gpuStatus && (
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-card/50 rounded-2xl border border-border shadow-sm group hover:border-primary/30 transition-all">
                        <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-sm",
                            gpuStatus.status === 'online' ? "bg-emerald-400 animate-pulse shadow-emerald-400/50" : "bg-amber-400"
                        )}></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] flex items-center gap-1.5">
                                <Cpu size={11} className="text-primary" /> {gpuStatus.device || 'Buscando Cloud Engine...'}
                            </span>
                            {gpuStatus.status === 'online' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-foreground">
                                        VRAM: {gpuStatus.vram_allocated_gb}GB / {gpuStatus.vram_total_gb}GB
                                    </span>
                                    <Activity size={10} className="text-emerald-400" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hidden sm:flex">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
                </Button>
                {/* TOKEN COUNTER - LEONARDO STYLE */}
                <div className="flex items-center gap-3 pl-4 pr-1">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Credits</span>
                        </div>
                        <span className="text-lg font-black leading-none text-foreground flex items-center gap-1">
                            <Zap size={14} className="text-amber-500 fill-amber-500" /> {credits}
                        </span>
                    </div>
                    <Button
                        size="sm"
                        className="h-9 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/20 rounded-xl text-xs font-black uppercase tracking-widest gap-2 transition-all hover:scale-105"
                    >
                        Upgrade
                    </Button>
                </div>

                <div className="h-8 w-px bg-border mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm font-bold text-foreground leading-tight">Juan Pablo</span>
                        <Badge variant="secondary" className="text-[9px] font-bold h-4 px-1.5 bg-primary/10 text-primary border-primary/20">PRO</Badge>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 border border-white/20 shadow-lg flex items-center justify-center text-white ring-2 ring-transparent hover:ring-primary/20 transition-all cursor-pointer">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}
