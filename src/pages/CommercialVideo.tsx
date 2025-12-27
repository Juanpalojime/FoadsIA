import { useState } from 'react';
import { Play, Plus, Trash2, FileText, MonitorPlay, Users, Image as ImageIcon, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';
import { useCreditsStore } from '../store/useCreditsStore';
import '../styles/variables.css';

// Mocks
const avatars = [
    { id: 1, name: 'Sofi', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 2, name: 'Marc', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 3, name: 'Ana', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 4, name: 'David', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 5, name: 'Julia', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 6, name: 'Alex', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150' },
];

const initialScenes = [
    { id: 1, text: 'Hola, bienvenidos a EnfoadsIA. Hoy les mostraré el futuro.', duration: 5, avatar: 1 },
    { id: 2, text: 'Con nuestra tecnología, crear contenido es más fácil que nunca.', duration: 4, avatar: 1 },
    { id: 3, text: 'Prueba gratis y descubre el poder de la IA generativa.', duration: 6, avatar: 2 },
];

export default function CommercialVideo() {
    const [activeTab, setActiveTab] = useState<'avatars' | 'backgrounds'>('avatars');
    const [script, setScript] = useState('');
    const [isRendering, setIsRendering] = useState(false);
    const [renderSuccess, setRenderSuccess] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [scenes, setScenes] = useState(initialScenes);

    const handleRender = async () => {
        if (!script && scenes.length === 0) return;

        const { useCredit } = useCreditsStore.getState();
        if (!useCredit(10)) {
            alert('Necesitas 10 créditos para renderizar un video comercial.');
            return;
        }

        setIsRendering(true);
        setRenderSuccess(false);
        setVideoUrl(null);

        try {
            const finalScript = script || scenes.map(s => s.text).join(' ');
            const response = await api.renderVideo(finalScript, 1); // Mock avatar ID 1
            if (response.status === 'success') {
                setRenderSuccess(true);
                setVideoUrl(response.video_url);
            }
        } catch (err) {
            console.error(err);
            alert('Error al iniciar el renderizado.');
        } finally {
            setIsRendering(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">

            <div className="flex-1 min-h-0 flex gap-4">
                {/* LEFT COLUMN: Configuration */}
                <div className="w-80 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-light)]">
                        <h2 className="font-bold flex items-center gap-2 text-sm">
                            <FileText size={18} className="text-[var(--primary)]" />
                            Guion y Configuración
                        </h2>
                    </div>
                    <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Texto del Guion</label>
                            <textarea
                                className="w-full h-40 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-lg p-3 text-sm focus:border-[var(--primary)] outline-none resize-none leading-relaxed transition-colors"
                                placeholder="Escribe lo que dirá el avatar..."
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Voz e Idioma</label>
                            <select className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] rounded-lg p-2.5 text-sm outline-none border-[var(--border-light)] hover:border-[var(--primary)]/50 transition-colors">
                                <option>Español (México) - Neural</option>
                                <option>English (US) - Professional</option>
                                <option>Français (France)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Estilo de Voz</label>
                            <div className="flex gap-2">
                                <button className="flex-1 py-1.5 text-[10px] font-bold border border-[var(--border-light)] rounded bg-[var(--bg-hover)] text-[var(--text-primary)]">CALMADO</button>
                                <button className="flex-1 py-1.5 text-[10px] font-bold border border-[var(--primary)] rounded bg-[var(--primary)]/10 text-[var(--primary)]">ENERGÉTICO</button>
                                <button className="flex-1 py-1.5 text-[10px] font-bold border border-[var(--border-light)] rounded bg-[var(--bg-hover)] text-[var(--text-primary)]">SERIO</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CENTER COLUMN: Gallery/Preview */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Visual Selector */}
                    <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-[var(--border-light)] flex gap-2">
                            <button
                                onClick={() => setActiveTab('avatars')}
                                className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeTab === 'avatars' ? "bg-[var(--primary)] text-white shadow-sm" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]")}
                            >
                                <Users size={16} /> Avatares
                            </button>
                            <button
                                onClick={() => setActiveTab('backgrounds')}
                                className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeTab === 'backgrounds' ? "bg-[var(--primary)] text-white shadow-sm" : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]")}
                            >
                                <ImageIcon size={16} /> Fondos
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {avatars.map((av) => (
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        key={av.id}
                                        className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer border border-transparent hover:border-[var(--primary)] transition-all shadow-lg"
                                    >
                                        <img src={av.img} alt={av.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{av.name}</span>
                                        </div>
                                    </motion.div>
                                ))}
                                {/* Mock More Items */}
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div key={`mock-${i}`} className="aspect-square rounded-xl bg-[var(--bg-input)] border border-[var(--border-light)] opacity-20 border-dashed" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM: Timeline / Scene Editor */}
            <div className="h-64 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col overflow-hidden shrink-0 shadow-2xl relative">
                {/* Rendering Overlay */}
                <AnimatePresence>
                    {isRendering && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4"
                        >
                            <RefreshCw size={48} className="text-[var(--primary)] animate-spin" />
                            <div className="text-center">
                                <h3 className="font-bold text-lg mb-1">Renderizando Video Comercial</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Procesando escenas y sintetizando voz neuronal...</p>
                            </div>
                            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 10 }}
                                    className="h-full bg-[var(--primary)] shadow-[var(--shadow-glow)]"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="h-10 border-b border-[var(--border-light)] flex items-center justify-between px-4 bg-[var(--bg-main)]/50">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Línea de Tiempo</span>
                        <div className="h-4 w-[1px] bg-[var(--border-light)]"></div>
                        <button className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-primary)] transition-colors"><Play size={14} fill="currentColor" /></button>
                        <span className="text-xs font-mono text-[var(--text-secondary)]">00:15 / 00:30</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {renderSuccess ? (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-[var(--success)] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-lg">
                                    <CheckCircle2 size={14} />
                                    Render Exitoso
                                </div>
                                {videoUrl && (
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all"
                                    >
                                        <ExternalLink size={14} />
                                        Ver Video
                                    </a>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleRender}
                                disabled={isRendering}
                                className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all disabled:opacity-50 group"
                            >
                                <MonitorPlay size={14} className="group-hover:scale-110 transition-transform" />
                                {isRendering ? 'Procesando...' : 'Renderizar Video (10 Créditos)'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-x-auto custom-scrollbar flex gap-4 items-center">
                    {scenes.map((scene, idx) => (
                        <motion.div
                            key={scene.id}
                            layoutId={`scene-${scene.id}`}
                            className="w-56 h-full bg-[var(--bg-main)] border border-[var(--border-light)] rounded-xl flex flex-col shadow-xl hover:border-[var(--primary)] cursor-pointer group relative shrink-0 transition-colors"
                        >
                            <div className="h-1.5 bg-[var(--primary)]/10 w-full relative overflow-hidden rounded-t-xl">
                                <div className="absolute top-0 left-0 h-full bg-[var(--primary)]" style={{ width: '100%' }}></div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter">Escena {idx + 1}</span>
                                    <span className="text-[9px] font-bold bg-[var(--bg-hover)] px-2 py-0.5 rounded-full text-[var(--text-secondary)] border border-[var(--border-light)]">{scene.duration}s</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] line-clamp-4 leading-relaxed italic">"{scene.text}"</p>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setScenes(scenes.filter(s => s.id !== scene.id)); }}
                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <button className="h-full w-14 border-2 border-dashed border-[var(--border-light)] rounded-xl flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all shrink-0 hover:scale-105 active:scale-95">
                        <Plus size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}
