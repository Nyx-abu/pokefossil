import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SaveFile, Pokemon } from '../parser/types';
import { GhostRecord } from '../parser/ghosts';
import { JourneyEvent } from '../parser/timeline';
import { PokemonSprite } from './PokemonSprite';
import { getNationalDexId } from '../utils/speciesMapping';
import { getPokemonName, getDisplayName } from '../utils/pokemonNames';

/**
 * ============================================================================
 * PokéFossil v6: The Homecoming (Authentic GBA Dialogue Sequence)
 * ============================================================================
 * Visual System:
 * - Upper Stage: Clean GBA scene background with battlefield pedestals
 * - Sprites: Crisp, full-color pixel art (no sepia, no grayscale)
 * - Bottom Container: Authentic FRLG .dialog-box with speaker tag
 * - Advance Cue: Classic bouncing triangle arrow indicator at bottom-right
 * ============================================================================
 */

export interface HomecomingProps {
    saveFile: SaveFile;
    ghosts: GhostRecord[];
    timeline?: JourneyEvent[];
    onComplete: () => void;
    onSkip?: () => void;
}

// Starter National Dex IDs and family mapping
const STARTER_FAMILIES: Record<number, { starterName: string; formName: string }> = {
    // Gen 1 (FireRed / LeafGreen)
    1: { starterName: 'Bulbasaur', formName: 'Bulbasaur' },
    2: { starterName: 'Bulbasaur', formName: 'Ivysaur' },
    3: { starterName: 'Bulbasaur', formName: 'Venusaur' },
    4: { starterName: 'Charmander', formName: 'Charmander' },
    5: { starterName: 'Charmander', formName: 'Charmeleon' },
    6: { starterName: 'Charmander', formName: 'Charizard' },
    7: { starterName: 'Squirtle', formName: 'Squirtle' },
    8: { starterName: 'Squirtle', formName: 'Wartortle' },
    9: { starterName: 'Squirtle', formName: 'Blastoise' },
    // Gen 2 (Johto)
    152: { starterName: 'Chikorita', formName: 'Chikorita' },
    153: { starterName: 'Chikorita', formName: 'Bayleef' },
    154: { starterName: 'Chikorita', formName: 'Meganium' },
    155: { starterName: 'Cyndaquil', formName: 'Cyndaquil' },
    156: { starterName: 'Cyndaquil', formName: 'Quilava' },
    157: { starterName: 'Cyndaquil', formName: 'Typhlosion' },
    158: { starterName: 'Totodile', formName: 'Totodile' },
    159: { starterName: 'Totodile', formName: 'Croconaw' },
    160: { starterName: 'Totodile', formName: 'Feraligatr' },
    // Gen 3 (Ruby / Sapphire / Emerald)
    252: { starterName: 'Treecko', formName: 'Treecko' },
    253: { starterName: 'Treecko', formName: 'Grovyle' },
    254: { starterName: 'Treecko', formName: 'Sceptile' },
    255: { starterName: 'Torchic', formName: 'Torchic' },
    256: { starterName: 'Torchic', formName: 'Combusken' },
    257: { starterName: 'Torchic', formName: 'Blaziken' },
    258: { starterName: 'Mudkip', formName: 'Mudkip' },
    259: { starterName: 'Mudkip', formName: 'Marshtomp' },
    260: { starterName: 'Mudkip', formName: 'Swampert' },
};

