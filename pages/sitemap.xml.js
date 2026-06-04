import { getSortedPostsData } from "../lib/posts";

const BASE = "https://blog.prodhosh.me";

function sitemap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  <url>
    <loc>${BASE}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${BASE}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  ${posts
    .map(
      (post) => `<url>
    <loc>${BASE}/blog/${post.slug}</loc>
    ${post.date ? `<lastmod>${new Date(post.date).toISOString().split("T")[0]}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n\n  ")}

</urlset>`;
}

export async function getServerSideProps({ res }) {
  const posts = await getSortedPostsData();
  const xml = sitemap(posts);

  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
