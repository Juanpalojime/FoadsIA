
import React from 'react';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: false },
    { icon: 'dynamic_feed', label: 'Feed Inspiración', active: true },
    { icon: 'campaign', label: 'Mis Campañas', active: false },
    { icon: 'auto_awesome', label: 'Generador AI', active: false },
    { icon: 'bar_chart', label: 'Analíticas', active: false },
    { icon: 'settings', label: 'Configuración', active: false },
  ];

  return (
    <aside className="w-[280px] shrink-0 h-full flex flex-col bg-background-dark border-r border-border-dark overflow-y-auto">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3 px-2 pt-2">
            <div className="bg-primary/20 rounded-full size-10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-white text-base font-bold leading-none tracking-wide font-display">ENFOADS AI</h1>
              <p className="text-[#a69db8] text-xs font-normal mt-1">Creative Suite</p>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  item.active 
                    ? 'bg-primary/10 text-white border border-primary/20' 
                    : 'text-[#a69db8] hover:bg-surface-dark hover:text-white'
                }`}
                href="#"
              >
                <span className={`material-symbols-outlined group-hover:scale-110 transition-transform ${item.active ? 'text-primary' : ''}`}>
                  {item.icon}
                </span>
                <p className="text-sm font-medium leading-normal">{item.label}</p>
              </a>
            ))}
          </nav>
        </div>
        
        <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-4 bg-primary hover:bg-primary-dark transition-colors text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          <span className="text-sm font-bold leading-normal tracking-wide">Nueva Campaña</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
