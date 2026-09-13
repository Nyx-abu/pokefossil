import React, { useState, useEffect, useRef } from 'react';
import { useStore, Screen } from '../store';
import { useControlsStore, ControllerButton, retroAudio } from '../controlsStore';
import { PokemonSprite } from './PokemonSprite';
import { getDisplayName } from '../utils/pokemonNames';

interface NavOption {
    id: Screen;
    label: string;
    icon: string;
    description: string;
    count?: number;
    subtext?: string;
}

export const Dashboard: React.FC = () => {
    const { saveFile, ghosts, timeline, setScreen, reset } = useStore();
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [hoveredDescription, setHoveredDescription] = useState<string | null>(null);
    const focusedIndexRef = useRef(focusedIndex);
    focusedIndexRef.current = focusedIndex;

    if (!saveFile) return null;

    const { trainerInfo, activeBlock } = saveFile;
    const { hours, minutes, seconds } = trainerInfo.playTime;

    let verifiedCount = 0;
    let uncertainCount = 0;
    let modifiedCount = 0;
    let totalCount = saveFile.party?.length || 0;

    saveFile.pokemonBoxes.forEach((b) => {
        b.pokemon.forEach((p) => {
            if (p) {
                totalCount++;
                if (p.verdict?.tier === 'VERIFIED') verifiedCount++;
                else if (p.verdict?.tier === 'UNCERTAIN') uncertainCount++;
                else modifiedCount++;
            }
        });
    });

    saveFile.party?.forEach((p) => {
        if (p.verdict?.tier === 'VERIFIED') verifiedCount++;
        else if (p.verdict?.tier === 'UNCERTAIN') uncertainCount++;
        else modifiedCount++;
    });

    const actionCommands: NavOption[] = [
        {
            id: 'BOXES',
            label: 'POKéMON BOXES',
            icon: '📦',
            description: "Access BILL's PC Pokémon Storage System to inspect 14 storage boxes.",
            count: totalCount,
            subtext: `${totalCount} IN STORAGE`,
        },
        {
            id: 'GHOSTS',
            label: 'GHOST ARCHIVE',
            icon: '👻',
            description: "Analyze memory remnants and overwritten records from backup block.",
            count: ghosts.length,
            subtext: `${ghosts.length} GHOST TRACES`,
        },
        {
            id: 'LEGITIMACY',
            label: 'LEGIT AUDIT',
            icon: '🛡️',
            description: "Review cryptographic signatures, PID-IV correlation, and checksum integrity.",
            count: verifiedCount,
            subtext: `${verifiedCount} LEGAL / ${uncertainCount + modifiedCount} FLAG`,
        },
        {
            id: 'JOURNEY',
            label: 'JOURNEY LOG',
            icon: '📜',
            description: "Reconstruct the adventure chronology and timeline of caught Pokémon.",
            count: timeline?.length || 0,
            subtext: `${timeline?.length || 0} CHRONO EVENTS`,
        },
    ];

    // Hardware GBA buttons listener
    useEffect(() => {
        const unsubscribe = useControlsStore.getState().addListener((button: ControllerButton) => {
            if (button === 'UP' || button === 'LEFT') {
                setFocusedIndex((prev) => (prev - 1 + actionCommands.length) % actionCommands.length);
            } else if (button === 'DOWN' || button === 'RIGHT') {
                setFocusedIndex((prev) => (prev + 1) % actionCommands.length);
            } else if (button === 'A') {
                const target = actionCommands[focusedIndexRef.current];
                if (target) {
                    setScreen(target.id);
                }
            } else if (button === 'B') {
                reset();
            }
        });
        return unsubscribe;
    }, [actionCommands.length, setScreen, reset]);

    const activeDescription =
        hoveredDescription ||
        actionCommands[focusedIndex]?.description ||
        `TRAINER ${trainerInfo.playerName || 'RED'}'s save data loaded. Choose a command.`;

    return (
        <div className="flex flex-col h-full space-y-2 font-pixel text-xs select-none">
            {/* Top GBA Header Bar (FireRed Banner) */}
            <div className="pokemon-banner-red px-2.5 py-1.5 flex items-center justify-between text-[9px] md:text-[10px] tracking-wider rounded-sm">
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-[#581008] shadow-[inset_0_0_2px_rgba(0,0,0,0.5)]"></span>
                    <span className="font-bold">POKéFOSSIL // GEN-III</span>
                </div>
                <div className="flex items-center space-x-1 md:space-x-1.5">
                    {actionCommands.map((cmd) => (
                        <button
                            key={cmd.id}
                            onClick={() => {
                                retroAudio.playSelect();
                                setScreen(cmd.id);
                            }}
                            className="pokemon-nav-tab text-[7px] md:text-[8px] hover:text-[#ffd040]"
                            title={cmd.label}
                        >
                            {cmd.icon} <span className="hidden sm:inline">{cmd.id}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            retroAudio.playBack();
                            reset();
                        }}
                        className="pokemon-nav-tab text-[7px] md:text-[8px] text-red-300 hover:text-red-100 hover:border-red-400"
                        title="Eject Save File"
                    >
                        ⏏ <span className="hidden sm:inline">EJECT</span>
                    </button>
                </div>
            </div>

            {/* Main Upper Split: Trainer Card + Active Party */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                {/* Authentic FireRed Trainer Card */}
                <div className="pokemon-trainer-card p-2 flex flex-col justify-between rounded-sm">
                    {/* Card Header */}
                    <div className="border-b border-[#4a729c] pb-1 mb-1.5 flex justify-between items-center text-[8px] md:text-[9px] text-[#e8f0f8]">
                        <span className="text-[#ffd040] font-bold">★ TRAINER CARD ★</span>
                        <span className="text-gray-300">
                            SAVE #{activeBlock.saveIndex?.toString().padStart(5, '0') || '00001'}
                        </span>
                    </div>

                    {/* Trainer Info Grid */}
                    <div className="grid grid-cols-3 gap-2 items-center mb-1.5">
                        {/* Avatar */}
                        <div className="w-14 h-14 bg-[#162438] border-2 border-[#0c1622] rounded flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                            <PokemonSprite
                                species={25}
                                alt="Trainer Emblem"
                                className="w-10 h-10 drop-shadow-md"
                            />
                            <span className="text-[6px] text-gray-400">
                                {trainerInfo.gender === 0 ? 'BOY' : 'GIRL'}
                            </span>
                        </div>

                        {/* Stats Column */}
                        <div className="col-span-2 space-y-0.5 text-[8px] text-gray-100">
                            <div className="flex justify-between border-b border-white/10 pb-0.5">
                                <span className="text-gray-300">NAME:</span>
                                <span className="text-[#ffffff] font-bold truncate">
                                    {trainerInfo.playerName || 'RED'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-0.5">
                                <span className="text-gray-300">IDNo.:</span>
                                <span className="text-[#ffd040]">
                                    {(trainerInfo.trainerId ?? 0).toString().padStart(5, '0')}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-0.5">
                                <span className="text-gray-300">MONEY:</span>
                                <span className="text-[#70f8a8]">
                                    ¥{trainerInfo.money != null ? trainerInfo.money.toLocaleString() : '---'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-300">TIME:</span>
                                <span className="text-white">
                                    {hours.toString().padStart(2, '0')}:
                                    {minutes.toString().padStart(2, '0')}:
                                    {seconds.toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 8 Gym Badges Case */}
                    <div className="bg-[#121c28] border border-[#0a121c] p-1 rounded">
                        <div className="text-[6px] text-gray-400 mb-0.5 flex justify-between">
                            <span>BADGES (KANTO / HOENN)</span>
                            <span className="text-[#ffd040]">8 / 8</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1 items-center justify-items-center">
                            {[
                                { name: 'Boulder', color: '#9e9e9e' },
                                { name: 'Cascade', color: '#29b6f6' },
                                { name: 'Thunder', color: '#ffa726' },
                                { name: 'Rainbow', color: '#ab47bc' },
                                { name: 'Soul', color: '#ef5350' },
                                { name: 'Marsh', color: '#ffd54f' },
                                { name: 'Volcano', color: '#ff7043' },
                                { name: 'Earth', color: '#66bb6a' },
                            ].map((badge, idx) => (
                                <div
                                    key={idx}
                                    title={badge.name}
                                    className="w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center shadow-sm"
                                    style={{
                                        backgroundColor: badge.color,
                                        boxShadow: `0 0 3px ${badge.color}88, inset 1px 1px 1px rgba(255,255,255,0.6)`,
                                    }}
                                >
                                    <span className="text-[5px] text-black/70 font-bold">★</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gen 3 Active Party Window */}
                <div className="pokemon-window-blue p-2 flex flex-col justify-between rounded-sm">
                    <div className="border-b border-[#3c5e84] pb-1 mb-1.5 flex justify-between items-center text-[8px] md:text-[9px]">
                        <span className="text-[#ffd040] font-bold">POKéMON PARTY</span>
                        <span className="text-gray-300">
                            {saveFile.party?.length || 0} / 6 READY
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 flex-grow">
                        {saveFile.party?.map((p, i) => {
                            const isLegal = p.verdict?.tier === 'VERIFIED';
                            const isUncertain = p.verdict?.tier === 'UNCERTAIN';
                            const hpColor = isLegal ? '#48c058' : isUncertain ? '#f8b820' : '#f84030';
                            const hpLabel = isLegal ? 'LEGAL' : isUncertain ? 'SUSPECT' : 'MODIFIED';

                            return (
                                <div
                                    key={i}
                                    className="bg-[#182638] border border-[#0c1622] rounded p-1 flex items-center space-x-1.5 shadow-sm"
                                >
                                    <div className="w-8 h-8 bg-[#101b2a] rounded flex items-center justify-center flex-shrink-0 border border-black/40">
                                        <PokemonSprite
                                            species={p.species}
                                            alt={getDisplayName(p.nickname, p.species)}
                                            className="w-7 h-7 drop-shadow"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[7px] font-bold truncate text-white">
                                                {getDisplayName(p.nickname, p.species)}
                                            </span>
                                            <span className="text-[6px] text-gray-300">
                                                Lv.{p.metLevel}
                                            </span>
                                        </div>
                                        {/* Retro HP / Legitimacy Bar */}
                                        <div className="mt-0.5">
                                            <div className="flex justify-between text-[5px] text-gray-300 mb-0.5">
                                                <span>STATUS</span>
                                                <span style={{ color: hpColor }}>{hpLabel}</span>
                                            </div>
                                            <div className="w-full bg-black/60 h-1 rounded-sm overflow-hidden border border-black/80">
                                                <div
                                                    className="h-full"
                                                    style={{
                                                        width: isLegal ? '100%' : isUncertain ? '60%' : '25%',
                                                        backgroundColor: hpColor,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty party slots */}
                        {Array.from({ length: 6 - (saveFile.party?.length || 0) }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="bg-[#121d2b]/60 border border-dashed border-[#24374e] rounded p-1 flex items-center justify-center opacity-40 text-[6px] text-gray-400"
                            >
                                - EMPTY -
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gen 3 Command Action Menu (4 Interactive Buttons) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {actionCommands.map((cmd, idx) => {
                    const isSelected = focusedIndex === idx;
                    return (
                        <button
                            key={cmd.id}
                            onClick={() => {
                                retroAudio.playSelect();
                                setFocusedIndex(idx);
                                setScreen(cmd.id);
                            }}
                            onMouseEnter={() => {
                                setFocusedIndex(idx);
                                setHoveredDescription(cmd.description);
                                retroAudio.playMove();
                            }}
                            onMouseLeave={() => setHoveredDescription(null)}
                            className={`pokemon-menu-btn p-1.5 rounded flex flex-col justify-between text-left transition-all ${
                                isSelected ? 'border-[#e04038] bg-[#283d56] ring-1 ring-[#e04038]' : ''
                            }`}
                        >
                            <div className="flex items-center space-x-1 mb-0.5">
                                <span className={`text-[#e04038] text-[8px] ${isSelected ? 'animate-pokemon-cursor' : 'opacity-0'}`}>
                                    ▶
                                </span>
                                <span className="text-[7px] md:text-[8px] font-bold text-white tracking-tight">
                                    {cmd.label}
                                </span>
                            </div>
                            <div className="text-[6px] md:text-[7px] text-[#ffd040] font-dialog font-bold pl-2.5">
                                {cmd.subtext}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Authentic FireRed Dialogue Box (At the bottom of screen) */}
            <div className="pokemon-dialog-cream px-2.5 py-1.5 rounded relative flex items-start space-x-2">
                <div className="flex-grow font-dialog text-[9px] md:text-[10px] leading-relaxed text-[#282830]">
                    {activeDescription}
                </div>
                {/* Bouncing red down arrow cursor */}
                <div className="flex-shrink-0 pt-0.5">
                    <span className="inline-block text-[#d83828] text-[10px] animate-pokemon-prompt font-pixel">
                        ▼
                    </span>
                </div>
            </div>
        </div>
    );
};
