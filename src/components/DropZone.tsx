import React, { useCallback, useState, useRef } from 'react';
import { useStore } from '../store';
import { parseSaveFile } from '../parser/parser';
import { detectGhosts } from '../parser/ghosts';
import { estimateJourney } from '../parser/timeline';
import { Pokemon } from '../parser/types';

export const DropZone: React.FC = () => {
    const setSaveData = useStore(state => state.setSaveData);
    const [error, setError] = useState<string | null>(null);
    const [isHovering, setIsHovering] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        setError(null);
        if (file.size !== 131072) {
            setError('Invalid file size. Expected exactly 128KB (.sav) file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const buffer = event.target?.result as ArrayBuffer;
                const saveFile = parseSaveFile(buffer);
                
                const ghosts = saveFile.inactiveBlock 
                    ? detectGhosts(saveFile.pokemonBoxes, saveFile.inactivePokemonBoxes) 
                    : [];
                
                // Extract all valid pokemon for timeline
                const allPokemon: Pokemon[] = [];
                saveFile.pokemonBoxes.forEach(box => {
                    box.pokemon.forEach(p => {
                        if (p) allPokemon.push(p);
                    });
                });
                
                const timeline = estimateJourney(allPokemon);
                
                setSaveData({ saveFile, ghosts, timeline });
            } catch (err: any) {
                setError(err.message || 'Failed to parse save file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }, [setSaveData]);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsHovering(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsHovering(true);
    }, []);

    const onDragLeave = useCallback(() => setIsHovering(false), []);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div 
            className="flex flex-col items-center justify-between min-h-screen w-full p-4 sm:p-8 select-none relative cursor-pointer"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={handleClick}
        >
            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".sav"
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        processFile(e.target.files[0]);
                    }
                }}
            />

            {/* FRLG Title Screen Header */}
            <header className="flex flex-col items-center text-center mt-4 sm:mt-8 space-y-2 z-10 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#303848]/10 border border-[#303848]/20 text-[11px] font-raw-data text-[#303848] uppercase tracking-widest">
                    <span>GAME BOY ADVANCE</span>
                </div>

                <div className="pt-2">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-raw-data text-[#d8382c] drop-shadow-[0_3px_0_#202830]">
                        POKéFOSSIL
                    </h1>
                    <p className="text-xs sm:text-sm font-raw-data text-[#485060] tracking-wider uppercase mt-1">
                        FIRERED &amp; LEAFGREEN VERSION
                    </p>
                </div>
            </header>

            {/* Center Stage: Professor Oak Intro / Dialogue Screen */}
            <main className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center my-4 z-10">
                {/* Professor Oak / Poké Ball Platform */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#303848] bg-white flex items-center justify-center shadow-md overflow-hidden relative">
                        <img 
                            src="https://play.pokemonshowdown.com/sprites/trainers/oak.png" 
                            alt="Professor Oak"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain pixelated"
                            onError={(e) => {
                                // Fallback to classic Poké Ball if network is offline
                                (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23fff" stroke="%23303848" stroke-width="3"/><path d="M 2,20 A 18 18 0 0 1 38,20 Z" fill="%23d8382c"/><line x1="2" y1="20" x2="38" y2="20" stroke="%23303848" stroke-width="3"/><circle cx="20" cy="20" r="5" fill="%23fff" stroke="%23303848" stroke-width="2.5"/></svg>';
                            }}
                        />
                    </div>
                    <div className="w-28 h-3 bg-[#303848]/20 rounded-full blur-[2px] mt-1" />
                </div>

                {/* Large GBA Dialogue Box */}
                <div 
                    className={`dialog-box w-full p-5 sm:p-8 transition-all duration-300 ${
                        isHovering 
                            ? 'ring-4 ring-[#d8382c] scale-[1.02] shadow-2xl' 
                            : 'hover:shadow-xl'
                    }`}
                >
                    {/* Speaker Header */}
                    <div className="flex items-center justify-between border-b border-[#303848]/20 pb-2 mb-4">
                        <span className="font-raw-data text-xs sm:text-sm font-bold text-[#303848] tracking-wide">
                            PROF. OAK
                        </span>
                        <span className="text-[10px] font-raw-data text-[#808898]">
                            GEN III SAVE ARCHAEOLOGY
                        </span>
                    </div>

                    {/* Dialogue Text */}
                    <div className="space-y-3 font-serif text-base sm:text-lg text-[#202830] leading-relaxed">
                        <p>
                            “Hello there! Glad to meet you! Welcome to the world of <span className="font-semibold text-[#d8382c]">POKéMON</span>!”
                        </p>
                        <p className="text-sm sm:text-base text-[#485060]">
                            To look back upon the companions and battles of your journey, please provide your Game Boy Advance save cartridge.
                        </p>
                    </div>

                    {/* Drop Target Card */}
                    <div className="mt-5 p-4 rounded border-2 border-dashed border-[#8898a8] bg-[#f8fafc] text-center">
                        <div className="font-raw-data text-xs sm:text-sm text-[#303848]">
                            {isHovering ? 'RELEASE TO INSERT CARTRIDGE' : 'DROP .SAV FILE (128KB) HERE'}
                        </div>
                        <div className="text-xs text-[#687080] font-serif mt-1">
                            or click anywhere to choose a file from your computer
                        </div>
                    </div>

                    {/* Flashing PRESS START Cue */}
                    <div className="press-start-cue text-center mt-5">
                        <span className="font-raw-data text-xs sm:text-sm font-bold text-[#d8382c] tracking-widest uppercase">
                            ▶ PRESS START TO LOAD ◀
                        </span>
                    </div>

                    {/* Error Notice */}
                    {error && (
                        <div className="mt-4 p-3 bg-[#d8382c]/10 border border-[#d8382c] rounded text-[#d8382c] text-xs sm:text-sm font-serif">
                            <strong>Warning:</strong> {error}
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Credits / Privacy */}
            <footer className="w-full max-w-2xl text-center py-2 z-10 pointer-events-none">
                <p className="text-[11px] font-serif text-[#687080]">
                    Everything stays on your device. Nothing leaves the browser.
                </p>
            </footer>
        </div>
    );
};
