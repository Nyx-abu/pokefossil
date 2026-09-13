import React from 'react';
import { useStore } from './store';
import { useControls } from './hooks/useControls';
import { DPad } from './components/DPad';
import { DropZone } from './components/DropZone';
import { Dashboard } from './components/Dashboard';
import { BoxExplorer } from './components/BoxExplorer';
import { GhostGallery } from './components/GhostGallery';
import { LegitimacyReport } from './components/LegitimacyReport';
import { JourneyEstimate } from './components/JourneyEstimate';

function App() {
  const currentScreen = useStore((state) => state.currentScreen);
  const { lastPressed, getButtonProps, soundEnabled, toggleSound } = useControls();

  const pressedButtonName = typeof lastPressed === 'object' && lastPressed !== null 
    ? (lastPressed as { button: string }).button 
    : lastPressed;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8 flex items-center justify-center bg-[var(--color-gba-plastic)] overflow-x-hidden overflow-y-auto">
      
      {/* The GBA Plastic Shell - Responsive: Vertical on mobile, Horizontal on desktop */}
      <div className="neu-plastic rounded-[28px] sm:rounded-[40px] md:rounded-[60px] p-3 sm:p-6 md:p-10 w-full max-w-xl md:max-w-6xl relative flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-12">

        {/* Desktop Left Controls (D-PAD) - Hidden on mobile, shown on md */}
        <div className="hidden md:flex flex-col items-center justify-center w-48 relative">
          <DPad size="lg" getButtonProps={getButtonProps} />
          
          {/* Start / Select */}
          <div className="flex space-x-6 mt-16">
            <div className="flex flex-col items-center">
              <button
                type="button"
                {...getButtonProps('SELECT')}
                className="w-12 h-4 neu-pill-btn transform -rotate-12 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">SELECT</span>
            </div>
            <div className="flex flex-col items-center">
              <button
                type="button"
                {...getButtonProps('START')}
                className="w-12 h-4 neu-pill-btn transform -rotate-12 focus:outline-none"
              />
              <span className="text-[10px] text-gray-500 font-bold mt-2 select-none">START</span>
            </div>
          </div>
        </div>

        {/* Center: The Screen Bezel */}
        <div className="neu-screen-bezel w-full max-w-3xl flex flex-col relative z-10 border-t-4 border-l-4 border-r-2 border-b-2 border-gray-900/40 p-2.5 sm:p-4">
          <div className="flex justify-between items-center text-gray-400 text-[10px] font-bold mb-1.5 sm:mb-2 tracking-widest select-none">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={toggleSound}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-mono tracking-normal px-1.5 py-0.5 rounded bg-gray-800/60 border border-gray-700/50"
                title="Toggle 8-bit sound effects"
              >
                <span>{soundEnabled ? '🔊 SFX' : '🔇 MUTE'}</span>
              </button>
            </div>
            {pressedButtonName && (
              <div className="text-[9px] text-emerald-400 font-mono tracking-wider transition-all">
                BUTTON: [{pressedButtonName}]
              </div>
            )}
          </div>
          
          {/* The LCD Screen */}
          <div className="neu-screen w-full aspect-[3/2] p-2.5 sm:p-4 flex flex-col border border-black/80">
            {currentScreen === 'DROP' && <DropZone />}
            {currentScreen === 'DASHBOARD' && <Dashboard />}
            {currentScreen === 'BOXES' && <BoxExplorer />}
            {currentScreen === 'GHOSTS' && <GhostGallery />}
            {currentScreen === 'LEGITIMACY' && <LegitimacyReport />}
            {currentScreen === 'JOURNEY' && <JourneyEstimate />}
          </div>
          
          <div className="text-center text-gray-300 font-bold text-sm sm:text-lg md:text-2xl mt-2.5 sm:mt-3 md:mt-4 mb-1 md:mb-2 tracking-[0.3em] select-none text-shadow-sm">
            POKEFOSSIL
          </div>
        </div>

        {/* Desktop Right Controls (A/B) - Hidden on mobile */}
        <div className="hidden md:flex flex-col items-center justify-center w-48 relative">
          <div className="flex space-x-6 transform -rotate-12">
            <div className="flex flex-col items-center mt-12">
              <button
                type="button"
                {...getButtonProps('B')}
                className="w-14 h-14 neu-button-red text-xl font-bold focus:outline-none"
              >
                B
              </button>
            </div>
            <div className="flex flex-col items-center mb-12">
              <button
                type="button"
                {...getButtonProps('A')}
                className="w-14 h-14 neu-button-red text-xl font-bold focus:outline-none"
              >
                A
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Only Controls (D-pad & Buttons beneath the screen) */}
        <div className="flex md:hidden justify-between items-center w-full max-w-sm px-2 sm:px-4 mt-1 sm:mt-2">
          {/* D-Pad */}
          <DPad size="md" className="scale-90 sm:scale-100 origin-center" getButtonProps={getButtonProps} />

          {/* A / B Buttons */}
          <div className="flex space-x-3 sm:space-x-4 transform -rotate-12 scale-90 sm:scale-100 origin-center">
            <div className="flex flex-col items-center mt-5 sm:mt-6">
              <button
                type="button"
                {...getButtonProps('B')}
                className="w-11 h-11 sm:w-12 sm:h-12 neu-button-red text-base sm:text-lg font-bold focus:outline-none"
              >
                B
              </button>
            </div>
            <div className="flex flex-col items-center mb-5 sm:mb-6">
              <button
                type="button"
                {...getButtonProps('A')}
                className="w-11 h-11 sm:w-12 sm:h-12 neu-button-red text-base sm:text-lg font-bold focus:outline-none"
              >
                A
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile-Only Start/Select */}
        <div className="flex md:hidden space-x-6 justify-center w-full mt-1 sm:mt-2 mb-1">
          <div className="flex flex-col items-center">
            <button
              type="button"
              {...getButtonProps('SELECT')}
              className="w-10 h-3 neu-pill-btn transform -rotate-12 focus:outline-none"
            />
            <span className="text-[9px] text-gray-500 font-bold mt-1 select-none">SELECT</span>
          </div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              {...getButtonProps('START')}
              className="w-10 h-3 neu-pill-btn transform -rotate-12 focus:outline-none"
            />
            <span className="text-[9px] text-gray-500 font-bold mt-1 select-none">START</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;