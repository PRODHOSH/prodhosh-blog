import { SITE, absUrl, ogImageUrl } from "./site";
import { escapeXml } from "./utils";
import { renderMarkdown } from "./markdown";

// Feed readers need absolute URLs inside the article HTML.
const absolutize = (html) =>
  html
    .replace(/(src|href)="\/(?!\/)/g, `$1="${SITE.url}/`)
    .replace(/\sloading="lazy"|\sdecoding="async"/g, "");

const cardImage = (p) =>
  p.coverImage ? absUrl(p.coverImage) : ogImageUrl({ title: p.title, tags: p.tags, date: p.date, readingTime: p.readingTime });

async function withHtml(posts, limit = 30) {
  return Promise.all(
    posts.slice(0, limit).map(async (p) => ({ ...p, html: absolutize((await renderMarkdown(p.content, { title: p.title })).html) }))
  );
}

export async function buildRss(allPosts) {
  const posts = await withHtml(allPosts);
  const items = posts
    .map((p) => {
      const url = absUrl(`/blog/${p.slug}`);
      const img = cardImage(p);
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(SITE.author.name)}</dc:creator>
      <description>${escapeXml(p.description)}</description>
      <content:encoded><![CDATA[${p.html.replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
${p.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")}
      <media:thumbnail url="${escapeXml(img)}" width="1200" height="630" />
      <media:content url="${escapeXml(img)}" medium="image" width="1200" height="630" />
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language.toLowerCase()}</language>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE.author.name)}</copyright>
    <managingEditor>${SITE.author.email} (${escapeXml(SITE.author.name)})</managingEditor>
    <webMaster>${SITE.author.email} (${escapeXml(SITE.author.name)})</webMaster>
    <generator>ProdhoshBlogs (Next.js)</generator>
    <ttl>60</ttl>
    <lastBuildDate>${new Date(allPosts[0]?.updated || Date.now()).toUTCString()}</lastBuildDate>
    <image>
      <url>${absUrl("/icon.png")}</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${SITE.url}</link>
    </image>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

export async function buildJsonFeed(allPosts) {
  const posts = await withHtml(allPosts);
  const author = { name: SITE.author.name, url: SITE.author.url, avatar: absUrl("/icon.png") };
  return JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: SITE.name,
      home_page_url: SITE.url,
      feed_url: `${SITE.url}/feed.json`,
      description: SITE.description,
      icon: absUrl("/icon.png"),
      favicon: absUrl("/favicon.ico"),
      language: SITE.language,
      authors: [author],
      items: posts.map((p) => ({
        id: absUrl(`/blog/${p.slug}`),
        url: absUrl(`/blog/${p.slug}`),
        title: p.title,
        summary: p.description,
        content_html: p.html,
        image: cardImage(p),
        date_published: new Date(p.date).toISOString(),
        date_modified: new Date(p.updated).toISOString(),
        tags: p.tags,
        language: SITE.language,
        authors: [author],
      })),
    },
    null,
    2
  );
}
