import { useState, useEffect } from 'react';
import { Video, RefreshCw, MessageSquare, AlertCircle, Layers, Send, Sparkles, Clock, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import MultiSceneTimeline, { type Scene } from '../components/video/MultiSceneTimeline';
import { io } from 'socket.io-client';
import { db } from '../services/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

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

                    // Save to Local DB
                    db.addAsset({
                        type: 'video',
                        content: data.url,
                        prompt: `Avatar Studio: ${scenes[0]?.script?.substring(0, 30)}...`,
                        createdAt: Date.now()
                    });
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
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-6 pb-4">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Video size={32} />
                        </span>
                        Avatar Studio
                        <Badge variant="default" className="ml-2 text-[10px] tracking-widest uppercase">Premium</Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">Editor Multi-Escena para voceros digitales.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 h-auto text-muted-foreground">
                        <Clock size={12} />
                        <span>EST. {scenes.length * 45}S</span>
                    </Badge>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Main Preview Area */}
                <main className="flex-1 flex flex-col gap-6">
                    <Card className="flex-1 border-border rounded-[2rem] overflow-hidden relative group shadow-lg bg-black/40">
                        <AnimatePresence mode="wait">
                            {videoUrl ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full h-full flex items-center justify-center bg-black"
                                >
                                    <video
                                        src={videoUrl}
                                        controls
                                        className="w-full h-full max-h-[600px] object-contain"
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
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                                            <motion.circle
                                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={552}
                                                animate={{ strokeDashoffset: 552 - (552 * progress) / 100 }}
                                                className="text-primary"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-primary">{progress}%</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Procesando</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-foreground mb-2">Renderizado Neuronal</h2>
                                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">{statusMessage || 'Preparando motores de IA...'}</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-6 text-muted-foreground/30 select-none">
                                    <div className="p-8 rounded-full bg-muted/10 border-4 border-dashed border-muted-foreground/10">
                                        <LayoutTemplate size={64} />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Vista Previa del Proyecto</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </Card>

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

                {/* Sidebar Controls */}
                <aside className="w-96 bg-card border border-border rounded-[2rem] flex flex-col overflow-hidden shadow-xl shrink-0">
                    <div className="p-6 border-b border-border bg-muted/10">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Escena Activa</h3>

                        {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-2 text-destructive text-[10px] font-bold">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <ScrollArea className="h-48 rounded-xl border border-border bg-background/50">
                            <div className="grid grid-cols-3 gap-3 p-3">
                                {avatars.map((av) => (
                                    <button
                                        key={av.id}
                                        onClick={() => {
                                            setSelectedAvatar(av);
                                            updateCurrentScene({ avatarId: av.id, avatarName: av.name, avatarImg: av.img });
                                        }}
                                        className={cn(
                                            "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5",
                                            selectedAvatar?.id === av.id ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <img src={av.img} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[7px] text-white font-black truncate uppercase text-center">{av.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                        <section className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Guion de la Escena</h3>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={async () => {
                                        const res = await api.magicPrompt(script);
                                        if (res.status === 'success') {
                                            const newPrompt = res.prompt || script;
                                            setScript(newPrompt);
                                            updateCurrentScene({ script: newPrompt });
                                        }
                                    }}
                                    className="h-7 text-[9px] font-black gap-1.5"
                                >
                                    <Sparkles size={10} />
                                    IA OPTIMIZE
                                </Button>
                            </div>
                            <Textarea
                                value={script}
                                onChange={(e) => {
                                    setScript(e.target.value);
                                    updateCurrentScene({ script: e.target.value });
                                }}
                                className="h-40 text-xs font-medium resize-none bg-muted/30"
                                placeholder="Escribe lo que el avatar debe decir en este segmento..."
                            />
                        </section>

                        <div className="p-4 bg-muted/20 rounded-2xl border border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <MessageSquare size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-foreground">Subtítulos de Escena</p>
                                    <p className="text-[9px] text-muted-foreground">Transmisión Whisper AI</p>
                                </div>
                            </div>
                            <Switch
                                checked={generateSubtitles}
                                onCheckedChange={(val) => {
                                    setGenerateSubtitles(val);
                                    updateCurrentScene({ generateSubtitles: val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-background border-t border-border">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || scenes.length === 0}
                            size="lg"
                            className="w-full py-6 text-xs font-black uppercase tracking-widest shadow-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                            {isGenerating ? 'Produciendo...' : `Producir Video Final ✨`}
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
