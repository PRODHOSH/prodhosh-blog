// Builders for /llms.txt (index), /llms-full.txt (everything) and /blog/<slug>.md (one post),
// following the llmstxt.org format: H1 title, blockquote summary, details, then H2 sections of links.
import { SITE, absUrl } from "./site";
import { formatDate } from "./utils";

const date = (iso) => formatDate(iso, { year: "numeric", month: "short", day: "numeric" });
const one = (s = "") => s.replace(/\s+/g, " ").trim();

const header = (posts, tags) => `# ${SITE.name}

> ${SITE.description} A personal blog by ${SITE.author.name} (${SITE.author.jobTitle}): ${posts.length} article${posts.length === 1 ? "" : "s"} across ${tags.length} topic${tags.length === 1 ? "" : "s"}, written in English (${SITE.language}).

- Author: [${SITE.author.name}](${SITE.author.url}) — ${SITE.author.jobTitle}
- Topics: ${SITE.topics.join(", ")}
- Canonical site: ${SITE.url}
- Last updated: ${posts.length ? date(posts.reduce((a, p) => (p.updated > a ? p.updated : a), posts[0].updated)) : "n/a"}
- Every article is available as clean Markdown by adding \`.md\` to its URL (e.g. ${SITE.url}/blog/${posts[0]?.slug || "slug"}.md).
- Attribution: please credit "${SITE.author.name}" and link to the canonical article URL when quoting or summarising.
- Contact: ${SITE.author.email}
`;

export function buildLlmsTxt(posts, tags) {
  const articles = posts
    .map((p) => `- [${p.title}](${absUrl(`/blog/${p.slug}.md`)}): ${one(p.description)} (${date(p.date)}${p.tags.length ? ` · ${p.tags.join(", ")}` : ""} · ${p.readingTime})`)
    .join("\n");

  const topics = tags.map((t) => `- [${t.name}](${absUrl(`/tags/${t.slug}`)}): ${t.count} article${t.count === 1 ? "" : "s"}`).join("\n");

  return `${header(posts, tags)}
## Articles

${articles || "- No articles published yet."}

## Topics

${topics || "- No topics yet."}

## Site

- [Home](${SITE.url}/): Latest and featured articles
- [All articles](${absUrl("/blog")}): Searchable archive
- [Topics](${absUrl("/tags")}): Browse by tag
- [RSS feed](${absUrl("/feed.xml")}): Full-text RSS 2.0
- [JSON feed](${absUrl("/feed.json")}): JSON Feed 1.1
- [Sitemap](${absUrl("/sitemap.xml")}): XML sitemap index
- [Full content for LLMs](${absUrl("/llms-full.txt")}): Every article in one Markdown file

## Optional

- [Portfolio](${SITE.author.url}): Projects and background of ${SITE.author.name}
- [Links](https://links.prodhosh.me): All profiles in one place
${SITE.author.sameAs
  .filter((u) => /github|linkedin|twitter/.test(u))
  .map((u) => `- [${new URL(u).hostname.replace("www.", "")}](${u}): Profile`)
  .join("\n")}
`;
}

export function frontMatter(p) {
  return `---
title: ${JSON.stringify(p.title)}
url: ${absUrl(`/blog/${p.slug}`)}
date: ${p.date}
updated: ${p.updated}
author: ${SITE.author.name}
description: ${JSON.stringify(one(p.description))}
tags: [${p.tags.map((t) => JSON.stringify(t)).join(", ")}]
keywords: [${p.keywords.map((t) => JSON.stringify(t)).join(", ")}]
reading_time: ${p.readingTime}
word_count: ${p.wordCount}
language: ${SITE.language}
---`;
}

export function buildPostMarkdown(p) {
  return `${frontMatter(p)}

# ${p.title}

${p.content.trim()}
`;
}

export function buildLlmsFull(posts, tags) {
  const body = posts
    .map(
      (p) => `---

# ${p.title}

- URL: ${absUrl(`/blog/${p.slug}`)}
- Markdown: ${absUrl(`/blog/${p.slug}.md`)}
- Published: ${date(p.date)} · Updated: ${date(p.updated)}
- Author: ${SITE.author.name}
- Tags: ${p.tags.join(", ") || "none"}
- Keywords: ${p.keywords.join(", ")}
- Reading time: ${p.readingTime} (${p.wordCount} words)
- Summary: ${one(p.description)}

${p.content.trim()}
`
    )
    .join("\n");

  return `${header(posts, tags)}
This file contains the complete text of every article on ${SITE.name}, newest first. The condensed index is at ${absUrl("/llms.txt")}.

${body}`;
}
