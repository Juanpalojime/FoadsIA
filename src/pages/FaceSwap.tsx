import { useState } from 'react';
import { Upload, Save, Image as ImageIcon, Video as VideoIcon, RefreshCw, Download, AlertCircle, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { db } from '../services/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fadeInUp, hoverLift, scaleIn } from '@/lib/animations';

type MediaType = 'image' | 'video';

export default function FaceSwap() {
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [targetMedia, setTargetMedia] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFile: (s: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const b64 = await toBase64(file);
                setFile(b64);
                setResultImage(null);
                setError(null);
            } catch (err) {
                console.error("Error reading file", err);
            }
        }
    };

    const handleProcess = async () => {
        if (!sourceImage || !targetMedia) return;

        setIsProcessing(true);
        setError(null);
        try {
            const response = await api.faceSwap(sourceImage, targetMedia);
            if (response.status === 'success' && response.image) {
                setResultImage(response.image);
                await db.addAsset({
                    type: 'image',
                    content: response.image,
                    prompt: 'Face Swap Result',
                    createdAt: Date.now()
                });
            } else {
                setError(response.message || 'Error en el procesamiento');
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <motion.div {...fadeInUp}>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3 tracking-tight">
                        <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                            <Zap className="w-8 h-8" />
                        </span>
                        Face Swap Lab
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Intercambio de rostros de alta precisión impulsado por InsightFace.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex bg-muted/50 p-1.5 rounded-xl border border-border"
                >
                    <Button
                        variant={mediaType === 'image' ? 'default' : 'ghost'}
                        onClick={() => { setMediaType('image'); setTargetMedia(null); setResultImage(null); }}
                        className="rounded-lg gap-2 font-bold uppercase tracking-wider text-xs"
                    >
                        <ImageIcon size={16} />
                        Foto
                    </Button>
                    <Button
                        variant="ghost"
                        disabled
                        className="rounded-lg gap-2 font-bold uppercase tracking-wider text-xs opacity-50"
                    >
                        <VideoIcon size={16} />
                        Video
                    </Button>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side inputs */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Source Image Card */}
                    <motion.div {...hoverLift}>
                        <Card className="overflow-hidden border-orange-500/20 shadow-lg shadow-orange-500/5 group">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-muted-foreground flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-orange-500/10 text-orange-500 flex items-center justify-center text-[10px]">1</span>
                                    Cara Origen
                                </h3>
                                <div className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-orange-500/50 bg-muted/30 transition-all flex flex-col items-center justify-center relative overflow-hidden group/upload cursor-pointer hover:bg-muted/50">
                                    {sourceImage ? (
                                        <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6 space-y-3">
                                            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover/upload:scale-110 transition-transform">
                                                <Upload className="text-muted-foreground group-hover/upload:text-orange-500 transition-colors" size={28} />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subir Rostro</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleFileUpload(e, setSourceImage)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Target Media Card */}
                    <motion.div {...hoverLift} transition={{ delay: 0.1 }}>
                        <Card className="overflow-hidden border-purple-500/20 shadow-lg shadow-purple-500/5 group">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-muted-foreground flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center text-[10px]">2</span>
                                    Imagen Destino
                                </h3>
                                <div className="aspect-video rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-purple-500/50 bg-muted/30 transition-all flex flex-col items-center justify-center relative overflow-hidden group/upload cursor-pointer hover:bg-muted/50">
                                    {targetMedia ? (
                                        <img src={targetMedia} alt="Target" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6 space-y-3">
                                            <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover/upload:scale-110 transition-transform">
                                                <Upload className="text-muted-foreground group-hover/upload:text-purple-500 transition-colors" size={28} />
                                            </div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subir Destino</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => handleFileUpload(e, setTargetMedia)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Processing Results */}
                <Card className="lg:col-span-8 min-h-[600px] flex flex-col relative overflow-hidden shadow-2xl border-border bg-card/50 backdrop-blur-sm">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute top-6 left-6 right-6 z-30 bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-xs flex items-center gap-3 font-bold uppercase tracking-widest backdrop-blur-md"
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Start Button Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        {!isProcessing && sourceImage && targetMedia && !resultImage && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleProcess}
                                    size="lg"
                                    className="pointer-events-auto h-16 px-10 rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-2xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0"
                                >
                                    <RefreshCw size={20} className="mr-3" />
                                    Iniciar Intercambio
                                </Button>
                            </motion.div>
                        )}
                    </div>

                    {/* Main Canvas Area */}
                    <div className="flex-1 bg-black/40 flex items-center justify-center p-8 relative">
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                        {isProcessing ? (
                            <div className="text-center space-y-8 relative z-10">
                                <div className="relative w-32 h-32 mx-auto">
                                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-t-primary border-r-purple-500 rounded-full animate-spin" />
                                    <div className="absolute inset-4 bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Sparkles size={32} className="text-primary animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-foreground font-black uppercase tracking-[0.3em] text-sm animate-pulse">Procesando IA</p>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">InsightFace Buffalo_L Engine Active</p>
                                </div>
                            </div>
                        ) : resultImage ? (
                            <motion.div
                                {...scaleIn}
                                className="w-full h-full flex items-center justify-center relative p-4"
                            >
                                <img
                                    src={resultImage}
                                    alt="Result"
                                    className="max-w-full max-h-full rounded-xl shadow-2xl object-contain ring-1 ring-white/10"
                                />

                                <div className="absolute bottom-8 right-8 flex gap-4">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-12 w-12 rounded-xl bg-background/50 backdrop-blur-md border border-white/10 hover:bg-background/80"
                                        asChild
                                    >
                                        <a href={resultImage} download="faceswap-result.png">
                                            <Download size={20} />
                                        </a>
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center opacity-20 select-none">
                                <Zap size={80} className="mx-auto mb-6 text-muted-foreground" />
                                <p className="font-black uppercase tracking-[0.4em] text-sm text-muted-foreground">Waiting for Input</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Status Bar */}
                    <div className="h-14 border-t border-border bg-card/30 backdrop-blur-md flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Neural Match V4.2 Protected</span>
                        </div>
                        <div className="flex gap-4">
                            {resultImage && (
                                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                    <Save size={12} />
                                    Guardado
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
