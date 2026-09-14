import React, { useState } from 'react';
import { useStore } from '../store';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName, getPokemonName } from '../utils/pokemonNames';
import { getNationalDexId } from '../utils/speciesMapping';
import { getPokemonTypes, TYPE_BADGE_STYLES } from '../utils/pokemonData';

export const GhostGallery: React.FC = () => {
    const { ghosts } = useStore();
    const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in font-sans pb-6">
            {/* FRLG Header Banner */}
            <div className="dialog-box-blue p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#7860c8] border-2 border-[#384048] flex items-center justify-center text-white font-pixel text-xs shadow-xs">
                        👻
                    </div>
                    <div>
                        <h1 className="font-pixel text-xs sm:text-sm font-bold text-[#282828] tracking-wider">
                            GHOST GALLERY
                        </h1>
                        <p className="text-[10px] text-[#606870] font-sans mt-0.5">
                            Backup Save Block Artifacts ·{' '}
                            <span className="font-bold text-[#7860c8]">{ghosts.length}</span> Ghosts Recovered
                        </p>
                    </div>
                </div>

                {/* View Switcher: FRLG Menu Buttons */}
                <div className="flex items-center gap-1.5 bg-[#eef2f7] border-2 border-[#b8c8d8] p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('CARDS')}
                        className={`font-pixel text-[9px] px-3 py-1.5 rounded transition-all cursor-pointer ${
                            viewMode === 'CARDS'
                                ? 'bg-[#5080e6] text-white shadow-xs'
                                : 'bg-transparent text-[#606870] hover:text-[#282828]'
                        }`}
                    >
                        CARDS
                    </button>
                    <button
                        onClick={() => setViewMode('TABLE')}
                        className={`font-pixel text-[9px] px-3 py-1.5 rounded transition-all cursor-pointer ${
                            viewMode === 'TABLE'
                                ? 'bg-[#5080e6] text-white shadow-xs'
                                : 'bg-transparent text-[#606870] hover:text-[#282828]'
                        }`}
                    >
                        TABLE
                    </button>
                </div>
            </div>

            {/* Information Callout: Light FRLG Dialog Box */}
            <div className="dialog-box-amber p-3 sm:p-4 mb-4 shrink-0 shadow-xs text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-pixel text-[9px] font-bold text-[#e69820]">
                        ⚠️ BACKUP BLOCK FORENSIC SCAN
                    </span>
                </div>
                <p className="text-[11px] text-[#554838] leading-relaxed">
                    Only the single most recent save-to-save change is recoverable. These Pokémon were present in the inactive backup block but deleted, released, or overwritten in the active block.
                </p>
            </div>

            {/* Content Area */}
            {ghosts.length === 0 ? (
                <div className="dialog-box p-8 flex-1 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f0f4f8] border-2 border-[#c0d0e0] flex items-center justify-center text-2xl mb-3 text-[#7860c8]">
                        ✧
                    </div>
                    <h3 className="font-pixel text-xs font-bold text-[#282828] mb-2">
                        NO GHOSTS DETECTED
                    </h3>
                    <p className="text-xs text-[#606870] font-sans max-w-sm leading-relaxed">
                        Silph Scope sweep complete. Both the active save block and inactive backup block are synchronized without any released Pokémon remnants.
                    </p>
                </div>
            ) : viewMode === 'CARDS' ? (
                /* FRLG Menu Cards View: Clean, Light Dialog-Box Panels */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1 scrollbar-thin pb-4 min-h-0 flex-1">
                    {ghosts.map((g, i) => {
                        const nationalId = getNationalDexId(g.pokemon.species);
                        const speciesName = getPokemonName(nationalId);
                        const typeInfo = getPokemonTypes(g.pokemon.species);
                        const t1 = TYPE_BADGE_STYLES[typeInfo.primary] || TYPE_BADGE_STYLES.NORMAL;
                        const ivTotal = g.pokemon.ivs ? g.pokemon.ivs.reduce((a, b) => a + b, 0) : 0;

                        return (
                            <div
                                key={i}
                                className="dialog-box p-4 flex flex-col sm:flex-row gap-4 shadow-xs hover:border-[#7860c8] transition-colors"
                            >
                                {/* Left: Framed Ghost Sprite */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#f5f8fb] rounded-lg border-2 border-[#b8c8d8] flex-shrink-0 flex items-center justify-center p-2 relative shadow-inner self-center sm:self-start">
                                    <PokemonSprite
                                        species={g.pokemon.species}
                                        alt={getDisplayName(g.pokemon.nickname, g.pokemon.species)}
                                        className="w-20 h-20 object-contain drop-shadow-sm opacity-85 filter contrast-90"
                                    />
                                    <span className="absolute bottom-1 right-1 font-pixel text-[8px] bg-white/90 px-1 rounded border border-[#b8c8d8] text-[#7860c8]">
                                        GHOST
                                    </span>
                                </div>

                                {/* Right: Pokémon Identity & Forensic Diff */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                                            <span className="font-pixel text-[11px] font-bold text-[#282828] truncate">
                                                {getDisplayName(g.pokemon.nickname, g.pokemon.species)}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded font-pixel text-[8px] font-bold border ${
                                                    g.type === 'RELEASED'
                                                        ? 'bg-[#f3edf8] text-[#7860c8] border-[#7860c8]'
                                                        : 'bg-[#fff4e8] text-[#e67020] border-[#e67020]'
                                                }`}
                                            >
                                                {g.type}
                                            </span>
                                        </div>

                                        <div className="text-[11px] text-[#606870] font-sans mb-2">
                                            No.{nationalId.toString().padStart(3, '0')} {speciesName} · Lv.{g.pokemon.metLevel}
                                        </div>

                                        {/* Type & Location Badges */}
                                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                            <span
                                                className="font-pixel text-[8px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                                                style={{ backgroundColor: t1.bg }}
                                            >
                                                {typeInfo.primary}
                                            </span>
                                            <span className="font-pixel text-[8px] bg-[#eef2f7] text-[#485868] border border-[#b8c8d8] px-2 py-0.5 rounded">
                                                BOX {g.boxIndex + 1} · SLOT {g.slotIndex + 1}
                                            </span>
                                            <span className="text-[10px] font-pixel text-[#389858]">
                                                IVs: {ivTotal}/186
                                            </span>
                                        </div>

                                        <div className="bg-[#f8fafd] border border-[#d0dce8] rounded p-2 text-[11px] text-[#405060] leading-snug">
                                            {g.type === 'RELEASED'
                                                ? 'Present in the inactive backup save block, missing from current save block.'
                                                : 'Overwritten by another Pokémon entity in the latest save session.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Tabular Data View: Pixel-Perfect Borders & Alternating Row Colors */
                <div className="frlg-table-container flex-1 overflow-y-auto scrollbar-thin">
                    <table className="frlg-table">
                        <thead>
                            <tr>
                                <th style={{ width: '8%' }}>STATUS</th>
                                <th style={{ width: '12%' }}>SPRITE</th>
                                <th style={{ width: '25%' }}>POKÉMON</th>
                                <th style={{ width: '10%' }}>LEVEL</th>
                                <th style={{ width: '15%' }}>LOCATION</th>
                                <th style={{ width: '10%' }}>IV TOTAL</th>
                                <th style={{ width: '20%' }}>DISPOSITION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ghosts.map((g, i) => {
                                const nationalId = getNationalDexId(g.pokemon.species);
                                const speciesName = getPokemonName(nationalId);
                                const ivTotal = g.pokemon.ivs ? g.pokemon.ivs.reduce((a, b) => a + b, 0) : 0;

                                return (
                                    <tr key={i}>
                                        <td>
                                            <span
                                                className={`px-1.5 py-0.5 rounded font-pixel text-[7px] font-bold border inline-block ${
                                                    g.type === 'RELEASED'
                                                        ? 'bg-[#f3edf8] text-[#7860c8] border-[#7860c8]'
                                                        : 'bg-[#fff4e8] text-[#e67020] border-[#e67020]'
                                                }`}
                                            >
                                                {g.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="w-9 h-9 bg-white border border-[#b8c8d8] rounded flex items-center justify-center p-0.5 shadow-xs">
                                                <PokemonSprite
                                                    species={g.pokemon.species}
                                                    alt={speciesName}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-pixel text-[9px] font-bold text-[#282828]">
                                                {getDisplayName(g.pokemon.nickname, g.pokemon.species)}
                                            </div>
                                            <div className="text-[10px] text-[#606870] font-sans">
                                                No.{nationalId.toString().padStart(3, '0')} {speciesName}
                                            </div>
                                        </td>
                                        <td className="font-pixel text-[9px] text-[#282828]">
                                            Lv.{g.pokemon.metLevel}
                                        </td>
                                        <td className="font-sans text-xs text-[#405060]">
                                            Box {g.boxIndex + 1}, Slot {g.slotIndex + 1}
                                        </td>
                                        <td className="font-pixel text-[9px] text-[#389858]">
                                            {ivTotal}/186
                                        </td>
                                        <td className="font-sans text-[11px] text-[#606870]">
                                            {g.type === 'RELEASED' ? 'Released from storage' : 'Overwritten in memory'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
