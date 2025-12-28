import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, RefreshCw, AlertCircle, Maximize2, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { db } from '../services/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { soundManager } from '@/lib/sounds';
import { useToast } from '@/components/ui/toast';

export default function GenerateImages() {
    const { showToast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const socketUrl = localStorage.getItem('FOADS_API_URL') || '';
        if (!socketUrl) return;

        const newSocket = io(socketUrl);
        newSocket.on('generation_progress', (data) => {
            if (data.progress) setProgress(data.progress);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);
    const [steps, setSteps] = useState(4); // Optimizado para SDXL Lightning (Hiperrealismo)
    const [performance, setPerformance] = useState('speed');
    const [guidance, setGuidance] = useState(2.0); // Guidance bajo para mayor realismo
    const [negativePrompt, setNegativePrompt] = useState('');
    const [styles, setStyles] = useState<string[]>(['Fooocus V2', 'Fooocus Cinematic', 'Fooocus Photograph', 'SAI Anime', 'SAI 3D Model', 'MRE Cinematic Dynamic', 'None']);
    const [selectedStyle, setSelectedStyle] = useState('Fooocus V2');

    useEffect(() => {
        const fetchStyles = async () => {
            try {
                const res = await api.getStyles();
                if (res.status === 'success' && res.styles) {
                    setStyles(res.styles);
                }
            } catch (e) {
                console.warn("Failed to fetch styles, using defaults");
            }
        };
        fetchStyles();
    }, []);

    const handleMagicPrompt = async () => {
        if (!prompt || isOptimizing) return;
        setIsOptimizing(true);
        try {
            const res = await api.magicPrompt(prompt);
            if (res.status === 'success' && res.prompt) {
                setPrompt(res.prompt);
                showToast('✨ Prompt optimizado para Hiperrealismo', 'success');
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            console.warn("Backend Magic Prompt failed, using local logic", err);
            // Local fallback logic optimized for PHOTOREALISM
            const realismKeywords = "Cinematic, Hyper-realistic, 8k uhd, DSLR, soft lighting, high quality, film grain, Fujifilm XT3";
            const newPrompt = `${realismKeywords}, ${prompt}, detailed texture, masterpiece`;
            setPrompt(newPrompt);
            showToast('✨ Prompt optimizado (Modo Local Realista)', 'info');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt || isGenerating) return;

        setIsGenerating(true);
        setResultImage(null);
        setError(null);

        try {
            const response = await api.generateImage(prompt, aspectRatio, steps, guidance, negativePrompt, selectedStyle);
            if (response.status === 'success' && response.image) {
                setResultImage(response.image);
                soundManager.playSuccess();
                showToast('🎨 Imagen generada exitosamente', 'success');
                await db.addAsset({
                    type: 'image',
                    content: response.image,
                    prompt: prompt,
                    createdAt: Date.now(),
                });
            } else {
                setError(response.message || 'La generación falló. Intenta con un prompt diferente.');
                showToast(response.message || 'Error en la generación', 'error');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            setError('Error de comunicación con el servidor de IA.');
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-8 pb-12 h-screen max-h-[calc(100vh-6rem)]">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
                            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                <Sparkles className="w-8 h-8" />
                            </span>
                            Imagen Pro Hub
                            <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 ml-2 animate-pulse">
                                {performance === 'speed' ? 'Lightning Engine' : 'Juggernaut XL Engine'}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">Renderizado fotorrealista de alto nivel impulsado por SDXL.</p>
                    </div>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                    {/* Left: Controls */}
                    <aside className="lg:col-span-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                        <Card className="rounded-[2.5rem] border-muted overflow-hidden relative shadow-lg h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                            <CardContent className="p-6 space-y-6 relative z-10">
                                <Tabs defaultValue="txt2img" className="w-full">
                                    <TabsList className="w-full grid grid-cols-2 mb-6">
                                        <TabsTrigger value="txt2img" className="font-bold uppercase text-[10px] tracking-widest"><Zap size={14} className="mr-2" /> Text to Image</TabsTrigger>
                                        <TabsTrigger value="img2img" className="font-bold uppercase text-[10px] tracking-widest" disabled><Layers size={14} className="mr-2" /> Image to Image</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="txt2img" className="space-y-6">
                                        {/* Prompt Input */}
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                                    Prompt
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm border-primary/20 text-primary">Required</Badge>
                                                </label>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={handleMagicPrompt}
                                                            disabled={!prompt || isOptimizing}
                                                            className="h-6 text-[9px] font-black uppercase tracking-widest gap-1.5 px-2"
                                                        >
                                                            {isOptimizing ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                                                            Magic
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Mejorar prompt con GPT-4</TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <Textarea
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="Describe tu imaginación con el mayor detalle posible..."
                                                className="min-h-[140px] bg-muted/30 border-2 border-border focus-visible:border-primary rounded-2xl p-4 text-sm font-medium resize-y shadow-sm transition-all focus:bg-background"
                                            />
                                        </div>

                                        {/* Performance Mode */}
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Rendimiento (Modo)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 'speed', label: 'Velocidad', desc: '4-8 pasos (Lightning)', icon: Zap },
                                                    { id: 'quality', label: 'Calidad Pro', desc: '30-40 pasos (Juggernaut)', icon: Sparkles },
                                                ].map((mode) => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => {
                                                            setPerformance(mode.id);
                                                            setSteps(mode.id === 'speed' ? 4 : 30);
                                                            setGuidance(mode.id === 'speed' ? 2 : 7);
                                                        }}
                                                        className={cn(
                                                            'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all transform active:scale-95 text-center',
                                                            performance === mode.id
                                                                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                        )}
                                                    >
                                                        <mode.icon size={14} className="mb-1" />
                                                        <span className="text-xs font-black">{mode.label}</span>
                                                        <span className="text-[8px] font-bold opacity-70 tracking-tight leading-none">{mode.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Aspect Ratio */}
                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Dimensiones (Aspect Ratio)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: '1:1', label: '1:1', desc: 'Square' },
                                                    { id: '11:8', label: '11:8', desc: 'Default' },
                                                    { id: '8:11', label: '8:11', desc: 'Portrait' },
                                                    { id: '16:9', label: '16:9', desc: 'Cinema' },
                                                    { id: '9:16', label: '9:16', desc: 'Mobile' },
                                                    { id: '21:9', label: '21:9', desc: 'UltraWide' },
                                                ].map((ratio) => (
                                                    <button
                                                        key={ratio.id}
                                                        onClick={() => setAspectRatio(ratio.id)}
                                                        className={cn(
                                                            'flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all text-center',
                                                            aspectRatio === ratio.id
                                                                ? 'bg-primary border-primary text-primary-foreground shadow-md'
                                                                : 'bg-background border-border text-muted-foreground hover:bg-muted'
                                                        )}
                                                    >
                                                        <span className="text-[10px] font-black">{ratio.label}</span>
                                                        <span className="text-[7px] font-bold opacity-60 uppercase">{ratio.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Advanced Settings Accordion */}
                                        <Accordion type="single" collapsible className="w-full border-t border-border mt-4">
                                            <AccordionItem value="advanced" className="border-b-0">
                                                <AccordionTrigger className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground hover:no-underline py-4">
                                                    Configuración Avanzada
                                                </AccordionTrigger>
                                                <AccordionContent className="space-y-6 pt-2 pb-4 px-1">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <span>Steps (Iteraciones)</span>
                                                            <span className="text-primary bg-primary/10 px-2 rounded">{steps}</span>
                                                        </div>
                                                        <Slider
                                                            value={[steps]}
                                                            min={10} max={50} step={1}
                                                            onValueChange={(val) => setSteps(val[0])}
                                                            className="py-2"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            <span>Guidance Scale (CFG)</span>
                                                            <span className="text-primary bg-primary/10 px-2 rounded">{guidance}</span>
                                                        </div>
                                                        <Slider
                                                            value={[guidance]}
                                                            min={1} max={20} step={0.5}
                                                            onValueChange={(val) => setGuidance(val[0])}
                                                            className="py-2"
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prompt Negativo</label>
                                                        <Textarea
                                                            value={negativePrompt}
                                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                                            placeholder="Elementos a excluir..."
                                                            className="h-20 bg-muted/30 border-border text-xs rounded-xl"
                                                        />
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>

                                        <div className="flex flex-col gap-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Estilo Artístico</label>
                                            <select
                                                value={selectedStyle}
                                                onChange={(e) => setSelectedStyle(e.target.value)}
                                                className="w-full bg-muted/30 border-2 border-border rounded-2xl p-3 text-xs font-bold focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                                                style={{ backgroundImage: 'none' }}
                                            >
                                                {styles.map((style) => (
                                                    <option key={style} value={style}>{style}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Button
                                            onClick={handleGenerate}
                                            disabled={!prompt || isGenerating}
                                            size="lg"
                                            className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                            <div className="relative flex items-center gap-3">
                                                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} className="fill-white/20" />}
                                                {isGenerating ? 'Generando...' : `Generar (${performance === 'speed' ? '4' : '15'} Tokens)`}
                                            </div>
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Right: Results */}
                    <main className="lg:col-span-8 flex flex-col h-full min-h-0">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive font-bold text-sm shadow-lg"
                            >
                                <AlertCircle size={18} />
                                {error}
                            </motion.div>
                        )}

                        <Card className="flex-1 border-border bg-card/50 backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-2xl group flex flex-col justify-center relative border-2 border-dashed border-muted-foreground/10">
                            {!resultImage && !isGenerating ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center select-none opacity-40">
                                    <div className="w-32 h-32 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                                        <ImageIcon size={64} className="text-muted-foreground -rotate-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tight">Estudio Listo</h3>
                                    <p className="text-base text-muted-foreground font-medium max-w-sm leading-relaxed">Configura los parámetros a la izquierda y observa la magia ocurrir aquí.</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center bg-black/5 p-4">
                                    <AnimatePresence>
                                        {isGenerating && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl"
                                            >
                                                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                                    {/* Outer Ring */}
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                            strokeDasharray={2 * Math.PI * 88}
                                                            strokeDashoffset={2 * Math.PI * 88 * (1 - (progress / 100))}
                                                            className="text-primary transition-all duration-300 ease-out"
                                                        />
                                                    </svg>

                                                    {/* Center Content */}
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-4xl font-black text-foreground">{progress}%</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Renderizando</span>
                                                    </div>
                                                </div>

                                                <span className="text-lg font-black uppercase tracking-[0.25em] text-foreground animate-pulse">Creando...</span>
                                                <p className="text-xs text-muted-foreground mt-3 font-bold uppercase tracking-widest">
                                                    {progress < 30 ? "Inicializando Tensores" : progress < 70 ? "Difusión Estocástica" : "Refinando Detalles"}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {resultImage && !isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative flex items-center justify-center w-full h-full"
                                        >
                                            <img
                                                src={resultImage}
                                                alt="AI Generated"
                                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                                            />

                                            {/* Floating Actions */}
                                            <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-12 w-12 rounded-2xl backdrop-blur-xl bg-black/50 hover:bg-black/70 text-white border border-white/10"
                                                    onClick={() => window.open(resultImage, '_blank')}
                                                >
                                                    <Maximize2 size={20} />
                                                </Button>
                                                <Button
                                                    className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-xl hover:shadow-2xl border-none font-black uppercase tracking-widest text-xs gap-2"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = resultImage;
                                                        link.download = `EnfoadsIA-${Date.now()}.png`;
                                                        link.click();
                                                    }}
                                                >
                                                    <Download size={18} />
                                                    Descargar HD
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    );
}
