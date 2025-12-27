import { NavLink } from 'react-router-dom';
import { Home, Zap, Settings, LogOut, Folder, Sparkles, MonitorPlay } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import '../../styles/variables.css';

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
            { path: '/generate-images', icon: Sparkles, label: 'Generador Pro' },
            { path: '/commercial-video', icon: MonitorPlay, label: 'Video Comercial' },
            { path: '/face-swap', icon: Zap, label: 'Face Swap Lab' },
        ]
    },
    {
        title: 'ASSETS',
        items: [
            { path: '/assets', icon: Folder, label: 'Mis Archivos' },
        ]
    }
];

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-card)] border-r border-[var(--border-light)] flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
                        E
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white">EnfoadsIA</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                {menuGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1">
                        <span className="px-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                            {group.title}
                        </span>

                        {group.items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                                        isActive
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute left-0 w-1 h-5 bg-[var(--primary)] rounded-r-full"
                                            />
                                        )}
                                        <item.icon size={20} className={clsx('transition-colors', isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]')} />
                                        <span className='text-sm'>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[var(--border-light)] space-y-1">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        clsx(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors",
                            isActive ? "text-[var(--primary)] bg-[var(--primary)]/10" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        )
                    }
                >
                    <Settings size={20} />
                    <span className='text-sm'>Configuración</span>
                </NavLink>
                <button className="flex items-center gap-3 w-full px-3 py-2.5 text-[var(--danger)] hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut size={20} />
                    <span className='text-sm'>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
