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
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-[#d0d5df] overflow-hidden">
      
      {/* The GBA Plastic Shell - Responsive: Vertical on mobile, Horizontal on desktop */}
      <div className="neu-plastic rounded-[40px] md:rounded-[60px] p-6 md:p-10 w-full max-w-sm md:max-w-6xl shadow-2xl relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        
        {/* Subtle physical branding */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest text-sm opacity-50 select-none whitespace-nowrap">
          NINTENDO GAME BOY ADVANCE
        </div>

        {/* Desktop Left Controls (D-PAD) - Hidden on mobile, shown on md */}
        <div className="hidden md:flex flex-col items-center justify-center w-48 relative mt-12">
          <div className="w-32 h-32 relative opacity-90 drop-shadow-lg">
            {/* D-Pad vertical bar */}
            <div className="absolute top-0 bottom-0 left-1/3 right-1/3 bg-[#333] rounded-sm shadow-md border-b-2 border-gray-800"></div>
            {/* D-Pad horizontal bar */}
            <div className="absolute left-0 right-0 top-1/3 bottom-1/3 bg-[#333] rounded-sm shadow-md border-b-2 border-gray-800"></div>
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#222] rounded-full shadow-inner"></div>
            
            {/* Directional ridges */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-gray-600"></div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-gray-600"></div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-r-[5px] border-r-gray-600"></div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-gray-600"></div>
          </div>
          
          {/* Start / Select */}
          <div className="flex space-x-6 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gray-500 rounded-full shadow-[inset_1px_2px_4px_rgba(0,0,0,0.4)] transform -rotate-12 cursor-pointer hover:bg-gray-400 border-b border-white/20"></div>
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">SELECT</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-4 bg-gray-500 rounded-full shadow-[inset_1px_2px_4px_rgba(0,0,0,0.4)] transform -rotate-12 cursor-pointer hover:bg-gray-400 border-b border-white/20"></div>
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">START</span>
            </div>
          </div>
        </div>

        {/* Center: The Screen Bezel */}
        <div className="neu-screen-bezel mt-12 md:mt-12 w-full max-w-3xl flex flex-col relative z-10 border-t-4 border-l-4 border-r-2 border-b-2 border-gray-900/40">
          <div className="text-gray-400 text-[10px] font-bold mb-2 tracking-widest flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-600 mr-2 shadow-[0_0_4px_#f00,inset_1px_1px_2px_rgba(255,255,255,0.4)]"></div> 
            BATTERY
          </div>
          
          {/* The LCD Screen */}
          <div className="neu-screen w-full aspect-[3/2] p-4 flex flex-col border border-black/80">
            {currentScreen === 'DROP' && <DropZone />}
            {currentScreen === 'DASHBOARD' && <Dashboard />}
            {currentScreen === 'BOXES' && <BoxExplorer />}
            {currentScreen === 'GHOSTS' && <GhostGallery />}
            {currentScreen === 'LEGITIMACY' && <LegitimacyReport />}
            {currentScreen === 'JOURNEY' && <JourneyEstimate />}
          </div>
          
          <div className="text-center text-gray-300 font-bold text-xl md:text-2xl mt-4 mb-2 tracking-[0.3em] select-none text-shadow-sm">
            POKÉFOSSIL
          </div>
        </div>

        {/* Desktop Right Controls (A/B) - Hidden on mobile */}
        <div className="hidden md:flex flex-col items-center justify-center w-48 relative mt-12">
          <div className="flex space-x-6 transform -rotate-12">
            <div className="flex flex-col items-center mt-12">
              <div className="w-14 h-14 neu-button-red text-xl select-none font-bold">B</div>
            </div>
            <div className="flex flex-col items-center mb-12">
              <div className="w-14 h-14 neu-button-red text-xl select-none font-bold">A</div>
            </div>
          </div>
        </div>

        {/* Mobile-Only Controls (D-pad & Buttons beneath the screen) */}
        <div className="flex md:hidden justify-between items-center w-full mt-4 px-4">
          {/* D-Pad */}
          <div className="w-28 h-28 relative opacity-90 drop-shadow-lg">
            <div className="absolute top-0 bottom-0 left-1/3 right-1/3 bg-[#333] rounded-sm shadow-md border-b-2 border-gray-800"></div>
            <div className="absolute left-0 right-0 top-1/3 bottom-1/3 bg-[#333] rounded-sm shadow-md border-b-2 border-gray-800"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#222] rounded-full shadow-inner"></div>
          </div>

          {/* A / B Buttons */}
          <div className="flex space-x-4 transform -rotate-12">
            <div className="flex flex-col items-center mt-8">
              <div className="w-12 h-12 neu-button-red text-lg select-none font-bold">B</div>
            </div>
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 neu-button-red text-lg select-none font-bold">A</div>
            </div>
          </div>
        </div>
        
        {/* Mobile-Only Start/Select */}
        <div className="flex md:hidden space-x-6 justify-center w-full mt-6 mb-2">
          <div className="flex flex-col items-center">
            <div className="w-10 h-3 bg-gray-500 rounded-full shadow-[inset_1px_2px_4px_rgba(0,0,0,0.4)] transform -rotate-12 cursor-pointer border-b border-white/20"></div>
            <span className="text-[9px] text-gray-500 font-bold mt-1 select-none">SELECT</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-3 bg-gray-500 rounded-full shadow-[inset_1px_2px_4px_rgba(0,0,0,0.4)] transform -rotate-12 cursor-pointer border-b border-white/20"></div>
            <span className="text-[9px] text-gray-500 font-bold mt-1 select-none">START</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;