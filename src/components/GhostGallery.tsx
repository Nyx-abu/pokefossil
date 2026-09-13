import React from 'react';
import { useStore } from '../store';
import { PokemonSprite } from './PokemonSprite';

import { getDisplayName } from '../utils/pokemonNames';

export const GhostGallery: React.FC = () => {
    const { ghosts, setScreen } = useStore();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 flex-shrink-0">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline text-sm font-mono">&larr; Back to Dashboard</button>
                <h1 className="text-lg md:text-xl font-bold font-mono">Ghost Gallery</h1>
            </div>

            <div className="bg-[#1A1815] border border-gray-700 p-3 rounded mb-4 flex-shrink-0">
                <h2 className="text-[var(--color-verdict-ghost)] font-bold text-sm mb-1 font-mono">GHOSTS RECOVERED FROM THE BACKUP BLOCK</h2>
                <p className="text-xs text-gray-400">
                    ⚠️ Only the single most recent save-to-save change is recoverable — this is not a full release history.
                </p>
            </div>

            {ghosts.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-gray-500 font-mono text-sm">
                    No ghosts recovered.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 scrollbar-thin pb-6 min-h-0 flex-grow">
                    {ghosts.map((g, i) => (
                        <div key={i} className="border border-gray-700 rounded-lg p-3 flex items-center space-x-4 bg-[#1A1815] shadow-md hover:border-gray-500 transition-colors">
                            <div className="w-28 h-28 bg-gray-800/80 rounded-lg border border-gray-600/50 flex-shrink-0 flex items-center justify-center neu-plastic-inset p-1">
                                <PokemonSprite 
                                    species={g.pokemon.species} 
                                    alt={getDisplayName(g.pokemon.nickname, g.pokemon.species)} 
                                    className="w-24 h-24 drop-shadow-md" 
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                                    <span className="font-bold text-base font-mono truncate">{getDisplayName(g.pokemon.nickname, g.pokemon.species)}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-verdict-ghost)]/20 text-[var(--color-verdict-ghost)] border border-[var(--color-verdict-ghost)] font-mono">
                                        {g.type}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mb-1 font-mono">
                                    Lv.{g.pokemon.metLevel} · Box {g.boxIndex + 1}, Slot {g.slotIndex + 1}
                                </div>
                                <div className="text-[11px] text-gray-500 leading-snug">
                                    {g.type === 'RELEASED' ? 'Present in the backup save, gone from the latest.' : 'Overwritten by another Pokémon in the latest save.'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

