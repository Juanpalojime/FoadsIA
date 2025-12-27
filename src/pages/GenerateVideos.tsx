import { useState, useEffect } from 'react';
import { Video, RefreshCw, MessageSquare, AlertCircle, Layers, Send, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';
import MultiSceneTimeline, { type Scene } from '../components/video/MultiSceneTimeline';
import { io } from 'socket.io-client';
import '../styles/variables.css';

export default function GenerateVideos() {
    const [avatars, setAvatars] = useState<any[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
    const [script, setScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoJob, setVideoJob] = useState<{ id: string; status: string } | null>(null);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Multi-Scene State
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [activeSceneId, setActiveSceneId] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const [generateSubtitles, setGenerateSubtitles] = useState(false);

    // WebSocket Connection
    useEffect(() => {
        const socketUrl = localStorage.getItem('FOADS_API_URL') || '';
        if (!socketUrl) return;

        const socket = io(socketUrl);

        socket.on('job_update', (data) => {
            if (data.job_id === videoJob?.id || (videoJob?.id && data.job_id.startsWith('multi_'))) {
                if (data.status === 'processing') {
                    setProgress(data.progress || 0);
                    if (data.message) setStatusMessage(data.message);
                } else if (data.status === 'completed') {
                    setProgress(100);
                    setVideoUrl(data.url);
                    setIsGenerating(false);
                } else if (data.status === 'failed') {
                    setError(data.error || 'Error en el proceso');
                    setIsGenerating(false);
                }
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [videoJob]);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const res = await api.getAvatars();
                if (res.status === 'success') {
                    setAvatars(res.avatars);
                    const defaultAvatar = res.avatars[0];
                    setSelectedAvatar(defaultAvatar);

                    const firstScene: Scene = {
                        id: Math.random().toString(36).substr(2, 9),
                        avatarId: defaultAvatar.id,
                        avatarName: defaultAvatar.name,
                        avatarImg: defaultAvatar.img,
                        script: '',
                        generateSubtitles: false
                    };
                    setScenes([firstScene]);
                    setActiveSceneId(firstScene.id);
                } else {
                    setError('No se pudieron cargar los avatares.');
                }
            } catch (err) {
                setError('Error crítico de conexión con el backend.');
            }
        };
        fetchAvatars();
    }, []);

    const addScene = () => {
        if (!selectedAvatar) return;
        const newScene: Scene = {
            id: Math.random().toString(36).substr(2, 9),
            avatarId: selectedAvatar.id,
            avatarName: selectedAvatar.name,
            avatarImg: selectedAvatar.img,
            script: '',
            generateSubtitles: false
        };
        setScenes([...scenes, newScene]);
        setActiveSceneId(newScene.id);
        setScript('');
        setGenerateSubtitles(false);
    };

    const deleteScene = (id: string) => {
        if (scenes.length <= 1) return;
        const filtered = scenes.filter(s => s.id !== id);
        setScenes(filtered);
        if (activeSceneId === id) {
            const nextActive = filtered[0];
            setActiveSceneId(nextActive.id);
            setScript(nextActive.script);
            setGenerateSubtitles(nextActive.generateSubtitles);
        }
    };

    const updateCurrentScene = (updates: Partial<Scene>) => {
        setScenes(prev => prev.map(s => s.id === activeSceneId ? { ...s, ...updates } : s));
    };

    const handleGenerate = async () => {
        if (scenes.some(s => !s.script)) {
            setError('Por favor completa el guion de todas las escenas');
            return;
        }

        setIsGenerating(true);
        setProgress(0);
        setStatusMessage('Iniciando proyecto multi-escena...');

        try {
            const res = await api.renderMultiScene(scenes);
            if (res.status === 'success') {
                setVideoJob({ id: res.job_id, status: 'queued' });
            } else {
                setError(res.message || 'Error al iniciar renderizado');
                setIsGenerating(false);
            }
        } catch (err) {
            setError('Error de comunicación con el servidor');
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <Video className="text-[var(--primary)]" size={32} />
                        Producción de Video <span className="text-[var(--primary)] text-sm px-2 py-0.5 bg-[var(--primary)]/10 rounded-full ml-2">PREMIUM</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-1">Editor Multi-Escena 100% Free / Open Source.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-tertiary)] bg-[var(--bg-input)] px-3 py-1.5 rounded-lg border border-[var(--border-light)]">
                        <Clock size={12} />
                        <span>EST. {scenes.length * 45}S</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                <main className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl overflow-hidden relative group shadow-inner">
                        <AnimatePresence mode="wait">
                            {videoUrl ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full h-full"
                                >
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                        autoPlay
                                    />
                                </motion.div>
                            ) : isGenerating ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full gap-6 p-12 text-center"
                                >
                                    <div className="relative w-48 h-48">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[var(--primary)]/10" />
                                            <motion.circle
                                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={552}
                                                animate={{ strokeDashoffset: 552 - (552 * progress) / 100 }}
                                                className="text-[var(--primary)]"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-[var(--primary)]">{progress}%</span>
                                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-1">Procesando</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[var(--text-primary)] mb-2">Renderizado Neuronal</h2>
                                        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">{statusMessage || 'Preparando motores de IA...'}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-tertiary)] opacity-30 select-none">
                                    <Layers size={64} className="mb-2" />
                                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Preview de Produción</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <MultiSceneTimeline
                        scenes={scenes}
                        activeSceneId={activeSceneId}
                        onAddScene={addScene}
                        onDeleteScene={deleteScene}
                        onSelectScene={(id) => {
                            setActiveSceneId(id);
                            const scene = scenes.find(s => s.id === id);
                            if (scene) {
                                setScript(scene.script);
                                setGenerateSubtitles(scene.generateSubtitles);
                                const avatar = avatars.find(a => a.id === scene.avatarId);
                                if (avatar) setSelectedAvatar(avatar);
                            }
                        }}
                    />
                </main>

                <aside className="w-96 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-[var(--border-light)]">
                        <h3 className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] mb-4">Escena Activa</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                            {avatars.map((av) => (
                                <button
                                    key={av.id}
                                    onClick={() => {
                                        setSelectedAvatar(av);
                                        updateCurrentScene({ avatarId: av.id, avatarName: av.name, avatarImg: av.img });
                                    }}
                                    className={clsx(
                                        "relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1",
                                        selectedAvatar?.id === av.id ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-transparent bg-[var(--bg-input)]"
                                    )}
                                >
                                    <img src={av.img} alt={av.name} className="w-full h-full object-cover rounded-xl" />
                                    <div className="absolute inset-x-1 bottom-1 p-1 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[8px] text-white font-black truncate uppercase text-center">{av.name}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                        <section>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Guion de la Escena</h3>
                                <button
                                    onClick={async () => {
                                        const res = await api.magicPrompt(script);
                                        if (res.status === 'success') {
                                            const newPrompt = res.prompt || script;
                                            setScript(newPrompt);
                                            updateCurrentScene({ script: newPrompt });
                                        }
                                    }}
                                    className="flex items-center gap-1.5 text-[var(--primary)] text-[10px] font-black hover:opacity-80 transition-all px-2 py-1 bg-[var(--primary)]/10 rounded-lg"
                                >
                                    <Sparkles size={12} />
                                    IA OPTIMIZE
                                </button>
                            </div>
                            <textarea
                                value={script}
                                onChange={(e) => {
                                    setScript(e.target.value);
                                    updateCurrentScene({ script: e.target.value });
                                }}
                                className="w-full h-32 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-2xl p-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] transition-all resize-none font-medium"
                                placeholder="Escribe lo que el avatar debe decir..."
                            />
                        </section>

                        <div className="p-4 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                                    <MessageSquare size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[var(--text-main)]">Subtítulos de Escena</p>
                                    <p className="text-[9px] text-[var(--text-tertiary)]">Transmisión Whisper AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const val = !generateSubtitles;
                                    setGenerateSubtitles(val);
                                    updateCurrentScene({ generateSubtitles: val });
                                }}
                                className={clsx(
                                    "w-10 h-5 rounded-full transition-colors relative",
                                    generateSubtitles ? "bg-[var(--primary)]" : "bg-[var(--border-light)]"
                                )}
                            >
                                <motion.div
                                    animate={{ x: generateSubtitles ? 20 : 2 }}
                                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-[var(--bg-main)] border-t border-[var(--border-light)]">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || scenes.length === 0}
                            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                            {isGenerating ? 'Produciendo...' : `Producir Video Final ✨`}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
