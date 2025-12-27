
import React from 'react';
import { WizardStep } from '../types';

interface HeaderProps {
  currentStep: WizardStep;
}

const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  return (
    <header className="bg-surface-darker/50 backdrop-blur-md border-b border-border-dark sticky top-0 z-10">
      <div className="max-w-6xl mx-auto w-full px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-white">Brand Vault</h2>
            <p className="text-gray-400 text-sm">Entrena tu IA con los activos de tu marca.</p>
          </div>

          <div className="flex items-center gap-4 bg-surface-dark border border-border-dark rounded-xl p-2 pr-6">
            <StepItem number={1} label="Subir Imágenes" active={currentStep >= 1} current={currentStep === 1} />
            <div className={`w-8 h-[1px] ${currentStep > 1 ? 'bg-primary' : 'bg-border-dark opacity-40'}`}></div>
            <StepItem number={2} label="Configuración" active={currentStep >= 2} current={currentStep === 2} />
            <div className={`w-8 h-[1px] ${currentStep > 2 ? 'bg-primary' : 'bg-border-dark opacity-40'}`}></div>
            <StepItem number={3} label="Revisión" active={currentStep >= 3} current={currentStep === 3} />
          </div>
        </div>
      </div>
    </header>
  );
};

interface StepItemProps {
  number: number;
  label: string;
  active: boolean;
  current: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ number, label, active, current }) => (
  <div className={`flex items-center gap-3 transition-opacity duration-300 ${!active ? 'opacity-40' : 'opacity-100'}`}>
    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all shadow-lg ${
      current ? 'bg-primary text-white shadow-primary/30 scale-110' : 
      active ? 'bg-primary/20 text-primary border border-primary/40' :
      'bg-surface-darker border border-border-dark text-gray-300'
    }`}>
      {number}
    </div>
    <span className={`font-medium text-sm ${current ? 'text-white' : 'text-gray-300'}`}>{label}</span>
  </div>
);

export default Header;
