import React, { useState } from 'react';
import { useStore } from '../store';
import { Pokemon } from '../parser/types';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName, getPokemonName } from '../utils/pokemonNames';
import { getNationalDexId } from '../utils/speciesMapping';
import { getPokemonTypes, TYPE_BADGE_STYLES } from '../utils/pokemonData';

type FilterType = 'ALL' | 'VERIFIED' | 'UNCERTAIN' | 'FLAGGED';
type ViewType = 'CARDS' | 'TABLE';

export const LegitimacyReport: React.FC = () => {
    const { saveFile } = useStore();
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [viewMode, setViewMode] = useState<ViewType>('CARDS');

    if (!saveFile) return null;

    const allPokemon: Pokemon[] = [];
    saveFile.pokemonBoxes.forEach((b) => {
        b.pokemon.forEach((p) => {
            if (p) allPokemon.push(p);
        });
    });

    const verified = allPokemon.filter((p) => p.verdict?.tier === 'VERIFIED');
    const uncertain = allPokemon.filter((p) => p.verdict?.tier === 'UNCERTAIN');
    const modified = allPokemon.filter(
        (p) => p.verdict?.tier === 'LIKELY_MODIFIED' || p.verdict?.tier === 'INVALID'
    );

    const displayedPokemon = allPokemon.filter((p) => {
        if (filter === 'VERIFIED') return p.verdict?.tier === 'VERIFIED';
        if (filter === 'UNCERTAIN') return p.verdict?.tier === 'UNCERTAIN';
        if (filter === 'FLAGGED')
            return p.verdict?.tier === 'LIKELY_MODIFIED' || p.verdict?.tier === 'INVALID';
        return true;
    });

    return (
        <div className="flex flex-col h-full overflow-hidden animate-fade-in font-sans pb-6">
            {/* Header Banner */}
            <div className="dialog-box-blue p-4 mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#389858] border-2 border-[#384048] flex items-center justify-center text-white font-pixel text-xs shadow-xs">
                        ⚖️
                    </div>
                    <div>
                        <h1 className="font-pixel text-xs sm:text-sm font-bold text-[#282828] tracking-wider">
                            LEGITIMACY FORENSICS
                        </h1>
                        <p className="text-[10px] text-[#606870] font-sans mt-0.5">
                            Gen 3 Memory Structure & PID/IV Auditor
                        </p>
                    </div>
                </div>

                {/* Status Counter Pills */}
                <div className="flex items-center gap-2">
                    <span className="font-pixel text-[9px] px-2 py-1 rounded bg-[#eef8f2] text-[#246e3a] border border-[#389858] shadow-xs">
                        {verified.length} ✓ Legitimate
                    </span>
                    <span className="font-pixel text-[9px] px-2 py-1 rounded bg-[#fef9ee] text-[#a06208] border border-[#e69820] shadow-xs">
                        {uncertain.length} ? Uncertain
                    </span>
                    <span className="font-pixel text-[9px] px-2 py-1 rounded bg-[#feeeee] text-[#b83030] border border-[#e65050] shadow-xs">
                        {modified.length} ✗ Flagged
                    </span>
                </div>
            </div>

            {/* Filter & View Switcher Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 shrink-0">
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {(['ALL', 'VERIFIED', 'UNCERTAIN', 'FLAGGED'] as FilterType[]).map((tab) => {
                        const count =
                            tab === 'ALL'
                                ? allPokemon.length
                                : tab === 'VERIFIED'
                                ? verified.length
                                : tab === 'UNCERTAIN'
                                ? uncertain.length
                                : modified.length;

                        return (
                            <button
                                key={tab}
                                onClick={() => setFilter(tab)}
                                className={`font-pixel text-[9px] px-3 py-1.5 rounded-md border-2 transition-all cursor-pointer ${
                                    filter === tab
                                        ? 'bg-[#5080e6] text-white border-[#3058b8] shadow-xs'
                                        : 'bg-white text-[#506070] border-[#c4d4e8] hover:border-[#5080e6]'
                                }`}
                            >
                                {tab} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1.5 bg-[#eef2f7] border-2 border-[#b8c8d8] p-1 rounded-lg shrink-0">
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

            {/* List / Table Content */}
            {displayedPokemon.length === 0 ? (
                <div className="dialog-box p-8 flex-1 flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f0f4f8] border-2 border-[#c0d0e0] flex items-center justify-center text-2xl mb-3 text-[#5080e6]">
                        ✓
                    </div>
                    <h3 className="font-pixel text-xs font-bold text-[#282828] mb-2">
                        NO ENTITIES IN THIS FILTER
                    </h3>
                    <p className="text-xs text-[#606870] font-sans max-w-sm leading-relaxed">
                        No Pokémon found matching the selected filter ({filter}).
                    </p>
                </div>
            ) : viewMode === 'CARDS' ? (
                /* FRLG Cards View: Light Dialog Box Panels */
                <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin pb-6 space-y-3 min-h-0">
                    {displayedPokemon.map((p, i) => {
                        const nationalId = getNationalDexId(p.species);
                        const speciesName = getPokemonName(nationalId);
                        const typeInfo = getPokemonTypes(p.species);
                        const t1 = TYPE_BADGE_STYLES[typeInfo.primary] || TYPE_BADGE_STYLES.NORMAL;
                        const tier = p.verdict?.tier || 'VERIFIED';

                        return (
                            <div
                                key={i}
                                className={`dialog-box p-4 flex flex-col md:flex-row md:items-center gap-4 shadow-xs transition-colors ${
                                    tier === 'VERIFIED'
                                        ? 'hover:border-[#389858]'
                                        : tier === 'UNCERTAIN'
                                        ? 'hover:border-[#e69820]'
                                        : 'hover:border-[#e65050]'
                                }`}
                            >
                                {/* Sprite Box */}
                                <div className="w-24 h-24 bg-[#f0f5fa] rounded-lg border-2 border-[#b8cce0] flex-shrink-0 flex items-center justify-center p-1 relative shadow-inner self-center md:self-start">
                                    <PokemonSprite
                                        species={p.species}
                                        alt={getDisplayName(p.nickname, p.species)}
                                        className="w-20 h-20 object-contain drop-shadow-sm"
                                    />
                                    <span className="absolute bottom-1 right-1 font-pixel text-[8px] bg-white/90 px-1 rounded border border-[#b8c8d8] text-[#282828]">
                                        Lv.{p.metLevel}
                                    </span>
                                </div>

                                {/* Main Info & Audit Evidence */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                        <span className="font-pixel text-[11px] font-bold text-[#282828] truncate">
                                            {getDisplayName(p.nickname, p.species)}
                                        </span>
                                        <span className="text-[11px] text-[#506878] font-sans">
                                            No.{nationalId.toString().padStart(3, '0')} {speciesName}
                                        </span>
                                        <span
                                            className="font-pixel text-[8px] font-bold px-2 py-0.5 rounded text-white shadow-xs"
                                            style={{ backgroundColor: t1.bg }}
                                        >
                                            {typeInfo.primary}
                                        </span>
                                        <VerdictBadge tier={tier} />
                                    </div>

                                    <div className="text-[10px] text-[#606870] font-sans mb-2 flex items-center gap-3 flex-wrap">
                                        <span>
                                            OT: <span className="font-mono text-[#282828]">{p.otName || 'TRAINER'}</span> (ID: {p.otid.toString().padStart(5, '0')})
                                        </span>
                                        <span>
                                            PID: <span className="font-mono text-[#5080e6]">0x{p.pid.toString(16).toUpperCase().padStart(8, '0')}</span>
                                        </span>
                                    </div>

                                    {/* Forensic Audit Evidence */}
                                    <div className="bg-[#f8fafd] border border-[#d0dce8] rounded p-2.5 text-xs space-y-1">
                                        {p.verdict?.evidence && p.verdict.evidence.length > 0 ? (
                                            p.verdict.evidence.map((ev, idx) => (
                                                <div key={idx} className="text-[#405060] font-sans flex items-start gap-1.5 text-[11px]">
                                                    <span className="text-[10px] text-[#5080e6] leading-tight">▸</span>
                                                    <span>{ev}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[#606870] text-[11px] font-sans">
                                                ▸ Valid Gen 3 checksum, PID correlation, and stat distribution.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Tabular Data View: GBA Stat Screen with Pixel-Perfect Borders & Alternating Rows */
                <div className="frlg-table-container flex-1 overflow-y-auto scrollbar-thin">
                    <table className="frlg-table">
                        <thead>
                            <tr>
                                <th style={{ width: '12%' }}>VERDICT</th>
                                <th style={{ width: '10%' }}>SPRITE</th>
                                <th style={{ width: '22%' }}>POKÉMON</th>
                                <th style={{ width: '8%' }}>LEVEL</th>
                                <th style={{ width: '18%' }}>TRAINER / PID</th>
                                <th style={{ width: '30%' }}>AUDIT EVIDENCE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedPokemon.map((p, i) => {
                                const nationalId = getNationalDexId(p.species);
                                const speciesName = getPokemonName(nationalId);
                                const tier = p.verdict?.tier || 'VERIFIED';

                                return (
                                    <tr key={i}>
                                        <td>
                                            <VerdictBadge tier={tier} />
                                        </td>
                                        <td>
                                            <div className="w-9 h-9 bg-white border border-[#b8c8d8] rounded flex items-center justify-center p-0.5 shadow-xs">
                                                <PokemonSprite
                                                    species={p.species}
                                                    alt={speciesName}
                                                    className="w-8 h-8 object-contain"
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-pixel text-[9px] font-bold text-[#282828]">
                                                {getDisplayName(p.nickname, p.species)}
                                            </div>
                                            <div className="text-[10px] text-[#606870] font-sans">
                                                No.{nationalId.toString().padStart(3, '0')} {speciesName}
                                            </div>
                                        </td>
                                        <td className="font-pixel text-[9px] text-[#282828]">
                                            Lv.{p.metLevel}
                                        </td>
                                        <td className="font-sans text-[11px] text-[#405060]">
                                            <div>{p.otName || 'TRAINER'} ({p.otid.toString().padStart(5, '0')})</div>
                                            <div className="font-mono text-[9px] text-[#5080e6]">
                                                0x{p.pid.toString(16).toUpperCase().padStart(8, '0')}
                                            </div>
                                        </td>
                                        <td className="font-sans text-[11px] text-[#405060]">
                                            {p.verdict?.evidence && p.verdict.evidence.length > 0 ? (
                                                <ul className="space-y-0.5">
                                                    {p.verdict.evidence.map((ev, idx) => (
                                                        <li key={idx} className="truncate max-w-sm" title={ev}>
                                                            ▸ {ev}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                'Valid Gen 3 structure & checksum'
                                            )}
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

const VerdictBadge: React.FC<{ tier: string }> = ({ tier }) => {
    if (tier === 'VERIFIED') {
        return (
            <span className="px-2 py-0.5 rounded font-pixel text-[8px] font-bold bg-[#eef8f2] text-[#246e3a] border border-[#389858] inline-block shadow-xs">
                ✓ VERIFIED
            </span>
        );
    }
    if (tier === 'UNCERTAIN') {
        return (
            <span className="px-2 py-0.5 rounded font-pixel text-[8px] font-bold bg-[#fef9ee] text-[#a06208] border border-[#e69820] inline-block shadow-xs">
                ? UNCERTAIN
            </span>
        );
    }
    return (
        <span className="px-2 py-0.5 rounded font-pixel text-[8px] font-bold bg-[#feeeee] text-[#b83030] border border-[#e65050] inline-block shadow-xs">
            ✗ MODIFIED
        </span>
    );
};
