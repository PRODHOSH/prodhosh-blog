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
