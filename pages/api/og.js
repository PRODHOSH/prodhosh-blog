import { ImageResponse } from "next/og";

export const config = { runtime: "edge" };

const bricolage = fetch(new URL("../../public/fonts/og/bricolage-800.woff", import.meta.url)).then((r) => r.arrayBuffer());
const serif = fetch(new URL("../../public/fonts/og/instrument-serif-italic.woff", import.meta.url)).then((r) => r.arrayBuffer());
const mono = fetch(new URL("../../public/fonts/og/jetbrains-mono-500.woff", import.meta.url)).then((r) => r.arrayBuffer());

function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// Only local, JPEG/PNG media can be embedded (satori can't decode WebP/GIF).
async function loadCover(origin, cover) {
  if (!cover || !/^\/media\/\d+/.test(cover)) return null;
  try {
    const r = await fetch(new URL(cover, origin));
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/^image\/(jpeg|png)$/.test(type)) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength > 3 * 1024 * 1024) return null;
    return `data:${type};base64,${toBase64(buf)}`;
  } catch {
    return null;
  }
}

const clean = (v, max) => (v || "").replace(/\s+/g, " ").trim().slice(0, max);

export default async function handler(req) {
  const { searchParams, origin } = new URL(req.url);
  const title = clean(searchParams.get("title"), 140) || "Thoughts on Tech, AI & Building Things";
  const tags = clean(searchParams.get("tags"), 100).split(",").filter(Boolean).slice(0, 3);
  const date = clean(searchParams.get("date"), 40);
  const read = clean(searchParams.get("read"), 20);
  const cover = await loadCover(origin, searchParams.get("cover"));

  const size = title.length <= 40 ? 92 : title.length <= 70 ? 78 : title.length <= 100 ? 64 : 52;
  const ink = cover ? "#ffffff" : "#0b0b0b";
  const sub = cover ? "rgba(255,255,255,.78)" : "#6b5f55";

  const meta = [date && new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }), read]
    .filter(Boolean)
    .join("  ·  ");

  const [f1, f2, f3] = await Promise.all([bricolage, serif, mono]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: cover ? "#0b0b0b" : "#f8eee8",
          position: "relative",
          fontFamily: "Bricolage",
        }}
      >
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} width={1200} height={630} style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                background: "rgba(11,11,11,.62)",
              }}
            />
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              right: -140,
              bottom: -160,
              width: 520,
              height: 520,
              borderRadius: 520,
              background: "#ff5400",
              display: "flex",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 1200,
            height: 630,
            padding: "64px 72px",
            position: "relative",
          }}
        >
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{ width: 18, height: 18, borderRadius: 18, background: "#ff5400", display: "flex" }} />
          <div style={{ display: "flex", fontSize: 30, color: ink, letterSpacing: -0.5 }}>prodhosh/blogs</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, position: "relative", maxWidth: cover ? 1000 : 880 }}>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 12 }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    fontFamily: "JetBrains",
                    fontSize: 22,
                    color: cover ? "#fff" : "#0b0b0b",
                    border: `2px solid ${cover ? "rgba(255,255,255,.55)" : "rgba(11,11,11,.35)"}`,
                    borderRadius: 99,
                    padding: "6px 18px",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", fontSize: size, lineHeight: 1.04, color: ink, letterSpacing: -2 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 18, position: "relative", color: sub }}>
          <div style={{ display: "flex", fontFamily: "Serif", fontStyle: "italic", fontSize: 36, color: ink }}>by Prodhosh VS</div>
          {meta && <div style={{ display: "flex", fontFamily: "JetBrains", fontSize: 22 }}>{meta}</div>}
        </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bricolage", data: f1, weight: 800, style: "normal" },
        { name: "Serif", data: f2, weight: 400, style: "italic" },
        { name: "JetBrains", data: f3, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, immutable, no-transform, s-maxage=31536000, max-age=86400" },
    }
  );
}
