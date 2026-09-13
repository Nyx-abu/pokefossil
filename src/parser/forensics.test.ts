import { describe, it, expect } from 'vitest';
import { checkMethod124, performForensics } from './forensics';
import { lcrngForward } from './prng';
import { Pokemon } from './types';

describe('Forensics Engine (§4.3, §5 Module 3)', () => {
    function generateMethod1Mon(seed: number) {
        const seed1 = lcrngForward(seed);
        const pidLow = (seed1 >>> 16) & 0xFFFF;
        const seed2 = lcrngForward(seed1);
        const pidHigh = (seed2 >>> 16) & 0xFFFF;
        const pid = ((pidHigh << 16) | pidLow) >>> 0;

        const seed3 = lcrngForward(seed2);
        const iv1 = (seed3 >>> 16) & 0x7FFF;
        const seed4 = lcrngForward(seed3);
        const iv2 = (seed4 >>> 16) & 0x7FFF;

        const ivs = [
            iv1 & 0x1F,
            (iv1 >> 5) & 0x1F,
            (iv1 >> 10) & 0x1F,
            iv2 & 0x1F,
            (iv2 >> 5) & 0x1F,
            (iv2 >> 10) & 0x1F,
        ];

        return { pid, ivs };
    }

    function generateMethod2Mon(seed: number) {
        const seed1 = lcrngForward(seed);
        const pidLow = (seed1 >>> 16) & 0xFFFF;
        const seed2 = lcrngForward(seed1);
        const pidHigh = (seed2 >>> 16) & 0xFFFF;
        const pid = ((pidHigh << 16) | pidLow) >>> 0;

        const seed3 = lcrngForward(seed2); // skipped
        const seed4 = lcrngForward(seed3); // IV1
        const iv1 = (seed4 >>> 16) & 0x7FFF;
        const seed5 = lcrngForward(seed4); // IV2
        const iv2 = (seed5 >>> 16) & 0x7FFF;

        const ivs = [
            iv1 & 0x1F,
            (iv1 >> 5) & 0x1F,
            (iv1 >> 10) & 0x1F,
            iv2 & 0x1F,
            (iv2 >> 5) & 0x1F,
            (iv2 >> 10) & 0x1F,
        ];

        return { pid, ivs };
    }

    function generateMethod4Mon(seed: number) {
        const seed1 = lcrngForward(seed);
        const pidLow = (seed1 >>> 16) & 0xFFFF;
        const seed2 = lcrngForward(seed1);
        const pidHigh = (seed2 >>> 16) & 0xFFFF;
        const pid = ((pidHigh << 16) | pidLow) >>> 0;

        const seed3 = lcrngForward(seed2); // IV1
        const iv1 = (seed3 >>> 16) & 0x7FFF;
        const seed4 = lcrngForward(seed3); // skipped
        const seed5 = lcrngForward(seed4); // IV2
        const iv2 = (seed5 >>> 16) & 0x7FFF;

        const ivs = [
            iv1 & 0x1F,
            (iv1 >> 5) & 0x1F,
            (iv1 >> 10) & 0x1F,
            iv2 & 0x1F,
            (iv2 >> 5) & 0x1F,
            (iv2 >> 10) & 0x1F,
        ];

        return { pid, ivs };
    }

    it('identifies Method 1 encounters correctly', () => {
        const mon = generateMethod1Mon(0x456789AB);
        expect(checkMethod124(mon.pid, mon.ivs)).toBe('Method 1');
    });

    it('identifies Method 2 encounters correctly', () => {
        const mon = generateMethod2Mon(0x13579BDF);
        expect(checkMethod124(mon.pid, mon.ivs)).toBe('Method 2');
    });

    it('identifies Method 4 encounters correctly', () => {
        const mon = generateMethod4Mon(0x98765432);
        expect(checkMethod124(mon.pid, mon.ivs)).toBe('Method 4');
    });

    it('returns null for non-matching RNG patterns', () => {
        const mon = generateMethod1Mon(0x12345678);
        // Modify IVs
        mon.ivs[0] = (mon.ivs[0] + 5) % 32;
        expect(checkMethod124(mon.pid, mon.ivs)).toBeNull();
    });

    it('verifies performForensics flags Bad Egg as INVALID', () => {
        const mon: Pokemon = {
            pid: 0x12345678,
            otid: 0x12345678,
            nickname: 'TEST',
            language: 2,
            isBadEgg: true,
            hasSpecies: true,
            otName: 'TRAINER',
            checksum: 0x1234,
            calculatedChecksum: 0x1234,
            species: 25,
            heldItem: 0,
            experience: 100,
            friendship: 70,
            moves: [1, 2, 0, 0],
            movePps: [10, 10, 0, 0],
            evs: [0, 0, 0, 0, 0, 0],
            ivs: [10, 10, 10, 10, 10, 10],
            isEgg: false,
            abilitySlot: 0,
            metLevel: 5,
            gameOfOrigin: 3,
            pokeBall: 4,
        };

        const verdict = performForensics(mon);
        expect(verdict.tier).toBe('INVALID');
    });

    it('verifies performForensics flags checksum mismatch as INVALID', () => {
        const mon: Pokemon = {
            pid: 0x12345678,
            otid: 0x12345678,
            nickname: 'TEST',
            language: 2,
            isBadEgg: false,
            hasSpecies: true,
            otName: 'TRAINER',
            checksum: 0x1234,
            calculatedChecksum: 0x9999,
            species: 25,
            heldItem: 0,
            experience: 100,
            friendship: 70,
            moves: [1, 2, 0, 0],
            movePps: [10, 10, 0, 0],
            evs: [0, 0, 0, 0, 0, 0],
            ivs: [10, 10, 10, 10, 10, 10],
            isEgg: false,
            abilitySlot: 0,
            metLevel: 5,
            gameOfOrigin: 3,
            pokeBall: 4,
        };

        const verdict = performForensics(mon);
        expect(verdict.tier).toBe('INVALID');
    });

    it('verifies performForensics returns VERIFIED for matching Method 1 with consistent ability', () => {
        const { pid, ivs } = generateMethod1Mon(0xABCDEF01);
        const mon: Pokemon = {
            pid,
            otid: 0x12345678,
            nickname: 'TEST',
            language: 2,
            isBadEgg: false,
            hasSpecies: true,
            otName: 'TRAINER',
            checksum: 0x1234,
            calculatedChecksum: 0x1234,
            species: 25,
            heldItem: 0,
            experience: 100,
            friendship: 70,
            moves: [1, 2, 0, 0],
            movePps: [10, 10, 0, 0],
            evs: [0, 0, 0, 0, 0, 0],
            ivs,
            isEgg: false,
            abilitySlot: pid & 1,
            metLevel: 5,
            gameOfOrigin: 3,
            pokeBall: 4,
        };

        const verdict = performForensics(mon);
        expect(verdict.tier).toBe('VERIFIED');
    });

    it('verifies performForensics returns UNCERTAIN when no RNG match but no other flags', () => {
        const mon: Pokemon = {
            pid: 0x12345678,
            otid: 0x12345678,
            nickname: 'TEST',
            language: 2,
            isBadEgg: false,
            hasSpecies: true,
            otName: 'TRAINER',
            checksum: 0x1234,
            calculatedChecksum: 0x1234,
            species: 25,
            heldItem: 0,
            experience: 100,
            friendship: 70,
            moves: [1, 2, 0, 0],
            movePps: [10, 10, 0, 0],
            evs: [0, 0, 0, 0, 0, 0],
            ivs: [12, 14, 16, 18, 20, 22],
            isEgg: false,
            abilitySlot: 0x12345678 & 1, // Consistent
            metLevel: 5,
            gameOfOrigin: 3,
            pokeBall: 4,
        };

        const verdict = performForensics(mon);
        expect(verdict.tier).toBe('UNCERTAIN');
    });
});
