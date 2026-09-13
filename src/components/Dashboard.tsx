import React from 'react';
import { useStore } from '../store';

export const Dashboard: React.FC = () => {
    const { saveFile, ghosts, timeline, setScreen } = useStore();

    if (!saveFile) return null;

    const { trainerInfo, activeBlock } = saveFile;
    const { hours, minutes, seconds } = trainerInfo.playTime;
    
    // Count pokemon
    let totalPokemon = 0;
    saveFile.pokemonBoxes.forEach(b => {
        b.pokemon.forEach(p => { if (p) totalPokemon++; });
    });

    let verified = 0;
    let uncertain = 0;
    let modified = 0;
    
    saveFile.pokemonBoxes.forEach(b => {
        b.pokemon.forEach(p => {
            if (p) {
                if (p.verdict?.tier === 'VERIFIED') verified++;
                else if (p.verdict?.tier === 'UNCERTAIN') uncertain++;
                else if (p.verdict?.tier === 'LIKELY_MODIFIED' || p.verdict?.tier === 'INVALID') modified++;
            }
        });
    });

    return (
        <div className="flex flex-col h-[80vh]">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-brand-accent)] tracking-widest">POKÉFOSSIL</h1>
                <div className="flex space-x-6 text-sm">
                    <button onClick={() => setScreen('BOXES')} className="hover:text-[var(--color-brand-accent)]">Box Explorer</button>
                    <button onClick={() => setScreen('GHOSTS')} className="hover:text-[var(--color-brand-accent)]">Ghosts</button>
                    <button onClick={() => setScreen('LEGITIMACY')} className="hover:text-[var(--color-brand-accent)]">Legitimacy</button>
                    <button onClick={() => setScreen('JOURNEY')} className="hover:text-[var(--color-brand-accent)]">Journey</button>
                </div>
            </div>

            <div className="border border-gray-700 p-6 rounded bg-[#1A1815] mb-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}></div>
                <div className="flex justify-between relative z-10">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Sprite</span>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-mono mb-1">CASE FILE #{activeBlock.saveIndex?.toString().padStart(7, '0')}</div>
                            <h2 className="text-xl font-bold mb-2 text-white">Trainer: {trainerInfo.playerName} ({trainerInfo.gender === 0 ? 'M' : 'F'})</h2>
                            <div className="text-sm text-gray-400">Game: Gen III (Auto-detecting)</div>
                            <div className="text-sm text-gray-400">Played: {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 flex-grow">
                <DashboardTile 
                    title="Population"
                    count={totalPokemon}
                    subtitle="in party + boxes"
                    onClick={() => setScreen('BOXES')}
                />
                <DashboardTile 
                    title="Ghosts"
                    count={ghosts.length}
                    subtitle="recovered"
                    onClick={() => setScreen('GHOSTS')}
                    accentColor={ghosts.length > 0 ? 'var(--color-verdict-ghost)' : undefined}
                />
                <DashboardTile 
                    title="Verified"
                    count={verified}
                    subtitle="legitimate"
                    onClick={() => setScreen('LEGITIMACY')}
                    accentColor={verified > 0 ? 'var(--color-verdict-verified)' : undefined}
                />
                <DashboardTile 
                    title="Uncertain/Modified"
                    count={uncertain + modified}
                    subtitle="flags found"
                    onClick={() => setScreen('LEGITIMACY')}
                    accentColor={(uncertain + modified) > 0 ? 'var(--color-verdict-modified)' : undefined}
                />
            </div>
        </div>
    );
};

interface TileProps {
    title: string;
    count: number;
    subtitle: string;
    onClick: () => void;
    accentColor?: string;
}

const DashboardTile: React.FC<TileProps> = ({ title, count, subtitle, onClick, accentColor }) => {
    return (
        <button 
            onClick={onClick}
            className="flex flex-col items-center justify-center border border-gray-700 rounded p-6 hover:bg-white/5 transition-colors duration-200 bg-[#1A1815]"
            style={{ borderLeftWidth: accentColor ? '4px' : '1px', borderLeftColor: accentColor || 'inherit' }}
        >
            <div className="text-sm text-gray-400 mb-2">{title}</div>
            <div className="text-3xl font-bold font-mono text-white mb-2">{count}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
        </button>
    );
};
