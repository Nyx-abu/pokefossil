import { Pokemon, ForensicsVerdict, VerdictTier } from './types';
import { reconstructSeedsFromPID, lcrngForward } from './prng';

export function checkMethod124(pid: number, ivs: number[]): string | null {
    // IVs are expected in order: HP, Atk, Def, Spe, SpA, SpD
    const targetIv1 = (ivs[0] & 0x1F) | ((ivs[1] & 0x1F) << 5) | ((ivs[2] & 0x1F) << 10);
    const targetIv2 = (ivs[3] & 0x1F) | ((ivs[4] & 0x1F) << 5) | ((ivs[5] & 0x1F) << 10);

    const possibleSeeds = reconstructSeedsFromPID(pid);
    
    for (const seed1 of possibleSeeds) {
        // seed1 generated PID low, seed2 generated PID high
        const seed2 = lcrngForward(seed1);
        
        // Method 1: [PID][PID][IV1][IV2]
        // seed3 generates IV1, seed4 generates IV2
        const seed3_m1 = lcrngForward(seed2);
        const seed4_m1 = lcrngForward(seed3_m1);
        
        if (
            ((seed3_m1 >>> 16) & 0x7FFF) === targetIv1 &&
            ((seed4_m1 >>> 16) & 0x7FFF) === targetIv2
        ) {
            return "Method 1";
        }
        
        // Method 2: [PID][PID][skip][IV1][IV2]
        const seed3_m2 = lcrngForward(seed2); // skipped
        const seed4_m2 = lcrngForward(seed3_m2); // IV1
        const seed5_m2 = lcrngForward(seed4_m2); // IV2
        
        if (
            ((seed4_m2 >>> 16) & 0x7FFF) === targetIv1 &&
            ((seed5_m2 >>> 16) & 0x7FFF) === targetIv2
        ) {
            return "Method 2";
        }
        
        // Method 4: [PID][PID][IV1][skip][IV2]
        const seed3_m4 = lcrngForward(seed2); // IV1
        const seed4_m4 = lcrngForward(seed3_m4); // skipped
        const seed5_m4 = lcrngForward(seed4_m4); // IV2
        
        if (
            ((seed3_m4 >>> 16) & 0x7FFF) === targetIv1 &&
            ((seed5_m4 >>> 16) & 0x7FFF) === targetIv2
        ) {
            return "Method 4";
        }
    }
    
    return null;
}

export function performForensics(pokemon: Pokemon): ForensicsVerdict {
    const evidence: string[] = [];
    let tier: VerdictTier = 'VERIFIED';
    let redFlags = 0;

    // 1. Bad Egg flag
    if (pokemon.isBadEgg) {
        return { tier: 'INVALID', evidence: ['Bad Egg flag is set (definitive corruption).'] };
    }

    // 2. Checksum mismatch
    if (pokemon.checksum !== pokemon.calculatedChecksum) {
        return { tier: 'INVALID', evidence: [`Checksum mismatch: expected 0x${pokemon.calculatedChecksum.toString(16)}, got 0x${pokemon.checksum.toString(16)}.`] };
    }

    // 3. PID-IV correlation
    const methodMatch = checkMethod124(pokemon.pid, pokemon.ivs);
    if (methodMatch) {
        evidence.push(`PID-IV match: ${methodMatch}.`);
    } else {
        evidence.push(`No standard RNG pattern matched — this can happen with certain wild encounters.`);
        tier = 'UNCERTAIN';
    }

    // 4. Ability-bit consistency
    const pidAbilityBit = pokemon.pid & 1;
    if (pidAbilityBit !== pokemon.abilitySlot) {
        evidence.push(`Ability bit mismatch: PID implies ${pidAbilityBit}, but stored slot is ${pokemon.abilitySlot}.`);
        redFlags++;
    } else {
        evidence.push(`Ability bit consistent.`);
    }

    // 5. Basic Sanity checks (impossible IVs handled by limits, we can check >31)
    const hasImpossibleIVs = pokemon.ivs.some(iv => iv > 31);
    if (hasImpossibleIVs) {
        evidence.push(`Impossible IVs detected (value > 31).`);
        redFlags++;
    }
    
    // Evaluate red flags
    if (redFlags > 0 && !methodMatch) {
        tier = 'LIKELY_MODIFIED';
    } else if (redFlags > 1) {
        tier = 'LIKELY_MODIFIED';
    }

    return { tier, evidence };
}
