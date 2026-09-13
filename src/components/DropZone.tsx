import React, { useCallback, useState } from 'react';
import { useStore } from '../store';
import { parseSaveFile } from '../parser/parser';
import { detectGhosts } from '../parser/ghosts';
import { estimateJourney } from '../parser/timeline';
import { Pokemon } from '../parser/types';

export const DropZone: React.FC = () => {
    const setSaveData = useStore(state => state.setSaveData);
    const [error, setError] = useState<string | null>(null);
    const [isHovering, setIsHovering] = useState<boolean>(false);

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

    return (
        <div 
            className="flex flex-col items-center justify-center h-full w-full relative z-20"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div className={`w-full max-w-2xl border-[2px] md:border-4 border-dashed rounded-lg md:rounded-xl p-3 md:p-12 text-center transition-colors flex flex-col items-center justify-center cursor-pointer relative ${isHovering ? 'border-[var(--color-gba-screen-text)] bg-black/10' : 'border-[var(--color-gba-screen-text)]/40 hover:border-[var(--color-gba-screen-text)]'}`}>
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept=".sav"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0]);
                        }
                    }}
                />
                <div className="text-sm md:text-2xl mb-1 md:mb-4 font-bold text-[var(--color-gba-screen-text)]">Drop a .sav file</div>
                <div className="text-[10px] md:text-base text-[var(--color-gba-screen-text)]">or click to browse</div>
            </div>

            <div className="mt-3 md:mt-8 text-center text-[var(--color-gba-screen-text)]">
                <p className="text-[9px] md:text-sm font-bold">Runs entirely in your browser. Nothing is uploaded.</p>
                <p className="text-[8px] md:text-xs mt-1 md:mt-2 font-bold">Supports: Ruby · Sapphire · Emerald · FireRed · LeafGreen</p>
                {error && <p className="text-red-700 font-bold mt-2 md:mt-4 bg-red-100/50 p-1 md:p-2 rounded">{error}</p>}
            </div>
        </div>
    );
};
