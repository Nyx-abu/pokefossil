import React from 'react';
import { useStore } from './store';
import { DropZone } from './components/DropZone';
import { Dashboard } from './components/Dashboard';
import { BoxExplorer } from './components/BoxExplorer';
import { GhostGallery } from './components/GhostGallery';
import { LegitimacyReport } from './components/LegitimacyReport';
import { JourneyEstimate } from './components/JourneyEstimate';

function App() {
  const currentScreen = useStore((state) => state.currentScreen);

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {currentScreen === 'DROP' && <DropZone />}
      {currentScreen === 'DASHBOARD' && <Dashboard />}
      {currentScreen === 'BOXES' && <BoxExplorer />}
      {currentScreen === 'GHOSTS' && <GhostGallery />}
      {currentScreen === 'LEGITIMACY' && <LegitimacyReport />}
      {currentScreen === 'JOURNEY' && <JourneyEstimate />}
    </div>
  );
}

export default App;