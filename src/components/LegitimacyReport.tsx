import React from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';
import { PokemonSprite } from './PokemonSprite';

export const LegitimacyReport: React.FC = () => {
    const { saveFile, setScreen } = useStore();

    if (!saveFile) return null;

    const allPokemon: Pokemon[] = [];
    saveFile.pokemonBoxes.forEach(b => {
        b.pokemon.forEach(p => { if (p) allPokemon.push(p); });
    });

    const verified = allPokemon.filter(p => p.verdict?.tier === 'VERIFIED');
    const uncertain = allPokemon.filter(p => p.verdict?.tier === 'UNCERTAIN');
    const modified = allPokemon.filter(p => p.verdict?.tier === 'LIKELY_MODIFIED' || p.verdict?.tier === 'INVALID');

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 flex-shrink-0">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline text-sm font-mono">&larr; Back to Dashboard</button>
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg md:text-xl font-bold font-mono">Legitimacy Forensics</h1>
                    <div className="text-xs md:text-sm font-mono flex space-x-2">
                        <span className="text-[var(--color-verdict-verified)]">{verified.length} ✓</span>
                        <span className="text-[var(--color-verdict-uncertain)]">{uncertain.length} ?</span>
                        <span className="text-[var(--color-verdict-modified)]">{modified.length} ✗</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin pb-6 space-y-3 min-h-0">
                {allPokemon.map((p, i) => (
                    <div key={i} className="border border-gray-700 rounded-lg p-3 bg-[#1A1815] flex items-center space-x-4 shadow-md hover:border-gray-500 transition-colors">
                        <div className="w-28 h-28 bg-gray-800/80 rounded-lg border border-gray-600/50 flex-shrink-0 flex items-center justify-center neu-plastic-inset p-1">
                            <PokemonSprite 
                                species={p.species} 
                                alt={p.nickname || p.species.toString()} 
                                className="w-24 h-24 drop-shadow-md" 
                            />
                        </div>
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-1">
                                <span className="font-bold text-base md:text-lg font-mono truncate">{p.nickname || `Species ${p.species}`}</span>
                                <span className="text-gray-400 text-xs md:text-sm font-mono">Lv.{p.metLevel}</span>
                                <VerdictBadge tier={p.verdict?.tier || 'VERIFIED'} />
                            </div>
                            <div className="text-xs space-y-1">
                                {p.verdict?.evidence.map((ev, idx) => (
                                    <div key={idx} className="text-gray-400 font-mono">▸ {ev}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const VerdictBadge: React.FC<{ tier: string }> = ({ tier }) => {
    let color = '';
    let label = '';
    if (tier === 'VERIFIED') { color = 'var(--color-verdict-verified)'; label = 'VERIFIED'; }
    else if (tier === 'UNCERTAIN') { color = 'var(--color-verdict-uncertain)'; label = 'UNCERTAIN'; }
    else { color = 'var(--color-verdict-modified)'; label = tier; }

    return (
        <span 
            className="px-2 py-0.5 rounded text-[10px] font-bold border"
            style={{ color, borderColor: color, backgroundColor: `${color}33` }}
        >
            {label}
        </span>
    );
};
