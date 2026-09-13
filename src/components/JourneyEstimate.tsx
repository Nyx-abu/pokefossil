import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Confidence } from '../parser/timeline';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName } from '../utils/pokemonNames';
import { useControlsStore } from '../controlsStore';

export const JourneyEstimate: React.FC = () => {
    const { timeline, setScreen } = useStore();

    useEffect(() => {
        const unsubscribe = useControlsStore.getState().addListener((button) => {
            if (button === 'B') {
                setScreen('DASHBOARD');
            }
        });
        return unsubscribe;
    }, [setScreen]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 flex-shrink-0">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline text-sm font-mono">&larr; Back to Dashboard</button>
                <h1 className="text-lg md:text-xl font-bold font-mono">Journey Estimate</h1>
            </div>

            <div className="bg-[#1A1815] border border-gray-700 p-3 rounded mb-4 flex-shrink-0">
                <p className="text-xs text-gray-400">
                    Order inferred from met-level; this Pokémon could have been caught earlier and leveled less.
                </p>
            </div>

            <div className="flex-grow overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin py-6 px-4 relative flex items-center min-h-0">
                <div className="absolute h-0.5 bg-gray-700 top-1/2 left-0 right-0 -z-10"></div>
                <div className="flex space-x-12 items-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-28 h-28 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center mb-2 bg-gray-900/40">
                            <span className="text-xs font-mono text-gray-500">START</span>
                        </div>
                        <div className="w-3.5 h-3.5 bg-gray-500 rounded-full mb-1"></div>
                        <span className="font-bold text-xs text-gray-500 font-mono">New Game</span>
                    </div>

                    {timeline.map((event, i) => (
                        <div key={i} className="flex flex-col items-center justify-center relative group" style={{ opacity: getOpacity(event.confidence) }}>
                            <div className="w-28 h-28 rounded-lg bg-gray-800/80 border border-gray-700 flex items-center justify-center p-1 mb-2 neu-plastic-inset group-hover:border-[var(--color-brand-accent)] transition-all">
                                <PokemonSprite 
                                    species={event.pokemon?.species} 
                                    alt={event.pokemon ? getDisplayName(event.pokemon.nickname, event.pokemon.species) : 'Unknown'} 
                                    className="w-24 h-24 object-contain drop-shadow-md" 
                                />
                            </div>
                            <div className="w-3.5 h-3.5 bg-[var(--color-brand-accent)] rounded-full mb-1 shadow-[0_0_6px_var(--color-brand-accent)]"></div>
                            <span className="font-bold text-xs font-mono max-w-[120px] truncate text-center">{event.pokemon ? getDisplayName(event.pokemon.nickname, event.pokemon.species) : 'Unknown'}</span>
                            <span className="text-[10px] text-gray-500 font-mono">({event.confidence})</span>
                            
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 border border-gray-700 p-2 rounded text-xs z-30 whitespace-normal w-52 text-center pointer-events-none shadow-xl font-mono">
                                <div className="font-bold text-gray-200 mb-1">{event.pokemon ? getDisplayName(event.pokemon.nickname, event.pokemon.species) : 'Unknown'}</div>
                                <div className="text-gray-400 text-[11px]">{event.description}</div>
                                {event.confidence !== 'High' && (
                                    <div className="mt-1 text-amber-500 text-[10px]">Order inferred from met-level; could be inaccurate.</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


function getOpacity(confidence: Confidence): number {
    switch (confidence) {
        case 'High': return 1;
        case 'Medium': return 0.7;
        case 'Low': return 0.4;
    }
}
