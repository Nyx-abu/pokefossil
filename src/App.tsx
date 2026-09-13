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
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      
      {/* The GBA Plastic Shell */}
      <div className="neu-plastic rounded-3xl p-6 md:p-10 w-full max-w-5xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle physical branding */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest text-sm opacity-50 select-none">
          NINTENDO GAME BOY ADVANCE
        </div>

        {/* The Screen Bezel */}
        <div className="neu-screen-bezel mt-8 mb-4 max-w-4xl mx-auto flex flex-col">
          <div className="text-gray-400 text-[10px] font-bold mb-2 tracking-widest flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-600 mr-2 shadow-[0_0_4px_#f00]"></div> 
            BATTERY
          </div>
          
          {/* The LCD Screen */}
          <div className="neu-screen w-full h-[60vh] md:h-[70vh] p-4 flex flex-col">
            {currentScreen === 'DROP' && <DropZone />}
            {currentScreen === 'DASHBOARD' && <Dashboard />}
            {currentScreen === 'BOXES' && <BoxExplorer />}
            {currentScreen === 'GHOSTS' && <GhostGallery />}
            {currentScreen === 'LEGITIMACY' && <LegitimacyReport />}
            {currentScreen === 'JOURNEY' && <JourneyEstimate />}
          </div>
          
          <div className="text-center text-gray-400 font-bold text-xl mt-3 tracking-[0.3em] opacity-80 select-none">
            POKÉFOSSIL
          </div>
        </div>

        {/* The Controls Area */}
        <div className="flex justify-between items-center max-w-4xl mx-auto mt-8 px-8">
          {/* D-PAD Placeholder */}
          <div className="w-32 h-32 relative opacity-80">
            <div className="absolute top-1/3 left-0 right-0 h-1/3 bg-[#333] rounded shadow-md"></div>
            <div className="absolute left-1/3 top-0 bottom-0 w-1/3 bg-[#333] rounded shadow-md"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#222] rounded-full shadow-inner"></div>
          </div>

          {/* Start / Select */}
          <div className="flex space-x-4 self-end mb-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gray-500 rounded-full shadow-inner transform -rotate-12 cursor-pointer hover:bg-gray-400"></div>
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">SELECT</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gray-500 rounded-full shadow-inner transform -rotate-12 cursor-pointer hover:bg-gray-400"></div>
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">START</span>
            </div>
          </div>

          {/* A / B Buttons */}
          <div className="flex space-x-6 transform -rotate-12">
            <div className="flex flex-col items-center mt-8">
              <div className="w-14 h-14 neu-button-red text-xl select-none">B</div>
            </div>
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 neu-button-red text-xl select-none">A</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;