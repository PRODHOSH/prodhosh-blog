// Pure helpers safe for both server and client bundles (no db imports here).
export function slugify(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const tagSlug = slugify;

export function formatDate(iso, opts = { year: "numeric", month: "long", day: "numeric" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}

export function escapeXml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── "Did you mean…?" for the 404 page ──

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

const words = (s) => slugify(s).split("-").filter((w) => w.length > 2);

/**
 * Best matching post for a mistyped URL, or null when nothing is close enough.
 * Combines word overlap (handles truncated or reordered slugs) with edit distance (handles typos).
 */
export function suggestPost(path = "", posts = []) {
  const last = decodeURIComponent(String(path).split(/[?#]/)[0].split("/").filter(Boolean).pop() || "").replace(/\.\w+$/, "");
  const needle = slugify(last);
  if (needle.length < 3) return null;
  const need = new Set(words(needle));

  let best = null;
  for (const p of posts) {
    const slug = p.slug;
    const hay = new Set([...words(slug), ...words(p.title)]);
    const overlap = need.size ? [...need].filter((w) => hay.has(w) || [...hay].some((h) => h.startsWith(w) || w.startsWith(h))).length / need.size : 0;
    const edit = 1 - editDistance(needle.slice(0, 80), slug.slice(0, 80)) / Math.max(needle.length, slug.length, 1);
    const contains = slug.includes(needle) || needle.includes(slug) ? 1 : 0;
    const score = Math.max(overlap * 0.9, edit, contains);
    if (!best || score > best.score) best = { post: p, score };
  }
  return best && best.score >= 0.5 ? best.post : null;
}
