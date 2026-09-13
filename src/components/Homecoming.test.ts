import { describe, it, expect } from 'vitest';
import { SaveFile, Pokemon } from '../parser/types';
import { GhostRecord } from '../parser/ghosts';

describe('Homecoming Narrative Flow Logic', () => {
    const createMockPokemon = (overrides: Partial<Pokemon> = {}): Pokemon => ({
        personality: 123456,
        otId: 99999,
        nickname: 'TREECKO',
        language: 2,
        isEgg: false,
        otName: 'ASH',
        markings: 0,
        checksum: 100,
        species: 277, // Gen 3 Treecko internal ID
        heldItem: 0,
        experience: 125,
        ppBonuses: 0,
        friendship: 70,
        moves: [1, 0, 0, 0],
        pp: [35, 0, 0, 0],
        hpEv: 0,
        attackEv: 0,
        defenseEv: 0,
        speedEv: 0,
        spAtkEv: 0,
        spDefEv: 0,
        coolStat: 0,
        beautyStat: 0,
        cuteStat: 0,
        smartStat: 0,
        toughStat: 0,
        sheen: 0,
        pokerus: 0,
        metLocation: 1,
        metLevel: 5,
        gameOfOrigin: 3, // Emerald
        pokeBall: 4,
        otGender: 0,
        hpIv: 15,
        attackIv: 15,
        defenseIv: 15,
        speedIv: 15,
        spAtkIv: 15,
        spDefIv: 15,
        abilityNum: 0,
        ribbons: 0,
        ...overrides,
    });

    const createMockSave = (hours: number, minutes: number = 24, saveCount: number = 42): SaveFile => {
        const activeBlock = {
            saveIndex: saveCount,
            sections: [{ id: 0, checksum: 0, valid: true, data: new Uint8Array(), footer: { saveIndex: saveCount, sectionId: 0, checksum: 0, signature: 0 } }],
            gameCode: 0,
            securityKey: 0,
        };
        return {
            activeBlock,
            inactiveBlock: {
                saveIndex: saveCount > 1 ? saveCount - 1 : 1,
                sections: [],
                gameCode: 0,
                securityKey: 0,
            },
            trainerInfo: {
                playerName: 'Brendan',
                gender: 0,
                trainerId: 12345,
                secretId: 54321,
                playTime: { hours, minutes, seconds: 12, frames: 0 },
                securityKey: 0x1234,
            },
            party: [createMockPokemon()],
            pokemonBoxes: [],
            gameCode: 'BPEE',
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
