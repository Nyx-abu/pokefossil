import { describe, it, expect } from 'vitest';
import { decodeString } from './charset';

describe('Charset Decoding (§2.7)', () => {
    it('decodes standard English letters and numbers', () => {
        // 0xBB = 'A', 0xD5 = 'a', 0xA1 = '0', 0xFF = terminator
        const data = new Uint8Array([0xBB, 0xD5, 0xA1, 0xFF]);
        expect(decodeString(data)).toBe('Aa0');
    });

    it('stops decoding at terminator 0xFF', () => {
        const data = new Uint8Array([0xBC, 0xFF, 0xBD]);
        expect(decodeString(data)).toBe('B');
    });

    it('decodes space (0x00) correctly', () => {
        const data = new Uint8Array([0xBB, 0x00, 0xBC, 0xFF]);
        expect(decodeString(data)).toBe('A B');
    });
});
