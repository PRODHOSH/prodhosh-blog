import { db } from "../../../lib/db";
import { media } from "../../../lib/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../../../lib/auth";

// Public GET serves the image bytes (reached through the /media/:id/:name rewrite).
// DELETE is admin-only.
export default async function handler(req, res) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).end();

  if (req.method === "GET" || req.method === "HEAD") {
    const [row] = await db.select().from(media).where(eq(media.id, id));
    if (!row) return res.status(404).end();

    const buf = Buffer.from(row.data, "base64");
    const etag = `"m${row.id}-${row.size}"`;
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    if (req.headers["if-none-match"] === etag) return res.status(304).end();

    res.setHeader("Content-Type", row.mime);
    res.setHeader("Content-Length", buf.length);
    return res.status(200).send(req.method === "HEAD" ? undefined : buf);
  }

  if (req.method === "DELETE") {
    if (!(await requireAdmin(req, res))) return;
    await db.delete(media).where(eq(media.id, id));
    return res.status(204).end();
  }

  res.status(405).end();
}
