import { requireAdmin } from "../../lib/auth";
import { readingStats, renderMarkdown } from "../../lib/markdown";

export const config = { api: { bodyParser: { sizeLimit: "2mb" } } };

// Renders markdown with the exact pipeline the public site uses.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (!(await requireAdmin(req, res))) return;

  const content = typeof req.body?.content === "string" ? req.body.content : "";
  const { html, toc } = await renderMarkdown(content);
  return res.json({ html, toc, ...readingStats(content) });
}
