/**
 * stego-core.js — LSB steganography for hiding UTF-8 text in image pixels.
 * Pure JS, no dependencies. Works in browser and Node.
 *
 * Format:
 *   magic "STEG1" (5 bytes) + length (4 bytes big-endian) + utf-8 payload bits,
 *   stored in the least-significant bit of the R, G and B channels of the first
 *   N pixels (3 bits per pixel).
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.StengoCore = factory();
    }
})(typeof self !== "undefined" ? self : globalThis, function () {
    const MAGIC = "STEG1";
    const HEADER_BYTES = 9; // 5 magic + 4 length

    function bytesToBits(bytes) {
        const bits = new Uint8Array(bytes.length * 8);
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            for (let bit = 0; bit < 8; bit++) {
                bits[i * 8 + bit] = (b >> (7 - bit)) & 1;
            }
        }
        return bits;
    }

    function bitsToBytes(bits, byteCount) {
        const bytes = new Uint8Array(byteCount);
        for (let i = 0; i < byteCount; i++) {
            let b = 0;
            for (let bit = 0; bit < 8; bit++) {
                b = (b << 1) | bits[i * 8 + bit];
            }
            bytes[i] = b;
        }
        return bytes;
    }

    function textToBytes(text) {
        return new TextEncoder().encode(text);
    }

    function bytesToText(bytes) {
        return new TextDecoder().decode(bytes);
    }

    /**
     * Encode `text` into `imageData` (ImageData-like {width,height,data}).
     * Returns a NEW copy of the image data (original untouched).
     */
    function encodeMessage(imageData, text) {
        const payload = textToBytes(text);
        const totalBytes = HEADER_BYTES + payload.length;
        const neededPixels = Math.ceil((totalBytes * 8) / 3);
        const pixelCount = imageData.width * imageData.height;
        if (neededPixels > pixelCount) {
            throw new Error(
                "Message too long: need " + neededPixels + " pixels, image has " + pixelCount,
            );
        }
        const header = new Uint8Array(HEADER_BYTES);
        for (let i = 0; i < 5; i++) header[i] = MAGIC.charCodeAt(i);
        header[5] = (payload.length >> 24) & 0xff;
        header[6] = (payload.length >> 16) & 0xff;
        header[7] = (payload.length >> 8) & 0xff;
        header[8] = payload.length & 0xff;
        const allBytes = new Uint8Array(totalBytes);
        allBytes.set(header, 0);
        allBytes.set(payload, HEADER_BYTES);
        const bits = bytesToBits(allBytes);
        const out = new Uint8ClampedArray(imageData.data);
        for (let i = 0; i < bits.length; i++) {
            const channel = i % 3; // R, G, B
            const bit = bits[i];
            const outIndex = Math.floor(i / 3) * 4 + channel;
            out[outIndex] = (out[outIndex] & 0xfe) | bit;
        }
        return { width: imageData.width, height: imageData.height, data: out };
    }

    /**
     * Try to decode a hidden message from `imageData`.
     * Returns null when no STEG1 magic is found.
     */
    function decodeMessage(imageData) {
        const data = imageData.data;
        const maxBytes = Math.floor(data.length / 4) * 3 / 8;
        const totalBits = Math.min(HEADER_BYTES * 8, Math.floor(maxBytes) / 1);
        const readBits = [];
        for (let i = 0; i < totalBits; i++) {
            const channel = i % 3;
            const idx = Math.floor(i / 3) * 4 + channel;
            readBits.push(data[idx] & 1);
        }
        const headerBytes = bitsToBytes(new Uint8Array(readBits), HEADER_BYTES);
        for (let i = 0; i < 5; i++) {
            if (headerBytes[i] !== MAGIC.charCodeAt(i)) return null;
        }
        const length =
            (headerBytes[5] << 24) |
            (headerBytes[6] << 16) |
            (headerBytes[7] << 8) |
            headerBytes[8];
        if (length < 0 || length > maxBytes) return null;
        const payloadBits = new Uint8Array(length * 8);
        const bitStart = HEADER_BYTES * 8;
        for (let i = 0; i < length * 8; i++) {
            const channel = (bitStart + i) % 3;
            const idx = Math.floor((bitStart + i) / 3) * 4 + channel;
            payloadBits[i] = data[idx] & 1;
        }
        try {
            const payloadBytes = bitsToBytes(payloadBits, length);
            return bytesToText(payloadBytes);
        } catch (_err) {
            return null;
        }
    }

    return {
        encodeMessage,
        decodeMessage,
        MAGIC,
        HEADER_BYTES,
    };
});
