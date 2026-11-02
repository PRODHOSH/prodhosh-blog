import { tagSlug } from "./utils";

// Rebuild the cached pages touched by a post change so edits go live instantly
// instead of waiting for the ISR timer.
export async function revalidatePost(res, { slugs = [], tags = [] } = {}) {
  const paths = new Set(["/", "/blog", "/tags"]);
  slugs.filter(Boolean).forEach((s) => paths.add(`/blog/${s}`));
  tags.filter(Boolean).forEach((t) => paths.add(`/tags/${tagSlug(t)}`));
  await Promise.allSettled([...paths].map((p) => res.revalidate(p)));
}
