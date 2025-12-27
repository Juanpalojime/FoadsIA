import { useState, useEffect } from 'react';
import { Play, Plus, Trash2, FileText, MonitorPlay, Users, Image as ImageIcon, RefreshCw, CheckCircle2, ExternalLink, Sparkles, Send, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useCreditsStore } from '../store/useCreditsStore';
import { io } from 'socket.io-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db } from '../services/db';

export default function CommercialVideo() {
    const [activeTab, setActiveTab] = useState<'avatars' | 'backgrounds'>('avatars');
    const [script, setScript] = useState('');
    const [isRendering, setIsRendering] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [renderSuccess, setRenderSuccess] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch Avatars from Backend
    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const res = await api.getAvatars();
                if (res.status === 'success') {
                    setAvatars(res.avatars);
                    if (res.avatars.length > 0) setSelectedAvatar(res.avatars[0]);
                }
            } catch (err) {
                console.error("Failed to fetch avatars", err);
            }
        };
        fetchAvatars();
    }, []);

    // WebSocket Connection for Real-time Updates
    useEffect(() => {
        if (!jobId) return;

        const socketUrl = localStorage.getItem('FOADS_API_URL') || '';
        if (!socketUrl) return;

        const socket = io(socketUrl);

        socket.on('job_update', (data) => {
            if (data.job_id === jobId) {
                if (data.status === 'processing') {
                    setProgress(data.progress || 0);
                    if (data.message) setStatusMessage(data.message);
                } else if (data.status === 'completed') {
                    setProgress(100);
                    setVideoUrl(data.url);
                    setIsRendering(false);
                    setRenderSuccess(true);

                    // Save to Local DB
                    db.addAsset({
                        type: 'video',
                        content: data.url,
                        prompt: `Commercial Video: ${script.substring(0, 30)}...`,
                        createdAt: Date.now()
                    });
                } else if (data.status === 'failed') {
                    setError(data.error || 'Error en el renderizado');
                    setIsRendering(false);
                }
            }
        });

        return () => { socket.disconnect(); };
    }, [jobId]);

    const handleRender = async () => {
        if (!script || !selectedAvatar) {
            setError('Por favor escribe un guion y selecciona un vocero.');
            return;
        }

        const { useCredit } = useCreditsStore.getState();
        if (!useCredit(25)) {
            alert('Necesitas 25 créditos para renderizar un video comercial premium.');
            return;
        }

        setIsRendering(true);
        setRenderSuccess(false);
        setVideoUrl(null);
        setError(null);
        setProgress(5);
        setStatusMessage('Iniciando motores de producción...');

        try {
            const response = await api.renderVideo(script, selectedAvatar.id);
            if (response.status === 'success') {
                setJobId(response.job_id);
            } else {
                throw new Error(response.message || 'Error al iniciar render');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error de comunicación con el servidor.');
            setIsRendering(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                        <span className="p-2 rounded-xl bg-primary/10 text-primary shadow-inner">
                            <MonitorPlay size={32} />
                        </span>
                        Commercial Studio
                        <Badge variant="default" className="ml-2 text-[10px] tracking-widest uppercase bg-gradient-to-r from-primary to-purple-600">PRO</Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Crea videos comerciales de alta conversión con rostros humanos.</p>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* LEFT COLUMN: Configuration */}
                <Card className="w-96 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl border-border bg-card/50 backdrop-blur-sm">
                    <div className="p-6 border-b border-border bg-muted/10">
                        <h2 className="font-black flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-foreground">
                            <FileText size={18} className="text-primary" />
                            Producción de Guion
                        </h2>
                    </div>
                    <ScrollArea className="flex-1 p-6">
                        <div className="flex flex-col gap-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Texto del Guion</label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[9px] font-black gap-1 text-primary hover:bg-primary/5"
                                        onClick={async () => {
                                            const res = await api.magicPrompt(script);
                                            if (res.status === 'success') setScript(res.prompt || script);
                                        }}
                                    >
                                        <Sparkles size={10} /> IA MAGIC
                                    </Button>
                                </div>
                                <Textarea
                                    className="min-h-[200px] text-xs font-medium focus-visible:ring-primary rounded-2xl bg-muted/20 border-border p-4 leading-relaxed"
                                    placeholder="Escribe lo que dirá el vocero... Ejemplo: 'Hola, bienvenidos a EnfoadsIA, el futuro del marketing digital.'"
                                    value={script}
                                    onChange={(e) => setScript(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground italic px-1">Tip: Sé específico y usa un tono profesional.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Seleccionar Vocero (Avatar)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {avatars.map((av) => (
                                        <button
                                            key={av.id}
                                            onClick={() => setSelectedAvatar(av)}
                                            className={cn(
                                                "relative group aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5",
                                                selectedAvatar?.id === av.id ? "border-primary ring-4 ring-primary/10" : "border-transparent opacity-60 hover:opacity-100"
                                            )}
                                        >
                                            <img src={av.img} alt={av.name} className="w-full h-full object-cover rounded-xl" />
                                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[7px] text-white font-black truncate uppercase text-center">{av.name}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {avatars.length === 0 && <div className="col-span-3 py-10 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-2xl">No hay avatares disponibles</div>}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-6 bg-muted/5 border-t border-border">
                        <Button
                            onClick={handleRender}
                            disabled={isRendering || !script}
                            className="w-full py-7 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 transition-all flex items-center justify-center gap-3"
                        >
                            {isRendering ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
                            {isRendering ? 'Procesando Video...' : 'Iniciar Renderizado (25 CR)'}
                        </Button>
                    </div>
                </Card>

                {/* CENTER COLUMN: Preview / Monitoring */}
                <Card className="flex-1 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border-border bg-black/40 relative group">
                    <AnimatePresence mode="wait">
                        {videoUrl ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex items-center justify-center bg-black">
                                <video src={videoUrl} controls className="w-full h-full object-contain" autoPlay />
                                <div className="absolute top-6 right-6">
                                    <Badge className="bg-green-500 text-white flex items-center gap-2 px-3 py-1.5">
                                        <CheckCircle2 size={14} /> Renderizado Completo
                                    </Badge>
                                </div>
                            </motion.div>
                        ) : isRendering ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center">
                                <div className="relative w-56 h-56">
                                    <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
                                        <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/5" />
                                        <motion.circle
                                            cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray={628}
                                            animate={{ strokeDashoffset: 628 - (628 * progress) / 100 }}
                                            strokeLinecap="round"
                                            className="text-primary"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-primary tracking-tighter">{progress}%</span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">GPU SYNC</span>
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    <h3 className="text-2xl font-black text-foreground tracking-tight">{statusMessage || 'Preparando Render'}</h3>
                                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                        Nuestra red neuronal está sintetizando la voz y animando el vocero. Esto puede tomar de 1 a 3 minutos.
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        <Badge variant="outline" className="animate-pulse">LivePortrait Active</Badge>
                                        <Badge variant="outline" className="animate-pulse text-primary border-primary">T4 GPU Engaged</Badge>
                                    </div>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full p-12 text-center text-destructive">
                                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Error de Producción</h3>
                                <p className="text-sm font-medium opacity-80 max-w-sm">{error}</p>
                                <Button variant="outline" className="mt-8 rounded-xl" onClick={() => setError(null)}>Reintentar</Button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-6 text-muted-foreground/20 select-none">
                                <div className="p-12 rounded-[3.5rem] bg-muted/5 border-4 border-dashed border-muted-foreground/10 flex items-center justify-center">
                                    <Play size={80} fill="currentColor" strokeWidth={0} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-black uppercase tracking-[0.4em]">Vista Previa de Producción</p>
                                    <p className="text-xs font-medium opacity-50 mt-2">Configura tu guion y vocero para comenzar.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}

