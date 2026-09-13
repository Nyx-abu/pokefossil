import { calculateSectionChecksum } from './checksum';
import { decodeString } from './charset';
import { SaveFile, SaveBlock, Section, TrainerInfo, PokemonBox } from './types';
import { parsePokemon } from './pokemon';
import { performForensics } from './forensics';

const DATA_SIZE_FOR_ID: Record<number, number> = {
    0: 3884, 1: 3968, 2: 3968, 3: 3968, 4: 3848,
    5: 3968, 6: 3968, 7: 3968, 8: 3968, 9: 3968,
    10: 3968, 11: 3968, 12: 3968, 13: 2000
};

export class SaveParserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SaveParserError";
    }
}

function readFooter(chunk: Uint8Array): Section['footer'] {
    const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    return {
        sectionId: view.getUint16(0x0FF4, true),
        checksum: view.getUint16(0x0FF6, true),
        signature: view.getUint32(0x0FF8, true),
        saveIndex: view.getUint32(0x0FFC, true),
    };
}

function evaluateBlock(blockBytes: Uint8Array): SaveBlock {
    const sections: Record<number, Section> = {};
    for (let i = 0; i < 14; i++) {
        const chunk = blockBytes.subarray(i * 4096, (i + 1) * 4096);
        const footer = readFooter(chunk);
        
        if (footer.signature !== 0x08012025) {
            continue;
        }
        
        const size = DATA_SIZE_FOR_ID[footer.sectionId];
        if (size === undefined) continue;

        if (calculateSectionChecksum(chunk, size) !== footer.checksum) {
            continue; // corrupted
        }
        
        sections[footer.sectionId] = {
            id: footer.sectionId,
            data: chunk,
            footer
        };
    }
    
    const isValid = Object.keys(sections).length === 14;
    const saveIndex = isValid ? sections[0].footer.saveIndex : null;
    
    return { isValid, saveIndex, sections };
}

export function parseSaveFile(buffer: ArrayBuffer): SaveFile {
    if (buffer.byteLength !== 131072) {
        throw new SaveParserError(`Invalid save file size. Expected 128KB, got ${buffer.byteLength} bytes.`);
    }

    const data = new Uint8Array(buffer);
    const blockA = evaluateBlock(data.subarray(0x00000, 0x0E000));
    const blockB = evaluateBlock(data.subarray(0x0E000, 0x1C000));

    if (!blockA.isValid && !blockB.isValid) {
        throw new SaveParserError("Corrupted save file: neither save block has a valid checksum/signature.");
    }

    let activeBlock: SaveBlock;
    let inactiveBlock: SaveBlock | null = null;

    if (blockA.isValid && !blockB.isValid) {
        activeBlock = blockA;
    } else if (blockB.isValid && !blockA.isValid) {
        activeBlock = blockB;
    } else {
        // Both valid, compare save index
        if ((blockA.saveIndex ?? 0) > (blockB.saveIndex ?? 0)) {
            activeBlock = blockA;
            inactiveBlock = blockB;
        } else {
            activeBlock = blockB;
            inactiveBlock = blockA;
        }
    }

    const activeBoxes = extractBoxes(activeBlock);
    const inactiveBoxes = inactiveBlock ? extractBoxes(inactiveBlock) : [];

    return {
        activeBlock,
        inactiveBlock,
        trainerInfo: parseTrainerInfo(activeBlock.sections[0].data),
        pokemonBoxes: activeBoxes
    };
}

export function extractBoxes(block: SaveBlock): PokemonBox[] {
    // Concatenate sections 5-13
    const buffer = new Uint8Array(33744);
    let offset = 0;
    for (let i = 5; i <= 13; i++) {
        const sec = block.sections[i];
        if (!sec) return []; // Incomplete block (should be handled by evaluateBlock though)
        buffer.set(sec.data.subarray(0, i === 13 ? 2000 : 3968), offset);
        offset += (i === 13 ? 2000 : 3968);
    }
    
    // Parse boxes
    // Offset 0x0004 -> 420 * 80 bytes
    // Box names at 0x8344
    const listOffset = 0x0004;
    const namesOffset = 0x8344;
    
    const boxes: PokemonBox[] = [];
    for (let b = 0; b < 14; b++) {
        const boxNameData = buffer.subarray(namesOffset + b * 9, namesOffset + b * 9 + 9);
        const name = decodeString(boxNameData);
        
        const pokemonList: (Pokemon | null)[] = [];
        for (let p = 0; p < 30; p++) {
            const index = b * 30 + p;
            const pokeData = buffer.subarray(listOffset + index * 80, listOffset + (index + 1) * 80);
            const pkmn = parsePokemon(pokeData, false);
            if (pkmn) {
                // Determine forensics
                pkmn.verdict = performForensics(pkmn);
            }
            pokemonList.push(pkmn);
        }
        
        boxes.push({ name, pokemon: pokemonList as any }); // Update types.ts to accept null
    }
    
    return boxes;
}

function parseTrainerInfo(sectionData: Uint8Array): TrainerInfo {
    const view = new DataView(sectionData.buffer, sectionData.byteOffset, sectionData.byteLength);
    const playerName = decodeString(sectionData.subarray(0, 7));
    const gender = sectionData[8];
    const trainerIdFull = view.getUint32(0x000A, true);
    
    const tid = trainerIdFull & 0xFFFF;
    const sid = (trainerIdFull >>> 16) & 0xFFFF;

    const playTime = {
        hours: view.getUint16(0x000E, true),
        minutes: sectionData[0x0010],
        seconds: sectionData[0x0011],
        frames: sectionData[0x0012]
    };

    // Note: Security key offset depends on game, we might need a way to detect the game first.
    // For now, we'll try to guess if it's Emerald (0x00AC) or FRLG (0x0AF8) later, or extract it based on version flags.

    return {
        playerName,
        gender,
        trainerId: tid,
        secretId: sid,
        playTime
    };
}
