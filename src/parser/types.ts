export interface SectionFooter {
    sectionId: number;
    checksum: number;
    signature: number;
    saveIndex: number;
}

export interface Section {
    id: number;
    data: Uint8Array;
    footer: SectionFooter;
}

export interface SaveBlock {
    isValid: boolean;
    saveIndex: number | null;
    sections: Record<number, Section>;
}

export interface SaveFile {
    activeBlock: SaveBlock;
    inactiveBlock: SaveBlock | null;
    trainerInfo: TrainerInfo;
    pokemonBoxes: PokemonBox[];
}

export interface TrainerInfo {
    playerName: string;
    gender: number;
    trainerId: number;
    secretId: number;
    playTime: { hours: number; minutes: number; seconds: number; frames: number };
    securityKey?: number;
}

export interface PokemonBox {
    name: string;
    pokemon: Pokemon[];
}

export type VerdictTier = 'VERIFIED' | 'UNCERTAIN' | 'LIKELY_MODIFIED' | 'INVALID';

export interface ForensicsVerdict {
    tier: VerdictTier;
    evidence: string[];
}

export interface Pokemon {
    pid: number;
    otid: number;
    nickname: string;
    language: number;
    isBadEgg: boolean;
    hasSpecies: boolean;
    otName: string;
    checksum: number;
    calculatedChecksum: number;
    
    species: number;
    heldItem: number;
    experience: number;
    friendship: number;
    
    moves: number[];
    movePps: number[];
    
    evs: number[];
    ivs: number[];
    isEgg: boolean;
    abilitySlot: number;
    
    metLevel: number;
    gameOfOrigin: number;
    pokeBall: number;
    
    verdict?: ForensicsVerdict;
}
