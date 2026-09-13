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
  const { setScreen } = useStore();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'DROP': return <DropZone />;
      case 'DASHBOARD': return <Dashboard />;
      case 'BOXES': return <BoxExplorer />;
      case 'GHOSTS': return <GhostGallery />;
      case 'LEGITIMACY': return <LegitimacyReport />;
      case 'JOURNEY': return <JourneyEstimate />;
      default: return <DropZone />;
    }
  };

  return (
    <div className="min-h-screen bg-[#16202e] text-[#eef2f7] overflow-hidden flex flex-col md:flex-row font-pixel">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      {currentScreen !== 'DROP' && (
        <nav className="md:w-64 bg-[#0a0f18] border-b md:border-b-0 md:border-r border-gray-800 p-4 flex md:flex-col justify-between md:justify-start gap-4 shadow-xl z-20 shrink-0 overflow-x-auto md:overflow-x-hidden relative">
          <div className="flex items-center gap-3 shrink-0 mb-2 md:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full border-2 border-white shadow-[0_0_10px_red]"></div>
            <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white mt-1">FOSSIL</h1>
          </div>
          
          <div className="flex md:flex-col gap-2">
            <NavBtn label="Trainer Card" active={currentScreen === 'DASHBOARD'} onClick={() => setScreen('DASHBOARD')} />
            <NavBtn label="PC Boxes" active={currentScreen === 'BOXES'} onClick={() => setScreen('BOXES')} />
            <NavBtn label="Timeline" active={currentScreen === 'JOURNEY'} onClick={() => setScreen('JOURNEY')} />
            <NavBtn label="Faded Ghosts" active={currentScreen === 'GHOSTS'} onClick={() => setScreen('GHOSTS')} />
            <NavBtn label="Forensics" active={currentScreen === 'LEGITIMACY'} onClick={() => setScreen('LEGITIMACY')} />
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden p-2 sm:p-4 md:p-6 bg-gradient-to-br from-[#16202e] to-[#0d131c]">
        <div className="w-full max-w-7xl mx-auto h-full">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}

const NavBtn = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg font-mono text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-all border ${active ? 'bg-red-600/20 border-red-500 text-white shadow-[inset_0_0_10px_rgba(220,38,38,0.2)]' : 'bg-transparent border-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-200'}`}
  >
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-gray-700'}`}></div>
    <span className="mt-0.5">{label}</span>
  </button>
);

export default App;