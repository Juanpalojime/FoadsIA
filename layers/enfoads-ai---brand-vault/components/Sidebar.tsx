
import React from 'react';
import { NavItem } from '../types';

const NAVIGATION: NavItem[] = [
  { id: 'dash', label: 'Dashboard', icon: 'dashboard' },
  { id: 'camp', label: 'Campaigns', icon: 'campaign' },
  { id: 'vault', label: 'Brand Vault', icon: 'verified_user', active: true },
  { id: 'analytics', label: 'Analytics', icon: 'donut_small' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[280px] h-full bg-surface-darker flex flex-col border-r border-border-dark flex-shrink-0 z-20">
      <div className="p-6 flex flex-col gap-1">
        <h1 className="text-white text-xl font-bold tracking-tight">ENFOADS AI</h1>
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Admin Workspace</span>
      </div>

      <nav className="flex-1 px-4 py-2 flex flex-col gap-2 overflow-y-auto">
        {NAVIGATION.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
              item.active 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(110,48,232,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-surface-dark'
            }`}
          >
            <span className={`material-symbols-outlined ${item.active ? 'fill-1' : 'text-gray-400 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-border-dark mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-dark cursor-pointer transition-colors">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-white font-bold text-sm">
            JS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Jane Smith</span>
            <span className="text-xs text-gray-400">Pro Plan</span>
          </div>
          <span className="material-symbols-outlined ml-auto text-gray-500 text-sm">expand_more</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
