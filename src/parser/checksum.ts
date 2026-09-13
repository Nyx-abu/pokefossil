export function calculateSectionChecksum(data: Uint8Array, dataSize: number): number {
    let checksum = 0;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    for (let i = 0; i < dataSize; i += 4) {
        const word = view.getUint32(i, true); // true for little-endian
        checksum = (checksum + word) >>> 0; // unsigned 32-bit addition
    }
    const folded = ((checksum >>> 16) + (checksum & 0xFFFF)) & 0xFFFF;
    return folded;
}
