import { db } from "../../../lib/db";
import { media } from "../../../lib/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "../../../lib/auth";

// Base64 inflates ~33%; Vercel caps request bodies at 4.5 MB, so keep decoded files <= 3 MB.
export const config = { api: { bodyParser: { sizeLimit: "4.2mb" } } };

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

function sniffOk(mime, buf) {
  return (ALLOWED[mime] || []).some((sig) => sig.every((b, i) => buf[i] === b));
}

const columns = {
  id: media.id,
  filename: media.filename,
  mime: media.mime,
  size: media.size,
  width: media.width,
  height: media.height,
  alt: media.alt,
  createdAt: media.createdAt,
};

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const rows = await db.select(columns).from(media).orderBy(desc(media.createdAt)).limit(200);
    return res.json(rows.map((m) => ({ ...m, url: `/media/${m.id}/${m.filename}` })));
  }

  if (req.method === "POST") {
    const { filename, mime, data, width, height, alt } = req.body || {};
    if (!ALLOWED[mime]) return res.status(400).json({ error: "Only JPG, PNG, WebP and GIF images are allowed." });
    if (typeof data !== "string" || !data) return res.status(400).json({ error: "No image data." });

    const buf = Buffer.from(data, "base64");
    if (buf.length > MAX_BYTES) return res.status(413).json({ error: "Image is larger than 3 MB." });
    if (!sniffOk(mime, buf)) return res.status(400).json({ error: "File content does not match its type." });

    const safeName =
      String(filename || "image")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "image";

    const [row] = await db
      .insert(media)
      .values({
        filename: safeName,
        mime,
        size: buf.length,
        width: Number.isFinite(width) ? Math.round(width) : null,
        height: Number.isFinite(height) ? Math.round(height) : null,
        alt: typeof alt === "string" ? alt.slice(0, 200) : "",
        data: buf.toString("base64"),
      })
      .returning(columns);

    return res.status(201).json({ ...row, url: `/media/${row.id}/${row.filename}` });
  }

  res.status(405).end();
}
