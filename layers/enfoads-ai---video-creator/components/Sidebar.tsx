
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'campaigns', label: 'Campaigns', icon: 'campaign' },
    { id: 'video-creator', label: 'Video Creator', icon: 'movie_creation' },
    { id: 'assets', label: 'Assets', icon: 'folder_open' },
    { id: 'billing', label: 'Billing', icon: 'credit_card' },
  ];

  return (
    <aside className="w-[280px] h-full flex flex-col border-r border-border-dark bg-[#131118] flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-normal">ENFOADS AI</h1>
            <p className="text-text-secondary text-xs font-normal leading-normal">Enterprise Platform</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group w-full text-left ${
                activeTab === item.id
                  ? 'bg-primary/10 border border-primary/20 text-white shadow-[0_0_15px_rgba(110,48,232,0.15)]'
                  : 'text-text-secondary hover:text-white hover:bg-surface-dark'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === item.id ? 'text-primary fill-1' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <p className="text-sm font-medium leading-normal">{item.label}</p>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border-dark">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-dark/50 border border-border-dark/50">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-400"></div>
          <div className="flex flex-col">
            <p className="text-white text-sm font-medium">Alex Morgan</p>
            <p className="text-text-secondary text-xs">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
