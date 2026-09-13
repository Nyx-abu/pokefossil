import React, { useState } from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName } from '../utils/pokemonNames';

export const BoxExplorer: React.FC = () => {
    const { saveFile } = useStore();
    const [selectedBox, setSelectedBox] = useState(0);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    if (!saveFile) return null;

    const totalBoxes = saveFile.pokemonBoxes.length;
    const currentBox = saveFile.pokemonBoxes[selectedBox];

    return (
        <div className="flex h-full animate-fade-in relative">
            <div className={`flex flex-col w-full transition-all duration-300 ${selectedPokemon ? 'md:w-2/3 pr-4' : 'w-full'}`}>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#c19b6c]/30 pb-4 mb-6 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-bold font-serif text-[#3a3532] tracking-widest">PC STORAGE</h1>
                    
                    <div className="flex items-center space-x-4 bg-white/80 p-2 rounded-lg border border-[#c19b6c]/30 shadow-md">
                        <button 
                            onClick={() => setSelectedBox((prev) => (prev > 0 ? prev - 1 : totalBoxes - 1))}
                            className="p-2 bg-[#f4f1ea] rounded hover:bg-red-600/80 hover:text-[#3a3532] transition-colors text-gray-500"
                        >
                            &larr;
                        </button>
                        <span className="font-serif text-sm md:text-base font-bold text-[#3a3532] min-w-[8rem] text-center">
                            BOX {selectedBox + 1}
                        </span>
                        <button 
                            onClick={() => setSelectedBox((prev) => (prev < totalBoxes - 1 ? prev + 1 : 0))}
                            className="p-2 bg-[#f4f1ea] rounded hover:bg-red-600/80 hover:text-[#3a3532] transition-colors text-gray-500"
                        >
                            &rarr;
                        </button>
                    </div>
                </div>

                {/* Box Grid */}
                <div className="flex-grow flex flex-col items-center min-h-0 overflow-y-auto w-full">
                    <div className="bg-white border border-[#c19b6c]/30 p-4 sm:p-8 rounded-xl shadow-sm w-full max-w-4xl mx-auto backdrop-blur-sm relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#c19b6c]/5 to-transparent rounded-xl pointer-events-none"></div>
                        <div className="grid grid-cols-6 gap-2 sm:gap-4 relative z-10">
                            {currentBox.pokemon.map((p, i) => (
                                <PokemonSlot 
                                    key={i} 
                                    pokemon={p} 
                                    isSelected={selectedPokemon === p}
                                    onClick={() => p && setSelectedPokemon(p)} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Slide-out Stats Panel */}
            {selectedPokemon && (
                <div className="hidden md:flex flex-col w-1/3 bg-[#f4f1ea] border-l border-[#c19b6c]/30 p-6 shadow-sm absolute right-0 top-0 bottom-0 overflow-y-auto animate-slide-in">
                    <div className="flex justify-between items-start mb-6 border-b border-[#c19b6c]/30 pb-4">
                        <h2 className="text-xl font-bold font-serif text-[#3a3532]">DATA ENTRY</h2>
                        <button onClick={() => setSelectedPokemon(null)} className="text-gray-500 hover:text-[#3a3532]">&times;</button>
                    </div>
                    
                    <div className="flex flex-col items-center bg-white/50 rounded-xl p-4 border border-[#c19b6c]/30 mb-6">
                        <PokemonSprite species={selectedPokemon.species} alt="Sprite" className="w-32 h-32 object-contain drop-shadow-xl" />
                        <span className="text-xl font-bold font-serif text-[#3a3532] mt-4">{getDisplayName(selectedPokemon.nickname, selectedPokemon.species)}</span>
                        <span className="text-sm font-serif text-gray-500 mt-1">Level {selectedPokemon.metLevel}</span>
                    </div>

                    <div className="space-y-6 font-serif text-sm">
                        <div className="bg-white p-4 rounded-lg border border-[#c19b6c]/30">
                            <h3 className="text-gray-500 text-xs mb-3 border-b border-[#c19b6c]/30 pb-1">GENETICS & EFFORT (IV / EV)</h3>
                            <div className="space-y-2 text-xs font-serif">
                                {[
                                    { label: 'HP', iv: selectedPokemon.ivs[0], ev: selectedPokemon.evs[0], color: 'bg-green-500' },
                                    { label: 'ATK', iv: selectedPokemon.ivs[1], ev: selectedPokemon.evs[1], color: 'bg-red-500' },
                                    { label: 'DEF', iv: selectedPokemon.ivs[2], ev: selectedPokemon.evs[2], color: 'bg-orange-500' },
                                    { label: 'SPE', iv: selectedPokemon.ivs[3], ev: selectedPokemon.evs[3], color: 'bg-pink-500' },
                                    { label: 'SPA', iv: selectedPokemon.ivs[4], ev: selectedPokemon.evs[4], color: 'bg-blue-500' },
                                    { label: 'SPD', iv: selectedPokemon.ivs[5], ev: selectedPokemon.evs[5], color: 'bg-purple-500' }
                                ].map((stat) => (
                                    <div key={stat.label} className="flex items-center gap-2">
                                        <span className="text-gray-500 w-8">{stat.label}</span>
                                        <div className="flex-1 bg-white rounded-full h-2 overflow-hidden flex relative group cursor-crosshair">
                                            {/* IV Bar (Max 31) */}
                                            <div className={`${stat.color} h-full opacity-70`} style={{ width: `${(stat.iv / 31) * 100}%` }}></div>
                                            {/* EV Indicator (Max 255) */}
                                            {stat.ev > 0 && (
                                                <div className="absolute top-0 bottom-0 left-0 bg-white/30" style={{ width: `${(stat.ev / 255) * 100}%` }}></div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 text-right w-16">
                                            <span className="text-gray-300 w-6">{stat.iv}</span>
                                            <span className="text-gray-600">/</span>
                                            <span className="text-gray-500 w-6">{stat.ev}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-[#c19b6c]/30">
                            <h3 className="text-gray-500 text-xs mb-3 border-b border-[#c19b6c]/30 pb-1">ORIGIN</h3>
                            <div className="grid grid-cols-1 gap-y-2 text-gray-300">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">MET AT:</span> 
                                    <span>Lv. {selectedPokemon.metLevel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">OT ID:</span> 
                                    <span>{selectedPokemon.otid.toString().padStart(5, '0')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Modal (Visible only on small screens when a Pokemon is selected) */}
            {selectedPokemon && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#f4f1ea] border border-[#c19b6c]/30 rounded-xl p-6 shadow-sm w-full max-w-sm overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-start mb-6 border-b border-[#c19b6c]/30 pb-4">
                            <h2 className="text-xl font-bold font-serif text-[#3a3532]">DATA ENTRY</h2>
                            <button onClick={() => setSelectedPokemon(null)} className="text-gray-500 hover:text-[#3a3532] text-2xl leading-none">&times;</button>
                        </div>
                        <div className="flex flex-col items-center bg-white/50 rounded-xl p-4 border border-[#c19b6c]/30 mb-6">
                            <PokemonSprite species={selectedPokemon.species} alt="Sprite" className="w-32 h-32 object-contain drop-shadow-xl" />
                            <span className="text-xl font-bold font-serif text-[#3a3532] mt-4">{getDisplayName(selectedPokemon.nickname, selectedPokemon.species)}</span>
                            <span className="text-sm font-serif text-gray-500 mt-1">Level {selectedPokemon.metLevel}</span>
                        </div>
                        <button onClick={() => setSelectedPokemon(null)} className="w-full bg-red-600 text-[#3a3532] font-serif py-3 rounded-lg mt-4">CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const PokemonSlot = ({ pokemon, isSelected, onClick }: { pokemon: Pokemon | null; isSelected: boolean; onClick: () => void }) => {
    if (!pokemon) {
        return (
            <div className="aspect-square bg-black/40 rounded-lg border border-[#c19b6c]/30/50 shadow-inner"></div>
        );
    }

    return (
        <div 
            onClick={onClick}
            className={`aspect-square bg-[#f4f1ea]/80 rounded-lg border flex items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 hover:z-10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] ${isSelected ? 'border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)] bg-red-900/20' : 'border-gray-700'}`}
        >
            <PokemonSprite 
                species={pokemon.species} 
                alt="sprite"
                className="w-full h-full object-contain drop-shadow-md" 
            />
        </div>
    );
};
