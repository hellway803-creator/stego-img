/**
 * pollinations-client.js — Pollinations image generation (BYOP).
 * Used by stego-img to generate a base image from a message prompt.
 *
 * Requires a Pollinations API key from https://enter.pollinations.ai/keys
 * (create one, then paste it into the app — stored locally in the browser).
 */
(async function (root) {
    const API_URL = "https://gen.pollinations.ai/v1/images/generations";
    const DEFAULT_MODEL = "flux";

    root.PolliClient = {
        async generateImage(prompt, { apiKey, model = DEFAULT_MODEL, width = 512, height = 512 } = {}) {
            if (!apiKey) {
                throw new Error("Missing Pollinations API key — get one at enter.pollinations.ai/keys");
            }
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    model,
                    prompt: String(prompt).slice(0, 1000),
                    width,
                    height,
                }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_err) {}
                throw new Error("Pollinations API error " + res.status + " " + detail);
            }
            const blob = await res.blob();
            return blob;
        },

        async chatCompletion(prompt, { apiKey, model = "deepseek/deepseek-v4-flash", maxTokens = 200 } = {}) {
            if (!apiKey) {
                throw new Error("Missing Pollinations API key — get one at enter.pollinations.ai/keys");
            }
            const res = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + apiKey,
                },
                body: JSON.stringify({
                    model,
                    messages: [{
                        role: "user",
                        content: prompt,
                    }],
                    max_tokens: maxTokens,
                }),
            });
            if (!res.ok) {
                let detail = "";
                try { detail = (await res.json()).error?.message || ""; } catch (_err) {}
                throw new Error("Pollinations LLM error " + res.status + " " + detail);
            }
            const data = await res.json();
            return (data.choices?.[0]?.message?.content || "").trim();
        },

        async blobToImageData(blob) {
            const url = URL.createObjectURL(blob);
            try {
                const img = await new Promise((resolve, reject) => {
                    const el = new Image();
                    el.onload = () => resolve(el);
                    el.onerror = () => reject(new Error("Could not load generated image"));
                    el.src = url;
                });
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                return ctx.getImageData(0, 0, canvas.width, canvas.height);
            } finally {
                URL.revokeObjectURL(url);
            }
        },
    };

    // Node test support
    if (typeof module === "object" && module.exports) {
        module.exports = root.PolliClient;
    }
})(typeof self !== "undefined" ? self : globalThis);
