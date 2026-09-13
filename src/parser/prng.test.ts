import { describe, it, expect } from 'vitest';
import { lcrngForward, lcrngReverse, advanceRNG, reconstructSeedsFromPID, calculateShinyValue, isShiny } from './prng';

describe('PRNG Engine (§4.1, §4.2, §4.4)', () => {
    it('verifies LCRNG forward and reverse are exact inverses', () => {
        const testSeeds = [0, 1, 0x12345678, 0x5A0, 0xFFFFFFFF, 0x80000000];
        for (const seed of testSeeds) {
            const next = lcrngForward(seed);
            const prev = lcrngReverse(next);
            expect(prev >>> 0).toBe(seed >>> 0);
        }
    });

    it('verifies advanceRNG advances correctly', () => {
        const seed = 0x12345678;
        const advanced1 = lcrngForward(seed);
        const advanced2 = lcrngForward(advanced1);
        expect(advanceRNG(seed, 2)).toBe(advanced2);
    });

    it('reconstructs seeds from PID correctly (§4.2)', () => {
        // Generate a known PID using forward RNG
        const initialSeed = 0x12345678;
        const seed1 = lcrngForward(initialSeed);
        const pidLow = (seed1 >>> 16) & 0xFFFF;
        const seed2 = lcrngForward(seed1);
        const pidHigh = (seed2 >>> 16) & 0xFFFF;
        const pid = ((pidHigh << 16) | pidLow) >>> 0;

        const reconstructed = reconstructSeedsFromPID(pid);
        expect(reconstructed.length).toBeGreaterThanOrEqual(1);
        expect(reconstructed.map(s => s >>> 0)).toContain(seed1 >>> 0);
    });

    it('calculates shiny value and checks shiny condition (§4.4)', () => {
        // Shiny condition: TID ^ SID ^ PID_high ^ PID_low < 8
        const tid = 12345;
        const sid = 54321;
        const pidLow = 0x1234;
        // Construct pidHigh such that tid ^ sid ^ pidHigh ^ pidLow = 0 (definitely shiny)
        const pidHigh = tid ^ sid ^ pidLow;
        const shinyPid = ((pidHigh << 16) | pidLow) >>> 0;

        expect(calculateShinyValue(tid, sid, shinyPid)).toBe(0);
        expect(isShiny(tid, sid, shinyPid)).toBe(true);

        // Non-shiny PID
        const nonShinyPid = (((pidHigh ^ 0x00FF) << 16) | pidLow) >>> 0;
        expect(isShiny(tid, sid, nonShinyPid)).toBe(false);
    });
});
