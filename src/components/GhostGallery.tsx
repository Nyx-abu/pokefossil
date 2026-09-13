import React from 'react';
import { useStore } from '../store';

export const GhostGallery: React.FC = () => {
    const { ghosts, setScreen } = useStore();

    return (
        <div className="flex flex-col h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline">&larr; Back to Dashboard</button>
                <h1 className="text-xl font-bold">Ghost Gallery</h1>
            </div>

            <div className="bg-[#1A1815] border border-gray-700 p-4 rounded mb-6">
                <h2 className="text-[var(--color-verdict-ghost)] font-bold mb-2">GHOSTS RECOVERED FROM THE BACKUP BLOCK</h2>
                <p className="text-sm text-gray-400">
                    ⚠ Only the single most recent save-to-save change is recoverable — this is not a full release history.
                </p>
            </div>

            {ghosts.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    No ghosts recovered.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 scrollbar-thin pb-8">
                    {ghosts.map((g, i) => (
                        <div key={i} className="border border-gray-700 rounded p-4 flex items-start space-x-4 bg-[#1A1815]">
                            <div className="w-16 h-16 bg-gray-800/80 rounded border border-gray-600/50 flex-shrink-0 flex items-center justify-center neu-plastic-inset">
                                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${g.pokemon.species}.png`} alt={g.pokemon.species.toString()} className="w-12 h-12 object-contain" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-bold text-lg">{g.pokemon.nickname || 'Pokemon'}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-verdict-ghost)]/20 text-[var(--color-verdict-ghost)] border border-[var(--color-verdict-ghost)]">
                                        {g.type}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-400 mb-2">
                                    Lv.{g.pokemon.metLevel} · Box {g.boxIndex + 1}, Slot {g.slotIndex + 1}
                                </div>
                                <div className="text-xs text-gray-500">
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
