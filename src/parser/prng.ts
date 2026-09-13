export function lcrngForward(seed: number): number {
    return Math.imul(seed, 0x41C64E6D) + 0x6073 | 0; // mod 2^32 signed int
}

export function lcrngReverse(seed: number): number {
    return Math.imul(seed, 0xEEB9EB65) + 0x0A3561A1 | 0;
}

export function advanceRNG(seed: number, steps: number): number {
    let s = seed;
    for (let i = 0; i < steps; i++) {
        s = lcrngForward(s);
    }
    return s;
}

/**
 * Reconstructs initial seed(s) from a PID.
 * pid_low = (seed_1 >> 16) & 0xFFFF
 * pid_high = (seed_2 >> 16) & 0xFFFF
 * where seed_2 = lcrngForward(seed_1)
 */
export function reconstructSeedsFromPID(pid: number): number[] {
    const pidLow = pid & 0xFFFF;
    const pidHigh = (pid >>> 16) & 0xFFFF;
    
    const possibleSeeds: number[] = [];
    
    for (let low16 = 0; low16 < 65536; low16++) {
        // Construct potential seed_1
        // We use >>> 0 to ensure it is unsigned 32-bit
        const seed1 = ((pidLow << 16) | low16) >>> 0;
        const seed2 = lcrngForward(seed1) >>> 0;
        
        if (((seed2 >>> 16) & 0xFFFF) === pidHigh) {
            possibleSeeds.push(seed1);
        }
    }
    
    return possibleSeeds;
}

export function calculateShinyValue(tid: number, sid: number, pid: number): number {
    const pidLow = pid & 0xFFFF;
    const pidHigh = (pid >>> 16) & 0xFFFF;
    return tid ^ sid ^ pidHigh ^ pidLow;
}

export function isShiny(tid: number, sid: number, pid: number): boolean {
    return calculateShinyValue(tid, sid, pid) < 8;
}
