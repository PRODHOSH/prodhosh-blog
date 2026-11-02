import { db } from "./db";
import { posts } from "./schema";
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { readingStats, renderMarkdown } from "./markdown";
import { tagSlug } from "./utils";
import { autoExcerpt, extractKeywords, markdownImages, metaDescription } from "./seo";
import { SITE } from "./site";

// A post is public when published and its (optional) schedule has arrived.
const isLive = () =>
  and(eq(posts.published, true), or(isNull(posts.publishedAt), lte(posts.publishedAt, new Date())));

// Excerpts are free text from the admin; collapse stray newlines so meta tags and JSON-LD stay single-line.
const tidy = (t = "") => t.replace(/\s+/g, " ").trim();

const displayDate = (p) => (p.publishedAt || p.createdAt).toISOString();

function toListItem(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: tidy(p.excerpt) || autoExcerpt(p.content), // cards fall back to the opening of the article
    tags: p.tags || [],
    featured: !!p.featured,
    coverImage: p.coverImage || "",
    date: displayDate(p),
    updated: p.updatedAt.toISOString(),
    readingTime: readingStats(p.content).readingTime,
  };
}

// Everything feeds / llms.txt / sitemaps need, including the markdown body.
function toFullItem(p) {
  const item = toListItem(p);
  return {
    ...item,
    id: p.id,
    content: p.content,
    seoTitle: p.seoTitle || "",
    description: metaDescription({ seoDescription: p.seoDescription, excerpt: p.excerpt, content: p.content, title: p.title, author: SITE.author.name }),
    keywords: extractKeywords({ title: p.title, tags: p.tags || [], content: p.content }),
    images: markdownImages(p.content),
    wordCount: readingStats(p.content).wordCount,
  };
}

export async function getPostsWithContent() {
  const rows = await db.select().from(posts).where(isLive());
  return rows
    .map((p) => ({ item: toFullItem(p), t: new Date(displayDate(p)).getTime() }))
    .sort((a, b) => b.t - a.t)
    .map((x) => x.item);
}

export async function getPostMarkdown(slug) {
  const [post] = await db.select().from(posts).where(and(eq(posts.slug, slug), isLive()));
  return post ? toFullItem(post) : null;
}

export async function getSortedPostsData() {
  const rows = await db.select().from(posts).where(isLive());
  return rows
    .map((p) => ({ item: toListItem(p), t: new Date(displayDate(p)).getTime() }))
    .sort((a, b) => b.t - a.t)
    .map((x) => x.item);
}

export async function getAllPostSlugs() {
  const rows = await db.select({ slug: posts.slug }).from(posts).where(isLive());
  return rows.map((p) => ({ params: { slug: p.slug } }));
}

export async function getPostData(slug) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), isLive()));
  if (!post) return null;

  const [{ html, toc }, all] = await Promise.all([
    renderMarkdown(post.content, { title: post.title }),
    getSortedPostsData(),
  ]);
  const stats = readingStats(post.content);

  const idx = all.findIndex((p) => p.slug === post.slug);
  const tags = post.tags || [];
  const related = all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, 3)
    .map((x) => x.p);

  return {
    slug: post.slug,
    title: post.title,
    excerpt: tidy(post.excerpt),
    tags,
    coverImage: post.coverImage || "",
    seoTitle: post.seoTitle || "",
    seoDescription: post.seoDescription || "",
    description: metaDescription({ seoDescription: post.seoDescription, excerpt: post.excerpt, content: post.content, title: post.title, author: SITE.author.name }),
    keywords: extractKeywords({ title: post.title, tags, content: post.content }),
    images: markdownImages(post.content).map((i) => i.src),
    date: displayDate(post),
    updated: post.updatedAt.toISOString(),
    readingTime: stats.readingTime,
    wordCount: stats.wordCount,
    contentHtml: html,
    toc,
    newer: idx > 0 ? all[idx - 1] : null,
    older: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
    related,
  };
}

// [{ name, slug, count }] sorted by popularity
export async function getAllTags(allPosts) {
  const list = allPosts || (await getSortedPostsData());
  const map = new Map();
  for (const p of list) {
    for (const t of p.tags) {
      const slug = tagSlug(t);
      if (!slug) continue;
      const cur = map.get(slug) || { name: t, slug, count: 0 };
      cur.count += 1;
      map.set(slug, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getTagPage(slug) {
  const all = await getSortedPostsData();
  const tags = await getAllTags(all);
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) return null;
  return { tag, posts: all.filter((p) => p.tags.some((t) => tagSlug(t) === slug)) };
}
