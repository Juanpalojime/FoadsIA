import { NavLink } from 'react-router-dom';
import { Home, Zap, Settings, LogOut, Folder, Sparkles, MonitorPlay, Image as ImageIcon, Layers, X } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MenuItem {
    path: string;
    icon: any;
    label: string;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        title: 'CREATION HUB',
        items: [
            { path: '/home', icon: Home, label: 'Inicio' },
            { path: '/ad-creator', icon: Sparkles, label: 'Creative Studio' },
            { path: '/generate-images', icon: ImageIcon, label: 'Generador Pro' },
            { path: '/canvas-editor', icon: Layers, label: 'Canvas Editor' },
            { path: '/commercial-video', icon: MonitorPlay, label: 'Video Comercial' },
            { path: '/face-swap', icon: Zap, label: 'Face Swap Lab' },
        ]
    },
    {
        title: 'ASSETS & BRAND',
        items: [
            { path: '/brand-vault', icon: Sparkles, label: 'Brand Vault' },
            { path: '/assets', icon: Folder, label: 'Mis Archivos' },
        ]
    }
];

interface SidebarProps {
    onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
    return (
        <aside className="h-full w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border-light)] flex flex-col shadow-2xl">
            {/* Logo Area */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-[var(--border-light)] bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-[var(--primary-glow)]">
                        E
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight text-white block leading-none">EnfoadsIA</span>
                        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Studio Engine</span>
                    </div>
                </div>

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-secondary)]"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                {menuGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                        <span className="px-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-3 opactiy-50">
                            {group.title}
                        </span>

                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                                        isActive
                                            ? 'bg-gradient-to-r from-[var(--primary)]/15 to-transparent text-white font-semibold'
                                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute left-0 w-1.5 h-6 bg-gradient-to-b from-[var(--primary)] to-[var(--accent)] rounded-r-full shadow-[0_0_10px_var(--primary-glow)]"
                                            />
                                        )}
                                        <item.icon
                                            size={20}
                                            className={clsx(
                                                'transition-all duration-300',
                                                isActive ? 'text-[var(--primary)] scale-110 drop-shadow-[0_0_8px_var(--primary-glow)]' : 'text-[var(--text-tertiary)] group-hover:text-white'
                                            )}
                                        />
                                        <span className='text-sm'>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-[var(--border-light)] bg-gradient-to-t from-white/5 to-transparent space-y-2">
                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                        clsx(
                            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300",
                            isActive ? "text-white bg-[var(--primary)]/10" : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]"
                        )
                    }
                >
                    <Settings size={20} className="opacity-70" />
                    <span className='text-sm font-medium'>Configuración</span>
                </NavLink>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-red-500/10 rounded-xl transition-all duration-300 group">
                    <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500 opacity-70" />
                    <span className='text-sm font-medium'>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
