
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { id: View.CAMPAIGNS, label: 'Mis Campañas', icon: 'folder' },
    { id: View.GENERATE, label: 'Generate Ads', icon: 'magic_button' },
    { id: View.ANALYTICS, label: 'Analytics', icon: 'bar_chart' },
  ];

  return (
    <aside className="w-[280px] h-full flex-shrink-0 flex flex-col bg-[#131118] border-r border-border-muted">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/20 rounded-full h-10 w-10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
        </div>
        <h1 className="text-white text-xl font-bold tracking-tight">ENFOADS AI</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-4 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              activeView === item.id
                ? 'bg-primary/10 border border-primary/20'
                : 'hover:bg-border-muted'
            }`}
          >
            <span className={`material-symbols-outlined ${
              activeView === item.id ? 'text-primary fill-1' : 'text-text-muted group-hover:text-white'
            }`}>
              {item.icon}
            </span>
            <span className={`text-sm ${
              activeView === item.id ? 'text-white font-bold' : 'text-text-muted group-hover:text-white font-medium'
            }`}>
              {item.label}
            </span>
          </button>
        ))}

        <div className="mt-auto">
          <div className="h-px bg-border-muted my-2"></div>
          <button
            onClick={() => onViewChange(View.SETTINGS)}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              activeView === View.SETTINGS ? 'bg-primary/10 border border-primary/20' : 'hover:bg-border-muted'
            }`}
          >
            <span className="material-symbols-outlined text-text-muted group-hover:text-white">settings</span>
            <span className="text-text-muted group-hover:text-white text-sm font-medium">Settings</span>
          </button>
        </div>
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-border-muted/50 border border-border-muted">
          <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/seed/user1/100')` }}></div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-white text-sm font-bold truncate">Ana Silva</p>
            <p className="text-text-muted text-xs truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
