
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import VideoCreator from './components/VideoCreator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('video-creator');

  return (
    <div className="flex h-screen w-full overflow-hidden font-display">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full overflow-y-auto bg-[#131118] relative">
        <div className="layout-container flex flex-col max-w-[1280px] mx-auto min-h-full">
          {activeTab === 'video-creator' ? (
            <VideoCreator />
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <p>Content for {activeTab} coming soon...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
