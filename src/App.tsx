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

import { useCreditsStore } from './store/useCreditsStore'

function App() {
  const initializeCredits = useCreditsStore(state => state.initialize);

  useEffect(() => {
    initializeCredits();
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
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
