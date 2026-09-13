import React, { useState } from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';

export const BoxExplorer: React.FC = () => {
    const { saveFile, setScreen } = useStore();
    const [selectedBox, setSelectedBox] = useState(0);

    if (!saveFile) return null;

    const currentBox = saveFile.pokemonBoxes[selectedBox];

    return (
        <div className="flex flex-col h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline">&larr; Back to Dashboard</button>
                <h1 className="text-xl font-bold">Box Explorer</h1>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-4 mb-4 scrollbar-thin">
                {saveFile.pokemonBoxes.map((box, i) => (
                    <button 
                        key={i} 
                        onClick={() => setSelectedBox(i)}
                        className={`px-4 py-2 rounded text-sm whitespace-nowrap ${selectedBox === i ? 'bg-[var(--color-brand-accent)] text-black font-bold' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                    >
                        {box.name}
                    </button>
                ))}
            </div>

            <div className="flex-grow flex items-center justify-center">
                <div className="bg-[#1A1815] border border-gray-700 p-8 rounded-lg">
                    <div className="grid grid-cols-6 gap-2">
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
        return <div className="w-16 h-16 border-2 border-dashed border-gray-700 rounded-md"></div>;
    }

    let dotColor = 'var(--color-verdict-verified)';
    if (pokemon.verdict?.tier === 'UNCERTAIN') dotColor = 'var(--color-verdict-uncertain)';
    if (pokemon.verdict?.tier === 'LIKELY_MODIFIED' || pokemon.verdict?.tier === 'INVALID') dotColor = 'var(--color-verdict-modified)';

    return (
        <div className="w-16 h-16 border border-gray-600 rounded-md relative bg-gray-800 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <div className="absolute top-1 left-1 text-[8px] bg-black/50 px-1 rounded">{pokemon.metLevel}</div>
            <div className="text-xs">{pokemon.species}</div> {/* Placeholder for sprite */}
            <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
        </div>
    );
};
