
import React, { useState } from 'react';
import { generateAdCopy, generateAdImage } from '../services/geminiService';

const GenerateAdsView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ headline: string; description: string; cta: string; imageUrl?: string } | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const [copy, imageUrl] = await Promise.all([
        generateAdCopy(prompt),
        generateAdImage(prompt)
      ]);
      setResult({ ...copy, imageUrl });
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-bold mb-2">Generate AI Ads</h2>
          <p className="text-text-muted">Describe your product and let Gemini create high-converting creative assets.</p>
        </header>

        <div className="bg-surface-dark border border-border-muted p-6 rounded-2xl mb-10 shadow-xl">
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full bg-background-dark border border-border-muted rounded-xl p-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
              placeholder="E.g., A sleek new waterproof running shoe for urban marathon runners. Emphasize speed and style..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined">magic_button</span>
              )}
              {loading ? 'Generating Creative...' : 'Generate Ad Assets'}
            </button>
          </div>
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-surface-dark border border-border-muted rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border-muted flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">text_fields</span>
                  Ad Copy
                </h3>
                <button className="text-text-muted hover:text-white transition-colors">
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
              <div className="p-8 flex flex-col gap-6">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Headline</p>
                  <p className="text-2xl font-bold leading-tight">{result.headline}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Body Text</p>
                  <p className="text-text-muted leading-relaxed">{result.description}</p>
                </div>
                <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  {result.cta}
                </button>
              </div>
            </div>

            <div className="bg-surface-dark border border-border-muted rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-border-muted flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">image</span>
                  Visual Asset
                </h3>
                <button className="text-text-muted hover:text-white transition-colors">
                  <span className="material-symbols-outlined">download</span>
                </button>
              </div>
              <div className="aspect-square relative group">
                {result.imageUrl ? (
                  <img src={result.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="Generated Ad" />
                ) : (
                  <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                    <span className="text-text-muted">Image generation failed</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold bg-primary px-4 py-2 rounded-lg">High Res Preview</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateAdsView;