export const Homecoming: React.FC<HomecomingProps> = ({
    saveFile,
    ghosts,
    timeline = [],
    onComplete,
    onSkip = onComplete,
}) => {
    // Current beat: 1 to 5
    const [beat, setBeat] = useState<number>(1);
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

    const changeBeat = useCallback((next: number) => {
        if (next === beat || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setBeat(next);
            setIsTransitioning(false);
        }, 220);
    }, [beat, isTransitioning]);

    const handleNext = useCallback(() => {
        if (beat < 5) {
            changeBeat(beat + 1);
        } else {
            onComplete();
        }
    }, [beat, changeBeat, onComplete]);

    // Keyboard navigation: Space, Enter, ArrowRight, 'z', 'a' advances beat; Esc skips
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'z' || e.key === 'a') {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'Escape') {
                onSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, onSkip]);

    // Gather all valid Pokemon from party & boxes
    const allPokemon = useMemo(() => {
        const partyList = saveFile.party || [];
        const boxList = saveFile.pokemonBoxes.flatMap(b => b.pokemon).filter((p): p is Pokemon => p !== null);
        return [...partyList, ...boxList];
    }, [saveFile]);

    // Beat 1: Playtime and Trainer facts
    const playTimeHours = saveFile.trainerInfo?.playTime?.hours ?? 0;
    const playTimeMinutes = saveFile.trainerInfo?.playTime?.minutes ?? 0;
    const trainerName = saveFile.trainerInfo?.playerName || 'Trainer';
    const trainerGender = saveFile.trainerInfo?.gender ?? 0; // 0 = Male, 1 = Female
    const trainerId = saveFile.trainerInfo?.trainerId ?? 0;
    const saveIndex = saveFile.activeBlock?.saveIndex ?? 0;

    const feltPlaytime = useMemo(() => {
        if (playTimeHours < 24) {
            return `${playTimeHours} ${playTimeHours === 1 ? 'hour' : 'hours'}. About a long weekend.`;
        }
        if (playTimeHours < 100) {
            const evenings = Math.max(1, Math.floor(playTimeHours / 3));
            return `${playTimeHours} hours. Roughly ${evenings} evenings after school.`;
        }
        return `${playTimeHours} hours. More time than most people spend on a college class.`;
    }, [playTimeHours]);

    // Detect Game of Origin and release year lookup table
    const gameInfo = useMemo(() => {
        const originFrequency: Record<number, number> = {};
        for (const mon of allPokemon) {
            if (mon.gameOfOrigin) {
                originFrequency[mon.gameOfOrigin] = (originFrequency[mon.gameOfOrigin] || 0) + 1;
            }
        }
        let topOrigin = 0;
        let topCount = 0;
        for (const [code, count] of Object.entries(originFrequency)) {
            if (count > topCount) {
                topCount = count;
                topOrigin = Number(code);
            }
        }

        // Fallback check on security key if pokemon metadata is sparse
        if (topOrigin === 0) {
            const secKey = saveFile.trainerInfo?.securityKey;
            if (secKey === 1) topOrigin = 4; // FireRed / LeafGreen
            else if (secKey !== null && secKey !== 0) topOrigin = 3; // Emerald
            else topOrigin = 2; // Ruby
        }

        // 1=Sapphire, 2=Ruby, 3=Emerald, 4=FireRed, 5=LeafGreen
        switch (topOrigin) {
            case 1:
                return { title: 'Pokémon Sapphire', year: 2002, region: 'Hoenn', startingTown: 'Littleroot Town', firstBadgeLocation: 'Rustboro City', trainerSprite: trainerGender === 1 ? 'may' : 'brendan' };
            case 2:
                return { title: 'Pokémon Ruby', year: 2002, region: 'Hoenn', startingTown: 'Littleroot Town', firstBadgeLocation: 'Rustboro City', trainerSprite: trainerGender === 1 ? 'may' : 'brendan' };
            case 3:
                return { title: 'Pokémon Emerald', year: 2004, region: 'Hoenn', startingTown: 'Littleroot Town', firstBadgeLocation: 'Rustboro City', trainerSprite: trainerGender === 1 ? 'may' : 'brendan' };
            case 4:
                return { title: 'Pokémon FireRed', year: 2004, region: 'Kanto', startingTown: 'Pallet Town', firstBadgeLocation: 'Pewter City', trainerSprite: trainerGender === 1 ? 'leaf-gen3' : 'red' };
            case 5:
                return { title: 'Pokémon LeafGreen', year: 2004, region: 'Kanto', startingTown: 'Pallet Town', firstBadgeLocation: 'Pewter City', trainerSprite: trainerGender === 1 ? 'leaf-gen3' : 'red' };
            default:
                return { title: 'Pokémon Emerald', year: 2004, region: 'Hoenn', startingTown: 'Littleroot Town', firstBadgeLocation: 'Rustboro City', trainerSprite: trainerGender === 1 ? 'may' : 'brendan' };
        }
    }, [allPokemon, saveFile.trainerInfo, trainerGender]);

    // Beat 2: Final party
    const party = saveFile.party || [];

    // Beat 3: The Road Here
    const starterInfo = useMemo(() => {
        let matchedStarter: { species: number; starterSpecies: string; currentName: string; metLevel: number } | null = null;

        for (const mon of allPokemon) {
            const natId = getNationalDexId(mon.species);
            const starterEntry = STARTER_FAMILIES[natId];
            if (starterEntry) {
                if (mon.metLevel === 5 || !matchedStarter) {
                    matchedStarter = {
                        species: mon.species,
                        starterSpecies: starterEntry.starterName,
                        currentName: getDisplayName(mon.nickname, mon.species),
                        metLevel: mon.metLevel || 5,
                    };
                    if (mon.metLevel === 5) break;
                }
            }
        }

        if (!matchedStarter && allPokemon.length > 0) {
            const earliest = [...allPokemon].sort((a, b) => a.metLevel - b.metLevel)[0];
            matchedStarter = {
                species: earliest.species,
                starterSpecies: getPokemonName(getNationalDexId(earliest.species)),
                currentName: getDisplayName(earliest.nickname, earliest.species),
                metLevel: earliest.metLevel || 5,
            };
        }

        const defaultSpecies = gameInfo.region === 'Kanto' ? 4 : 255;
        const defaultName = gameInfo.region === 'Kanto' ? 'Charmander' : 'Torchic';

        return matchedStarter || {
            species: defaultSpecies,
            starterSpecies: defaultName,
            currentName: defaultName,
            metLevel: 5,
        };
    }, [allPokemon, gameInfo.region]);

    const firstBadgeCompanion = useMemo(() => {
        const nonStarters = allPokemon.filter(p => {
            const natId = getNationalDexId(p.species);
            return !STARTER_FAMILIES[natId] && p.metLevel > 0 && p.metLevel <= 15;
        });

        if (nonStarters.length > 0) {
            nonStarters.sort((a, b) => a.metLevel - b.metLevel);
            const companion = nonStarters[0];
            return {
                species: companion.species,
                speciesName: getPokemonName(getNationalDexId(companion.species)),
                metLevel: companion.metLevel,
            };
        }

        const captureEvent = timeline.find(e => e.type === 'CAPTURE' && e.pokemon && !STARTER_FAMILIES[getNationalDexId(e.pokemon.species)]);
        if (captureEvent?.pokemon) {
            return {
                species: captureEvent.pokemon.species,
                speciesName: getPokemonName(getNationalDexId(captureEvent.pokemon.species)),
                metLevel: captureEvent.pokemon.metLevel,
            };
        }

        return null;
    }, [allPokemon, timeline]);

    // Hall of Fame analysis
    const hallOfFameStatus = useMemo(() => {
        const highestLevel = allPokemon.reduce((max, p) => Math.max(max, (p as any).level || p.metLevel || 0), 0);
        const hasBeatenE4 = highestLevel >= 50 || saveIndex >= 25;
        
        let hofSaveIndex = saveIndex;
        if (saveFile.inactiveBlock?.saveIndex && saveFile.inactiveBlock.saveIndex < saveIndex) {
            hofSaveIndex = saveFile.inactiveBlock.saveIndex;
        } else if (saveIndex > 5) {
            hofSaveIndex = Math.max(1, Math.floor(saveIndex * 0.85));
        }

        return { hasBeatenE4, hofSaveIndex };
    }, [allPokemon, saveFile.inactiveBlock, saveIndex]);

    // Beat 4: The Ghost (The one who didn't make it)
    const ghost = ghosts.length > 0 ? ghosts[0] : null;
    const ghostData = useMemo(() => {
        if (!ghost) return null;

        const speciesName = getPokemonName(getNationalDexId(ghost.pokemon.species));
        const nickname = getDisplayName(ghost.pokemon.nickname, ghost.pokemon.species);
        const metLevel = ghost.pokemon.metLevel || 5;
        const currentLevel = (ghost.pokemon as any).level || metLevel;
        const levelsGained = Math.max(0, currentLevel - metLevel);

        const saveIndexBefore = saveFile.inactiveBlock?.saveIndex ?? (saveIndex > 1 ? saveIndex - 1 : 1);
        const saveIndexAfter = saveIndex;

        return {
            species: ghost.pokemon.species,
            speciesName,
            nickname,
            metLevel,
            currentLevel,
            levelsGained,
            saveIndexBefore,
            saveIndexAfter,
            isOverwritten: ghost.type === 'OVERWRITTEN',
        };
    }, [ghost, saveFile.inactiveBlock, saveIndex]);

    return (
        <div 
            className="min-h-screen w-full flex flex-col justify-between select-none relative cursor-pointer overflow-hidden bg-[#e8eef4]"
            onClick={handleNext}
        >
            {/* Top Navigation Bar */}
            <header className="w-full flex justify-between items-center px-4 sm:px-8 py-3 z-30 bg-white/70 backdrop-blur border-b border-[#303848]/10 text-xs font-raw-data text-[#303848]">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-[#d8382c]">POKéFOSSIL</span>
                    <span className="text-[#8898a8] hidden sm:inline">|</span>
                    <span className="text-[#606878] hidden sm:inline">{gameInfo.title}</span>
                </div>

                {/* Beat Indicator Dots & Skip Action */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-1.5">
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    changeBeat(idx);
                                }}
                                aria-label={`Beat ${idx}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    beat === idx
                                        ? 'w-6 bg-[#d8382c]'
                                        : 'w-2 bg-[#b8c4d0] hover:bg-[#8898a8]'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSkip();
                        }}
                        className="px-2.5 py-1 rounded bg-[#303848]/10 hover:bg-[#303848]/20 text-[#303848] text-[10px] tracking-wider transition-colors"
                        title="Skip to Explore Mode"
                    >
                        SKIP (ESC) →
                    </button>
                </div>
            </header>

            {/* Upper Stage: Clean GBA Visual Arena with crisp, full-color sprites */}
            <main className="flex-1 w-full flex items-center justify-center p-4 relative z-10">
                <div 
                    className={`w-full max-w-4xl flex flex-col items-center justify-center transition-opacity duration-200 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    {/* =========================================================================
                        BEAT 1: The Return (Trainer & Playtime)
                       ========================================================================= */}
                    {beat === 1 && (
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            {/* Battle Podium */}
                            <div className="relative flex flex-col items-center">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center z-10">
                                    <img
                                        src={`https://play.pokemonshowdown.com/sprites/trainers/${gameInfo.trainerSprite}.png`}
                                        alt={trainerName}
                                        className="w-32 h-32 sm:w-40 sm:h-40 object-contain pixelated drop-shadow-md"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                {/* GBA Trainer circular podium */}
                                <div className="w-36 sm:w-44 h-10 bg-gradient-to-r from-[#98b0c8] via-[#c8d8e8] to-[#98b0c8] rounded-[50%] border-2 border-[#303848] shadow-md -mt-5" />
                            </div>

                            {/* Trainer Badge Information */}
                            <div className="bg-white/90 border border-[#303848]/20 px-4 py-2 rounded shadow-sm text-center">
                                <div className="font-raw-data text-xs sm:text-sm font-bold text-[#303848]">
                                    TRAINER: {trainerName.toUpperCase()}
                                </div>
                                <div className="font-raw-data text-[10px] text-[#606878] mt-0.5">
                                    IDNo. {String(trainerId).padStart(5, '0')} · {gameInfo.region.toUpperCase()} REGION
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 2: The Team As It Stood (Party Pokemon - Crisp, Full Color)
                       ========================================================================= */}
                    {beat === 2 && (
                        <div className="flex flex-col items-center justify-center w-full">
                            {/* Party Lineup on Clean Background */}
                            <div className="w-full bg-white/80 border border-[#303848]/20 rounded-xl p-4 sm:p-6 shadow-sm">
                                {party.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 items-end justify-items-center">
                                        {party.map((mon, idx) => {
                                            const natId = getNationalDexId(mon.species);
                                            const speciesName = getPokemonName(natId);
                                            const nickname = mon.nickname?.trim();
                                            const hasCustomNickname = Boolean(
                                                nickname &&
                                                nickname.toUpperCase() !== speciesName.toUpperCase() &&
                                                !nickname.includes('?')
                                            );
                                            const level = (mon as any).level || mon.metLevel || 5;

                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="flex flex-col items-center text-center w-full"
                                                >
                                                    {/* Pokémon Sprite: Full Color, Crisp, No Sepia, No Grayscale */}
                                                    <div className="relative flex flex-col items-center">
                                                        <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center z-10">
                                                            <PokemonSprite
                                                                species={mon.species}
                                                                alt={nickname || speciesName}
                                                                className="w-full h-full object-contain pixelated drop-shadow"
                                                            />
                                                        </div>
                                                        {/* Mini GBA grass battle base */}
                                                        <div className="w-16 sm:w-20 h-5 bg-[#78b878] rounded-[50%] border border-[#303848] shadow-sm -mt-2.5" />
                                                    </div>

                                                    <div className="mt-2 w-full">
                                                        <div className="font-serif font-bold text-xs sm:text-sm text-[#202830] truncate">
                                                            {hasCustomNickname ? nickname : speciesName}
                                                        </div>
                                                        {hasCustomNickname && (
                                                            <div className="text-[10px] font-serif text-[#606878] truncate">
                                                                {speciesName}
                                                            </div>
                                                        )}
                                                        <div className="font-raw-data text-[10px] text-[#d8382c] mt-0.5">
                                                            Lv.{level}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 font-serif text-sm text-[#606878] italic">
                                        Your active party was empty. All companions rested securely in the PC storage boxes.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 3: The Road Here (Starter & First Companion - Crisp, Full Color)
                       ========================================================================= */}
                    {beat === 3 && (
                        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-xl">
                            <div className="flex items-center justify-center gap-6 sm:gap-12">
                                {/* Starter Mon Platform */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center z-10">
                                            <PokemonSprite
                                                species={starterInfo.species}
                                                alt={starterInfo.starterSpecies}
                                                className="w-full h-full object-contain pixelated drop-shadow"
                                            />
                                        </div>
                                        <div className="w-20 sm:w-24 h-6 bg-[#78b878] rounded-[50%] border border-[#303848] -mt-3 shadow-sm" />
                                    </div>
                                    <div className="mt-2 font-serif font-bold text-xs sm:text-sm text-[#202830]">
                                        {starterInfo.currentName}
                                    </div>
                                    <div className="font-raw-data text-[10px] text-[#606878]">
                                        FIRST PARTNER · LV.{starterInfo.metLevel}
                                    </div>
                                </div>

                                {/* Journey Connector Arrow */}
                                <div className="font-raw-data text-base sm:text-xl text-[#303848]">
                                    ➔
                                </div>

                                {/* First Caught Companion Platform */}
                                {firstBadgeCompanion ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center z-10">
                                                <PokemonSprite
                                                    species={firstBadgeCompanion.species}
                                                    alt={firstBadgeCompanion.speciesName}
                                                    className="w-full h-full object-contain pixelated drop-shadow"
                                                />
                                            </div>
                                            <div className="w-20 sm:w-24 h-6 bg-[#d8b068] rounded-[50%] border border-[#303848] -mt-3 shadow-sm" />
                                        </div>
                                        <div className="mt-2 font-serif font-bold text-xs sm:text-sm text-[#202830]">
                                            {firstBadgeCompanion.speciesName}
                                        </div>
                                        <div className="font-raw-data text-[10px] text-[#606878]">
                                            FIRST JOINED · LV.{firstBadgeCompanion.metLevel}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#303848]/40 flex items-center justify-center text-xl text-[#8898a8]">
                                            ?
                                        </div>
                                        <div className="font-raw-data text-[10px] text-[#606878] mt-2">
                                            SOLO TRAVELER
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* League Badge Plaque */}
                            <div className="inline-flex items-center gap-2 bg-white/90 border border-[#303848]/20 px-4 py-1.5 rounded shadow-sm text-xs font-raw-data text-[#303848]">
                                <span>🏆</span>
                                <span>{hallOfFameStatus.hasBeatenE4 ? 'CHAMPION RECORDED' : 'LEAGUE CHALLENGE INCOMPLETE'}</span>
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 4: The Ghost (The One Who Didn't Make It - Crisp, Full Color)
                       ========================================================================= */}
                    {beat === 4 && (
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            {ghostData ? (
                                <>
                                    {/* Crisp, Full Color Sprite on Clean Background (No Sepia, No Grayscale) */}
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center z-10">
                                            <PokemonSprite
                                                species={ghostData.species}
                                                alt={ghostData.nickname}
                                                className="w-full h-full object-contain pixelated drop-shadow-md"
                                            />
                                        </div>
                                        {/* Soft mystic battle platform */}
                                        <div className="w-28 sm:w-36 h-8 bg-gradient-to-r from-[#b0a8c8] via-[#e8e0f8] to-[#b0a8c8] rounded-[50%] border-2 border-[#303848] -mt-4 shadow-sm" />
                                    </div>

                                    {/* Ghost Mon Badge */}
                                    <div className="bg-white/90 border border-[#303848]/20 px-4 py-2 rounded shadow-sm text-center">
                                        <div className="font-serif font-bold text-sm sm:text-base text-[#202830]">
                                            {ghostData.nickname} <span className="font-normal text-xs text-[#606878]">({ghostData.speciesName})</span>
                                        </div>
                                        <div className="font-raw-data text-[10px] text-[#805090] mt-0.5">
                                            CAUGHT LV.{ghostData.metLevel} ➔ LAST SEEN LV.{ghostData.currentLevel}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="w-20 h-20 rounded-full bg-[#78b878]/20 border-2 border-[#78b878] flex items-center justify-center text-3xl shadow-sm">
                                        ✨
                                    </div>
                                    <div className="font-raw-data text-xs sm:text-sm text-[#407040] font-bold mt-4">
                                        ALL COMPANIONS PRESERVED
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 5: Now, and Then (Game Boy Advance Homecoming)
                       ========================================================================= */}
                    {beat === 5 && (
                        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-lg">
                            {/* Game Cartridge / Pokédex emblem */}
                            <div className="relative flex flex-col items-center">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white border-2 border-[#303848] flex items-center justify-center shadow-md p-3">
                                    <img
                                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                                        alt="Poké Ball"
                                        className="w-16 h-16 object-contain pixelated"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23fff" stroke="%23303848" stroke-width="3"/><path d="M 2,20 A 18 18 0 0 1 38,20 Z" fill="%23d8382c"/><circle cx="20" cy="20" r="5" fill="%23fff" stroke="%23303848" stroke-width="2.5"/></svg>';
                                        }}
                                    />
                                </div>
                                <div className="w-32 h-4 bg-[#303848]/20 rounded-full blur-[2px] mt-1" />
                            </div>

                            <div className="font-raw-data text-xs sm:text-sm font-bold text-[#303848]">
                                {gameInfo.title.toUpperCase()} · {gameInfo.year}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Screen: Authentic GBA .dialog-box with "click to advance" bouncing triangle */}
            <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 pb-6 relative z-20">
                <div 
                    className="dialog-box w-full p-4 sm:p-6 min-h-[140px] sm:min-h-[160px] flex flex-col justify-between relative cursor-pointer select-none transition-shadow hover:shadow-2xl"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                >
                    {/* Speaker Header Tag */}
                    <div className="flex items-center justify-between border-b border-[#303848]/15 pb-2 mb-2">
                        <span className="font-raw-data text-xs sm:text-sm font-bold text-[#d8382c] tracking-wide">
                            {beat === 1 && 'TRAINER LOG'}
                            {beat === 2 && 'ACTIVE ROSTER'}
                            {beat === 3 && 'JOURNEY CHRONICLE'}
                            {beat === 4 && (ghostData ? 'STATIC RECORD' : 'ARCHIVE AUDIT')}
                            {beat === 5 && 'HOMECOMING'}
                        </span>
                        <span className="font-raw-data text-[10px] text-[#808898]">
                            PAGE {beat} OF 5
                        </span>
                    </div>

                    {/* Dialogue Text Area */}
                    <div className="font-serif text-base sm:text-lg text-[#202830] leading-relaxed pr-8">
                        {beat === 1 && (
                            <div className="space-y-1">
                                <p>
                                    It has been a long time, <span className="font-bold text-[#202830]">{trainerName}</span>.
                                </p>
                                <p className="text-sm sm:text-base text-[#485060]">
                                    You logged {playTimeHours} hours, {playTimeMinutes} minutes in this world. <span className="italic">({feltPlaytime})</span>
                                </p>
                                <p className="text-xs sm:text-sm text-[#687080]">
                                    This cartridge recorded #{saveIndex} completed saves before it was set down.
                                </p>
                            </div>
                        )}

                        {beat === 2 && (
                            <div className="space-y-1">
                                <p>
                                    This is who stood beside you at the end of your adventure.
                                </p>
                                <p className="text-sm sm:text-base text-[#485060]">
                                    {party.length > 0
                                        ? `Your active party held ${party.length} Pokémon, ready for whatever battle came next.`
                                        : 'Your party rested peacefully in the PC boxes when the file was last closed.'}
                                </p>
                            </div>
                        )}

                        {beat === 3 && (
                            <div className="space-y-1">
                                <p>
                                    <span className="font-semibold text-[#202830]">{starterInfo.starterSpecies}</span> was the first to walk with you, at Level 5 in {gameInfo.startingTown}.
                                </p>
                                {firstBadgeCompanion ? (
                                    <p className="text-sm sm:text-base text-[#485060]">
                                        By {gameInfo.firstBadgeLocation}, <span className="font-medium text-[#202830]">{firstBadgeCompanion.speciesName}</span> had joined your party.
                                    </p>
                                ) : (
                                    <p className="text-sm sm:text-base text-[#485060]">
                                        By {gameInfo.firstBadgeLocation}, you journeyed on alongside {starterInfo.starterSpecies}.
                                    </p>
                                )}
                                <p className="text-xs sm:text-sm text-[#687080]">
                                    {hallOfFameStatus.hasBeatenE4
                                        ? `You conquered the Pokémon League on save #${hallOfFameStatus.hofSaveIndex}.`
                                        : `Your journey paused on save #${saveIndex}, with the Pokémon League still ahead.`}
                                </p>
                            </div>
                        )}

                        {beat === 4 && (
                            <div className="space-y-1">
                                {ghostData ? (
                                    <>
                                        <p className="font-semibold text-[#803030]">
                                            Wait... someone is missing from the team.
                                        </p>
                                        <p className="text-sm sm:text-base text-[#485060]">
                                            <span className="font-bold text-[#202830]">{ghostData.nickname}</span>, a {ghostData.speciesName}. Caught at Level {ghostData.metLevel}, last seen at Level {ghostData.currentLevel}.
                                        </p>
                                        <p className="text-xs sm:text-sm text-[#687080]">
                                            {ghostData.levelsGained > 0
                                                ? `They grew with you for ${ghostData.levelsGained} ${ghostData.levelsGained === 1 ? 'level' : 'levels'}.`
                                                : `They joined your journey at Level ${ghostData.metLevel}.`}
                                            {' '}
                                            {ghostData.isOverwritten
                                                ? `Somewhere between save #${ghostData.saveIndexBefore} and save #${ghostData.saveIndexAfter}, someone else took their place.`
                                                : `Somewhere between save #${ghostData.saveIndexBefore} and save #${ghostData.saveIndexAfter}, you let them go.`}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-[#306830]">
                                            No one was left behind.
                                        </p>
                                        <p className="text-sm sm:text-base text-[#485060]">
                                            Every Pokémon who started this cartridge finished it right beside you.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {beat === 5 && (
                            <div className="space-y-1.5">
                                <p>
                                    {gameInfo.title} came out in {gameInfo.year}.
                                </p>
                                <p className="text-sm sm:text-base text-[#485060]">
                                    This file has rested quietly since the last time someone turned off a Game Boy Advance and meant to come back to it.
                                </p>
                                <p className="text-sm sm:text-base font-bold text-[#d8382c]">
                                    You just did.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Right: Classic Bouncing Triangle Arrow Indicator or Explore Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#303848]/10 mt-2">
                        <span className="text-[10px] font-raw-data text-[#8898a8]">
                            [SPACE] OR CLICK TO ADVANCE
                        </span>

                        {beat < 5 ? (
                            <div className="flex items-center gap-1.5" title="Click to advance">
                                <div className="dialog-arrow" />
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onComplete();
                                }}
                                className="px-3 py-1 bg-[#d8382c] hover:bg-[#b8281c] text-white font-raw-data text-xs rounded shadow transition-all flex items-center gap-1.5 group"
                            >
                                <span>OPEN EXPLORE MODE</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">▶</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Homecoming;

