const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../src/stego-core.js");

function makeImageData(width, height) {
    const data = new Uint8ClampedArray(width * height * 4);
    let v = 128;
    for (let i = 0; i < data.length; i++) {
        data[i] = v;
        v = (v + 1) % 256;
    }
    return { width, height, data };
}

test("round-trip encodes and decodes a message", () => {
    const img = makeImageData(64, 64);
    const encoded = core.encodeMessage(img, "Hello stego world!");
    assert.notDeepEqual(encoded.data, img.data);
    const decoded = core.decodeMessage(encoded);
    assert.equal(decoded, "Hello stego world!");
});

test("supports unicode / emoji", () => {
    const img = makeImageData(128, 128);
    const msg = "secret 🤫 pesan rahasia 秘密";
    const decoded = core.decodeMessage(core.encodeMessage(img, msg));
    assert.equal(decoded, msg);
});

test("decode returns null on untouched image", () => {
    const img = makeImageData(64, 64);
    assert.equal(core.decodeMessage(img), null);
});

test("encode throws when message too long", () => {
    const img = makeImageData(8, 8);
    assert.throws(() => core.encodeMessage(img, "y".repeat(200)));
});

test("encode does not mutate original image", () => {
    const img = makeImageData(32, 32);
    const before = Array.from(img.data);
    core.encodeMessage(img, "short");
    assert.deepEqual(Array.from(img.data), before);
});

test("longer message round-trip", () => {
    const img = makeImageData(256, 256);
    const msg = "The quick brown fox jumps over the lazy dog. ".repeat(10);
    const decoded = core.decodeMessage(core.encodeMessage(img, msg));
    assert.equal(decoded, msg);
});
