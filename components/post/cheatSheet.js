// Adds a toolbar to the "cheat sheet" table of a post: copy as text, copy / download as an image,
// and share to WhatsApp. The image is drawn straight onto a canvas, so no extra libraries are needed.

const COLORS = { bg: "#f7eee8", ink: "#0b0b0b", orange: "#ff5400", line: "#d9cdc3", mute: "#6b625b", head: "#fcae88" };

function readTable(table) {
  const rows = [...table.querySelectorAll("tr")].map((tr) =>
    [...tr.children].map((c) => c.innerText.replace(/\s+/g, " ").trim())
  );
  return { head: rows[0] || [], body: rows.slice(1) };
}

function toText({ head, body }, title, url) {
  const lines = body.map((r) => `• ${r[0]}: ${r[1]}\n   Test: ${r[2]}`);
  return `${title}\n\n${lines.join("\n")}\n\n${url}`;
}

function wrap(ctx, text, maxWidth) {
  const out = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      out.push(line);
      line = word;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

function drawImage({ head, body }, title) {
  const W = 1200;
  const S = 2;
  const pad = 48;
  const widths = [0.17, 0.5, 0.33].map((p) => Math.round((W - pad * 2) * p));
  const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const measure = document.createElement("canvas").getContext("2d");

  measure.font = `400 22px ${font}`;
  const rows = body.map((r) => {
    const cells = r.map((t, i) => wrap(measure, t, widths[i] - 28));
    return { cells, h: Math.max(...cells.map((c) => c.length)) * 30 + 28 };
  });
  const headH = 56;
  const top = 150;
  const H = top + headH + rows.reduce((a, r) => a + r.h, 0) + 90;

  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  ctx.scale(S, S);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = COLORS.orange;
  ctx.beginPath();
  ctx.arc(pad + 9, 62, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 26px ${font}`;
  ctx.fillText("prodhosh/blogs", pad + 30, 71);
  ctx.font = `800 44px ${font}`;
  ctx.fillText(title, pad, 128);

  let y = top;
  ctx.fillStyle = COLORS.head;
  ctx.fillRect(pad, y, W - pad * 2, headH);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 20px ${font}`;
  let x = pad;
  head.forEach((t, i) => {
    ctx.fillText(t, x + 14, y + 36);
    x += widths[i];
  });
  y += headH;

  rows.forEach((r) => {
    x = pad;
    r.cells.forEach((lines, i) => {
      ctx.font = `${i === 0 ? 700 : 400} 22px ${font}`;
      ctx.fillStyle = i === 0 ? COLORS.orange : COLORS.ink;
      lines.forEach((l, li) => ctx.fillText(l, x + 14, y + 38 + li * 30));
      x += widths[i];
    });
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y + r.h);
    ctx.lineTo(W - pad, y + r.h);
    ctx.stroke();
    y += r.h;
  });

  ctx.fillStyle = COLORS.mute;
  ctx.font = `400 20px ${font}`;
  ctx.fillText("blog.prodhosh.me", pad, H - 34);
  return canvas;
}

const toBlob = (canvas) => new Promise((res) => canvas.toBlob(res, "image/png"));

export function enhanceCheatSheet(root, { title, url }) {
  if (!root) return () => {};
  const h2 = [...root.querySelectorAll("h2")].find((h) => /cheat sheet/i.test(h.textContent));
  const table = h2 && (() => {
    let el = h2.nextElementSibling;
    while (el && el.tagName !== "TABLE" && el.tagName !== "H2") el = el.nextElementSibling;
    return el && el.tagName === "TABLE" ? el : null;
  })();
  if (!table || table.dataset.enhanced) return () => {};
  table.dataset.enhanced = "1";

  const data = readTable(table);
  const heading = "Website launch checklist";
  const bar = document.createElement("div");
  bar.className = "sheet-bar";
  const status = document.createElement("span");
  status.className = "sheet-status";
  status.setAttribute("aria-live", "polite");

  const flash = (msg) => {
    status.textContent = msg;
    setTimeout(() => (status.textContent = ""), 2200);
  };
  const mk = (label, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.addEventListener("click", fn);
    bar.appendChild(b);
    return b;
  };
  const download = (blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "website-launch-checklist.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  mk("Copy as text", async () => {
    try {
      await navigator.clipboard.writeText(toText(data, heading, url));
      flash("Copied ✓");
    } catch {
      flash("Couldn't copy");
    }
  });
  mk("Copy as image", async () => {
    const blob = await toBlob(drawImage(data, heading));
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied ✓");
    } catch {
      download(blob);
      flash("Copy not supported here, downloaded instead");
    }
  });
  mk("Download image", async () => {
    download(await toBlob(drawImage(data, heading)));
  });
  mk("Share on WhatsApp", async () => {
    const text = `${heading}: ${title}\n${url}`;
    try {
      const blob = await toBlob(drawImage(data, heading));
      const file = new File([blob], "website-launch-checklist.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch (e) {
      if (e?.name === "AbortError") return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(toText(data, heading, url))}`, "_blank", "noopener,noreferrer");
  });
  bar.appendChild(status);
  table.parentNode.insertBefore(bar, table);

  return () => {
    bar.remove();
    delete table.dataset.enhanced;
  };
}
