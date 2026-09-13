import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useControlsStore } from '../controlsStore';
import { Pokemon } from '../parser/types';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName } from '../utils/pokemonNames';

export const BoxExplorer: React.FC = () => {
    const { saveFile, setScreen } = useStore();
    const [selectedBox, setSelectedBox] = useState(0);

    useEffect(() => {
        if (!saveFile) return;
        const totalBoxes = saveFile.pokemonBoxes.length;
        const unsubscribe = useControlsStore.getState().addListener((button) => {
            if (button === 'LEFT') {
                setSelectedBox((prev) => (prev > 0 ? prev - 1 : totalBoxes - 1));
            } else if (button === 'RIGHT') {
                setSelectedBox((prev) => (prev < totalBoxes - 1 ? prev + 1 : 0));
            } else if (button === 'B') {
                setScreen('DASHBOARD');
            }
        });
        return unsubscribe;
    }, [saveFile, setScreen]);

    if (!saveFile) return null;

    const currentBox = saveFile.pokemonBoxes[selectedBox];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 flex-shrink-0">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline text-sm font-mono">&larr; Back to Dashboard</button>
                <h1 className="text-lg md:text-xl font-bold font-mono">Box Explorer</h1>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-3 mb-3 scrollbar-thin flex-shrink-0">
                {saveFile.pokemonBoxes.map((box, i) => (
                    <button 
                        key={i} 
                        onClick={() => setSelectedBox(i)}
                        className={`px-3 py-1.5 rounded text-xs md:text-sm font-mono whitespace-nowrap transition-colors ${selectedBox === i ? 'bg-[var(--color-brand-accent)] text-white font-bold shadow-md' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                    >
                        {box.name}
                    </button>
                ))}
            </div>

            <div className="flex-grow flex items-center justify-center min-h-0 overflow-y-auto w-full p-1">
                <div className="bg-[#1A1815] border border-gray-700 p-3 sm:p-5 rounded-lg max-h-full overflow-y-auto scrollbar-thin shadow-inner">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                        {currentBox.pokemon.map((p, i) => (
                            <PokemonSlot key={i} pokemon={p} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PokemonSlot: React.FC<{ pokemon: Pokemon | null }> = ({ pokemon }) => {
    if (!pokemon) {
        return (
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-700/60 rounded-lg flex items-center justify-center bg-gray-900/40 opacity-40">
                <span className="text-[10px] text-gray-600 font-mono">-</span>
            </div>
        );
    }

    let dotColor = 'var(--color-verdict-verified)';
    if (pokemon.verdict?.tier === 'UNCERTAIN') dotColor = 'var(--color-verdict-uncertain)';
    if (pokemon.verdict?.tier === 'LIKELY_MODIFIED' || pokemon.verdict?.tier === 'INVALID') dotColor = 'var(--color-verdict-modified)';

    return (
        <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gray-700 rounded-lg relative bg-gray-800/80 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-brand-accent)] hover:scale-105 transition-all shadow-sm group">
            <div className="absolute top-1 left-1 text-[9px] font-mono bg-black/70 px-1 rounded text-gray-300 z-10">
                Lv.{pokemon.metLevel}
            </div>
            <PokemonSprite 
                species={pokemon.species} 
                alt={getDisplayName(pokemon.nickname, pokemon.species)} 
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" 
            />
            <div 
                className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full shadow-[0_0_4px_currentColor] z-10" 
                style={{ backgroundColor: dotColor, color: dotColor }}
            ></div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[10px] font-mono px-2 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 border border-gray-700 shadow-lg">
                {getDisplayName(pokemon.nickname, pokemon.species)}
            </div>
        </div>
    );
};
