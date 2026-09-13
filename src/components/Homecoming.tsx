import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SaveFile, Pokemon } from '../parser/types';
import { GhostRecord } from '../parser/ghosts';
import { JourneyEvent } from '../parser/timeline';
import { PokemonSprite } from './PokemonSprite';
import { getNationalDexId } from '../utils/speciesMapping';
import { getPokemonName, getDisplayName } from '../utils/pokemonNames';

/**
 * ============================================================================
 * PokéFossil v5: The Homecoming
 * ============================================================================
 * Visual System per §3.1 of specification:
 * - Background: Warm, aged paper cream sampled from 2002 GBA cartridge box cardstock patina (#f7f4ea)
 * - Photo Frame Backing: Soft unbleached archival paper sampled from Gen 3 instruction manual inner pages (#fffefb)
 * - Primary Text: Soft charcoal-brown sampled from Gen 3 dialogue text box ink (#2d2926)
 * - Secondary Text: Muted stone pencil sampled from Hoenn Town Map route annotation gray (#6e675f)
 * - Accent: Warm muted brass sampled from Hoenn Stone Badge rim brass (#9c7a2b)
 * - Frame Border: Warm linen taupe sampled from vintage boxed set inner tray (#dfd8ca)
 * - Absence / Ghost: Desaturated sprite using grayscale(100%) and opacity(70%) per §3.1 (absence as "less", not purple)
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
        }, 300);
    }, [beat, isTransitioning]);

    const handleNext = useCallback(() => {
        if (beat < 5) {
            changeBeat(beat + 1);
        } else {
            onComplete();
        }
    }, [beat, changeBeat, onComplete]);

    // Keyboard navigation: Space, Enter, or ArrowRight advances beat
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
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

    // Detect Game of Origin and release year lookup table per §2.5
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
                return { title: 'Pokémon FireRed', year: 2004, region: 'Kanto', startingTown: 'Pallet Town', firstBadgeLocation: 'Pewter City', trainerSprite: trainerGender === 1 ? 'leaf' : 'red' };
            case 5:
                return { title: 'Pokémon LeafGreen', year: 2004, region: 'Kanto', startingTown: 'Pallet Town', firstBadgeLocation: 'Pewter City', trainerSprite: trainerGender === 1 ? 'leaf' : 'red' };
            default:
                return { title: 'Pokémon Emerald', year: 2004, region: 'Hoenn', startingTown: 'Littleroot Town', firstBadgeLocation: 'Rustboro City', trainerSprite: trainerGender === 1 ? 'may' : 'brendan' };
        }
    }, [allPokemon, saveFile.trainerInfo, trainerGender]);

    // Beat 2: Final party "class photo"
    const party = saveFile.party || [];

    // Beat 3: The Road Here
    const starterInfo = useMemo(() => {
        // Find starter by species mapping and metLevel === 5
        let matchedStarter: { starterSpecies: string; currentName: string; metLevel: number } | null = null;

        for (const mon of allPokemon) {
            const natId = getNationalDexId(mon.species);
            const starterEntry = STARTER_FAMILIES[natId];
            if (starterEntry) {
                if (mon.metLevel === 5 || !matchedStarter) {
                    matchedStarter = {
                        starterSpecies: starterEntry.starterName,
                        currentName: getDisplayName(mon.nickname, mon.species),
                        metLevel: mon.metLevel || 5,
                    };
                    if (mon.metLevel === 5) break;
                }
            }
        }

        if (!matchedStarter && allPokemon.length > 0) {
            // Fallback to earliest caught Pokémon if no canonical starter detected
            const earliest = [...allPokemon].sort((a, b) => a.metLevel - b.metLevel)[0];
            matchedStarter = {
                starterSpecies: getPokemonName(getNationalDexId(earliest.species)),
                currentName: getDisplayName(earliest.nickname, earliest.species),
                metLevel: earliest.metLevel || 5,
            };
        }

        return matchedStarter || {
            starterSpecies: gameInfo.region === 'Kanto' ? 'Charmander' : 'Torchic',
            currentName: gameInfo.region === 'Kanto' ? 'Charmander' : 'Torchic',
            metLevel: 5,
        };
    }, [allPokemon, gameInfo.region]);

    const firstBadgeCompanion = useMemo(() => {
        // Find earliest non-starter Pokémon met at or before level 14
        const nonStarters = allPokemon.filter(p => {
            const natId = getNationalDexId(p.species);
            return !STARTER_FAMILIES[natId] && p.metLevel > 0 && p.metLevel <= 15;
        });

        if (nonStarters.length > 0) {
            nonStarters.sort((a, b) => a.metLevel - b.metLevel);
            const companion = nonStarters[0];
            return {
                speciesName: getPokemonName(getNationalDexId(companion.species)),
                metLevel: companion.metLevel,
            };
        }

        // Fallback from timeline if available
        const captureEvent = timeline.find(e => e.type === 'CAPTURE' && e.pokemon && !STARTER_FAMILIES[getNationalDexId(e.pokemon.species)]);
        if (captureEvent?.pokemon) {
            return {
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
            className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 select-none transition-colors duration-500 relative cursor-pointer"
            style={{
                backgroundColor: '#f7f4ea', // Warm aged paper cream
                color: '#2d2926',           // Soft charcoal-brown
            }}
            onClick={handleNext}
        >
            {/* Inline styles for custom subtle photographic cross-fade and typography */}
            <style>{`
                @keyframes photoCrossFadeUp {
                    0% {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .photo-fade-in {
                    animation: photoCrossFadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .photo-fade-in-delayed {
                    animation: photoCrossFadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 250ms forwards;
                    opacity: 0;
                }
                .photo-fade-in-delayed-2 {
                    animation: photoCrossFadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 500ms forwards;
                    opacity: 0;
                }
            `}</style>

            {/* Header with quiet skip affordance */}
            <header className="w-full max-w-4xl flex justify-between items-center py-2 text-xs font-serif tracking-wide text-[#6e675f]">
                <span className="opacity-60">PokéFossil</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSkip();
                    }}
                    className="opacity-50 hover:opacity-100 hover:text-[#2d2926] transition-opacity underline decoration-[#dfd8ca] underline-offset-4"
                >
                    skip to explore →
                </button>
            </header>

            {/* Center Story Container */}
            <main className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center text-center px-4 my-auto">
                <div 
                    className={`w-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
                    key={beat}
                >
                    {/* =========================================================================
                        BEAT 1: The Return
                        {playTimeHours} hours, {playTimeMinutes} minutes.
                        Felt conversion: long weekend / school evenings / college class.
                        You played as {trainerName}.
                        You saved this file {saveIndex} times.
                       ========================================================================= */}
                    {beat === 1 && (
                        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 photo-fade-in">
                            <div className="space-y-2">
                                <p className="text-2xl sm:text-4xl font-serif tracking-tight text-[#2d2926]">
                                    {playTimeHours} hours, {playTimeMinutes} minutes.
                                </p>
                                <p className="text-base sm:text-xl font-serif text-[#6e675f] italic">
                                    {feltPlaytime}
                                </p>
                            </div>

                            <div className="flex flex-col items-center space-y-3 pt-4 photo-fade-in-delayed">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#dfd8ca] bg-[#fffefb] flex items-center justify-center shadow-sm overflow-hidden">
                                    <img
                                        src={`https://play.pokemonshowdown.com/sprites/trainers/${gameInfo.trainerSprite}.png`}
                                        alt={trainerName}
                                        className="w-14 h-14 object-contain"
                                        onError={(e) => {
                                            // Fallback if trainer sprite fails to load
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <p className="text-xl sm:text-2xl font-serif text-[#2d2926]">
                                    You played as <span className="font-semibold text-[#2d2926]">{trainerName}</span>.
                                </p>
                            </div>

                            <div className="pt-2 photo-fade-in-delayed-2">
                                <p className="text-sm sm:text-base font-serif text-[#6e675f]">
                                    You saved this file <span className="font-mono text-sm sm:text-base font-semibold text-[#9c7a2b]">#{saveIndex}</span> times.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 2: The Team As It Stood
                        "This is who was with you at the end."
                        Single wide photograph frame, row of sprites, nicknames/levels.
                       ========================================================================= */}
                    {beat === 2 && (
                        <div className="flex flex-col items-center justify-center space-y-6 photo-fade-in w-full">
                            <p className="text-xl sm:text-2xl font-serif text-[#2d2926]">
                                This is who was with you at the end.
                            </p>

                            {/* Class photograph frame per §2.2 */}
                            <div 
                                className="w-full bg-[#fffefb] border border-[#dfd8ca] rounded-lg p-4 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                            >
                                {party.length > 0 ? (
                                    <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6 md:gap-8">
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
                                                    className="flex flex-col items-center text-center min-w-[70px] sm:min-w-[90px] photo-fade-in"
                                                    style={{ animationDelay: `${idx * 80}ms` }}
                                                >
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
                                                        <PokemonSprite
                                                            species={mon.species}
                                                            alt={nickname || speciesName}
                                                            className="w-full h-full object-contain drop-shadow-sm"
                                                        />
                                                    </div>

                                                    {hasCustomNickname ? (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-sm sm:text-base font-serif font-semibold text-[#2d2926] leading-tight">
                                                                {nickname}
                                                            </span>
                                                            <span className="text-[11px] font-serif text-[#6e675f] leading-tight">
                                                                {speciesName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm sm:text-base font-serif font-medium text-[#2d2926] leading-tight">
                                                            {speciesName}
                                                        </span>
                                                    )}

                                                    <span className="text-[11px] font-serif text-[#6e675f] mt-0.5">
                                                        Lv.{level}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm font-serif text-[#6e675f] italic py-4">
                                        Your party was empty when the file was closed. The Pokémon rested in PC storage.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 3: The Road Here
                        {starterSpecies} was the first one, at Level 5, in {startingTown}.
                        By {firstBadgeLocation}, {firstBadgeSpecies} had joined. [confidence opacity]
                        You beat the Elite Four on save #{hallOfFameSaveIndex}. [hard fact]
                       ========================================================================= */}
                    {beat === 3 && (
                        <div className="flex flex-col items-center justify-center space-y-8 photo-fade-in max-w-xl mx-auto">
                            <div className="space-y-2">
                                <p className="text-xl sm:text-2xl font-serif text-[#2d2926] leading-relaxed">
                                    <span className="font-semibold text-[#2d2926]">{starterInfo.starterSpecies}</span> was the first one, at Level 5, in {gameInfo.startingTown}.
                                </p>
                            </div>

                            {firstBadgeCompanion ? (
                                <div className="space-y-1 opacity-75 photo-fade-in-delayed">
                                    <p className="text-lg sm:text-xl font-serif text-[#2d2926]">
                                        By {gameInfo.firstBadgeLocation}, <span className="font-medium">{firstBadgeCompanion.speciesName}</span> had joined.
                                    </p>
                                    <p className="text-[11px] font-serif text-[#6e675f] italic">
                                        [Inferred from met levels]
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1 opacity-75 photo-fade-in-delayed">
                                    <p className="text-lg sm:text-xl font-serif text-[#2d2926]">
                                        By {gameInfo.firstBadgeLocation}, you were still traveling with {starterInfo.starterSpecies}.
                                    </p>
                                </div>
                            )}

                            <div className="pt-2 photo-fade-in-delayed-2 border-t border-[#dfd8ca]/60 w-full">
                                {hallOfFameStatus.hasBeatenE4 ? (
                                    <p className="text-xl sm:text-2xl font-serif text-[#2d2926] font-semibold leading-relaxed">
                                        You beat the Elite Four on save <span className="font-mono text-[#9c7a2b]">#{hallOfFameStatus.hofSaveIndex}</span>.
                                    </p>
                                ) : (
                                    <p className="text-lg sm:text-xl font-serif text-[#2d2926] leading-relaxed">
                                        Your journey paused on save <span className="font-mono text-[#9c7a2b]">#{saveIndex}</span>, with the Elite Four still ahead.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 4: The One Who Didn't Make It (THE CLIMAX)
                        Restraint, quietness, no ghost drone.
                        If ghost:
                          "But someone's missing."
                          Desaturated sprite alone.
                          {ghostNickname}, a {ghostSpecies}.
                          Level {ghostLevel} when you last saw them.
                          Caught at Level {ghostMetLevel}.
                          They were with you for {estimatedLevelsGained} levels.
                          "Somewhere between save #{saveIndexBefore} and save #{saveIndexAfter}, you let them go."
                        If no ghost:
                          "No one's missing."
                          "Everyone who started this file finished it with you."
                       ========================================================================= */}
                    {beat === 4 && (
                        <div className="flex flex-col items-center justify-center space-y-6 photo-fade-in max-w-lg mx-auto">
                            {ghostData ? (
                                <>
                                    <p className="text-xl sm:text-2xl font-serif text-[#2d2926]">
                                        But someone's missing.
                                    </p>

                                    {/* Desaturated sprite per §3.1: absence as "less", not purple */}
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center my-2 photo-fade-in-delayed">
                                        <PokemonSprite
                                            species={ghost!.pokemon.species}
                                            alt={ghostData.nickname}
                                            className="w-full h-full object-contain filter grayscale contrast-90 opacity-70"
                                        />
                                    </div>

                                    <div className="space-y-2 photo-fade-in-delayed">
                                        <p className="text-lg sm:text-xl font-serif text-[#2d2926]">
                                            <span className="font-semibold">{ghostData.nickname}</span>, a {ghostData.speciesName}.
                                        </p>
                                        <p className="text-base sm:text-lg font-serif text-[#6e675f]">
                                            Level {ghostData.currentLevel} when you last saw them.
                                        </p>
                                        <p className="text-base sm:text-lg font-serif text-[#6e675f]">
                                            Caught at Level {ghostData.metLevel}.
                                        </p>
                                    </div>

                                    {ghostData.levelsGained > 0 ? (
                                        <p className="text-base sm:text-lg font-serif text-[#2d2926] photo-fade-in-delayed-2">
                                            They were with you for {ghostData.levelsGained} {ghostData.levelsGained === 1 ? 'level' : 'levels'}.
                                        </p>
                                    ) : (
                                        <p className="text-base sm:text-lg font-serif text-[#6e675f] photo-fade-in-delayed-2">
                                            They joined you at Level {ghostData.metLevel}.
                                        </p>
                                    )}

                                    <div className="pt-2 photo-fade-in-delayed-2">
                                        {ghostData.isOverwritten ? (
                                            <p className="text-base sm:text-lg font-serif text-[#6e675f]">
                                                Somewhere between save <span className="font-mono text-sm font-semibold text-[#9c7a2b]">#{ghostData.saveIndexBefore}</span> and save <span className="font-mono text-sm font-semibold text-[#9c7a2b]">#{ghostData.saveIndexAfter}</span>, someone else took their place.
                                            </p>
                                        ) : (
                                            <p className="text-base sm:text-lg font-serif text-[#6e675f]">
                                                Somewhere between save <span className="font-mono text-sm font-semibold text-[#9c7a2b]">#{ghostData.saveIndexBefore}</span> and save <span className="font-mono text-sm font-semibold text-[#9c7a2b]">#{ghostData.saveIndexAfter}</span>, you let them go.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 py-8">
                                    <p className="text-2xl sm:text-3xl font-serif text-[#2d2926]">
                                        No one's missing.
                                    </p>
                                    <p className="text-lg sm:text-xl font-serif text-[#6e675f] max-w-md mx-auto leading-relaxed">
                                        Everyone who started this file finished it with you.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* =========================================================================
                        BEAT 5: Now, and Then
                        {gameTitle} came out in {gameReleaseYear}.
                        This file has been sitting untouched since the last time
                        someone turned off a Game Boy Advance and meant to come back to it.
                        You just did.
                        [Look through the file yourself →]
                       ========================================================================= */}
                    {beat === 5 && (
                        <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 photo-fade-in max-w-xl mx-auto">
                            <p className="text-2xl sm:text-3xl font-serif text-[#2d2926] tracking-tight">
                                {gameInfo.title} came out in {gameInfo.year}.
                            </p>

                            <p className="text-lg sm:text-xl font-serif text-[#6e675f] leading-relaxed max-w-lg photo-fade-in-delayed">
                                This file has been sitting untouched since the last time someone turned off a Game Boy Advance and meant to come back to it.
                            </p>

                            <p className="text-2xl sm:text-3xl font-serif text-[#2d2926] font-semibold photo-fade-in-delayed-2">
                                You just did.
                            </p>

                            <div className="pt-6 photo-fade-in-delayed-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onComplete();
                                    }}
                                    className="px-6 py-3 bg-[#fffefb] border border-[#dfd8ca] rounded-md text-base sm:text-lg font-serif text-[#2d2926] hover:border-[#9c7a2b] hover:text-[#9c7a2b] shadow-sm hover:shadow transition-all group"
                                >
                                    Look through the file yourself <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer with Beat Indicators & Next CTA */}
            <footer className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center py-4 gap-3 text-xs font-serif text-[#6e675f]">
                {/* 5-beat dot indicators */}
                <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                changeBeat(idx);
                            }}
                            aria-label={`Go to beat ${idx}`}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                beat === idx
                                    ? 'w-6 bg-[#2d2926]'
                                    : 'bg-[#dfd8ca] hover:bg-[#6e675f]'
                            }`}
                        />
                    ))}
                </div>

                {/* Advance prompt */}
                {beat < 5 ? (
                    <div className="flex items-center space-x-2 text-xs font-serif opacity-70 hover:opacity-100 transition-opacity">
                        <span>Click or press Space to continue</span>
                        <span className="text-sm">→</span>
                    </div>
                ) : (
                    <span className="text-xs font-serif opacity-50">Story complete</span>
                )}
            </footer>
        </div>
    );
};

export default Homecoming;
