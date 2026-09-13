import { Pokemon } from './types';
import { decryptPokemonData } from './crypto';
import { decodeString } from './charset';

const SHUFFLE_ORDER = [
    "GAEM", "GAME", "GEAM", "GEMA", "GMAE", "GMEA",
    "AGEM", "AGME", "AEGM", "AEMG", "AMGE", "AMEG",
    "EGAM", "EGMA", "EAGM", "EAMG", "EMGA", "EMAG",
    "MGAE", "MGEA", "MAGE", "MAEG", "MEGA", "MEAG"
];

export function parsePokemon(data: Uint8Array, isParty: boolean = false): Pokemon | null {
    if (data.length < 80) return null; // Needs at least 80 bytes
    
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const pid = view.getUint32(0x00, true);
    const otidFull = view.getUint32(0x04, true);
    // §3.8 Detecting Empty Slots (fast path: all 80 bytes are 0x00)
    let allZero = true;
    for (let i = 0; i < 80; i++) {
        if (data[i] !== 0) { allZero = false; break; }
    }
    if (allZero) return null;

    const nickname = decodeString(data.subarray(0x08, 0x12));
    const language = data[0x12];
    const miscFlags = data[0x13];
    const isBadEgg = (miscFlags & 1) !== 0;
    const hasSpecies = (miscFlags & 2) !== 0;
    
    const otName = decodeString(data.subarray(0x14, 0x1B));
    const checksum = view.getUint16(0x1C, true);
    
    const encryptedSub = data.subarray(0x20, 0x50);
    const decryptedSub = decryptPokemonData(encryptedSub, pid, otidFull);
    const decView = new DataView(decryptedSub.buffer, decryptedSub.byteOffset, decryptedSub.byteLength);
    
    // Calculate checksum
    let calculatedChecksum = 0;
    for (let i = 0; i < 48; i += 2) {
        calculatedChecksum = (calculatedChecksum + decView.getUint16(i, true)) & 0xFFFF;
    }
    
    const orderIndex = pid % 24;
    const order = SHUFFLE_ORDER[orderIndex];
    
    let species = 0, heldItem = 0, experience = 0, friendship = 0;
    let moves = [0,0,0,0], movePps = [0,0,0,0];
    let evs = [0,0,0,0,0,0]; // HP, Atk, Def, Spe, SpA, SpD
    let ivs = [0,0,0,0,0,0];
    let isEgg = false, abilitySlot = 0, metLevel = 0, gameOfOrigin = 0, pokeBall = 0;

    for (let i = 0; i < 4; i++) {
        const subId = order[i];
        const offset = i * 12;
        
        if (subId === 'G') {
            species = decView.getUint16(offset + 0x00, true);
            heldItem = decView.getUint16(offset + 0x02, true);
            experience = decView.getUint32(offset + 0x04, true);
            friendship = decView.getUint8(offset + 0x09);
        } else if (subId === 'A') {
            moves = [
                decView.getUint16(offset + 0x00, true),
                decView.getUint16(offset + 0x02, true),
                decView.getUint16(offset + 0x04, true),
                decView.getUint16(offset + 0x06, true)
            ];
            movePps = [
                decView.getUint8(offset + 0x08),
                decView.getUint8(offset + 0x09),
                decView.getUint8(offset + 0x0A),
                decView.getUint8(offset + 0x0B)
            ];
        } else if (subId === 'E') {
            evs = [
                decView.getUint8(offset + 0x00), // HP
                decView.getUint8(offset + 0x01), // Atk
                decView.getUint8(offset + 0x02), // Def
                decView.getUint8(offset + 0x03), // Spe
                decView.getUint8(offset + 0x04), // SpA
                decView.getUint8(offset + 0x05)  // SpD
            ];
        } else if (subId === 'M') {
            const origins = decView.getUint16(offset + 0x02, true);
            metLevel = origins & 0x7F;
            gameOfOrigin = (origins >> 7) & 0x0F;
            pokeBall = (origins >> 11) & 0x0F;
            
            const ivEggAbility = decView.getUint32(offset + 0x04, true);
            ivs = [
                ivEggAbility & 0x1F,
                (ivEggAbility >>> 5) & 0x1F,
                (ivEggAbility >>> 10) & 0x1F,
                (ivEggAbility >>> 15) & 0x1F,
                (ivEggAbility >>> 20) & 0x1F,
                (ivEggAbility >>> 25) & 0x1F
            ];
            isEgg = ((ivEggAbility >>> 30) & 1) !== 0;
            abilitySlot = (ivEggAbility >>> 31) & 1;
        }
    }

    // §3.8: A box slot is empty if PID==0 AND Species==0, or species is 0 (SPECIES_NONE)
    if (species === 0) {
        return null;
    }

    return {
        pid, otid: otidFull, nickname, language, isBadEgg, hasSpecies, otName, 
        checksum, calculatedChecksum, species, heldItem, experience, friendship, 
        moves, movePps, evs, ivs, isEgg, abilitySlot, metLevel, gameOfOrigin, pokeBall
    };
}
