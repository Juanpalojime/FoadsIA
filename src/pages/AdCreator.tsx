import React, { useState } from 'react';
import { Sparkles, Trash2, History, Smartphone, Square, Monitor, ArrowRight, Zap, RefreshCw, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdConfig, AdVariation, AspectRatio } from '../types';
import { generateAdVariations } from '../services/gemini';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

const AspectButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <Button
        variant={active ? "default" : "outline"}
        onClick={onClick}
        className={cn(
            "flex flex-col items-center gap-1 h-auto py-2 min-w-[60px]",
            active ? 'border-primary' : 'hover:border-primary/50'
        )}
    >
        <Icon size={16} />
        <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </Button>
);

const AdCard: React.FC<{
    variation: AdVariation,
    isActive: boolean,
    onSelect: () => void,
    onAdjust?: () => void,
    onUse?: () => void
}> = ({ variation, isActive, onSelect, onAdjust, onUse }) => (
    <Card
        onClick={onSelect}
        className={cn(
            "group relative overflow-hidden cursor-pointer transition-all border-2 hover:border-primary/50",
            isActive ? 'border-primary shadow-lg shadow-primary/20 scale-[0.98]' : 'border-border'
        )}
    >
        <div className="aspect-[16/10] w-full bg-muted relative overflow-hidden">
            <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={variation.imageUrl} alt={variation.headline} />
            {isActive && (
                <Badge className="absolute top-3 right-3 bg-primary text-white z-10">Activo</Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
        <CardContent className="p-5">
            <h4 className="text-foreground font-bold text-sm tracking-tight mb-1 truncate">{variation.headline}</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 mb-4">{variation.description}</p>
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onAdjust) onAdjust();
                    }}
                >
                    Ajustar
                </Button>
                <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="flex-1 text-[10px] font-black uppercase tracking-widest h-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onUse) onUse();
                    }}
                >
                    {isActive ? 'Listo' : 'Usar'}
                </Button>
            </div>
        </CardContent>
    </Card>
);

