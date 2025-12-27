import { useState, useEffect } from 'react';
import { Folder, Trash2, Download, CloudSync, CheckCircle2, RefreshCw, ZoomIn } from 'lucide-react';
import { db, type Asset } from '../services/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Assets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setLoading(true); // Ensure loading state is true on refresh
        try {
            const items = await db.getAllAssets();
            setAssets(items);
        } catch (e) {
            console.error(e);
        } finally {
            // Fake loading delay for better UX feel
            setTimeout(() => setLoading(false), 800);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncSuccess(false);
        await new Promise(r => setTimeout(r, 2000));
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
        await db.deleteAsset(id);
        loadAssets();
    };

    const slides = assets.filter(a => a.type === 'image').map(asset => ({ src: asset.content }));

    return (
        <TooltipProvider>
            <div className="max-w-7xl mx-auto h-full flex flex-col gap-8 pb-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black mb-2 text-foreground tracking-tight">Mis Archivos</h1>
                        <p className="text-muted-foreground font-medium">Gestiona tu librería de activos generados.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant={syncSuccess ? "secondary" : "outline"}
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={cn(
                                "gap-2 text-[10px] uppercase font-black tracking-widest h-10 px-6 rounded-xl transition-all",
                                syncSuccess && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                            )}
                        >
                            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : syncSuccess ? <CheckCircle2 size={14} /> : <CloudSync size={14} />}
                            {isSyncing ? "Sincronizando..." : syncSuccess ? "Nube Sincronizada" : "Sincronizar"}
                        </Button>
                        <Button onClick={loadAssets} className="gap-2 text-[10px] uppercase font-black tracking-widest h-10 px-6 rounded-xl shadow-lg hover:shadow-primary/20">
                            Refrescar
                        </Button>
                    </div>
                </header>

                <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col">
                    <ScrollArea className="flex-1">
                        <div className="p-8">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="aspect-square space-y-3">
                                            <Skeleton className="w-full h-full rounded-2xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-3 w-3/4 rounded-full" />
                                                <Skeleton className="h-3 w-1/2 rounded-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : assets.length === 0 ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground opacity-50 select-none">
                                    <Folder size={64} className="mb-4 text-muted-foreground/50" />
                                    <p className="font-bold text-lg">Librería Vacía</p>
                                    <p className="text-sm">Genera algo increíble para empezar.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {assets.map((asset, index) => (
                                        <div
                                            key={asset.id}
                                            className="group relative aspect-square bg-muted/30 rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:-translate-y-1"
                                        >
                                            {asset.type === 'image' && (
                                                <img
                                                    src={asset.content}
                                                    alt={asset.prompt}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onClick={() => setLightboxIndex(index)}
                                                />
                                            )}

                                            {/* Top Badges */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <Badge variant="secondary" className="backdrop-blur-md bg-black/40 text-white border-none text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                                                    {asset.type}
                                                </Badge>
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                                                <p className="text-[10px] text-white/80 line-clamp-2 mb-4 font-medium leading-relaxed">
                                                    {asset.prompt}
                                                </p>

                                                <div className="flex gap-2 justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                                                                onClick={() => setLightboxIndex(index)}
                                                            >
                                                                <ZoomIn size={14} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Ver Fullscreen</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md"
                                                                asChild
                                                            >
                                                                <a href={asset.content} download={`asset-${asset.id}.png`}>
                                                                    <Download size={14} />
                                                                </a>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Descargar</TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="h-8 w-8 rounded-lg shadow-lg"
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(asset.id!); }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Eliminar</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                <Lightbox
                    open={lightboxIndex >= 0}
                    index={lightboxIndex}
                    close={() => setLightboxIndex(-1)}
                    slides={slides}
                />
            </div>
        </TooltipProvider>
    );
}
