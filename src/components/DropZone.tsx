import React, { useCallback, useState } from 'react';
import { useStore } from '../store';
import { parseSaveFile } from '../parser/parser';
import { detectGhosts } from '../parser/ghosts';
import { estimateJourney } from '../parser/timeline';
import { Pokemon } from '../parser/types';

export const DropZone: React.FC = () => {
    const setSaveData = useStore(state => state.setSaveData);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setError(null);
        
        const file = e.dataTransfer.files[0];
        if (!file) return;

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

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <h1 className="text-4xl font-bold mb-8 text-[var(--color-brand-accent)] tracking-widest">POKÉFOSSIL</h1>
            
            <div 
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="w-[600px] h-[300px] border-4 border-dashed border-[var(--color-brand-accent)] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors duration-300"
            >
                <div className="text-2xl mb-4 font-mono">Drop a .sav file</div>
                <div className="text-gray-400">or click to browse</div>
            </div>

            {error && (
                <div className="mt-8 text-[var(--color-verdict-modified)] border border-[var(--color-verdict-modified)] p-4 rounded bg-[#C1554B]/10 max-w-lg text-center">
                    {error}
                </div>
            )}

            <div className="mt-12 text-center max-w-lg text-gray-400 leading-relaxed">
                <p className="italic mb-4">"Every save file is a fossil. This reads the strata without disturbing the rock."</p>
                <p>Runs entirely in your browser. Nothing is uploaded.</p>
                <p className="text-sm mt-2">Supports: Ruby · Sapphire · Emerald · FireRed · LeafGreen</p>
            </div>
        </div>
    );
};
