import React from 'react';
import { useStore } from '../store';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName } from '../utils/pokemonNames';

export const Dashboard: React.FC = () => {
    const { saveFile } = useStore();

    if (!saveFile) return null;

    const { trainerInfo } = saveFile;
    const { hours, minutes, seconds } = trainerInfo.playTime;
    
    // Extract Party Pokemon
    const party = saveFile.party || [];

    // Determine region and highest level for badge heuristic
    const allValidPokemon = saveFile.pokemonBoxes.flatMap(box => box.pokemon).filter(p => p !== null);
    const highestLevel = allValidPokemon.reduce((max, p) => Math.max(max, p!.metLevel), 0);
    const gameId = allValidPokemon[0]?.gameOfOrigin ?? 3; // 1=S, 2=R, 3=E, 4=FR, 5=LG
    const isKanto = gameId === 4 || gameId === 5;

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold font-mono text-white mb-2 tracking-widest border-b border-gray-800 pb-4">TRAINER CARD</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trainer Info Card */}
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/60 transition-colors">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                    <h2 className="text-xl font-bold text-indigo-300 mb-6 font-mono tracking-wider">ID: {trainerInfo.trainerId.toString().padStart(5, '0')}</h2>
                    
                    <div className="space-y-4 font-mono">
                        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
                            <span className="text-gray-400 text-sm">NAME</span>
                            <span className="text-2xl font-bold text-white tracking-widest">{trainerInfo.playerName || '???'}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
                            <span className="text-gray-400 text-sm">PLAY TIME</span>
                            <span className="text-lg text-gray-200">{hours}:{minutes.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-indigo-900/50 pb-2">
                            <span className="text-gray-400 text-sm">GENDER</span>
                            <span className="text-lg text-gray-200">{trainerInfo.gender === 0 ? 'BOY' : 'GIRL'}</span>
                        </div>
                        <div className="flex justify-between items-end pb-2">
                            <span className="text-gray-400 text-sm">MONEY</span>
                            <span className="text-lg text-emerald-400 font-bold">¥{trainerInfo.money || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Current Party */}
                <div className="bg-[#131924] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col">
                    <h2 className="text-lg font-bold text-gray-400 mb-4 font-mono tracking-wider border-b border-gray-800 pb-2">CURRENT PARTY</h2>
                    {party.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-grow">
                            {party.map((p, idx) => (
                                <div key={idx} className="bg-gray-900/50 rounded-lg p-2 flex flex-col items-center justify-center border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer group">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <PokemonSprite species={p!.species} alt={getDisplayName(p!.nickname, p!.species)} className="w-16 h-16 object-contain relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="text-xs font-bold mt-2 font-mono text-gray-300 truncate w-full text-center">{getDisplayName(p!.nickname, p!.species)}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">Lv.{p!.metLevel}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-gray-600 font-mono text-sm">
                            <span>No party Pokémon found.</span>
                            <span className="text-[10px] mt-2">Are they all in the PC?</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Badges Section */}
            <div className="bg-[#131924] border border-gray-800 rounded-xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-gray-400 mb-6 font-mono tracking-wider border-b border-gray-800 pb-2">
                    GYM BADGES ({isKanto ? 'KANTO' : 'HOENN'})
                </h2>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                    {(isKanto 
                        ? ['BOULDER', 'CASCADE', 'THUNDER', 'RAINBOW', 'SOUL', 'MARSH', 'VOLCANO', 'EARTH']
                        : ['STONE', 'KNUCKLE', 'DYNAMO', 'HEAT', 'BALANCE', 'FEATHER', 'MIND', 'RAIN']
                    ).map((badge, i) => {
                        // Estimate badge ownership based on highest level Pokemon in party/pc (very rough heuristic)
                        const estimatedLevelReq = (i + 1) * 10;
                        const hasBadge = highestLevel >= estimatedLevelReq;
                        
                        return (
                            <div key={i} className="flex flex-col items-center justify-center group cursor-help relative">
                                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center mb-2 transition-all shadow-inner ${hasBadge ? 'bg-amber-500/20 border-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gray-800 border-gray-700'}`}>
                                    <span className={`text-2xl transition-all ${hasBadge ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-gray-600'}`}>
                                        {hasBadge ? '★' : '?'}
                                    </span>
                                </div>
                                <span className={`text-[9px] font-mono text-center ${hasBadge ? 'text-gray-300' : 'text-gray-600'}`}>{badge}</span>
                                
                                {/* Tooltip */}
                                <div className="absolute top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gray-700 p-2 rounded text-xs z-30 font-mono whitespace-nowrap pointer-events-none mb-2">
                                    <span className="text-white">{badge} BADGE</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
