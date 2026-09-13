import { describe, it, expect } from 'vitest';
import { estimateJourney } from './timeline';
import { Pokemon } from './types';

function createMockMon(species: number, metLevel: number, nickname: string = 'Mon', isEgg: boolean = false): Pokemon {
    return {
        pid: 12345,
        otid: 54321,
        nickname,
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
        isEgg,
        abilitySlot: 0,
        metLevel,
        gameOfOrigin: 3,
        pokeBall: 4,
    };
}

describe('Journey Estimate Engine (§5 Module 4)', () => {
    it('sorts captures by met level heuristic', () => {
        const p1 = createMockMon(16, 12, 'Pidgey'); // Route 1
        const p2 = createMockMon(258, 5, 'Mudkip'); // Starter
        const p3 = createMockMon(63, 8, 'Abra'); // Route 116

        const events = estimateJourney([p1, p2, p3]);
        expect(events).toHaveLength(3);
        expect(events[0].pokemon?.nickname).toBe('Mudkip');
        expect(events[1].pokemon?.nickname).toBe('Abra');
        expect(events[2].pokemon?.nickname).toBe('Pidgey');
    });

    it('assigns High confidence to level 5 starters (§5 Module 4)', () => {
        const starter = createMockMon(258, 5, 'Mudkip'); // Starter Lv 5
        const regular = createMockMon(263, 3, 'Zigzagoon'); // Wild Lv 3

        const events = estimateJourney([starter, regular]);
        const starterEvent = events.find(e => e.pokemon?.species === 258);
        const regularEvent = events.find(e => e.pokemon?.species === 263);

        expect(starterEvent?.confidence).toBe('High');
        expect(regularEvent?.confidence).toBe('Medium');
    });

    it('assigns Medium confidence if starter is not met at level 5', () => {
        const tradedStarter = createMockMon(258, 20, 'Mudkip'); // Traded or bred later
        const events = estimateJourney([tradedStarter]);
        expect(events[0].confidence).toBe('Medium');
    });
});
