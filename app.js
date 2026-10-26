(function () {
    const core = window.StengoCore;
    const polli = window.PolliClient;

    let baseImageData = null;
    let resultUrl = null;

    function el(id) { return document.getElementById(id); }
    function status(id, text, cls) {
        const s = el(id);
        s.textContent = text;
        s.className = cls || "";
    }

    function readFileAsImageData(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
            };
            img.onerror = function () { reject(new Error("Could not read image")); };
            img.src = URL.createObjectURL(file);
        });
    }

    function showBase(imgData) {
        baseImageData = imgData;
        const canvas = document.createElement("canvas");
        canvas.width = imgData.width;
        canvas.height = imgData.height;
        canvas.getContext("2d").putImageData(imgData, 0, 0);
        const wrap = el("baseImgWrap");
        wrap.innerHTML = "";
        wrap.appendChild(canvas);
    }

    el("fileInput").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { showBase(await readFileAsImageData(file)); }
        catch (err) { status("encodeStatus", err.message, "err"); }
    });

    el("genBtn").addEventListener("click", async () => {
        const prompt = el("prompt").value.trim();
        const apiKey = el("apiKey").value.trim();
        if (!prompt) { status("encodeStatus", "Type a prompt first", "err"); return; }
        try {
            el("genBtn").disabled = true;
            status("encodeStatus", "Generating image with Pollinations...");
            const blob = await polli.generateImage(prompt, { apiKey });
            const imgData = await polli.blobToImageData(blob);
            showBase(imgData);
            status("encodeStatus", "Generated. Now add your secret message below.", "ok");
        } catch (err) {
            status("encodeStatus", err.message, "err");
        } finally {
            el("genBtn").disabled = false;
        }
    });

    el("encodeBtn").addEventListener("click", () => {
        if (!baseImageData) { status("encodeStatus", "Pick or generate a base image first", "err"); return; }
        const msg = el("message").value;
        if (!msg) { status("encodeStatus", "Type a secret message first", "err"); return; }
        try {
            const encoded = core.encodeMessage(baseImageData, msg);
            const canvas = document.createElement("canvas");
            canvas.width = encoded.width;
            canvas.height = encoded.height;
            canvas.getContext("2d").putImageData(encoded, 0, 0);
            const wrap = el("resultWrap");
            wrap.innerHTML = "";
            wrap.appendChild(canvas);
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            canvas.toBlob((blob) => {
                resultUrl = URL.createObjectURL(blob);
                const link = el("downloadLink");
                link.href = resultUrl;
                link.hidden = false;
            }, "image/png");
            status("encodeStatus", "Message hidden ✅", "ok");
        } catch (err) {
            status("encodeStatus", err.message, "err");
        }
    });

    el("decodeBtn").addEventListener("click", async () => {
        const file = el("decodeInput").files[0];
        if (!file) { el("decodeOut").textContent = "Pick an image to decode"; return; }
        try {
            const imgData = await readFileAsImageData(file);
            const msg = core.decodeMessage(imgData);
            const out = el("decodeOut");
            if (msg === null) {
                out.textContent = "No hidden STEG1 message found in this image. 🤷";
                out.className = "hint";
            } else {
                out.textContent = "Decoded: " + msg;
                out.className = "ok";
            }
        } catch (err) {
            const out = el("decodeOut");
            out.textContent = err.message;
            out.className = "err";
        }
    });
})();
