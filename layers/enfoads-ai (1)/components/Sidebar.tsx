
import React from 'react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'grid_view', active: false },
    { name: 'Campañas', icon: 'campaign', active: false },
    { name: 'Herramientas', icon: 'build', active: true },
    { name: 'Recursos', icon: 'library_books', active: false },
    { name: 'Ajustes', icon: 'settings', active: false },
  ];

  return (
    <aside className="w-[280px] h-full flex flex-col bg-background-dark border-r border-border-dark flex-shrink-0 z-20">
      <div className="p-6 flex flex-col h-full justify-between">
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex gap-3 items-center">
            <div className="rounded-full size-12 ring-2 ring-primary/20 bg-cover bg-center" style={{backgroundImage: 'url("https://picsum.photos/100")'}}></div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">ENFOADS AI</h1>
              <p className="text-muted-text text-xs font-normal mt-1 uppercase tracking-wider">Ad Creation Platform</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a 
                key={item.name}
                href="#"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  item.active 
                    ? 'bg-primary/20 text-white shadow-[0_0_15px_rgba(110,48,232,0.15)] border border-primary/10' 
                    : 'text-muted-text hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined ${item.active ? 'text-primary' : 'group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-border-dark">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-dark border border-border-dark p-3 hover:bg-white/5 transition-colors group">
            <span className="material-symbols-outlined text-muted-text text-[20px] group-hover:text-white transition-colors">logout</span>
            <span className="text-muted-text text-sm font-medium group-hover:text-white transition-colors">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