const Mockup = ({ ad, ratio }: { ad?: AdVariation, ratio: AspectRatio }) => {
    if (!ad) {
        return (
            <div className="w-full max-w-[260px] aspect-[9/16] bg-card border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground p-8 text-center text-xs animate-pulse">
                <Smartphone size={32} className="mb-4 opacity-20" />
                Selecciona una variación para previsualizar el diseño final.
            </div>
        );
    }

    const containerSizes: Record<AspectRatio, string> = {
        [AspectRatio.PORTRAIT]: 'w-[240px] aspect-[9/16]',
        [AspectRatio.SQUARE]: 'w-[280px] aspect-square',
        [AspectRatio.LANDSCAPE]: 'w-full max-w-[340px] aspect-video'
    };

    return (
        <div className={cn(
            "relative bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-500",
            containerSizes[ratio],
            ratio === AspectRatio.PORTRAIT ? "rounded-[2.8rem] border-[6px] border-zinc-900" : "rounded-3xl border-4 border-zinc-900"
        )}>
            {ratio === AspectRatio.PORTRAIT && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-zinc-900 rounded-b-2xl z-20"></div>}
            <div className="w-full h-full bg-black relative">
                <img className="w-full h-full object-cover opacity-80" src={ad.imageUrl} alt="Ad background" />
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-purple-500 border border-white/20 flex items-center justify-center text-[10px] font-black text-white">E</div>
                        <span className="text-white text-[10px] font-black tracking-widest drop-shadow-lg">ENFOADSIA</span>
                    </div>
                </div>
                <div className="absolute bottom-10 left-6 right-6 z-10">
                    <h2 className="text-white text-lg font-black italic drop-shadow-xl leading-tight mb-2 uppercase line-clamp-3">{ad.headline}</h2>
                    <p className="text-white text-[10px] drop-shadow-lg mb-4 line-clamp-2 opacity-90 font-medium">{ad.description}</p>
                    <Button size="sm" className="w-full bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-widest shadow-xl">
                        {ad.cta}
                    </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default function AdCreator() {
    const [config, setConfig] = useState<AdConfig>({
        tone: 'Profesional',
        audience: 'Emprendedores',
        goal: 'Conversión / Ventas',
        creativity: 75,
        brandSafety: true,
        includeLogo: true
    });
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [variations, setVariations] = useState<AdVariation[]>([]);
    const [selectedVarIndex, setSelectedVarIndex] = useState(0);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);
    const [showConfig, setShowConfig] = useState(false);

    const selectedAd = variations[selectedVarIndex];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const results = await generateAdVariations(prompt, config);
            setVariations(results);
            setSelectedVarIndex(0);
        } catch (err) {
            console.error(err);
            alert("Error al generar. Asegúrate de tener configurada la API Key de Google.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAdjustVariation = (index: number) => {
        setSelectedVarIndex(index);
        // Scroll to configuration panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowConfig(true);
        alert(`Ajustando variación ${index + 1}. Modifica la configuración y regenera.`);
    };

    const handleUseVariation = (index: number) => {
        setSelectedVarIndex(index);
        alert(`Variación ${index + 1} seleccionada. Puedes previsualizarla en el panel derecho.`);
    };

    const handleExport = () => {
        if (!selectedAd) {
            alert('Selecciona una variación primero');
            return;
        }

        // Aquí puedes agregar lógica de exportación real
        const exportData = {
            variation: selectedAd,
            aspectRatio,
            config,
            exportedAt: new Date().toISOString()
        };

        console.log('Exportando campaña:', exportData);
        alert(`¡Campaña exportada!\n\nTítulo: ${selectedAd.headline}\nFormato: ${aspectRatio}\n\nRevisa la consola para más detalles.`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-10rem)] pb-12">
            {/* Configuration Panel */}
            <aside className={cn(
                "lg:w-72 bg-card border border-border rounded-[2rem] flex flex-col transition-all duration-300 overflow-hidden shrink-0 shadow-lg",
                showConfig ? "max-h-[1000px]" : "max-h-[64px] lg:max-h-none"
            )}>
                <div className="p-5 border-b border-border flex justify-between items-center bg-muted/20">
                    <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-foreground">
                        <Zap size={16} className="text-primary" />
                        Configuración
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowConfig(!showConfig)} className="lg:hidden">
                        {showConfig ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Tono de Voz</label>
                        <select
                            className="w-full bg-background border border-input text-foreground text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            value={config.tone}
                            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                        >
                            <option>Profesional</option>
                            <option>Divertido e Ingenioso</option>
                            <option>Urgente</option>
                            <option>Empático</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Audiencia Objetivo</label>
                        <select
                            className="w-full bg-background border border-input text-foreground text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                            value={config.audience}
                            onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                        >
                            <option>Emprendedores</option>
                            <option>Gen Z Gamers</option>
                            <option>Fitness</option>
                            <option>Padres Primerizos</option>
                        </select>
                    </div>

                    <div className="h-px bg-border w-full opacity-50"></div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                            <label className="text-muted-foreground">Creatividad</label>
                            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                                {config.creativity > 70 ? 'AI Boosted' : config.creativity > 30 ? 'Balance' : 'Safe'}
                            </Badge>
                        </div>
                        <Slider
                            value={[config.creativity]}
                            max={100}
                            step={1}
                            onValueChange={(vals) => setConfig({ ...config, creativity: vals[0] })}
                        />
                    </div>

                    <div className="space-y-6 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">Brand Safety</label>
                            <Switch checked={config.brandSafety} onCheckedChange={(v) => setConfig({ ...config, brandSafety: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground">Incluir Logo</label>
                            <Switch checked={config.includeLogo} onCheckedChange={(v) => setConfig({ ...config, includeLogo: v })} />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-card border border-border rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl lg:min-h-[500px]">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-muted/10 backdrop-blur-md">
                        <div>
                            <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-widest text-foreground">
                                <Sparkles size={18} className="text-yellow-500" />
                                Ad Creator Studio
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                <History size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => { setPrompt(''); setVariations([]); }}>
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col gap-10 custom-scrollbar">
                        <div className="relative group space-y-4">
                            <Textarea
                                className="min-h-[160px] text-lg lg:text-xl font-medium resize-none bg-muted/30 border-2 focus-visible:ring-0 focus-visible:border-primary rounded-3xl p-6"
                                placeholder="¿Qué quieres anunciar hoy? Describe tu producto y estilo..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">{prompt.length}/500</span>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    size="lg"
                                    className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg font-black uppercase tracking-wider rounded-2xl px-8"
                                >
                                    {isGenerating ? <RefreshCw size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                                    {isGenerating ? 'Creando...' : 'Generar Campaña'}
                                </Button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {variations.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-4 px-2">
                                        <span className="h-px flex-1 bg-border" />
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] text-center">
                                            IDEAS GENERADAS POR IA
                                        </h3>
                                        <span className="h-px flex-1 bg-border" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {variations.map((v, idx) => (
                                            <AdCard
                                                key={v.id}
                                                variation={v}
                                                isActive={selectedVarIndex === idx}
                                                onSelect={() => setSelectedVarIndex(idx)}
                                                onAdjust={() => handleAdjustVariation(idx)}
                                                onUse={() => handleUseVariation(idx)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-pulse">
                                <Sparkles size={48} className="text-primary mb-4" />
                                <h4 className="font-black text-xl mb-2">Gemini está trabajando...</h4>
                                <p className="text-muted-foreground text-sm">Creando variaciones de alto impacto.</p>
                            </div>
                        )}

                        {!isGenerating && variations.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center opacity-30 select-none">
                                <Layers size={48} className="mb-6 text-muted-foreground" />
                                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Escribe algo y presiona generar</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Preview Panel */}
            <aside className="lg:w-80 bg-card border border-border rounded-[2.5rem] flex flex-col shrink-0 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/20">
                    <Monitor size={18} className="text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Vista de Mockup</h2>
                </div>

                <div className="p-8 flex-1 flex flex-col gap-8 items-center justify-center bg-muted/5">
                    <div className="flex gap-2 p-1.5 bg-background rounded-xl border border-border shadow-sm">
                        <AspectButton icon={Smartphone} label="Móvil" active={aspectRatio === AspectRatio.PORTRAIT} onClick={() => setAspectRatio(AspectRatio.PORTRAIT)} />
                        <AspectButton icon={Square} label="Feed" active={aspectRatio === AspectRatio.SQUARE} onClick={() => setAspectRatio(AspectRatio.SQUARE)} />
                        <AspectButton icon={Monitor} label="Web" active={aspectRatio === AspectRatio.LANDSCAPE} onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)} />
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full min-h-[400px]">
                        <Mockup ad={selectedAd} ratio={aspectRatio} />
                    </div>
                </div>

                <div className="p-8 border-t border-border bg-background">
                    <Button
                        className="w-full py-6 rounded-xl font-black uppercase tracking-widest shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 text-white"
                        onClick={handleExport}
                        disabled={!selectedAd}
                    >
                        Finalizar y Exportar
                        <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>
            </aside>
        </div>
    );
}
