import React from 'react';
import { useStore } from './store';
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
      <div className="min-h-screen frlg-bg-pattern overflow-hidden relative">
        <DropZone />
      </div>
    );
  }

  if (currentScreen === 'STORY') {
    return (
      <div className="min-h-screen frlg-bg-pattern overflow-hidden relative">
        <Homecoming 
          saveFile={saveFile} 
          ghosts={ghosts} 
          onComplete={() => setScreen('EXPLORE')} 
        />
      </div>
    );
  }

  // EXPLORE MODE
  return (
    <div className="min-h-screen frlg-bg-pattern text-[#282828] flex flex-col relative">
      <header className="bg-[#f0f4f8] border-b-2 border-[#b8c8d8] z-20 shrink-0 sticky top-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-3 pb-0 md:h-16 md:py-0">
            <div className="flex items-center justify-between w-full md:w-auto">
              <button 
                onClick={() => setScreen('STORY')} 
                className="text-left group transition-transform active:scale-95"
                title="Return to Story Mode"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#e65050] inline-block border-2 border-[#384048] shadow-xs" />
                  <h1 className="text-xs sm:text-sm font-bold tracking-wider text-[#e65050] group-hover:text-[#b83030] transition-colors">
                    PokéFossil
                  </h1>
                </div>
              </button>
              
              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={() => setScreen('STORY')}
                  className="text-[9px] px-2 py-1 rounded border-2 border-[#5080e6] bg-white text-[#5080e6] font-bold"
                >
                  Story
                </button>
                <button
                  onClick={reset}
                  className="text-[9px] px-2 py-1 rounded border-2 border-[#8090a0] bg-white text-[#607080] font-bold"
                >
                  New
                </button>
              </div>
            </div>
            
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none w-full md:w-auto justify-start md:justify-center items-end self-end">
              <TabBtn label="PC Boxes" active={exploreTab === 'BOXES'} onClick={() => setExploreTab('BOXES')} />
              <TabBtn label="Timeline" active={exploreTab === 'JOURNEY'} onClick={() => setExploreTab('JOURNEY')} />
              <TabBtn label="Ghosts" active={exploreTab === 'GHOSTS'} onClick={() => setExploreTab('GHOSTS')} />
              <TabBtn label="Forensics" active={exploreTab === 'LEGITIMACY'} onClick={() => setExploreTab('LEGITIMACY')} />
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setScreen('STORY')}
                className="text-[10px] px-3 py-1.5 rounded-md border-2 border-[#5080e6] bg-white text-[#5080e6] hover:bg-[#5080e6] hover:text-white transition-all shadow-xs active:translate-y-0.5 cursor-pointer font-bold"
              >
                ◀ Story
              </button>
              <button
                onClick={reset}
                className="text-[10px] px-3 py-1.5 rounded-md border-2 border-[#8090a0] bg-white text-[#607080] hover:border-[#e65050] hover:text-[#e65050] transition-all shadow-xs active:translate-y-0.5 cursor-pointer font-bold"
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

interface TabBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const TabBtn = ({ label, active, onClick }: TabBtnProps) => (
  <button 
    onClick={onClick}
    className={`whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-lg text-[10px] sm:text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer select-none ${
      active 
        ? 'bg-white text-[#e65050] border-t-4 border-t-[#e65050] border-x-2 border-x-[#b8c8d8] border-b-2 border-b-white -mb-[2px] z-10 shadow-sm' 
        : 'bg-[#d8e2ec] text-[#586878] border-t-2 border-x-2 border-b-2 border-[#b8c8d8] hover:bg-[#e4ecf4] hover:text-[#282828]'
    }`}
  >
    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#e65050] inline-block" />}
    {label}
  </button>
);

export default App;
