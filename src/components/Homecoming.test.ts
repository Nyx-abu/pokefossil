import { describe, it, expect } from 'vitest';
import { SaveFile, Pokemon } from '../parser/types';
import { GhostRecord } from '../parser/ghosts';

describe('Homecoming Narrative Flow Logic', () => {
    const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
        pid: 123456,
        otid: 99999,
        nickname: 'TREECKO',
        language: 2,
        isBadEgg: false,
        hasSpecies: true,
        otName: 'ASH',
        checksum: 100,
        calculatedChecksum: 100,
        species: 277, // Gen 3 Treecko internal ID
        heldItem: 0,
        experience: 125,
        friendship: 70,
        moves: [1, 0, 0, 0],
        movePps: [35, 0, 0, 0],
        evs: [0, 0, 0, 0, 0, 0],
        ivs: [15, 15, 15, 15, 15, 15],
        isEgg: false,
        abilitySlot: 0,
        metLevel: 5,
        gameOfOrigin: 3, // Emerald
        pokeBall: 4,
        ...overrides,
    });

    const createMockSave = (hours: number, minutes: number = 24, saveCount: number = 42): SaveFile => {
        const activeBlock = {
            isValid: true,
            saveIndex: saveCount,
            sections: {},
        };
        const inactiveBlock = {
            isValid: true,
            saveIndex: saveCount > 1 ? saveCount - 1 : 1,
            sections: {},
        };
        return {
            activeBlock,
            inactiveBlock,
            trainerInfo: {
                playerName: 'Brendan',
                gender: 0,
                trainerId: 12345,
                secretId: 54321,
                playTime: { hours, minutes, seconds: 12, frames: 0 },
                securityKey: 0x1234,
                money: 5000,
            },
            party: [createMockPokemon()],
            pokemonBoxes: [],
            inactivePokemonBoxes: [],
        };
    };

    describe('Beat 1: Playtime felt conversion', () => {
        const getFeltPlaytime = (hours: number) => {
            if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'}. About a long weekend.`;
            if (hours < 100) {
                const evenings = Math.max(1, Math.floor(hours / 3));
                return `${hours} hours. Roughly ${evenings} evenings after school.`;
            }
            return `${hours} hours. More time than most people spend on a college class.`;
        };

        it('translates under 24 hours to "About a long weekend"', () => {
            expect(getFeltPlaytime(14)).toBe('14 hours. About a long weekend.');
            expect(getFeltPlaytime(1)).toBe('1 hour. About a long weekend.');
            expect(getFeltPlaytime(0)).toBe('0 hours. About a long weekend.');
        });

        it('translates 24 to 99 hours to evenings after school', () => {
            expect(getFeltPlaytime(36)).toBe('36 hours. Roughly 12 evenings after school.');
            expect(getFeltPlaytime(75)).toBe('75 hours. Roughly 25 evenings after school.');
        });

        it('translates 100+ hours to college class duration', () => {
            expect(getFeltPlaytime(100)).toBe('100 hours. More time than most people spend on a college class.');
            expect(getFeltPlaytime(250)).toBe('250 hours. More time than most people spend on a college class.');
        });
    });

    describe('Beat 4: Ghost copy logic', () => {
        it('formats released ghost copy correctly with exact save indices', () => {
            const save = createMockSave(40, 15, 128);
            const ghostMon = createMockPokemon({ nickname: 'RALTS', species: 311, metLevel: 4 });
            const ghost: GhostRecord = {
                type: 'RELEASED',
                pokemon: ghostMon,
                boxIndex: 0,
                slotIndex: 5,
            };

            const saveBefore = save.inactiveBlock?.saveIndex ?? 1;
            const saveAfter = save.activeBlock?.saveIndex ?? 1;

            expect(saveBefore).toBe(127);
            expect(saveAfter).toBe(128);
            expect(ghost.type).toBe('RELEASED');
        });

        it('formats overwritten ghost copy correctly', () => {
            const ghostMon = createMockPokemon({ nickname: 'ZIGZAGOON', species: 288, metLevel: 3 });
            const ghost: GhostRecord = {
                type: 'OVERWRITTEN',
                pokemon: ghostMon,
                boxIndex: 1,
                slotIndex: 0,
            };

            expect(ghost.type).toBe('OVERWRITTEN');
        });
    });

    describe('Beat 5: Game title and release year anchors', () => {
        const getGameData = (originCode: number) => {
            switch (originCode) {
                case 1: return { title: 'Pokémon Sapphire', year: 2002 };
                case 2: return { title: 'Pokémon Ruby', year: 2002 };
                case 3: return { title: 'Pokémon Emerald', year: 2004 };
                case 4: return { title: 'Pokémon FireRed', year: 2004 };
                case 5: return { title: 'Pokémon LeafGreen', year: 2004 };
                default: return { title: 'Pokémon Emerald', year: 2004 };
            }
        };

        it('correctly maps cartridge release years without guessing dates', () => {
            expect(getGameData(1)).toEqual({ title: 'Pokémon Sapphire', year: 2002 });
            expect(getGameData(2)).toEqual({ title: 'Pokémon Ruby', year: 2002 });
            expect(getGameData(3)).toEqual({ title: 'Pokémon Emerald', year: 2004 });
            expect(getGameData(4)).toEqual({ title: 'Pokémon FireRed', year: 2004 });
            expect(getGameData(5)).toEqual({ title: 'Pokémon LeafGreen', year: 2004 });
        });
    });
});
