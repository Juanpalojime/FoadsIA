import { useState, useEffect } from 'react';
import { Cpu, Bell, User, Menu, Activity } from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';

interface TopBarProps {
    onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const [gpuStatus, setGpuStatus] = useState<any>(null);

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
        <header className="h-20 px-4 lg:px-8 border-b border-[var(--border-light)] bg-[var(--bg-main)]/50 backdrop-blur-xl flex items-center justify-between sticky top-0 z-[50]">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl text-white hover:bg-[var(--bg-hover)] transition-all active:scale-95"
                >
                    <Menu size={22} />
                </button>

                {/* GPU Status Badge */}
                {gpuStatus && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)]/50 rounded-2xl border border-[var(--border-light)] shadow-lg group hover:border-[var(--primary)]/30 transition-all">
                        <div className={clsx(
                            "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                            gpuStatus.status === 'online' ? "bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" : "bg-amber-400"
                        )}></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.1em] flex items-center gap-1.5">
                                <Cpu size={11} className="text-[var(--primary)]" /> {gpuStatus.device || 'Buscando Engine...'}
                            </span>
                            {gpuStatus.status === 'online' ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-white">
                                        VRAM: {gpuStatus.vram_used}GB / {gpuStatus.vram_total}GB
                                    </span>
                                    <Activity size={10} className="text-emerald-400" />
                                </div>
                            ) : (
                                <span className="text-[11px] font-black text-amber-400 uppercase tracking-tight">Servidor en Reposo</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3 lg:gap-5">
                {/* Credits Display (Optional but premium) */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--primary)]/10 to-transparent border border-[var(--border-light)] rounded-2xl">
                    <Sparkles size={14} className="text-[var(--primary)]" />
                    <span className="text-xs font-bold text-white">Pro Plan</span>
                </div>

                <div className="h-6 w-px bg-[var(--border-light)] mx-1 lg:mx-2"></div>

                <button className="relative p-2.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl text-[var(--text-secondary)] hover:text-white hover:border-white/20 transition-all group overflow-hidden">
                    <Bell size={20} className="group-hover:shake" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent)] rounded-full border-2 border-[var(--bg-card)] shadow-[0_0_8px_var(--accent-glow)]"></span>
                </button>

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-sm font-bold text-white leading-tight">Juan Pablo</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">ADMIN</span>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] border border-white/20 shadow-xl flex items-center justify-center text-white ring-2 ring-white/5 hover:ring-white/20 transition-all cursor-pointer">
                        <User size={22} />
                    </div>
                </div>
            </div>
        </header>
    );
}

// Icons
const Sparkles = ({ size, className }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);
