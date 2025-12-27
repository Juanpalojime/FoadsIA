import { useEffect, useState } from 'react';
import { Compass, Sparkles, Heart, Share2, Eye, Play, X, Filter, Film, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import type { Asset } from '../services/db';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const industries = ['Todas', 'E-commerce', 'Tecnología', 'Moda', 'Educación', 'Inmuebles'];
const platforms = ['Todas', 'TikTok/Reels', 'YouTube', 'Ads', 'Cine'];
const styles = ['Todas', 'Cinematográfico', 'Minimalista', 'Vibrante', 'Vintage'];

export default function Inspiration() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selectedIndustry, setSelectedIndustry] = useState('Todas');
    const [selectedPlatform, setSelectedPlatform] = useState('Todas');
    const [selectedStyle, setSelectedStyle] = useState('Todas');
    const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

    // Lightbox State
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    useEffect(() => {
        const loadAssets = async () => {
            const all = await db.getAllAssets();
            setAssets(all);
            setLoading(false);
        };
        loadAssets();
    }, []);

    const toggleLike = (id: number) => {
        setLikedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredAssets = assets.filter(a => {
        const typeMatch = filter === 'all' || a.type === filter;
        return typeMatch;
    });

    // Prepare slides for Lightbox
    // Note: Lightbox works best with images. For video support, we'd need the video plugin, 
    // but for now we'll just show images or placeholders for videos.
    const slides = filteredAssets.map(asset =>
        asset.type === 'video'
            ? { type: 'video', src: asset.content, width: 1280, height: 720, poster: asset.content } // simplified for now
            : { src: asset.content }
    );

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-8 pb-12">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight text-foreground">
                            <Compass className="text-primary" size={32} />
                            Hub de Inspiración <Badge variant="default" className="text-xs px-2 py-0.5 rounded-full ml-2">PREMIUM</Badge>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">Directorio de activos IA de alto impacto visual.</p>
                    </div>

                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border shadow-sm">
                        {['all', 'image', 'video'].map((f) => (
                            <Button
                                key={f}
                                variant={filter === f ? 'default' : 'ghost'}
                                onClick={() => setFilter(f as any)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest",
                                    filter === f && "shadow-md"
                                )}
                            >
                                {f === 'all' ? 'Todas' : f === 'image' ? 'Imágenes' : 'Videos'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mr-2">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Filtros Pro:</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="bg-background border border-input text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-primary transition-all uppercase"
                        >
                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>

                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="bg-background border border-input text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-primary transition-all uppercase"
                        >
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="bg-background border border-input text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-primary transition-all uppercase"
                        >
                            {styles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="flex-1 bg-card border border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center shadow-lg">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <Sparkles size={40} className="text-primary opacity-20" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Sin contenido en esta categoría</h2>
                    <p className="text-muted-foreground max-w-sm">Genera tu primera creación para verla aquí.</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-1">
                    {filteredAssets?.map((asset, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            key={asset.id}
                            onClick={() => setLightboxIndex(idx)}
                            className="break-inside-avoid bg-card border border-border rounded-3xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-md hover:shadow-2xl relative active:scale-[0.98] transform hover:-translate-y-1 mb-6"
                        >
                            <div className="relative overflow-hidden aspect-auto">
                                <img
                                    src={asset.content}
                                    alt={asset.prompt}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 border border-white/20 shadow-xl">
                                        {asset.type === 'video' ? <Play fill="currentColor" size={24} /> : <Eye size={24} />}
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                                        {asset.type === 'video' ? <Film size={10} className="inline mr-1" /> : <Zap size={10} className="inline mr-1" />}
                                        {asset.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 bg-gradient-to-b from-transparent to-background/5">
                                <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium leading-relaxed">"{asset.prompt}"</p>
                                <div className="flex items-center justify-between mt-5 border-t border-border pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-indigo-500 ring-2 ring-background"></div>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Foads_Creator</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLike(asset.id!); }}
                                        className={cn(
                                            "flex items-center gap-1.5 transition-all text-[10px] font-bold group/like",
                                            likedItems.has(asset.id!) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                                        )}
                                    >
                                        <Heart size={14} className="group-hover/like:scale-110 transition-transform" fill={likedItems.has(asset.id!) ? "currentColor" : "none"} />
                                        <span>{likedItems.has(asset.id!) ? 501 : 500}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <Lightbox
                open={lightboxIndex >= 0}
                index={lightboxIndex}
                close={() => setLightboxIndex(-1)}
                slides={slides}
            />
        </div>
    );
}
