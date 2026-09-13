import { PokemonBox, Pokemon } from './types';

export type GhostType = 'RELEASED' | 'OVERWRITTEN';

export interface GhostRecord {
    type: GhostType;
    pokemon: Pokemon;
    boxIndex: number;
    slotIndex: number;
    replacedBy?: Pokemon;
}

export function detectGhosts(activeBoxes: PokemonBox[], inactiveBoxes: PokemonBox[]): GhostRecord[] {
    const ghosts: GhostRecord[] = [];

    if (!activeBoxes || !inactiveBoxes || activeBoxes.length === 0 || inactiveBoxes.length === 0) {
        return ghosts;
    }

    for (let b = 0; b < 14; b++) {
        for (let p = 0; p < 30; p++) {
            const activePkmn = getPokemonAt(activeBoxes[b], p);
            const inactivePkmn = getPokemonAt(inactiveBoxes[b], p);

            if (inactivePkmn) {
                if (!activePkmn) {
                    // Active empty, inactive has a valid Pokémon → GHOST (RELEASED)
                    ghosts.push({
                        type: 'RELEASED',
                        pokemon: inactivePkmn,
                        boxIndex: b,
                        slotIndex: p
                    });
                } else if (activePkmn.pid !== inactivePkmn.pid) {
                    // Both non-empty but different PIDs → GHOST (OVERWRITTEN)
                    ghosts.push({
                        type: 'OVERWRITTEN',
                        pokemon: inactivePkmn,
                        boxIndex: b,
                        slotIndex: p,
                        replacedBy: activePkmn
                    });
                }
            }
        }
    }

    return ghosts;
}

function getPokemonAt(box: PokemonBox, index: number): Pokemon | null {
    if (!box || !box.pokemon || index >= box.pokemon.length) return null;
    return box.pokemon[index];
}
