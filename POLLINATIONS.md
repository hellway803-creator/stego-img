# Pollinations integration evidence — stego-img

Quest: https://github.com/pollinations/pollinations/issues/18367

## What uses Pollinations

- **`pollinations-client.js`** (repo root) — `PolliClient.generateImage(prompt, { apiKey })`
  calls `POST https://gen.pollinations.ai/v1/images/generations` with the user's Pollinations
  API key (BYOP). The returned image becomes the stego base image.
- **`index.html`** — UI with a "Generate with Polli ✨" button, API key field, and status updates.
- **`app.js`** — wires the button to `PolliClient`, renders the generated image, then encodes
  the user's secret message into it.

## Key flow

1. User pastes a Pollinations API key (https://enter.pollinations.ai/keys).
2. User types a prompt → `POST gen.pollinations.ai/v1/images/generations` → image.
3. User types a hidden message → LSB encode (stego-core.js) → downloadable stego PNG.
4. Anyone can upload the PNG and decode the hidden message.

## Files

| File | Role |
| --- | --- |
| `pollinations-client.js` | Pollinations image generation (BYOP) |
| `src/stego-core.js` | LSB steganography core (pure JS, tested) |
| `app.js` | UI wiring |
| `index.html` | App entry |
