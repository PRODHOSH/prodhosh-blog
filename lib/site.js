// Single source of truth for site-wide identity + URL helpers.
export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://blog.prodhosh.me").replace(/\/$/, ""),
  name: "ProdhoshBlogs",
  shortName: "prodhosh/blogs",
  tagline: "Thoughts on Tech, AI & Building Things",
  description:
    "Prodhosh VS writes about full stack development, AI, open-source and shipping real-world software products.",
  locale: "en_IN",
  language: "en-IN",
  gaId: "G-32JNX7ZWHL",
  themeColor: "#f8eee8",
  // Site-level keyword set, grouped by search intent. Posts add their own on top (see lib/seo.js).
  keywords: [
    "Prodhosh VS",
    "ProdhoshBlogs",
    "full stack developer blog",
    "AI engineering blog",
    "Next.js tutorials",
    "React and TypeScript",
    "open source for beginners",
    "GitHub profile README",
    "software supply chain security",
    "LLM agents",
    "web development",
    "developer career",
    "building and shipping software",
  ],
  // Topics the author writes about (used by Person.knowsAbout and llms.txt).
  topics: [
    "Full stack development",
    "Next.js",
    "React",
    "Artificial intelligence",
    "LLM agents",
    "Open source",
    "GitHub",
    "Software supply chain security",
    "Developer careers",
  ],
  author: {
    name: "Prodhosh VS",
    url: "https://prodhosh.me",
    jobTitle: "Full Stack Developer & AI Engineer",
    twitter: "@prodhosh3",
    email: "prodhosh3@gmail.com",
    image: "/icon.png",
    sameAs: [
      "https://prodhosh.me",
      "https://links.prodhosh.me",
      "https://github.com/PRODHOSH",
      "https://www.linkedin.com/in/prodhoshvs/",
      "https://twitter.com/prodhosh3",
      "https://www.instagram.com/itzprodhosh/",
    ],
  },
};

// Stable JSON-LD @id values so every page links to the same entities.
export const ids = {
  person: () => `${SITE.author.url}/#person`,
  website: () => `${SITE.url}/#website`,
  blog: () => `${SITE.url}/#blog`,
};

export function absUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

// Dynamic social card. `cover` must be a local /media/... path.
export function ogImageUrl({ title, tags, date, readingTime, cover } = {}) {
  const q = new URLSearchParams();
  if (title) q.set("title", title.slice(0, 140));
  if (tags && tags.length) q.set("tags", tags.slice(0, 3).join(","));
  if (date) q.set("date", date);
  if (readingTime) q.set("read", readingTime);
  if (cover && /^\/media\/\d+/.test(cover)) q.set("cover", cover);
  const qs = q.toString();
  return absUrl(`/og${qs ? `?${qs}` : ""}`);
}
