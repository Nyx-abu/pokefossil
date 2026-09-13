import { describe, it, expect } from 'vitest';
import { detectGhosts } from './ghosts';
import { PokemonBox, Pokemon } from './types';

function createMockPokemon(pid: number, species: number = 1): Pokemon {
    return {
        pid,
        otid: 12345,
        nickname: `Mon_${pid}`,
        language: 2,
        isBadEgg: false,
        hasSpecies: true,
        otName: 'TRAINER',
        checksum: 0,
        calculatedChecksum: 0,
        species,
        heldItem: 0,
        experience: 0,
        friendship: 70,
        moves: [1, 0, 0, 0],
        movePps: [10, 0, 0, 0],
        evs: [0, 0, 0, 0, 0, 0],
        ivs: [10, 10, 10, 10, 10, 10],
        isEgg: false,
        abilitySlot: 0,
        metLevel: 5,
        gameOfOrigin: 3,
        pokeBall: 4,
    };
}

function createEmptyBoxes(): PokemonBox[] {
    const boxes: PokemonBox[] = [];
    for (let b = 0; b < 14; b++) {
        boxes.push({
            name: `BOX ${b + 1}`,
            pokemon: new Array(30).fill(null),
        });
    }
    return boxes;
}

describe('Ghost Recovery Engine (§5 Module 2)', () => {
    it('returns empty array when both blocks have identical pokemon', () => {
        const active = createEmptyBoxes();
        const inactive = createEmptyBoxes();

        active[0].pokemon[0] = createMockPokemon(1001);
        inactive[0].pokemon[0] = createMockPokemon(1001);

        const ghosts = detectGhosts(active, inactive);
        expect(ghosts).toHaveLength(0);
    });

    it('detects RELEASED ghost when active is empty but inactive has pokemon', () => {
        const active = createEmptyBoxes();
        const inactive = createEmptyBoxes();

        const releasedMon = createMockPokemon(2001, 280); // Gardevoir
        inactive[2].pokemon[11] = releasedMon; // Box 3, slot 12 (0-indexed 2, 11)

        const ghosts = detectGhosts(active, inactive);
        expect(ghosts).toHaveLength(1);
        expect(ghosts[0].type).toBe('RELEASED');
        expect(ghosts[0].boxIndex).toBe(2);
        expect(ghosts[0].slotIndex).toBe(11);
        expect(ghosts[0].pokemon.pid).toBe(2001);
        expect(ghosts[0].replacedBy).toBeUndefined();
    });

    it('detects OVERWRITTEN ghost when slot has different PID in active block', () => {
        const active = createEmptyBoxes();
        const inactive = createEmptyBoxes();

        const oldMon = createMockPokemon(3001, 1);
        const newMon = createMockPokemon(3002, 4);

        inactive[0].pokemon[5] = oldMon;
        active[0].pokemon[5] = newMon;

        const ghosts = detectGhosts(active, inactive);
        expect(ghosts).toHaveLength(1);
        expect(ghosts[0].type).toBe('OVERWRITTEN');
        expect(ghosts[0].boxIndex).toBe(0);
        expect(ghosts[0].slotIndex).toBe(5);
        expect(ghosts[0].pokemon.pid).toBe(3001);
        expect(ghosts[0].replacedBy?.pid).toBe(3002);
    });

    it('returns empty array when active/inactive boxes are empty or invalid', () => {
        expect(detectGhosts([], [])).toEqual([]);
    });
});
