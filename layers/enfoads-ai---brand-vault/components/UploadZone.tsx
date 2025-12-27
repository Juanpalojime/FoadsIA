
import React, { useRef } from 'react';

interface UploadZoneProps {
  onUpload: (files: FileList | null) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      className="w-full relative group cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <input 
        ref={inputRef}
        className="hidden" 
        multiple 
        type="file" 
        onChange={(e) => onUpload(e.target.files)}
        accept="image/png, image/jpeg"
      />
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-border-dark bg-surface-dark/50 hover:bg-surface-dark hover:border-primary/50 transition-all duration-300 px-6 py-16 group-hover:shadow-[0_0_30px_rgba(110,48,232,0.1)]">
        <div className="h-16 w-16 rounded-full bg-surface-darker flex items-center justify-center border border-border-dark group-hover:scale-110 transition-transform duration-300">
          <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
        </div>
        <div className="flex flex-col items-center gap-2 text-center max-w-md">
          <p className="text-xl font-bold text-white">Arrastra tus fotos aquí</p>
          <p className="text-gray-400 text-sm leading-relaxed">Se requieren entre 15 y 40 fotos para obtener mejores resultados. Formatos soportados: PNG, JPG.</p>
        </div>
        <button className="pointer-events-none mt-2 h-10 px-6 bg-primary text-white rounded-lg font-bold text-sm tracking-wide shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
          Seleccionar archivos
        </button>
      </div>
    </div>
  );
};

export default UploadZone;
