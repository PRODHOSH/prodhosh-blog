import { db } from "../../../lib/db";
import { posts } from "../../../lib/schema";
import { and, eq, ne } from "drizzle-orm";
import { requireAdmin } from "../../../lib/auth";
import { parsePostInput } from "../../../lib/validate";
import { revalidatePost } from "../../../lib/revalidate";

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid id" });

  const [existing] = await db.select().from(posts).where(eq(posts.id, id));
  if (!existing) return res.status(404).json({ error: "Not found" });

  if (req.method === "GET") return res.json(existing);

  if (req.method === "PUT") {
    const { data, error } = parsePostInput(req.body);
    if (error) return res.status(400).json({ error });

    const [taken] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.slug, data.slug), ne(posts.id, id)));
    if (taken) return res.status(409).json({ error: "That slug is already used by another post." });

    const [updated] = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    await revalidatePost(res, {
      slugs: [existing.slug, updated.slug],
      tags: [...(existing.tags || []), ...(updated.tags || [])],
    });
    return res.json(updated);
  }

  if (req.method === "DELETE") {
    await db.delete(posts).where(eq(posts.id, id));
    await revalidatePost(res, { slugs: [existing.slug], tags: existing.tags || [] });
    return res.status(204).end();
  }

  res.status(405).end();
}
