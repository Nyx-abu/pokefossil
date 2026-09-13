import React from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';

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
        <div className="flex flex-col h-[90vh]">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
                <button onClick={() => setScreen('DASHBOARD')} className="text-[var(--color-brand-accent)] hover:underline">&larr; Back to Dashboard</button>
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Legitimacy Forensics</h1>
                    <div className="text-sm flex space-x-2">
                        <span className="text-[var(--color-verdict-verified)]">{verified.length} ✓</span>
                        <span className="text-[var(--color-verdict-uncertain)]">{uncertain.length} ?</span>
                        <span className="text-[var(--color-verdict-modified)]">{modified.length} ✗</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin pb-8 space-y-4">
                {allPokemon.map((p, i) => (
                    <div key={i} className="border border-gray-700 rounded p-4 bg-[#1A1815] flex space-x-4">
                        <div className="w-16 h-16 bg-gray-800 rounded border border-gray-600 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs text-gray-500">Sprite</span>
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center space-x-4 mb-2">
                                <span className="font-bold text-lg w-32">{p.nickname || `Species ${p.species}`}</span>
                                <span className="text-gray-400 w-16">Lv.{p.metLevel}</span>
                                <VerdictBadge tier={p.verdict?.tier || 'VERIFIED'} />
                            </div>
                            <div className="text-sm space-y-1">
                                {p.verdict?.evidence.map((ev, idx) => (
                                    <div key={idx} className="text-gray-400">▸ {ev}</div>
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
