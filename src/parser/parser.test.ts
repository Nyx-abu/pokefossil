import { describe, it, expect } from 'vitest';
import { parseSaveFile, extractParty, parseTrainerInfo, SaveParserError } from './parser';
import { calculateSectionChecksum } from './checksum';
import { xorMask32 } from './crypto';
import { SaveBlock } from './types';

const DATA_SIZE_FOR_ID: Record<number, number> = {
    0: 3884, 1: 3968, 2: 3968, 3: 3968, 4: 3848,
    5: 3968, 6: 3968, 7: 3968, 8: 3968, 9: 3968,
    10: 3968, 11: 3968, 12: 3968, 13: 2000
};

function createValidSection(sectionId: number, saveIndex: number): Uint8Array {
    const section = new Uint8Array(4096);
    const view = new DataView(section.buffer);

    // If section 0, write minimal trainer info
    if (sectionId === 0) {
        // Player name at 0: "ASH", terminated by 0xFF
        section[0] = 0xBB; // 'A'
        section[1] = 0xCD; // 'S'
        section[2] = 0xC2; // 'H'
        section[3] = 0xFF;
        section[8] = 0; // Male
        view.setUint32(0x000A, 12345 | (54321 << 16), true); // TID / SID
    }

    const dataSize = DATA_SIZE_FOR_ID[sectionId];
    const checksum = calculateSectionChecksum(section, dataSize);

    // Footer at 0x0FF4
    view.setUint16(0x0FF4, sectionId, true);
    view.setUint16(0x0FF6, checksum, true);
    view.setUint32(0x0FF8, 0x08012025, true); // Signature
    view.setUint32(0x0FFC, saveIndex, true);

    return section;
}

function createValidBlock(saveIndex: number, shufflePhysical: boolean = false): Uint8Array {
    const block = new Uint8Array(57344); // 14 * 4096
    const order = Array.from({ length: 14 }, (_, i) => i);
    if (shufflePhysical) {
        // Rotate sections per §2.4 wear-leveling (e.g., 13, 0, 1, 2, ..., 12)
        const last = order.pop()!;
        order.unshift(last);
    }

    order.forEach((sectionId, physicalIndex) => {
        const secData = createValidSection(sectionId, saveIndex);
        block.set(secData, physicalIndex * 4096);
    });

    return block;
}

