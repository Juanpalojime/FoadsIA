
import React, { useState, useRef, useEffect } from 'react';
import { generateAIVideo } from '../services/gemini';

const VideoCreator: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>('https://lh3.googleusercontent.com/aida-public/AB6AXuCIu_7VCf5aXvqQuzl0y-DU7vRf3Hn57J83mPuWcuckel5wLWON6xYA0UU499msnNUvGkmqhsQd2mUwwTPNZuwb6QZlWu_EktNgj3d_sXQGmLfMOGMEBsym3qfdaqBz7rPIN2LgaZ8RQ6WWnMyBFz1tOOW7HExlEjuX_ST9xUTOIKmOZdjCOUkAshX3-iMfZrX7iMvOV-stOwccIYZu69M0JLWxQxaYLNP4q-v14YQOJOMdyLtidUFXurYLTEoZtmbN-t7fGuk-ag26');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [motionStrength, setMotionStrength] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedVideoUrl(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setGeneratedVideoUrl(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    setGenerationStatus('Initiating AI generation...');
    setGeneratedVideoUrl(null);

    try {
      // Base64 cleaning
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const videoUrl = await generateAIVideo(base64Data, mimeType, (status) => {
        setGenerationStatus(status);
      });

      if (videoUrl) {
        setGeneratedVideoUrl(videoUrl);
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert('Video generation failed. Please ensure you have a valid billing API key configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <header className="px-8 pt-8 pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <span>Workspace</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white">New Video</span>
          </div>
          <h2 className="text-white text-[32px] font-bold leading-tight tracking-tight">Video Creator</h2>
          <p className="text-text-secondary text-base font-normal max-w-2xl">Transform your static assets into engaging high-performance video ads.</p>
        </div>
      </header>

      <div className="px-8 pb-12 flex flex-col gap-6 flex-1">
        {/* Source Selection Tabs */}
        <div className="w-full max-w-[400px]">
          <div className="flex h-12 items-center rounded-xl bg-surface-dark p-1 border border-border-dark">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-full rounded-lg bg-[#2e2938] text-white shadow-sm text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Upload Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <button className="flex-1 h-full rounded-lg text-text-secondary hover:text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              Gallery
            </button>
          </div>
        </div>

        {/* Main Creation Workspace (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Pane: Input */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">image</span>
                Original Image
              </h3>
              <button 
                onClick={clearImage}
                className="text-text-secondary hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Clear
              </button>
            </div>
            {/* Image Preview Card */}
            <div className="relative w-full aspect-[9/16] bg-surface-dark rounded-xl border border-border-dark overflow-hidden group">
              {selectedImage ? (
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url('${selectedImage}')` }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                   <span className="material-symbols-outlined text-[48px] mb-2">add_photo_alternate</span>
                   <p>No image selected</p>
                </div>
              )}
              {/* Hover Actions */}
              {selectedImage && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-all">
                    <span className="material-symbols-outlined">crop</span>
                  </button>
                  <button className="p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-all">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </div>
              )}
            </div>
            {selectedImage && (
              <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface-dark/50 p-2 rounded-lg border border-border-dark self-start">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Image loaded successfully
              </div>
            )}
          </div>

          {/* Right Pane: Output */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_display</span>
                Preview Video
              </h3>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/20">AI PREVIEW</span>
              </div>
            </div>
            {/* Video Preview Area */}
            <div className="relative w-full aspect-[9/16] bg-[#0f0e13] rounded-xl border border-border-dark flex flex-col overflow-hidden">
              {generatedVideoUrl ? (
                <video 
                  src={generatedVideoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 relative z-10 h-full">
                  {selectedImage && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" 
                      style={{ backgroundImage: `url('${selectedImage}')` }}
                    />
                  )}
                  
                  <div className="z-20 flex flex-col items-center gap-4">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative size-16">
                          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-white font-medium text-sm drop-shadow-md">Generating your video...</p>
                          <p className="text-text-secondary text-xs">{generationStatus}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={handleGenerate}
                          disabled={!selectedImage}
                          className={`size-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(110,48,232,0.4)] transition-transform group ${
                            selectedImage ? 'bg-primary/90 text-white cursor-pointer hover:scale-105' : 'bg-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[32px] ml-1 group-hover:text-white">play_arrow</span>
                        </button>
                        <p className="text-white font-medium text-sm drop-shadow-md">
                          {selectedImage ? 'Click to generate motion' : 'Upload an image to start'}
                        </p>
                      </>
                    )}
                  </div>
                  {/* Progress Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div 
                      className="h-full bg-primary shadow-[0_0_10px_#6e30e8] transition-all duration-300" 
                      style={{ width: isGenerating ? '60%' : '0%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            {/* Technical Specs Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 rounded-md bg-surface-dark border border-border-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[16px]">timer</span>
                <span className="text-xs font-medium text-white">Duration: 5s</span>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-surface-dark border border-border-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[16px]">videocam</span>
                <span className="text-xs font-medium text-white">Format: MP4</span>
              </div>
              <div className="px-3 py-1.5 rounded-md bg-surface-dark border border-border-dark flex items-center gap-2">
                <span className="material-symbols-outlined text-text-secondary text-[16px]">aspect_ratio</span>
                <span className="text-xs font-medium text-white">Size: 720x1280</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="bg-surface-dark/40 border border-border-dark rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 mt-4 backdrop-blur-sm">
          {/* Motion Slider */}
          <div className="flex-1 w-full flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <label className="text-white text-sm font-bold">Fuerza (Motion Strength)</label>
              <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {motionStrength < 33 ? 'Sutil' : motionStrength < 66 ? 'Moderate' : 'Dinámico'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-secondary font-medium">Sutil</span>
              <input 
                className="w-full h-1 bg-surface-dark rounded-lg appearance-none cursor-pointer" 
                max="100" min="1" type="range" 
                value={motionStrength}
                onChange={(e) => setMotionStrength(parseInt(e.target.value))}
              />
              <span className="text-xs text-text-secondary font-medium">Dinámico</span>
            </div>
          </div>
          {/* Divider on Desktop */}
          <div className="hidden md:block w-px h-12 bg-border-dark"></div>
          {/* Action Button */}
          <div className="flex flex-col gap-2 w-full md:w-auto flex-shrink-0">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedImage}
              className="relative overflow-hidden group h-12 px-8 bg-gradient-to-r from-primary to-[#8b5cf6] hover:from-[#5b20d1] hover:to-[#7c3aed] rounded-lg text-white font-bold text-sm shadow-[0_4px_20px_rgba(110,48,232,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <span className="material-symbols-outlined">auto_awesome</span>
              {isGenerating ? 'Generando...' : 'Generar Video'}
              <span className="ml-2 px-2 py-0.5 bg-black/20 rounded text-[10px] font-mono border border-white/10 opacity-80">• 50 TOKENS</span>
            </button>
            <p className="text-[10px] text-text-secondary text-center">Estimated time: ~15-20 seconds</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoCreator;
