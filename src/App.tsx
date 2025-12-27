import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import FaceSwap from './pages/FaceSwap'
import Assets from './pages/Assets'
import GenerateImages from './pages/GenerateImages'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import CommercialVideo from './pages/CommercialVideo'
import GenerateVideos from './pages/GenerateVideos'
import Inspiration from './pages/Inspiration'
import AdCreator from './pages/AdCreator'
import CanvasEditor from './pages/CanvasEditor'
import BrandVault from './pages/BrandVault'
import { ExamplePage } from './pages/ExamplePage'

import { useCreditsStore } from './store/useCreditsStore'

function App() {
  const initializeCredits = useCreditsStore(state => state.initialize);

  useEffect(() => {
    initializeCredits();

    // Load Favicon
    const savedFavicon = localStorage.getItem('app_favicon');
    if (savedFavicon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = savedFavicon;
      }
    }
  }, [initializeCredits]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />

      {/* App Routes (Protected by Layout) */}
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/face-swap" element={<FaceSwap />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/generate-images" element={<GenerateImages />} />
        <Route path="/generate-videos" element={<GenerateVideos />} />
        <Route path="/commercial-video" element={<CommercialVideo />} />
        <Route path="/ad-creator" element={<AdCreator />} />
        <Route path="/canvas-editor" element={<CanvasEditor />} />
        <Route path="/brand-vault" element={<BrandVault />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/example" element={<ExamplePage />} />
      </Route>
    </Routes>
  )
}

export default App
