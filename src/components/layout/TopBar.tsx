import { useState, useEffect } from 'react';
import { Cpu, Bell, User } from 'lucide-react';
import { api } from '../../services/api';
import clsx from 'clsx';
import '../../styles/variables.css';

export default function TopBar() {
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
        <div className="h-16 px-6 border-b border-[var(--border-light)] bg-[var(--bg-card)]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-6">
                {/* GPU Status Badge */}
                {gpuStatus && (
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-light)] shadow-inner">
                        <div className={clsx(
                            "w-2 h-2 rounded-full",
                            gpuStatus.status === 'online' ? "bg-[var(--success)] animate-pulse shadow-[0_0_8px_var(--success)]" : "bg-[var(--warning)]"
                        )}></div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter flex items-center gap-1">
                                <Cpu size={10} /> {gpuStatus.device || 'Buscando GPU...'}
                            </span>
                            {gpuStatus.status === 'online' ? (
                                <span className="text-[10px] font-bold text-[var(--text-primary)]">
                                    VRAM: {gpuStatus.vram_used}GB / {gpuStatus.vram_total}GB
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold text-[var(--warning)] uppercase">Servidor en Reposo</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="h-4 w-px bg-[var(--border-light)] mx-2"></div>

                <button className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-[var(--bg-card)]"></span>
                </button>

                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-500 border-2 border-[var(--bg-card)] shadow-xl flex items-center justify-center text-white">
                    <User size={20} />
                </div>
            </div>
        </div>
    );
}
