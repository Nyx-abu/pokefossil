import React, { useState } from 'react';
import { useStore } from '../store';
import { Confidence } from '../parser/timeline';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName, getPokemonName } from '../utils/pokemonNames';
import { getNationalDexId } from '../utils/speciesMapping';
import { getPokemonTypes, TYPE_BADGE_STYLES } from '../utils/pokemonData';

export const JourneyEstimate: React.FC = () => {
    const { timeline } = useStore();
    const [viewMode, setViewMode] = useState<'MAP' | 'TABLE'>('MAP');

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in font-sans pb-6">
            {/* Header Banner */}
            <div className="dialog-box-blue p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#e65050] border-2 border-[#384048] flex items-center justify-center text-white font-pixel text-xs shadow-xs">
                        🗺️
                    </div>
                    <div>
                        <h1 className="font-pixel text-xs sm:text-sm font-bold text-[#282828] tracking-wider">
                            JOURNEY TIMELINE
                        </h1>
                        <p className="text-[10px] text-[#606870] font-sans mt-0.5">
                            Chronological Capture Sequence ·{' '}
                            <span className="font-bold text-[#e65050]">{timeline.length}</span> Milestones Recorded
                        </p>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1.5 bg-[#eef2f7] border-2 border-[#b8c8d8] p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('MAP')}
                        className={`font-pixel text-[9px] px-3 py-1.5 rounded transition-all cursor-pointer ${
                            viewMode === 'MAP'
                                ? 'bg-[#5080e6] text-white shadow-xs'
                                : 'bg-transparent text-[#606870] hover:text-[#282828]'
                        }`}
                    >
                        TIMELINE
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

            {/* Explanatory Info Dialog Box */}
            <div className="dialog-box p-3 sm:p-4 mb-4 shrink-0 shadow-xs text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-pixel text-[9px] font-bold text-[#5080e6]">
                        KANTO & HOENN LOGBOOK
                    </span>
                </div>
                <p className="text-[11px] text-[#506070] leading-relaxed">
                    Order inferred from met-level progression, gift encounters, and gym battle pacing. Confidence reflects chronological certainty.
                </p>
            </div>

            {/* Timeline View / Map Road */}
            {timeline.length === 0 ? (
                <div className="dialog-box p-8 flex-1 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f0f4f8] border-2 border-[#c0d0e0] flex items-center justify-center text-2xl mb-3 text-[#5080e6]">
                        🧭
                    </div>
                    <h3 className="font-pixel text-xs font-bold text-[#282828] mb-2">
                        NO JOURNEY DATA FOUND
                    </h3>
                    <p className="text-xs text-[#606870] font-sans max-w-sm leading-relaxed">
                        Load a valid Pokémon Gen 3 save file with caught Pokémon to trace the trainer's journey.
                    </p>
                </div>
            ) : viewMode === 'MAP' ? (
                <div className="dialog-box-blue p-6 flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin relative flex items-center min-h-[19rem] shadow-xs">
                    {/* Horizontal Road / Connector */}
                    <div className="absolute h-2 bg-[#b8cce0] top-1/2 left-8 right-8 -z-10 rounded-full border-y border-[#88a4c0]" />

                    <div className="flex space-x-10 items-center px-4">
                        {/* Start Node: Pallet Town / Littleroot */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-[#5080e6] flex flex-col items-center justify-center mb-2 bg-[#f0f5fa] shadow-inner">
                                <span className="text-xl mb-1">🏡</span>
                                <span className="text-[8px] font-pixel text-[#5080e6] font-bold">START</span>
                            </div>
                            <div className="w-4 h-4 bg-[#5080e6] rounded-full mb-1 border-2 border-white shadow-xs" />
                            <span className="font-pixel text-[9px] text-[#282828] font-bold">New Game</span>
                            <span className="text-[9px] text-[#606870] font-sans">Level 5</span>
                        </div>

                        {/* Milestones */}
                        {timeline.map((event, i) => {
                            const p = event.pokemon;
                            const nationalId = p ? getNationalDexId(p.species) : 0;
                            const speciesName = p ? getPokemonName(nationalId) : 'Unknown';
                            const displayName = p ? getDisplayName(p.nickname, p.species) : 'Unknown';

                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center relative group shrink-0"
                                    style={{ opacity: getOpacity(event.confidence) }}
                                >
                                    {/* Sprite Display Frame */}
                                    <div className="w-24 h-24 rounded-lg bg-white border-2 border-[#b8cce0] flex items-center justify-center p-1 mb-2 shadow-xs group-hover:border-[#e65050] group-hover:scale-105 transition-all cursor-pointer">
                                        <PokemonSprite
                                            species={p?.species}
                                            alt={displayName}
                                            className="w-20 h-20 object-contain drop-shadow-sm"
                                        />
                                    </div>

                                    {/* Milestone Node Dot */}
                                    <div className="w-4 h-4 bg-[#e65050] rounded-full mb-1 border-2 border-white shadow-xs group-hover:bg-[#b83030]" />

                                    {/* Labels */}
                                    <span className="font-pixel text-[9px] text-[#282828] font-bold max-w-[110px] truncate text-center block">
                                        {displayName}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] font-pixel text-[#389858]">
                                            Lv.{p?.metLevel || '?'}
                                        </span>
                                        <span className={`text-[8px] font-pixel px-1 rounded ${
                                            event.confidence === 'High'
                                                ? 'text-[#246e3a] bg-[#eef8f2]'
                                                : event.confidence === 'Medium'
                                                ? 'text-[#a06208] bg-[#fef9ee]'
                                                : 'text-[#606870] bg-[#f0f4f8]'
                                        }`}>
                                            {event.confidence}
                                        </span>
                                    </div>

                                    {/* Light FRLG Dialog Tooltip on Hover */}
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity dialog-box p-3 z-30 whitespace-normal w-56 text-left pointer-events-none shadow-md">
                                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#d8e2ec]">
                                            <span className="font-pixel text-[9px] font-bold text-[#282828]">
                                                {displayName}
                                            </span>
                                            <span className="font-pixel text-[8px] text-[#5080e6]">
                                                Step #{i + 1}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-[#606870] font-sans mb-1">
                                            No.{nationalId.toString().padStart(3, '0')} {speciesName} · Met at Lv.{p?.metLevel || '?'}
                                        </div>
                                        <div className="text-[11px] text-[#282828] font-sans mb-1.5 leading-snug">
                                            {event.description}
                                        </div>
                                        {event.confidence !== 'High' && (
                                            <div className="text-[9px] text-[#e69820] font-sans pt-1 border-t border-[#e8eff6]">
                                                ⚠️ Order approximated from met-level.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Tabular View: GBA Stat Screen with Pixel-Perfect Borders & Alternating Rows */
                <div className="frlg-table-container flex-1 overflow-y-auto scrollbar-thin">
                    <table className="frlg-table">
                        <thead>
                            <tr>
                                <th style={{ width: '8%' }}>STEP</th>
                                <th style={{ width: '12%' }}>SPRITE</th>
                                <th style={{ width: '24%' }}>POKÉMON</th>
                                <th style={{ width: '10%' }}>MET LV</th>
                                <th style={{ width: '14%' }}>CONFIDENCE</th>
                                <th style={{ width: '32%' }}>ESTIMATED EVENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timeline.map((event, i) => {
                                const p = event.pokemon;
                                const nationalId = p ? getNationalDexId(p.species) : 0;
                                const speciesName = p ? getPokemonName(nationalId) : 'Unknown';
                                const displayName = p ? getDisplayName(p.nickname, p.species) : 'Unknown';
                                const typeInfo = p ? getPokemonTypes(p.species) : { primary: 'NORMAL' };
                                const t1 = TYPE_BADGE_STYLES[typeInfo.primary] || TYPE_BADGE_STYLES.NORMAL;

                                return (
                                    <tr key={i}>
                                        <td className="font-pixel text-[9px] font-bold text-[#5080e6]">
                                            #{i + 1}
                                        </td>
                                        <td>
                                            <div className="w-9 h-9 bg-white border border-[#b8c8d8] rounded flex items-center justify-center p-0.5 shadow-xs">
                                                <PokemonSprite
                                                    species={p?.species}
                                                    alt={displayName}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-pixel text-[9px] font-bold text-[#282828]">
                                                {displayName}
                                            </div>
                                            <div className="text-[10px] text-[#606870] font-sans flex items-center gap-1.5 mt-0.5">
                                                <span>No.{nationalId.toString().padStart(3, '0')} {speciesName}</span>
                                                <span
                                                    className="font-pixel text-[7px] px-1 py-0.2 rounded text-white"
                                                    style={{ backgroundColor: t1.bg }}
                                                >
                                                    {typeInfo.primary}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="font-pixel text-[9px] text-[#282828]">
                                            Lv.{p?.metLevel || '?'}
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-0.5 rounded font-pixel text-[7px] font-bold border inline-block ${
                                                    event.confidence === 'High'
                                                        ? 'bg-[#eef8f2] text-[#246e3a] border-[#389858]'
                                                        : event.confidence === 'Medium'
                                                        ? 'bg-[#fef9ee] text-[#a06208] border-[#e69820]'
                                                        : 'bg-[#f0f4f8] text-[#606870] border-[#b8c8d8]'
                                                }`}
                                            >
                                                {event.confidence}
                                            </span>
                                        </td>
                                        <td className="font-sans text-xs text-[#282828]">
                                            {event.description}
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

function getOpacity(confidence: Confidence): number {
    switch (confidence) {
        case 'High': return 1;
        case 'Medium': return 0.85;
        case 'Low': return 0.6;
    }
}
