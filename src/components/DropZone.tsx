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
            <div className="mb-10 text-center animate-fade-in">
                <div className="w-20 h-20 md:w-32 md:h-32 bg-red-600 rounded-full mx-auto border-4 border-white shadow-[0_0_30px_rgba(220,38,38,0.6)] mb-6 flex items-center justify-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full"></div>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-widest text-white mb-2">POKEFOSSIL</h1>
                <p className="text-gray-400 font-mono text-sm md:text-base tracking-widest">SAVE DATA TIME CAPSULE</p>
            </div>

            <div className={`w-full max-w-2xl border-4 border-dashed rounded-xl p-8 md:p-12 text-center transition-all flex flex-col items-center justify-center cursor-pointer relative shadow-lg ${isHovering ? 'border-red-500 bg-red-900/10 scale-105' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'}`}>
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
                <div className="text-xl md:text-2xl mb-4 font-bold text-white tracking-widest">Drop a .sav file</div>
                <div className="text-sm md:text-base text-gray-400 font-mono">or click to browse</div>
            </div>

            <div className="mt-8 text-center text-gray-400 font-mono">
                <p className="text-xs md:text-sm">Runs entirely in your browser. Nothing is uploaded.</p>
                <p className="text-[10px] md:text-xs mt-2 text-gray-500">Supports: Ruby • Sapphire • Emerald • FireRed • LeafGreen</p>
                {error && <p className="text-red-400 font-bold mt-4 bg-red-900/40 border border-red-500 p-2 rounded max-w-md mx-auto">{error}</p>}
            </div>
        </div>
    );
};
