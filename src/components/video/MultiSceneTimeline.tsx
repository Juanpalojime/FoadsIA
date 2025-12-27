import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export interface Scene {
    id: string;
    avatarId: string;
    avatarName: string;
    avatarImg: string;
    script: string;
    generateSubtitles: boolean;
}

interface Props {
    scenes: Scene[];
    activeSceneId: string;
    onAddScene: () => void;
    onDeleteScene: (id: string) => void;
    onSelectScene: (id: string) => void;
}

export default function MultiSceneTimeline({
    scenes,
    activeSceneId,
    onAddScene,
    onDeleteScene,
    onSelectScene
}: Props) {
    return (
        <div className="bg-card border-t border-border p-4 flex flex-col gap-4 rounded-b-3xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Video size={16} className="text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Línea de Tiempo del Proyecto
                    </h4>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold bg-muted px-2 py-1 rounded-md">
                    <Clock size={12} />
                    <span>Est. {scenes.length * 20}s</span>
                </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20">
                <AnimatePresence mode='popLayout'>
                    {scenes.map((scene, idx) => (
                        <motion.div
                            key={scene.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => onSelectScene(scene.id)}
                            className={cn(
                                "flex-shrink-0 w-40 h-24 rounded-2xl border-2 transition-all cursor-pointer relative group overflow-hidden select-none",
                                activeSceneId === scene.id
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-border bg-muted/20 hover:border-primary/50"
                            )}
                        >
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded text-[8px] font-black text-white z-10">
                                ESCENA {idx + 1}
                            </div>

                            {scenes.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteScene(scene.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-destructive shadow-lg"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}

                            <img
                                src={scene.avatarImg}
                                alt=""
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-[9px] text-white font-bold truncate">
                                    {scene.script || 'Sin guion...'}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button
                    onClick={onAddScene}
                    className="flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group text-muted-foreground hover:text-primary"
                >
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase">Nueva</span>
                </button>
            </div>
        </div>
    );
}
