import { describe, it, expect } from 'vitest';
import { parseSaveFile, SaveParserError } from './parser';
import { calculateSectionChecksum } from './checksum';

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
    });
});
