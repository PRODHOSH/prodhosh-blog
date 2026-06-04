import { db } from "../../../lib/db";
import { posts } from "../../../lib/schema";
import { eq } from "drizzle-orm";

function isAdmin(req) {
  return req.cookies?.admin_token === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const numId = Number(id);

  if (req.method === "GET") {
    const [post] = await db.select().from(posts).where(eq(posts.id, numId));
    if (!post) return res.status(404).json({ error: "Not found" });
    return res.json(post);
  }

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "PUT") {
    const { title, slug, excerpt, content, tags, published } = req.body;
    const [updated] = await db
      .update(posts)
      .set({
        title,
        slug,
        excerpt,
        content,
        tags: tags || [],
        published: !!published,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, numId))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  }

  if (req.method === "DELETE") {
    await db.delete(posts).where(eq(posts.id, numId));
    return res.status(204).end();
  }

  res.status(405).end();
}
