import { db } from "../../../lib/db";
import { posts } from "../../../lib/schema";
import { desc, eq } from "drizzle-orm";

function isAdmin(req) {
  return req.cookies?.admin_token === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const rows = isAdmin(req)
      ? await db.select().from(posts).orderBy(desc(posts.createdAt))
      : await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
    return res.json(rows);
  }

  if (req.method === "POST") {
    if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

    const { title, slug, excerpt, content, tags, published } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ error: "title, slug and content are required" });
    }

    const [post] = await db
      .insert(posts)
      .values({ title, slug, excerpt, content, tags: tags || [], published: !!published })
      .returning();

    return res.status(201).json(post);
  }

  res.status(405).end();
}
