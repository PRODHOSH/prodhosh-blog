import { db } from "./db";
import { posts } from "./schema";
import { desc, eq } from "drizzle-orm";
import readingTime from "reading-time";

export async function getSortedPostsData() {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  return rows.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || "",
    tags: p.tags || [],
    date: p.createdAt.toISOString().split("T")[0],
    readingTime: readingTime(p.content).text,
  }));
}

export async function getAllPostSlugs() {
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.published, true));

  return rows.map((p) => ({ params: { slug: p.slug } }));
}

export async function getPostData(slug) {
  const [post] = await db.select().from(posts).where(eq(posts.slug, slug));
  if (!post) return null;

  const { remark } = await import("remark");
  const { default: remarkHtml } = await import("remark-html");
  const { default: remarkGfm } = await import("remark-gfm");

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(post.content);

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    date: post.createdAt.toISOString().split("T")[0],
    readingTime: readingTime(post.content).text,
    contentHtml: processed.toString(),
  };
}

export async function getAllTags() {
  const allPosts = await getSortedPostsData();
  const tagSet = new Set();
  allPosts.forEach((p) => {
    if (Array.isArray(p.tags)) p.tags.forEach((t) => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}
