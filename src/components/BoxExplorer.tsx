import React, { useState } from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName, getPokemonName } from '../utils/pokemonNames';
import { getNationalDexId } from '../utils/speciesMapping';
import { 
    getNature, 
    getPokeballName, 
    isShiny, 
    getPokemonTypes, 
    TYPE_BADGE_STYLES 
} from '../utils/pokemonData';

function getGameName(gameId?: number): string {
    switch (gameId) {
        case 1: return 'Sapphire';
        case 2: return 'Ruby';
        case 3: return 'Emerald';
        case 4: return 'FireRed';
        case 5: return 'LeafGreen';
        case 15: return 'Colosseum / XD';
        default: return 'GBA (Gen 3)';
    }
}

export const BoxExplorer: React.FC = () => {
    const { saveFile } = useStore();
    const [selectedBox, setSelectedBox] = useState(0);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    if (!saveFile) return null;

    const totalBoxes = saveFile.pokemonBoxes.length;
    const currentBox = saveFile.pokemonBoxes[selectedBox];
    const boxPokemonList = currentBox.pokemon.filter((p): p is Pokemon => p !== null);
    const boxCount = boxPokemonList.length;

    // Total Pokemon in all boxes
    const totalStored = saveFile.pokemonBoxes.reduce(
        (acc, b) => acc + b.pokemon.filter((p) => p !== null).length, 
        0
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full animate-fade-in font-sans pb-6">
            {/* Left Area: Bill's PC Box Storage Screen */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Bill's PC Main Header Banner */}
                <div className="dialog-box-blue p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#5080e6] border-2 border-[#384048] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                            PC
                        </div>
                        <div>
                            <h1 className="font-pixel text-xs sm:text-sm font-bold text-[#282828] tracking-wider">
                                BILL'S PC STORAGE
                            </h1>
                            <p className="text-[10px] text-[#606870] font-sans mt-0.5">
                                Total Stored: <span className="font-bold text-[#5080e6]">{totalStored}</span> Pokémon · 14 Boxes
                            </p>
                        </div>
                    </div>

                    {/* Box Switcher Navigation Banner */}
                    <div className="flex items-center gap-2 bg-[#eef2f7] border-2 border-[#b8c8d8] px-3 py-1.5 rounded-lg shadow-inner">
                        <button
                            onClick={() => {
                                setSelectedBox((prev) => (prev > 0 ? prev - 1 : totalBoxes - 1));
                            }}
                            className="w-7 h-7 bg-white hover:bg-[#5080e6] hover:text-white text-[#282828] border-2 border-[#5080e6] rounded font-pixel text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
                            title="Previous Box"
                        >
                            ◀
                        </button>

                        <div className="text-center min-w-[7rem]">
                            <span className="font-pixel text-[11px] font-bold text-[#282828] block">
                                {currentBox.name?.trim() || `BOX ${selectedBox + 1}`}
                            </span>
                            <span className="text-[9px] text-[#606870] font-sans">
                                {boxCount} / 30 POKéMON
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                setSelectedBox((prev) => (prev < totalBoxes - 1 ? prev + 1 : 0));
                            }}
                            className="w-7 h-7 bg-white hover:bg-[#5080e6] hover:text-white text-[#282828] border-2 border-[#5080e6] rounded font-pixel text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
                            title="Next Box"
                        >
                            ▶
                        </button>
                    </div>
                </div>

                {/* The Box Grid: Authentic FRLG White Rounded Window with Distinct Colored Border */}
                <div className="frlg-pc-window p-4 sm:p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    {/* FRLG Box Header Strip */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-[#d4e2f0]">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5080e6] border border-[#204070]" />
                            <span className="font-pixel text-[10px] text-[#3058b8] font-bold uppercase">
                                {currentBox.name?.trim() || `BOX ${selectedBox + 1}`} WALLPAPER
                            </span>
                        </div>
                        
                        {/* Quick Box Jump Dropdown */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#606870]">
                            <span className="hidden sm:inline">Jump:</span>
                            <select
                                value={selectedBox}
                                onChange={(e) => setSelectedBox(Number(e.target.value))}
                                className="bg-[#f0f4f8] border border-[#a8bcd4] text-[#282828] rounded px-2 py-0.5 font-sans text-xs cursor-pointer focus:outline-none focus:border-[#5080e6]"
                            >
                                {saveFile.pokemonBoxes.map((b, idx) => {
                                    const count = b.pokemon.filter(Boolean).length;
                                    return (
                                        <option key={idx} value={idx}>
                                            Box {idx + 1} ({count}/30)
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* 30 Slots (6 cols x 5 rows) */}
                    <div className="grid grid-cols-6 gap-2 sm:gap-3.5 my-auto max-w-4xl mx-auto w-full">
                        {currentBox.pokemon.map((p, i) => (
                            <PokemonSlot
                                key={i}
                                pokemon={p}
                                slotNumber={i + 1}
                                isSelected={selectedPokemon === p}
                                onClick={() => p && setSelectedPokemon(p)}
                            />
                        ))}
                    </div>

                    {/* Footer Hint Bar */}
                    <div className="mt-4 pt-3 border-t border-[#d8e4f0] flex justify-between items-center text-[10px] text-[#606870] font-sans">
                        <span>Click any Pokémon to open the FRLG Summary Screen</span>
                        <span className="font-pixel text-[9px] text-[#5080e6]">
                            SLOTS: 30
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Area: Authentic FRLG Summary Screen / PC Sidebar */}
            <div className="w-full lg:w-[24rem] xl:w-[26rem] shrink-0">
                {selectedPokemon ? (
                    <div className="dialog-box p-4 shadow-md sticky top-20 animate-fade-in flex flex-col gap-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
                        {/* Summary Header Banner */}
                        <div className="flex justify-between items-center pb-2 border-b-2 border-[#b8c8d8]">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#e65050] text-white font-pixel text-[9px] px-2 py-0.5 rounded shadow-xs">
                                    INFO
                                </span>
                                <h2 className="font-pixel text-[11px] font-bold text-[#282828]">
                                    POKéMON SUMMARY
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedPokemon(null)}
                                className="font-pixel text-[10px] text-[#606870] hover:text-[#e65050] hover:bg-[#ffebee] px-2 py-1 rounded transition-colors cursor-pointer"
                                title="Close Summary"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Top Profile Card: Sprite, Species, Nickname, Types */}
                        <div className="bg-[#f0f5fa] border-2 border-[#b8cce0] rounded-lg p-3 flex items-center gap-3">
                            <div className="relative w-28 h-28 bg-white rounded-lg border-2 border-[#98b4cc] flex items-center justify-center shrink-0 shadow-inner">
                                <PokemonSprite
                                    species={selectedPokemon.species}
                                    alt={getDisplayName(selectedPokemon.nickname, selectedPokemon.species)}
                                    className="w-24 h-24 object-contain drop-shadow-sm transition-transform hover:scale-110"
                                />
                                {isShiny(selectedPokemon) && (
                                    <span 
                                        className="absolute top-1 right-1 text-amber-500 text-xs animate-pulse" 
                                        title="Shiny Pokémon!"
                                    >
                                        ★
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-pixel text-[11px] font-bold text-[#282828] truncate block">
                                        {getDisplayName(selectedPokemon.nickname, selectedPokemon.species)}
                                    </span>
                                </div>
                                <span className="text-[11px] text-[#506878] font-sans font-semibold block mt-0.5">
                                    No.{getNationalDexId(selectedPokemon.species).toString().padStart(3, '0')}{' '}
                                    {getPokemonName(getNationalDexId(selectedPokemon.species))}
                                </span>

                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="bg-[#eef2f7] border border-[#b0c4d8] text-[#282828] text-[10px] font-pixel px-1.5 py-0.5 rounded font-bold">
                                        Lv.{selectedPokemon.metLevel}
                                    </span>
                                    <span className="text-[10px] text-[#606870]">
                                        {getPokeballName(selectedPokemon.pokeBall)}
                                    </span>
                                </div>

                                {/* Type Badges */}
                                <div className="flex gap-1.5 mt-2">
                                    {(() => {
                                        const typeInfo = getPokemonTypes(selectedPokemon.species);
                                        const t1 = TYPE_BADGE_STYLES[typeInfo.primary] || TYPE_BADGE_STYLES.NORMAL;
                                        return (
                                            <>
                                                <span
                                                    className="font-pixel text-[10px] font-bold px-3 py-1 rounded border shadow-sm text-white shadow-xs"
                                                    style={{ backgroundColor: t1.bg, borderColor: t1.border }}
                                                >
                                                    {typeInfo.primary}
                                                </span>
                                                {typeInfo.secondary && (() => {
                                                    const t2 = TYPE_BADGE_STYLES[typeInfo.secondary] || TYPE_BADGE_STYLES.NORMAL;
                                                    return (
                                                        <span
                                                            className="font-pixel text-[10px] font-bold px-3 py-1 rounded border shadow-sm text-white shadow-xs"
                                                            style={{ backgroundColor: t2.bg, borderColor: t2.border }}
                                                        >
                                                            {typeInfo.secondary}
                                                        </span>
                                                    );
                                                })()}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* FRLG Stat Screen: Tabular Data with Pixel-Perfect Borders & Alternating Rows */}
                        <div className="frlg-table-container">
                            <div className="bg-[#3058b8] text-white font-pixel text-[9px] px-3 py-1.5 font-bold flex justify-between items-center">
                                <span>POKéMON STATS</span>
                                <span className="text-[8px] text-[#b0c8ff]">IV / EV</span>
                            </div>
                            <table className="frlg-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '28%' }}>STAT</th>
                                        <th style={{ width: '38%' }}>GRAPH</th>
                                        <th style={{ width: '17%', textAlign: 'right' }}>IV</th>
                                        <th style={{ width: '17%', textAlign: 'right' }}>EV</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: 'HP', iv: selectedPokemon.ivs[0], ev: selectedPokemon.evs[0], color: '#389858' },
                                        { label: 'ATTACK', iv: selectedPokemon.ivs[1], ev: selectedPokemon.evs[1], color: '#e65050' },
                                        { label: 'DEFENSE', iv: selectedPokemon.ivs[2], ev: selectedPokemon.evs[2], color: '#e69820' },
                                        { label: 'SP. ATK', iv: selectedPokemon.ivs[4], ev: selectedPokemon.evs[4], color: '#5080e6' },
                                        { label: 'SP. DEF', iv: selectedPokemon.ivs[5], ev: selectedPokemon.evs[5], color: '#7860c8' },
                                        { label: 'SPEED', iv: selectedPokemon.ivs[3], ev: selectedPokemon.evs[3], color: '#e65098' },
                                    ].map((s) => (
                                        <tr key={s.label}>
                                            <td className="font-pixel text-[9px] font-bold text-[#384858]">
                                                {s.label}
                                            </td>
                                            <td>
                                                <div className="w-full bg-[#d8e4f0] h-2.5 rounded-sm overflow-hidden border border-[#a8bcd0] relative">
                                                    <div
                                                        className="h-full rounded-xs transition-all duration-300"
                                                        style={{
                                                            width: `${Math.min(100, Math.max(8, (s.iv / 31) * 100))}%`,
                                                            backgroundColor: s.color,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-right font-pixel text-[9px] font-bold text-[#282828]">
                                                {s.iv}
                                            </td>
                                            <td className="text-right font-sans text-xs text-[#606870]">
                                                {s.ev}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Origin & Trainer Info Panel */}
                        <div className="bg-[#f8fafc] border-2 border-[#b8c8d8] rounded-lg p-3 text-xs space-y-2">
                            <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-[#e0e8f0]">
                                <span className="font-pixel text-[9px] text-[#606870]">NATURE</span>
                                <span className="font-bold text-[#282828]">
                                    {getNature(selectedPokemon.pid)} Nature
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-[#e0e8f0]">
                                <span className="font-pixel text-[9px] text-[#606870]">ORIGIN</span>
                                <span className="text-[#282828]">
                                    {getGameName(selectedPokemon.gameOfOrigin)} · Met at Lv.{selectedPokemon.metLevel}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-[#e0e8f0]">
                                <span className="font-pixel text-[9px] text-[#606870]">TRAINER</span>
                                <span className="font-mono text-[#282828]">
                                    {selectedPokemon.otName || 'TRAINER'} (ID: {selectedPokemon.otid.toString().padStart(5, '0')})
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-pixel text-[9px] text-[#606870]">PID</span>
                                <span className="font-mono text-[9px] text-[#5080e6]">
                                    0x{selectedPokemon.pid.toString(16).toUpperCase().padStart(8, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Forensic Legitimacy Verdict Badge */}
                        {selectedPokemon.verdict && (
                            <div className={`p-3 rounded-lg border-2 text-xs ${
                                selectedPokemon.verdict.tier === 'VERIFIED'
                                    ? 'bg-[#eef8f2] border-[#389858] text-[#246e3a]'
                                    : selectedPokemon.verdict.tier === 'UNCERTAIN'
                                    ? 'bg-[#fef9ee] border-[#e69820] text-[#a06208]'
                                    : 'bg-[#feeeee] border-[#e65050] text-[#b83030]'
                            }`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-pixel text-[9px] font-bold tracking-wider">
                                        VERDICT: {selectedPokemon.verdict.tier}
                                    </span>
                                    <span className="font-bold text-xs">
                                        {selectedPokemon.verdict.tier === 'VERIFIED' ? '✓' : selectedPokemon.verdict.tier === 'UNCERTAIN' ? '?' : '✗'}
                                    </span>
                                </div>
                                <ul className="space-y-1 text-[11px] font-sans">
                                    {selectedPokemon.verdict.evidence.map((ev, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-[10px] leading-tight">▸</span>
                                            <span>{ev}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Standby / Empty Selection Card */
                    <div className="dialog-box p-6 shadow-sm sticky top-20 text-center flex flex-col items-center justify-center min-h-[22rem]">
                        <div className="w-16 h-16 rounded-full bg-[#eef2f7] border-2 border-[#b8c8d8] flex items-center justify-center mb-4 text-2xl text-[#5080e6] shadow-inner">
                            🔍
                        </div>
                        <h3 className="font-pixel text-xs font-bold text-[#282828] mb-2">
                            FRLG PC VIEWER
                        </h3>
                        <p className="text-xs text-[#606870] font-sans leading-relaxed max-w-xs mb-4">
                            Select any Pokémon from the 30 PC slots to inspect its full summary, stats, IV/EV graphs, and memory forensics.
                        </p>
                        <div className="bg-[#f0f4f8] border border-[#c4d4e8] rounded-md px-3 py-2 text-[10px] text-[#506878] font-pixel">
                            BOX {selectedBox + 1}: {boxCount} / 30 STORED
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PokemonSlotProps {
    pokemon: Pokemon | null;
    slotNumber: number;
    isSelected: boolean;
    onClick: () => void;
}

const PokemonSlot: React.FC<PokemonSlotProps> = ({
    pokemon,
    slotNumber,
    isSelected,
    onClick,
}) => {
    if (!pokemon) {
        return (
            <div className="aspect-square bg-[#f0f4f8]/60 border-2 border-dashed border-[#c8d4e4] rounded-lg flex items-center justify-center text-[12px] font-pixel text-[#a8b8c8] select-none">
                {slotNumber}
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            className={`aspect-square frlg-slot flex flex-col items-center justify-center p-1 cursor-pointer relative group ${
                isSelected ? 'frlg-slot-selected' : ''
            }`}
            title={`${getDisplayName(pokemon.nickname, pokemon.species)} (Lv. ${pokemon.metLevel})`}
        >
            <PokemonSprite
                species={pokemon.species}
                alt={getDisplayName(pokemon.nickname, pokemon.species)}
                className="w-full h-full object-contain p-0.5 transition-transform duration-200 group-hover:scale-115 drop-shadow-xs"
            />

            {/* Micro Level Tag */}
            <span className="absolute bottom-0.5 right-1 font-pixel text-[7px] text-[#606870] group-hover:text-[#282828] bg-white/80 px-0.5 rounded leading-none">
                {pokemon.metLevel}
            </span>

            {/* Shiny Micro Indicator */}
            {isShiny(pokemon) && (
                <span className="absolute top-0.5 left-1 text-[8px] text-amber-500 leading-none">
                    ★
                </span>
            )}
        </button>
    );
};
