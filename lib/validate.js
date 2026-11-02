import { slugify } from "./utils";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COVER_RE = /^(\/media\/\d+(\/[\w.\-]*)?|https:\/\/[^\s]+)$/;

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Validates + normalises a post payload from the admin editor.
export function parsePostInput(body = {}) {
  const title = str(body.title, 200);
  if (!title) return { error: "Title is required." };

  const slug = str(body.slug, 120) || slugify(title);
  if (!SLUG_RE.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers and hyphens." };
  }

  const published = !!body.published;
  const content = typeof body.content === "string" ? body.content : "";
  if (published && !content.trim()) return { error: "Write some content before publishing." };
  if (content.length > 500_000) return { error: "Content is too long." };

  const rawTags = Array.isArray(body.tags)
    ? body.tags
    : typeof body.tags === "string"
    ? body.tags.split(",")
    : [];
  const tags = [...new Set(rawTags.map((t) => str(t, 30)).filter(Boolean))].slice(0, 10);

  const coverImage = str(body.coverImage, 500);
  if (coverImage && !COVER_RE.test(coverImage)) {
    return { error: "Cover image must be an uploaded image or an https URL." };
  }

  let publishedAt = null;
  if (body.publishedAt) {
    const d = new Date(body.publishedAt);
    if (Number.isNaN(d.getTime())) return { error: "Invalid publish date." };
    publishedAt = d;
  }

  return {
    data: {
      title,
      slug,
      excerpt: str(body.excerpt, 400),
      content,
      tags,
      published,
      featured: !!body.featured,
      coverImage,
      seoTitle: str(body.seoTitle, 120),
      seoDescription: str(body.seoDescription, 300),
      publishedAt,
    },
  };
}
