import { describe, it, expect } from 'vitest';
import { xorMask32, decryptPokemonData } from './crypto';

describe('Crypto Module (§3.2)', () => {
    it('decrypts 48-byte substructures using PID ^ OTID', () => {
        const pid = 0x12345678;
        const otid = 0x87654321;
        const key = (pid ^ otid) >>> 0;

        const plaintext = new Uint8Array(48);
        for (let i = 0; i < 48; i++) {
            plaintext[i] = i & 0xFF;
        }

        // Encrypt with key
        const encrypted = xorMask32(plaintext, key);

        // Decrypt with decryptPokemonData
        const decrypted = decryptPokemonData(encrypted, pid, otid);

        expect(decrypted).toEqual(plaintext);
    });

    it('verifies XOR decryption is symmetric', () => {
        const key = 0xAABBCCDD;
        const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
        const masked = xorMask32(data, key);
        const unmasked = xorMask32(masked, key);
        expect(unmasked).toEqual(data);
    });

    it('handles non-4-byte aligned data correctly', () => {
        const key = 0x11223344;
        const data = new Uint8Array([0xAA, 0xBB, 0xCC]);
        const masked = xorMask32(data, key);
        const unmasked = xorMask32(masked, key);
        expect(unmasked).toEqual(data);
    });
});
