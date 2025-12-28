import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Zap, Settings, LogOut, Folder, Sparkles, MonitorPlay, Image as ImageIcon, Layers, X, FlaskConical, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
            { path: '/example', icon: FlaskConical, label: 'Component Demo' },
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
    const [collapsed, setCollapsed] = useState(false);

    return (
        <TooltipProvider>
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 288 }}
                className="h-full bg-card/60 backdrop-blur-xl border-r border-[rgba(255,255,255,0.08)] flex flex-col shadow-2xl z-50 relative transition-all duration-300 ease-in-out"
            >
                {/* Toggle Button (Desktop) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform hidden lg:flex z-50 border border-white/20"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Area */}
                <div className={cn(
                    "h-20 flex items-center px-6 border-b border-border bg-gradient-to-b from-primary/5 to-transparent overflow-hidden",
                    collapsed ? "justify-center px-2" : "justify-between"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
                            E
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <span className="font-bold text-lg tracking-tight text-foreground block leading-none">EnfoadsIA</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Studio Engine</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Close Button Mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="lg:hidden text-muted-foreground hover:text-foreground ml-auto"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-3 flex flex-col gap-8 overflow-y-auto scrollbar-thin overflow-x-hidden">
                    {menuGroups.map((group) => (
                        <div key={group.title} className="flex flex-col gap-1">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-3 whitespace-nowrap"
                                >
                                    {group.title}
                                </motion.span>
                            )}

                            {group.items.map((item) => {
                                const LinkContent = ({ isActive }: { isActive: boolean }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute left-0 w-1 h-3/5 bg-primary rounded-r-full shadow-lg shadow-primary/50"
                                            />
                                        )}
                                        <item.icon
                                            size={20}
                                            className={cn(
                                                'transition-all duration-300 flex-shrink-0',
                                                isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'
                                            )}
                                        />
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className='text-sm whitespace-nowrap'
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </>
                                );

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
                                                collapsed ? 'justify-center' : '',
                                                isActive
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            collapsed ? (
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex items-center justify-center">
                                                            <LinkContent isActive={isActive} />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" className="font-bold text-xs">
                                                        {item.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <LinkContent isActive={isActive} />
                                            )
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-border bg-muted/10 space-y-2">
                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
                                collapsed ? 'justify-center' : '',
                                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )
                        }
                    >
                        {collapsed ? (
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger>
                                    <Settings size={20} className="opacity-70" />
                                </TooltipTrigger>
                                <TooltipContent side="right">Configuración</TooltipContent>
                            </Tooltip>
                        ) : (
                            <>
                                <Settings size={20} className="opacity-70" />
                                <span className='text-sm font-medium'>Configuración</span>
                            </>
                        )}
                    </NavLink>
                    <button className={cn(
                        "flex items-center gap-3 w-full px-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 group",
                        collapsed ? 'justify-center' : ''
                    )}>
                        <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500 opacity-70" />
                        {!collapsed && <span className='text-sm font-medium'>Cerrar Sesión</span>}
                    </button>
                </div>
            </motion.aside>
        </TooltipProvider>
    );
}
