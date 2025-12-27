
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import CanvasArea from './components/CanvasArea';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';
import { Layer, ToolType, Selection } from './types';
import { generateNewLayer } from './services/geminiService';

const INITIAL_LAYERS: Layer[] = [
  {
    id: 'layer-1',
    name: 'Product Image',
    type: 'image',
    visible: true,
    locked: false,
    content: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNdY6bFMhNlHwUUjO3njIFjzOkGueivYNzuXMWdE7RTNMrfsX5gbm36RFZRt7msZp70iVv3Atyda_LKMEwzqGqbnOQJ0da44tMc_bpCRB3ZCNwTfqUmp0xo4HrsIs5oKAKhk3ymNGNH4VzaV71y7Y2Mc7eC1bf66uFhFTRVFjse9LkqcEjbdHrFGuyEzLPdw9YyDDlWJatmQ_CypvuUtblksLNj6fkjmHVUVQaCMnEyVsc9XSOeu1a0jX2nXd6VSnvpEADuoM9MtSv'
  },
  {
    id: 'layer-text',
    name: 'Headline Text',
    type: 'text',
    visible: true,
    locked: true,
    content: 'NEW PS5 PRO'
  },
  {
    id: 'layer-bg',
    name: 'Studio Background',
    type: 'background',
    visible: true,
    locked: true,
    content: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }
];

const App: React.FC = () => {
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
    
    // Add a temporary processing layer
    const tempId = `ai-gen-${Date.now()}`;
    const newAiLayer: Layer = {
      id: tempId,
      name: `AI Generation ${layers.filter(l => l.type === 'ai').length + 1}`,
      type: 'ai',
      visible: true,
      locked: false,
      content: '', // Will be filled
      isProcessing: true
    };
    
    setLayers(prev => [newAiLayer, ...prev]);

    // Use Gemini service
    const prompt = "A futuristic glowing effect around a gaming controller, cyberpunk aesthetics, sparks and light trails";
    const imageUrl = await generateNewLayer(prompt);

    if (imageUrl) {
      setLayers(prev => prev.map(l => l.id === tempId ? { ...l, content: imageUrl, isProcessing: false } : l));
    } else {
      // Fallback if failed
      setLayers(prev => prev.filter(l => l.id !== tempId));
      alert("Failed to generate AI layer. Please check your API key.");
    }
    
    setIsGenerating(false);
  };

  const addEmptyLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `New Layer ${layers.length + 1}`,
      type: 'text',
      visible: true,
      locked: false,
      content: 'Empty Text'
    };
    setLayers(prev => [newLayer, ...prev]);
  };

  return (
    <div className="flex h-screen w-full bg-background-dark text-white font-display overflow-hidden select-none">
      <Sidebar />
      
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
};

export default App;
