
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { AdConfiguration, AdObjective, AspectRatio, VisualStyle } from './types';
import { geminiService } from './services/geminiService';

const DEFAULT_CONFIG: AdConfiguration = {
  objective: 'direct_sales',
  visualStyle: 'ecommerce_clean',
  mood: 'dark_mode',
  aspectRatio: '1:1',
  advanced: {
    creativity: 75,
    variations: 2,
    guidanceScale: 7.5,
  }
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AdConfiguration>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      alert("Please enter a brief description of what you want to advertise.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const [image, copy] = await Promise.all([
        geminiService.generateAdImage(config, userPrompt),
        geminiService.generateAdCopy(config, userPrompt)
      ]);
      setGeneratedImage(image);
      setGeneratedCopy(copy || null);
    } catch (error) {
      alert("Failed to generate advertisement. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setGeneratedImage(null);
    setGeneratedCopy(null);
    setUserPrompt('');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          config={config} 
          setConfig={setConfig} 
          onGenerate={handleGenerate}
          onReset={resetConfig}
          isGenerating={isGenerating}
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'} bg-[#0f0f12] relative flex flex-col overflow-hidden`}>
          <Canvas 
            config={config} 
            isGenerating={isGenerating} 
            generatedImage={generatedImage}
            generatedCopy={generatedCopy}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
