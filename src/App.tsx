import React from 'react';
import { useStore, ExploreTab } from './store';
import { DropZone } from './components/DropZone';
import { Homecoming } from './components/Homecoming';
import { BoxExplorer } from './components/BoxExplorer';
import { GhostGallery } from './components/GhostGallery';
import { LegitimacyReport } from './components/LegitimacyReport';
import { JourneyEstimate } from './components/JourneyEstimate';

function App() {
  const { currentScreen, exploreTab, setScreen, setExploreTab, saveFile, ghosts, reset } = useStore();

  const renderExploreTab = () => {
    switch (exploreTab) {
      case 'BOXES': return <BoxExplorer />;
      case 'JOURNEY': return <JourneyEstimate />;
      case 'GHOSTS': return <GhostGallery />;
      case 'LEGITIMACY': return <LegitimacyReport />;
      default: return <BoxExplorer />;
    }
  };

  if (currentScreen === 'DROP' || !saveFile) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] overflow-hidden">
        <DropZone />
      </div>
    );
  }

  if (currentScreen === 'STORY') {
    return (
      <div className="min-h-screen bg-[#f4f1ea] overflow-hidden">
        <Homecoming 
          saveFile={saveFile} 
          ghosts={ghosts} 
          onComplete={() => setScreen('EXPLORE')} 
        />
      </div>
    );
  }

  // EXPLORE MODE (Database & Reference)
  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#3a3532] flex flex-col font-serif">
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#c19b6c]/30 shadow-sm z-20 shrink-0 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0 gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setScreen('STORY')} 
                className="text-left group transition-colors"
                title="Return to Story Mode"
              >
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#3a3532] group-hover:text-[#c19b6c] transition-colors">
                    PokéFossil
                  </h1>
                  <span className="text-xs text-gray-400 italic hidden md:inline">
                    Reference Mode
                  </span>
                </div>
              </button>
            </div>
            
            <nav className="flex space-x-1 sm:space-x-6 overflow-x-auto scrollbar-none">
              <TabBtn label="PC Boxes" active={exploreTab === 'BOXES'} onClick={() => setExploreTab('BOXES')} />
              <TabBtn label="Timeline" active={exploreTab === 'JOURNEY'} onClick={() => setExploreTab('JOURNEY')} />
              <TabBtn label="Ghosts" active={exploreTab === 'GHOSTS'} onClick={() => setExploreTab('GHOSTS')} />
              <TabBtn label="Forensics" active={exploreTab === 'LEGITIMACY'} onClick={() => setExploreTab('LEGITIMACY')} />
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScreen('STORY')}
                className="text-xs px-3 py-1.5 rounded border border-[#c19b6c]/40 text-[#3a3532] hover:bg-[#c19b6c]/10 transition-colors"
              >
                ← Replay Story
              </button>
              <button
                onClick={reset}
                className="text-xs px-3 py-1.5 rounded text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Eject save file and load another"
              >
                New File
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto h-full">
          {renderExploreTab()}
        </div>
      </main>
    </div>
  );
}

const TabBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`whitespace-nowrap py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-colors ${
      active 
        ? 'border-[#c19b6c] text-[#3a3532]' 
        : 'border-transparent text-gray-500 hover:text-[#3a3532] hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);

export default App;