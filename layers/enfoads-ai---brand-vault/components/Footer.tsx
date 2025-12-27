
import React from 'react';

interface FooterProps {
  selectedCount: number;
  maxCount: number;
  onClearAll: () => void;
  onNext: () => void;
}

const Footer: React.FC<FooterProps> = ({ selectedCount, maxCount, onClearAll, onNext }) => {
  const isMinimumReached = selectedCount >= 15;

  return (
    <div className="bg-surface-darker/90 backdrop-blur-md border-t border-border-dark absolute bottom-0 w-full z-20">
      <div className="max-w-6xl mx-auto w-full px-8 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white text-sm font-bold">{selectedCount}/{maxCount} Seleccionadas</span>
          {isMinimumReached ? (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Mínimo alcanzado
            </span>
          ) : (
            <span className="text-orange-400 text-xs">Faltan {15 - selectedCount} para el mínimo</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onClearAll}
            className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-dark transition-colors text-sm font-medium border border-transparent hover:border-border-dark"
          >
            Limpiar todo
          </button>
          <button 
            onClick={onNext}
            disabled={!isMinimumReached}
            className={`px-8 py-2.5 rounded-lg text-white text-sm font-bold shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
              isMinimumReached 
                ? 'bg-primary hover:bg-primary-hover shadow-primary/25 hover:shadow-primary/40' 
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            }`}
          >
            Siguiente
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
