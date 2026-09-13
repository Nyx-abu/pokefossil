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
            className="flex flex-col items-center justify-center h-full w-full absolute inset-0 z-20"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div className={`w-full max-w-2xl p-16 text-center transition-all duration-700 flex flex-col items-center justify-center cursor-pointer ${isHovering ? 'scale-105 opacity-100' : 'opacity-80 hover:opacity-100'}`}>
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
                
                <h1 className="text-4xl md:text-5xl font-serif text-[#3a3532] mb-6 tracking-tight">
                    PokéFossil
                </h1>
                
                <div className="text-xl md:text-2xl text-[#3a3532] font-serif font-light mb-2">
                    Provide the save file.
                </div>
                <div className="text-sm md:text-base text-gray-500 font-serif italic">
                    .sav (128KB)
                </div>
                
                {error && <p className="text-[#a04949] font-serif mt-8 p-4 bg-[#a04949]/10 rounded">{error}</p>}
            </div>

            <div className="absolute bottom-8 text-center text-gray-400 font-serif text-sm">
                <p>Everything stays on your device. Nothing leaves the browser.</p>
            </div>
        </div>
    );
};
