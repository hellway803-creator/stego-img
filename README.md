# 🖼️ stego-img

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/123ed07456106a4f752c0a22c584e8cadd2db6a8/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

Hide secret messages inside images (LSB steganography), or extract them back.
Built for the Pollinations quest **#18367: "An app, game or tool about messages hidden in images"**.

## Features

- **Encode**: pick an image (upload or generate with Pollinations), type a message, download the stego image.
- **Decode**: upload any image and extract the hidden `STEG1` message, if present.
- **Pollinations integration**: generate the base image from a text prompt via `gen.pollinations.ai`
  using your own key (BYOP). See [`pollinations-client.js`](./pollinations-client.js).

## How it works

The message is UTF-8 encoded with a `STEG1` magic header + length, then written into the
least-significant bits of the R, G and B channels of the first pixels (3 bits per pixel).
The visible image changes imperceptibly.

## Try it

Open `index.html` locally, or deploy to any static host (Cloudflare Pages / GitHub Pages).

1. Paste a Pollinations API key from https://enter.pollinations.ai/keys (optional, only for image generation)
2. Type a prompt → **Generate with Polli ✨** (or upload an image)
3. Type the secret message → **Encode message**
4. Download the stego PNG and share it — anyone can **Decode** it back.

## Pollinations integration (verified)

- `pollinations-client.js` (repo root) calls `POST https://gen.pollinations.ai/v1/images/generations`
  with `Authorization: Bearer <key>` (BYOP flow).
- The app is bundled with `src/stego-core.js` (pure local steganography) and `app.js` (UI wiring).

## Tests

```
npm test
```

6 tests pass: round-trip encode/decode, unicode, untouched image, overflow, immutability, long message.

## License

MIT
