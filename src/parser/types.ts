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
    // We will expand this
}
