
import React, { useState } from 'react';
import { Tool, AdCopyResult } from '../types';
import { generateAdCopy, generateImage } from '../services/geminiService';

interface ToolModalProps {
  tool: Tool;
  onClose: () => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [target, setTarget] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [copyResult, setCopyResult] = useState<AdCopyResult | null>(null);
  const [imageResult, setImageResult] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (tool.id === 'copy-gen') {
        const res = await generateAdCopy(input, target, platform);
        setCopyResult(res);
      } else if (tool.id === 'realtime-gen') {
        const res = await generateImage(input);
        setImageResult(res);
      }
    } catch (error) {
      console.error(error);
      alert("Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-dark border border-border-dark w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-dark flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg flex items-center justify-center ${tool.color}`}>
              <span className="material-symbols-outlined">{tool.icon}</span>
            </div>
            <h2 className="text-xl font-bold">{tool.name}</h2>
          </div>
          <button onClick={onClose} className="text-muted-text hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6">
          {tool.id === 'copy-gen' ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-text uppercase mb-2 block">Producto o Servicio</label>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:border-primary outline-none h-24"
                  placeholder="Describe qué estás vendiendo..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-text uppercase mb-2 block">Audiencia Objetivo</label>
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:border-primary outline-none"
                    placeholder="E.g. Jóvenes emprendedores"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-text uppercase mb-2 block">Plataforma</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:border-primary outline-none"
                  >
                    <option>Facebook</option>
                    <option>Instagram</option>
                    <option>LinkedIn</option>
                    <option>Google Ads</option>
                  </select>
                </div>
              </div>
            </div>
          ) : tool.id === 'realtime-gen' ? (
            <div>
              <label className="text-xs font-bold text-muted-text uppercase mb-2 block">Describe tu visual</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-white focus:border-primary outline-none h-32"
                placeholder="E.g. Un robot moderno trabajando en una oficina futurista con luces de neón..."
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-muted-text mb-4">construction</span>
              <p className="text-muted-text">Esta herramienta se encuentra actualmente en desarrollo para la demo.</p>
            </div>
          )}

          {copyResult && (
            <div className="bg-background-dark p-6 rounded-xl border border-primary/20 flex flex-col gap-4 animate-in fade-in duration-500">
              <h4 className="text-primary font-bold text-sm uppercase">Resultado Generado</h4>
              <div>
                <p className="text-xs text-muted-text font-bold mb-1">Headline</p>
                <p className="text-lg font-bold">{copyResult.headline}</p>
              </div>
              <div>
                <p className="text-xs text-muted-text font-bold mb-1">Cuerpo del anuncio</p>
                <p className="text-sm opacity-90">{copyResult.primaryText}</p>
              </div>
              <div>
                <p className="text-xs text-muted-text font-bold mb-1">CTA</p>
                <button className="bg-primary px-4 py-2 rounded text-sm font-bold">{copyResult.cta}</button>
              </div>
            </div>
          )}

          {imageResult && (
            <div className="animate-in zoom-in duration-500">
              <img src={imageResult} alt="Generated result" className="w-full rounded-xl border border-border-dark shadow-lg" />
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageResult;
                  link.download = 'ai-creative.png';
                  link.click();
                }}
                className="mt-4 flex items-center gap-2 text-primary font-bold"
              >
                <span className="material-symbols-outlined">download</span>
                Descargar Imagen
              </button>
            </div>
          )}

          {(tool.id === 'copy-gen' || tool.id === 'realtime-gen') && (
            <button 
              onClick={handleAction}
              disabled={loading || !input}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex gap-1">
                  <span className="size-2 bg-white rounded-full animate-bounce"></span>
                  <span className="size-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="size-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generar con IA
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolModal;
