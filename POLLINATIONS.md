# Pollinations integration evidence — stego-img

Quest: https://github.com/pollinations/pollinations/issues/18367

## What uses Pollinations

- **`pollinations-client.js`** (repo root) — two Pollinations calls, both BYOP
  (`Authorization: Bearer <user key>`, users pay their own Pollen):
  1. **LLM**: `PolliClient.chatCompletion(prompt)` → `POST https://gen.pollinations.ai/v1/chat/completions`
     — writes the secret message from a user prompt (quest #18367 requires a Pollinations LLM).
  2. **Image**: `PolliClient.generateImage(prompt)` → `POST https://gen.pollinations.ai/v1/images/generations`
     — generates the base stego image.

The LLM-generated message is LSB-encoded into the (uploaded or generated) image.
- **`index.html`** — UI with a "Generate with Polli ✨" button, API key field, and status updates.
- **`app.js`** — wires the button to `PolliClient`, renders the generated image, then encodes
  the user's secret message into it.

## Key flow

1. User pastes a Pollinations API key (https://enter.pollinations.ai/keys).
2. User types a prompt → `POST gen.pollinations.ai/v1/images/generations` → image.
3. User types a hidden message (or clicks **Generate message with Polli LLM ✨**) → LSB encode (stego-core.js) → downloadable stego PNG.
4. Anyone can upload the PNG and decode the hidden message.

## Files

| File | Role |
| --- | --- |
| `pollinations-client.js` | Pollinations image generation (BYOP) |
| `src/stego-core.js` | LSB steganography core (pure JS, tested) |
| `app.js` | UI wiring |
| `index.html` | App entry |
