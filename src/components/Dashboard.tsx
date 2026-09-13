import React from 'react';
import { useStore } from '../store';

export const Dashboard: React.FC = () => {
    const { saveFile, ghosts, timeline, setScreen } = useStore();

    if (!saveFile) return null;

    const { trainerInfo, activeBlock } = saveFile;
    const { hours, minutes, seconds } = trainerInfo.playTime;

    let verifiedCount = 0;
    let uncertainCount = 0;
    let modifiedCount = 0;
    let totalCount = saveFile.party?.length || 0;

    saveFile.pokemonBoxes.forEach(b => {
        b.pokemon.forEach(p => {
            if (p) {
                totalCount++;
                if (p.verdict?.tier === 'VERIFIED') verifiedCount++;
                else if (p.verdict?.tier === 'UNCERTAIN') uncertainCount++;
                else modifiedCount++;
            }
        });
    });

    saveFile.party?.forEach(p => {
        if (p.verdict?.tier === 'VERIFIED') verifiedCount++;
        else if (p.verdict?.tier === 'UNCERTAIN') uncertainCount++;
        else modifiedCount++;
    });

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-brand-accent)] tracking-widest">POKÉFOSSIL</h1>
                <div className="flex space-x-6 text-sm">
                    <button onClick={() => setScreen('BOXES')} className="hover:text-[var(--color-brand-accent)]">Box Explorer</button>
                    <button onClick={() => setScreen('GHOSTS')} className="hover:text-[var(--color-brand-accent)]">Ghosts</button>
                    <button onClick={() => setScreen('LEGITIMACY')} className="hover:text-[var(--color-brand-accent)]">Legitimacy</button>
                    <button onClick={() => setScreen('JOURNEY')} className="hover:text-[var(--color-brand-accent)]">Journey</button>
                </div>
            </div>

            <div className="bg-[#1A1815]/80 backdrop-blur border border-gray-700/50 p-6 rounded-lg relative overflow-hidden shadow-lg shadow-black/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="font-mono text-6xl">#{activeBlock.saveIndex?.toString().padStart(7, '0')}</span>
                </div>
                
                <h1 className="text-xl font-bold tracking-widest text-[var(--color-brand-accent)] mb-4">CASE FILE #{activeBlock.saveIndex?.toString().padStart(7, '0')}</h1>
                
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-800/80 rounded border-2 border-gray-700 flex-shrink-0 flex items-center justify-center neu-plastic-inset">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sprite</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex text-sm"><span className="w-24 text-gray-400">Trainer:</span> <span className="font-mono">{trainerInfo.playerName} ({trainerInfo.gender === 0 ? 'M' : 'F'})</span></div>
                        <div className="flex text-sm"><span className="w-24 text-gray-400">Game:</span> <span className="font-mono">Gen III</span></div>
                        <div className="flex text-sm"><span className="w-24 text-gray-400">Played:</span> <span className="font-mono">{hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span></div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1A1815]/80 border border-gray-700/50 p-4 rounded-lg shadow-inner">
                <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3 border-b border-gray-700/50 pb-2">Active Party</h2>
                <div className="flex space-x-4">
                    {saveFile.party?.map((p, i) => (
                        <div key={i} className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg p-2 flex flex-col items-center justify-center relative shadow-sm">
                            <span className="text-xs font-bold font-mono text-center truncate w-full px-1">{p.nickname || '???'}</span>
                            <span className="text-[10px] text-gray-500">Lv.{p.metLevel}</span>
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.verdict?.tier === 'VERIFIED' ? 'var(--color-verdict-verified)' : p.verdict?.tier === 'UNCERTAIN' ? 'var(--color-verdict-uncertain)' : 'var(--color-verdict-modified)' }}></div>
                        </div>
                    ))}
                    {Array.from({ length: 6 - (saveFile.party?.length || 0) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 bg-gray-800/20 border border-gray-700/50 border-dashed rounded-lg p-2 flex items-center justify-center opacity-50">
                            <span className="text-xs text-gray-600">Empty</span>
                        </div>
                    ))}
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
