/* =========================================================
   Neko-Yotsuba — Free AI Game Creator
   Uses the free Pollinations.AI text endpoint (no API key).
   Verified 2026: https://text.pollinations.ai/models currently
   lists "openai-fast" (GPT-OSS 20B) for anonymous users; the
   alias "openai" is also accepted. No paid/private models are
   assumed or hardcoded, and no credentials are used.
   ========================================================= */
(function () {
  "use strict";

  var UNAVAILABLE_MSG = "Free AI via Pollinations is temporarily unavailable, please come back later";

  var promptEl   = document.getElementById("gamePrompt");
  var modelEl    = document.getElementById("modelSelect");
  var generateBtn= document.getElementById("generateBtn");
  var statusEl   = document.getElementById("statusMsg");
  var codeEl     = document.getElementById("codeOutput");
  var previewBtn = document.getElementById("previewBtn");
  var downloadBtn= document.getElementById("downloadBtn");
  var newWinBtn  = document.getElementById("newWinBtn");
  var copyBtn    = document.getElementById("copyBtn");
  var resetBtn   = document.getElementById("resetBtn");
  var frame      = document.getElementById("previewFrame");
  var outputWrap = document.getElementById("outputWrap");

  var currentHTML = "";
  var abortController = null;

  /* ---------- Helpers ---------- */

  function setStatus(msg, kind) {
    statusEl.textContent = msg || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function extractHTML(text) {
    if (!text) return "";
    // Prefer a ```html fenced block if present
    var fence = text.match(/```(?:html|htm)?\s*([\s\S]*?)```/i);
    var candidate = fence ? fence[1] : text;

    // Trim leading prose before <!DOCTYPE or <html
    var idx = candidate.search(/<!doctype\s+html>/i);
    if (idx === -1) idx = candidate.search(/<html[\s>]/i);
    if (idx > -1) candidate = candidate.slice(idx);

    // Trim trailing prose after </html>
    var end = candidate.toLowerCase().lastIndexOf("</html>");
    if (end > -1) candidate = candidate.slice(0, end + 7);

    return candidate.trim();
  }

  function buildSystemPrompt(userIdea) {
    return (
      "You are an expert game developer. Create a complete, single-file HTML5 game based on this idea: \"" +
      userIdea + "\". " +
      "Rules: Output ONLY the full HTML document inside one ```html code block. No explanations outside the code block. " +
      "All CSS and JavaScript must be inline in the same file. No external libraries, images, fonts or network requests. " +
      "Use canvas or DOM elements for graphics with simple drawn shapes or emoji. " +
      "The game must include: a start screen or instructions, player controls explained on screen, a score, " +
      "a game-over state with a restart button, and it must run immediately when opened in a browser."
    );
  }

  function sanitiseHTML(html) {
    // Strip external resource loads and dangerous attributes so the
    // generated game stays self-contained inside its sandboxed iframe.
    return html
      .replace(/<link[^>]*href=["']https?:\/\/[^"']*["'][^>]*>/gi, "")
      .replace(/<script[^>]+src=["'][^"']*["'][^>]*>\s*<\/script>/gi, "")
      .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
      .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
      .replace(/javascript:/gi, "");
  }

  function callPollinations(systemPrompt) {
    var endpoint = "https://text.pollinations.ai/openai";
    var body = JSON.stringify({
      model: modelEl ? modelEl.value : "openai-fast",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Make the game now." }
      ]
    });

    abortController = new AbortController();
    var timedOut = setTimeout(function () { abortController.abort(); }, 90000);

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      signal: abortController.signal
    })
      .then(function (res) {
        clearTimeout(timedOut);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        try {
          var content = data.choices[0].message.content;
          if (!content) throw new Error("empty");
          return content;
        } catch (e) {
          throw new Error("bad response");
        }
      });
  }

  function renderPreview(html) {
    // Use srcdoc for a sandboxed live preview
    frame.srcdoc = html;
  }

  function showOutput(html) {
    currentHTML = html;
    codeEl.textContent = html;
    outputWrap.style.display = "block";
    renderPreview(html);
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
    newWinBtn.disabled = false;
    if (copyBtn) copyBtn.disabled = false;
  }

  /* ---------- Events ---------- */

  generateBtn.addEventListener("click", function () {
    var idea = (promptEl.value || "").trim();
    if (!idea) {
      setStatus("Please describe the game you'd like to create first.", "error");
      promptEl.focus();
      return;
    }

    generateBtn.disabled = true;
    generateBtn.classList.add("loading");
    setStatus("AI is coding your game… this can take up to a minute.", "info");
    codeEl.textContent = "";
    outputWrap.style.display = "none";
    currentHTML = "";

    callPollinations(buildSystemPrompt(idea))
      .then(function (raw) {
        var html = sanitiseHTML(extractHTML(raw));
        if (!html || html.length < 80 || html.indexOf("<") === -1) {
          throw new Error("unusable");
        }
        showOutput(html);
        setStatus("Your game is ready — try the live preview!", "success");
      })
      .catch(function () {
        setStatus(UNAVAILABLE_MSG, "error");
      })
      .finally(function () {
        generateBtn.disabled = false;
        generateBtn.classList.remove("loading");
      });
  });

  promptEl.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generateBtn.click();
  });

  previewBtn.addEventListener("click", function () {
    if (currentHTML) renderPreview(currentHTML);
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!currentHTML) return;
      function done() {
        copyBtn.textContent = "✓ Copied!";
        setTimeout(function () { copyBtn.textContent = "⧉ Copy Code"; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentHTML).then(done, function () {
          setStatus("Copying was blocked by your browser — select the code and copy manually.", "info");
        });
      } else {
        // Fallback: select the code block for manual copying
        var range = document.createRange();
        range.selectNodeContents(codeEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        setStatus("The generated code is selected — press Ctrl/Cmd + C to copy it.", "info");
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      currentHTML = "";
      codeEl.textContent = "";
      frame.srcdoc = "";
      outputWrap.style.display = "none";
      previewBtn.disabled = true;
      downloadBtn.disabled = true;
      newWinBtn.disabled = true;
      if (copyBtn) copyBtn.disabled = true;
      setStatus("", null);
      promptEl.value = "";
      promptEl.focus();
    });
  }

  newWinBtn.addEventListener("click", function () {
    if (!currentHTML) return;
    var blob = new Blob([currentHTML], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  });

  downloadBtn.addEventListener("click", function () {
    if (!currentHTML) return;
    var blob = new Blob([currentHTML], { type: "text/html" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ai-game.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
  });
})();
