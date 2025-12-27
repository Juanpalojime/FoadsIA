
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CampaignsView from './components/CampaignsView';
import GenerateAdsView from './components/GenerateAdsView';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CAMPAIGNS);

  const renderContent = () => {
    switch (activeView) {
      case View.CAMPAIGNS:
        return <CampaignsView />;
      case View.GENERATE:
        return <GenerateAdsView />;
      case View.DASHBOARD:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">dashboard</span>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-text-muted">Overview metrics and quick actions coming soon.</p>
            </div>
          </div>
        );
      case View.ANALYTICS:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">bar_chart</span>
              <h2 className="text-2xl font-bold">Analytics</h2>
              <p className="text-text-muted">Detailed performance insights and ROAS tracking.</p>
            </div>
          </div>
        );
      default:
        return <CampaignsView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-dark">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
