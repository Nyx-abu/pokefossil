export function xorMask32(data: Uint8Array, key: number): Uint8Array {
    const result = new Uint8Array(data.length);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const outView = new DataView(result.buffer);
    
    // Mask word by word
    for (let i = 0; i < data.length - 3; i += 4) {
        const word = view.getUint32(i, true);
        outView.setUint32(i, word ^ key, true);
    }
    
    // Leftover bytes if any (Gen 3 usually aligns to 4 for encrypted chunks, but just in case)
    const remainder = data.length % 4;
    for (let i = data.length - remainder; i < data.length; i++) {
        const byteKey = (key >>> (8 * (i % 4))) & 0xFF;
        result[i] = data[i] ^ byteKey;
    }
    
    return result;
}

export function decryptPokemonData(encryptedData: Uint8Array, pid: number, otid: number): Uint8Array {
    const key = (pid ^ otid) >>> 0;
    return xorMask32(encryptedData, key);
}
