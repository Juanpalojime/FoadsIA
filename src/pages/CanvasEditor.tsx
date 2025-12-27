
import React, { useState, useCallback } from 'react';
import Toolbar from '../components/canvas/Toolbar';
import CanvasArea from '../components/canvas/CanvasArea';
import RightPanel from '../components/canvas/RightPanel';
import BottomBar from '../components/canvas/BottomBar';
import { Layer, ToolType, Selection } from '../types';
import { generateGeminiImage } from '../services/gemini';

const INITIAL_LAYERS: Layer[] = [
    {
        id: 'layer-1',
        name: 'Imagen Principal',
        type: 'image',
        visible: true,
        locked: false,
        content: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1080'
    },
    {
        id: 'layer-text',
        name: 'Título Headline',
        type: 'text',
        visible: true,
        locked: true,
        content: 'ENFOADS IA 2025'
    },
    {
        id: 'layer-bg',
        name: 'Fondo Estudio',
        type: 'background',
        visible: true,
        locked: true,
        content: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)'
    }
];

export default function CanvasEditor() {
    const [activeTool, setActiveTool] = useState<ToolType>('select');
    const [zoom, setZoom] = useState(65);
    const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleLayerVisibility = useCallback((id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    }, []);

    const toggleLayerLock = useCallback((id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    }, []);

    const handleGenerate = async (selection: Selection) => {
        setIsGenerating(true);

        const tempId = `ai-gen-${Date.now()}`;
        const newAiLayer: Layer = {
            id: tempId,
            name: `Gen IA ${layers.filter(l => l.type === 'ai').length + 1}`,
            type: 'ai',
            visible: true,
            locked: false,
            content: '',
            isProcessing: true
        };

        setLayers(prev => [newAiLayer, ...prev]);

        try {
            const prompt = "A highly detailed futuristic glowing asset, professional photography, studio lighting, product marketing style";
            const imageUrl = await generateGeminiImage(prompt);
            setLayers(prev => prev.map(l => l.id === tempId ? { ...l, content: imageUrl, isProcessing: false } : l));
        } catch (err) {
            setLayers(prev => prev.filter(l => l.id !== tempId));
            alert("Erorr al generar asset con IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const addEmptyLayer = () => {
        const newLayer: Layer = {
            id: `layer-${Date.now()}`,
            name: `Nueva Capa ${layers.length + 1}`,
            type: 'text',
            visible: true,
            locked: false,
            content: 'Nuevo Texto'
        };
        setLayers(prev => [newLayer, ...prev]);
    };

    return (
        <div className="h-[calc(100vh-6rem)] bg-[var(--bg-main)] rounded-xl border border-[var(--border-light)] flex overflow-hidden relative shadow-2xl">
            <main className="flex-1 flex flex-col relative h-full">
                {/* Workspace Area */}
                <div className="flex flex-1 relative overflow-hidden">
                    <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />

                    <CanvasArea
                        zoom={zoom}
                        layers={layers}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />

                    <BottomBar zoom={zoom} setZoom={setZoom} />
                </div>
            </main>

            <RightPanel
                layers={layers}
                onToggleVisibility={toggleLayerVisibility}
                onToggleLock={toggleLayerLock}
                onAddLayer={addEmptyLayer}
            />
        </div>
    );
}
