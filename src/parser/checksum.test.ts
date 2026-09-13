import { describe, it, expect } from 'vitest';
import { calculateSectionChecksum } from './checksum';

describe('Checksum validation', () => {
    it('calculates checksum correctly', () => {
        // Create a dummy section of 4096 bytes with some known data
        const data = new Uint8Array(4096);
        const view = new DataView(data.buffer);
        // Fill some data
        view.setUint32(0, 0x11223344, true);
        view.setUint32(4, 0x55667788, true);
        
        // Checksum formula: sum all 32-bit words, then fold high + low 16 bits.
        // sum = 0x11223344 + 0x55667788 = 0x6688AACC
        // folded = 0x6688 + 0xAACC = 0x11154
        // masked to 16-bit = 0x1154
        
        const checksum = calculateSectionChecksum(data, 3968);
        expect(checksum).toBe(0x1154);
    });
});
