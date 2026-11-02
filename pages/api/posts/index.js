import { db } from "../../../lib/db";
import { posts } from "../../../lib/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "../../../lib/auth";
import { parsePostInput } from "../../../lib/validate";
import { revalidatePost } from "../../../lib/revalidate";
import { readingStats } from "../../../lib/markdown";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
    // The dashboard only needs metadata, not whole post bodies.
    return res.json(
      rows.map(({ content, ...p }) => ({ ...p, wordCount: readingStats(content).wordCount }))
    );
  }

  if (req.method === "POST") {
    const { data, error } = parsePostInput(req.body);
    if (error) return res.status(400).json({ error });

    const [taken] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, data.slug));
    if (taken) return res.status(409).json({ error: "That slug is already used by another post." });

    const [post] = await db.insert(posts).values(data).returning();
    await revalidatePost(res, { slugs: [post.slug], tags: post.tags });
    return res.status(201).json(post);
  }

  res.status(405).end();
}
