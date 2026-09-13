import { describe, it, expect } from 'vitest';
import { parsePokemon } from './pokemon';
import { xorMask32 } from './crypto';

describe('Pokemon Parser (§3.1-3.9)', () => {
    it('returns null for an all-zero 80-byte buffer (empty slot)', () => {
        const emptyData = new Uint8Array(80);
        const result = parsePokemon(emptyData);
        expect(result).toBeNull();
    });

    it('returns null when PID=0 and species=0 even if some bytes are non-zero (§3.8)', () => {
        const data = new Uint8Array(80);
        data[0x12] = 2; // Language = 2
        data[0x13] = 0; // Misc flags
        const result = parsePokemon(data);
        expect(result).toBeNull();
    });

    it('returns null when buffer length is less than 80 bytes', () => {
        const shortData = new Uint8Array(50);
        expect(parsePokemon(shortData)).toBeNull();
    });

    it('parses unencrypted header and decrypts substructures correctly', () => {
        const data = new Uint8Array(80);
        const view = new DataView(data.buffer);

        const pid = 0x00000000; // pid % 24 = 0 -> "GAEM"
        const otid = 0x12345678;

        view.setUint32(0x00, pid, true);
        view.setUint32(0x04, otid, true);

        // Nickname: 10 bytes at 0x08. Let's use Gen III charset: 0xBB = 'A', 0xFF = terminator
        data[0x08] = 0xBB; // 'A'
        data[0x09] = 0xFF; // terminator

        data[0x12] = 2; // Language: English
        data[0x13] = 2; // Misc flags: bit 1 = HasSpecies (1 << 1)

        // OT Name: 7 bytes at 0x14
        data[0x14] = 0xBC; // 'B'
        data[0x15] = 0xFF;

        // Substructures (48 bytes, 0x20 to 0x4F)
        // For pid % 24 = 0, order is GAEM:
        // G (0-11): species at +0, heldItem at +2, exp at +4, friendship at +9
        // A (12-23): moves at +0, +2, +4, +6; pp at +8, +9, +10, +11
        // E (24-35): EVs at +0..+5
        // M (36-47): Pokerus +0, MetLoc +1, Origins +2, IV/Egg/Ability +4, Ribbons +8

        const decrypted = new Uint8Array(48);
        const decView = new DataView(decrypted.buffer);

        // Growth (offset 0)
        decView.setUint16(0x00, 25, true); // Pikachu
        decView.setUint16(0x02, 1, true); // Held item: Master Ball
        decView.setUint32(0x04, 1000, true); // Exp: 1000
        decView.setUint8(0x09, 120); // Friendship: 120

        // Attacks (offset 12)
        decView.setUint16(12 + 0, 85, true); // Thunderbolt
        decView.setUint16(12 + 2, 86, true);
        decView.setUint8(12 + 8, 15); // PP

        // EVs (offset 24)
        decView.setUint8(24 + 0, 252); // HP
        decView.setUint8(24 + 3, 252); // Speed

        // Misc (offset 36)
        // Origins: metLevel=5 (bits 0-6), game=Emerald(3, bits 7-10), ball=UltraBall(2, bits 11-14)
        // 5 | (3 << 7) | (2 << 11) = 5 | 0x0180 | 0x1000 = 0x1185
        decView.setUint16(36 + 2, 0x1185, true);
        // IVs: all 31 (0x1F) -> 31 | (31 << 5) | (31 << 10) | (31 << 15) | (31 << 20) | (31 << 25) = 0x3FFFFFFF
        // Ability slot 1 -> bit 31 = 1 -> 0xBFFFFFFF
        decView.setUint32(36 + 4, 0xBFFFFFFF, true);

        // Calculate checksum of decrypted substructures
        let sum = 0;
        for (let i = 0; i < 48; i += 2) {
            sum = (sum + decView.getUint16(i, true)) & 0xFFFF;
        }
        view.setUint16(0x1C, sum, true);

        // Encrypt substructures
        const key = (pid ^ otid) >>> 0;
        const encrypted = xorMask32(decrypted, key);
        data.set(encrypted, 0x20);

        const mon = parsePokemon(data);
        expect(mon).not.toBeNull();
        if (!mon) return;

        expect(mon.pid).toBe(pid);
        expect(mon.otid).toBe(otid);
        expect(mon.nickname).toBe('A');
        expect(mon.language).toBe(2);
        expect(mon.hasSpecies).toBe(true);
        expect(mon.isBadEgg).toBe(false);
        expect(mon.otName).toBe('B');
        expect(mon.checksum).toBe(sum);
        expect(mon.calculatedChecksum).toBe(sum);

        expect(mon.species).toBe(25);
        expect(mon.heldItem).toBe(1);
        expect(mon.experience).toBe(1000);
        expect(mon.friendship).toBe(120);

        expect(mon.moves[0]).toBe(85);
        expect(mon.moves[1]).toBe(86);
        expect(mon.movePps[0]).toBe(15);

        expect(mon.evs[0]).toBe(252);
        expect(mon.evs[3]).toBe(252);

        expect(mon.metLevel).toBe(5);
        expect(mon.gameOfOrigin).toBe(3);
        expect(mon.pokeBall).toBe(2);

        expect(mon.ivs).toEqual([31, 31, 31, 31, 31, 31]);
        expect(mon.isEgg).toBe(false);
        expect(mon.abilitySlot).toBe(1);
    });

    it('correctly handles substructure shuffle orders (§3.3)', () => {
        // Test with pid % 24 = 6 -> "AGEM"
        const pid = 6;
        const otid = 0;
        const data = new Uint8Array(80);
        const view = new DataView(data.buffer);
        view.setUint32(0x00, pid, true);
        view.setUint32(0x04, otid, true);

        const decrypted = new Uint8Array(48);
        const decView = new DataView(decrypted.buffer);

        // AGEM:
        // A (offset 0): Move 1 at 0
        decView.setUint16(0x00, 33, true); // Tackle
        // G (offset 12): Species at 12
        decView.setUint16(12 + 0, 1, true); // Bulbasaur
        // E (offset 24): HP EV at 24
        decView.setUint8(24 + 0, 10);
        // M (offset 36): MetLevel at 38
        decView.setUint16(36 + 2, 5, true);

        let sum = 0;
        for (let i = 0; i < 48; i += 2) {
            sum = (sum + decView.getUint16(i, true)) & 0xFFFF;
        }
        view.setUint16(0x1C, sum, true);

        const key = (pid ^ otid) >>> 0;
        data.set(xorMask32(decrypted, key), 0x20);

        const mon = parsePokemon(data);
        expect(mon).not.toBeNull();
        if (!mon) return;

        expect(mon.species).toBe(1);
        expect(mon.moves[0]).toBe(33);
        expect(mon.evs[0]).toBe(10);
        expect(mon.metLevel).toBe(5);
    });
});
