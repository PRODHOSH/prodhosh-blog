import { SITE, absUrl } from "./site";
import { escapeXml, tagSlug } from "./utils";

const day = (iso) => new Date(iso).toISOString();

const wrap = (body, extraNs = "") =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${extraNs}>\n${body}\n</urlset>`;

function urlEntry(u) {
  return `  <url>
    <loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${day(u.lastmod)}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${(u.images || [])
      .map((src) => `\n    <image:image>\n      <image:loc>${escapeXml(src)}</image:loc>\n    </image:image>`)
      .join("")}
  </url>`;
}

const newest = (items, key = "updated") =>
  items.reduce((a, p) => (p[key] && (!a || new Date(p[key]) > new Date(a)) ? p[key] : a), null);

export function pagesSitemap(posts) {
  const last = newest(posts);
  return wrap(
    [
      { loc: SITE.url, lastmod: last, changefreq: "daily", priority: "1.0" },
      { loc: `${SITE.url}/blog`, lastmod: last, changefreq: "daily", priority: "0.9" },
      { loc: `${SITE.url}/tags`, lastmod: last, changefreq: "weekly", priority: "0.6" },
      { loc: `${SITE.url}/subscribe`, lastmod: null, changefreq: "yearly", priority: "0.3" },
    ]
      .map(urlEntry)
      .join("\n")
  );
}

export function postsSitemap(posts) {
  return wrap(
    posts
      .map((p) => {
        const imgs = [p.coverImage, ...p.images.map((i) => i.src)].filter(Boolean).map(absUrl);
        return urlEntry({
          loc: `${SITE.url}/blog/${p.slug}`,
          lastmod: p.updated,
          changefreq: "monthly",
          priority: "0.8",
          images: [...new Set(imgs)],
        });
      })
      .join("\n"),
    ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
  );
}

export function tagsSitemap(tags, posts) {
  return wrap(
    tags
      .map((t) => {
        const related = posts.filter((p) => p.tags.some((x) => tagSlug(x) === t.slug));
        return urlEntry({
          loc: `${SITE.url}/tags/${t.slug}`,
          lastmod: newest(related),
          changefreq: "weekly",
          priority: "0.5",
        });
      })
      .join("\n")
  );
}

export function sitemapIndex(posts) {
  const last = newest(posts);
  const entries = ["sitemap-pages.xml", "sitemap-posts.xml", "sitemap-tags.xml"]
    .map((f) => `  <sitemap>\n    <loc>${SITE.url}/${f}</loc>${last ? `\n    <lastmod>${day(last)}</lastmod>` : ""}\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;
}
