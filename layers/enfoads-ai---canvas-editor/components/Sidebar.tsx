
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[280px] h-full flex flex-col border-r border-border-dark bg-[#131118] shrink-0 z-50">
      <div className="flex flex-col h-full p-4 justify-between">
        {/* Top Section */}
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-gradient-to-tr from-primary to-purple-400 aspect-square rounded-xl size-10 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>auto_awesome</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">ENFOADS AI</h1>
              <p className="text-muted-text text-xs font-normal mt-1">Creative Studio</p>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <NavItem icon="home" label="Home" />
            <NavItem icon="grid_view" label="Templates" />
            <NavItem icon="edit_square" label="Canvas Editor" active />
            <NavItem icon="folder_open" label="Assets" />
          </nav>
        </div>
        {/* Bottom Section */}
        <div className="flex flex-col gap-2 border-t border-border-dark pt-4">
          <a className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-text hover:bg-white/5 hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div 
              className="size-9 rounded-full bg-cover bg-center border border-border-dark" 
              style={{ backgroundImage: `url("https://picsum.photos/id/64/100/100")` }}
            ></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Jane Doe</span>
              <span className="text-xs text-muted-text">Pro Plan</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <a 
    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-muted-text hover:bg-white/5 hover:text-white'}`} 
    href="#"
  >
    <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: active ? "'FILL' 1" : undefined }}>{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

export default Sidebar;