describe('Save File Parser (§2.1-2.6)', () => {
    it('throws error if file size is not 128KB', () => {
        const invalidBuffer = new ArrayBuffer(65536);
        expect(() => parseSaveFile(invalidBuffer)).toThrow(SaveParserError);
        expect(() => parseSaveFile(invalidBuffer)).toThrow(/Invalid save file size/);
    });

    it('throws error if neither block is valid', () => {
        const emptyBuffer = new ArrayBuffer(131072);
        expect(() => parseSaveFile(emptyBuffer)).toThrow(SaveParserError);
        expect(() => parseSaveFile(emptyBuffer)).toThrow(/Corrupted save file/);
    });

    it('selects Block A when only Block A is valid (§2.3)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(100);
        fullSave.set(blockA, 0x00000);
        // Block B is left all zeros (corrupted/invalid)

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.activeBlock.isValid).toBe(true);
        expect(parsed.activeBlock.saveIndex).toBe(100);
        expect(parsed.inactiveBlock).toBeNull();
    });

    it('selects Block B when only Block B is valid (§2.3)', () => {
        const fullSave = new Uint8Array(131072);
        const blockB = createValidBlock(100);
        fullSave.set(blockB, 0x0E000);
        // Block A is left all zeros

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.activeBlock.isValid).toBe(true);
        expect(parsed.activeBlock.saveIndex).toBe(100);
        expect(parsed.inactiveBlock).toBeNull();
    });

    it('selects higher save index when both blocks are valid (§2.3)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(105);
        const blockB = createValidBlock(104);
        fullSave.set(blockA, 0x00000);
        fullSave.set(blockB, 0x0E000);

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.activeBlock.saveIndex).toBe(105);
        expect(parsed.inactiveBlock?.saveIndex).toBe(104);
    });

    it('resolves tie in save index in favor of Block B (§2.3)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(50);
        const blockB = createValidBlock(50);
        fullSave.set(blockA, 0x00000);
        fullSave.set(blockB, 0x0E000);

        const parsed = parseSaveFile(fullSave.buffer);
        // Tie goes to B
        expect(parsed.activeBlock.saveIndex).toBe(50);
        // Ensure active block was block B
        expect(parsed.activeBlock.sections[0].footer.saveIndex).toBe(50);
        expect(parsed.inactiveBlock?.sections[0].footer.saveIndex).toBe(50);
    });

    it('handles rotated physical section order via footer scan (§2.4)', () => {
        const fullSave = new Uint8Array(131072);
        // Block A has physical rotation (wear-leveling)
        const blockA = createValidBlock(200, true);
        fullSave.set(blockA, 0x00000);

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.activeBlock.isValid).toBe(true);
        expect(Object.keys(parsed.activeBlock.sections)).toHaveLength(14);
        // Logical section 0 should be properly identified despite rotation
        expect(parsed.activeBlock.sections[0].id).toBe(0);
        expect(parsed.trainerInfo.playerName).toBe('ASH');
    });

    it('correctly parses trainer info fields (§2.6)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        fullSave.set(blockA, 0x00000);

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.trainerInfo.playerName).toBe('ASH');
        expect(parsed.trainerInfo.gender).toBe(0);
        expect(parsed.trainerInfo.trainerId).toBe(12345);
        expect(parsed.trainerInfo.secretId).toBe(54321);
        expect(parsed.trainerInfo.money).toBe(0);
        expect(parsed.trainerInfo.securityKey).toBeNull();
    });

    it('decrypts Money using Emerald Security Key from Section 0 at 0x00AC (Phase 9)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec0 = blockA.subarray(0, 4096);
        const sec1 = blockA.subarray(4096, 8192);
        const sec0View = new DataView(sec0.buffer, sec0.byteOffset, sec0.byteLength);
        const sec1View = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        const securityKey = 0x5A3C9F12;
        const expectedMoney = 150000;
        const rawMoney = (expectedMoney ^ securityKey) >>> 0;

        sec0View.setUint32(0x00AC, securityKey, true);
        sec1View.setUint32(0x0290, rawMoney, true);

        // Recompute checksums
        sec0View.setUint16(0x0FF6, calculateSectionChecksum(sec0, DATA_SIZE_FOR_ID[0]), true);
        sec1View.setUint16(0x0FF6, calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]), true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.trainerInfo.securityKey).toBe(securityKey);
        expect(parsed.trainerInfo.money).toBe(expectedMoney);
    });

    it('decrypts Money using FRLG Security Key from Section 0 at 0x0AF8 with gameCode at 0x00AC (Phase 9)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec0 = blockA.subarray(0, 4096);
        const sec1 = blockA.subarray(4096, 8192);
        const sec0View = new DataView(sec0.buffer, sec0.byteOffset, sec0.byteLength);
        const sec1View = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        const securityKey = 0x1A2B3C4D;
        const expectedMoney = 999999;
        const rawMoney = (expectedMoney ^ securityKey) >>> 0;

        sec0View.setUint32(0x00AC, 1, true); // gameCode == 1 for FRLG
        sec0View.setUint32(0x0AF8, securityKey, true);
        sec1View.setUint32(0x0290, rawMoney, true);

        // Recompute checksums
        sec0View.setUint16(0x0FF6, calculateSectionChecksum(sec0, DATA_SIZE_FOR_ID[0]), true);
        sec1View.setUint16(0x0FF6, calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]), true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.trainerInfo.securityKey).toBe(securityKey);
        expect(parsed.trainerInfo.money).toBe(expectedMoney);
    });

    it('decrypts Money using FRLG Security Key at 0x0AF8 without gameCode set (Phase 9)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec0 = blockA.subarray(0, 4096);
        const sec1 = blockA.subarray(4096, 8192);
        const sec0View = new DataView(sec0.buffer, sec0.byteOffset, sec0.byteLength);
        const sec1View = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        const securityKey = 0x0FEDCBA9;
        const expectedMoney = 42000;
        const rawMoney = (expectedMoney ^ securityKey) >>> 0;

        sec0View.setUint32(0x0AF8, securityKey, true);
        sec1View.setUint32(0x0290, rawMoney, true);

        sec0View.setUint16(0x0FF6, calculateSectionChecksum(sec0, DATA_SIZE_FOR_ID[0]), true);
        sec1View.setUint16(0x0FF6, calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]), true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.trainerInfo.securityKey).toBe(securityKey);
        expect(parsed.trainerInfo.money).toBe(expectedMoney);
    });

    it('parses Ruby/Sapphire saves with securityKey null and unencrypted money (Phase 9)', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec0 = blockA.subarray(0, 4096);
        const sec1 = blockA.subarray(4096, 8192);
        const sec0View = new DataView(sec0.buffer, sec0.byteOffset, sec0.byteLength);
        const sec1View = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        const expectedMoney = 35000;
        sec1View.setUint32(0x0290, expectedMoney, true);

        sec0View.setUint16(0x0FF6, calculateSectionChecksum(sec0, DATA_SIZE_FOR_ID[0]), true);
        sec1View.setUint16(0x0FF6, calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]), true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.trainerInfo.securityKey).toBeNull();
        expect(parsed.trainerInfo.money).toBe(expectedMoney);
    });

    it('parseTrainerInfo handles missing or small buffer gracefully', () => {
        const emptyInfo = parseTrainerInfo(new Uint8Array(0));
        expect(emptyInfo.securityKey).toBeNull();
        expect(emptyInfo.money).toBe(0);
        expect(emptyInfo.playerName).toBe('');
    });

    it('returns empty party when party count is 0', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        fullSave.set(blockA, 0x00000);

        const parsed = parseSaveFile(fullSave.buffer);
        expect(parsed.party).toEqual([]);
    });

    it('parses party pokemon correctly from Section 1', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec1 = blockA.subarray(4096, 8192);
        const secView = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        secView.setUint32(0x0234, 2, true);
        sec1.set(createMockPokemonData(0, 25), 0x0238); // Pikachu
        sec1.set(createMockPokemonData(24, 1), 0x0238 + 100); // Bulbasaur

        const checksum = calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]);
        secView.setUint16(0x0FF6, checksum, true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.party).toHaveLength(2);
        expect(parsed.party[0].species).toBe(25);
        expect(parsed.party[1].species).toBe(1);
        expect(parsed.party[0].verdict).toBeDefined();
    });

    it('only parses up to partyCount even if residual data exists in subsequent slots', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec1 = blockA.subarray(4096, 8192);
        const secView = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        secView.setUint32(0x0234, 1, true);
        sec1.set(createMockPokemonData(0, 25), 0x0238);
        sec1.set(createMockPokemonData(24, 1), 0x0238 + 100);
        sec1.set(createMockPokemonData(48, 4), 0x0238 + 200);

        const checksum = calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]);
        secView.setUint16(0x0FF6, checksum, true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.party).toHaveLength(1);
        expect(parsed.party[0].species).toBe(25);
    });

    it('clamps party count to maximum 6', () => {
        const fullSave = new Uint8Array(131072);
        const blockA = createValidBlock(1);
        const sec1 = blockA.subarray(4096, 8192);
        const secView = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);

        secView.setUint32(0x0234, 10, true);
        for (let i = 0; i < 6; i++) {
            sec1.set(createMockPokemonData(i * 24, i + 1), 0x0238 + i * 100);
        }

        const checksum = calculateSectionChecksum(sec1, DATA_SIZE_FOR_ID[1]);
        secView.setUint16(0x0FF6, checksum, true);

        fullSave.set(blockA, 0x00000);
        const parsed = parseSaveFile(fullSave.buffer);

        expect(parsed.party).toHaveLength(6);
    });

    it('extractParty directly extracts party from SaveBlock', () => {
        const blockA = createValidBlock(1);
        const sec1 = blockA.subarray(4096, 8192);
        const secView = new DataView(sec1.buffer, sec1.byteOffset, sec1.byteLength);
        secView.setUint32(0x0234, 1, true);
        sec1.set(createMockPokemonData(0, 25), 0x0238);

        const block: SaveBlock = {
            isValid: true,
            saveIndex: 1,
            sections: {
                1: {
                    id: 1,
                    data: sec1,
                    footer: { sectionId: 1, checksum: 0, signature: 0x08012025, saveIndex: 1 }
                }
            }
        };

        const party = extractParty(block);
        expect(party).toHaveLength(1);
        expect(party[0].species).toBe(25);
    });
});

function createMockPokemonData(pid: number, species: number, otid: number = 0x12345678): Uint8Array {
    const data = new Uint8Array(100);
    const view = new DataView(data.buffer);
    view.setUint32(0x00, pid, true);
    view.setUint32(0x04, otid, true);
    data[0x08] = 0xBB; // 'A'
    data[0x09] = 0xFF;
    data[0x12] = 2; // English
    data[0x13] = 2; // HasSpecies

    const decrypted = new Uint8Array(48);
    const decView = new DataView(decrypted.buffer);
    // pid % 24 = 0 -> GAEM: Growth at offset 0
    decView.setUint16(0x00, species, true);
    decView.setUint32(0x04, 100, true);

    let sum = 0;
    for (let i = 0; i < 48; i += 2) {
        sum = (sum + decView.getUint16(i, true)) & 0xFFFF;
    }
    view.setUint16(0x1C, sum, true);

    const key = (pid ^ otid) >>> 0;
    const encrypted = xorMask32(decrypted, key);
    data.set(encrypted, 0x20);

    return data;
}

