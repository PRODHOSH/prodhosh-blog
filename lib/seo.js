// Pure SEO helpers (safe for server + client): titles, descriptions, keyword extraction.

const STOP = new Set(
  (
    "a about above after again against all also am an and any are aren't as at be because been before being below between both but by can can't cannot could couldn't " +
    "did didn't do does doesn't doing don't down during each even every few for from further get gets getting go going got had hadn't has hasn't have haven't having he her here hers " +
    "him his how however i i'd i'll i'm i've if in into is isn't it it's its itself just let let's like make makes many may me might more most much must my myself no nor not now of off " +
    "on once one only or other our ours out over own really same say says she should shouldn't so some still such take than that the their theirs them then there these they this those " +
    "through to too under until up us use used uses using very want was wasn't way we we'd we'll we're we've well were weren't what when where whether which while who whom why will with " +
    "won't would wouldn't yes yet you you'd you'll you're you've your yours yourself thing things something anything everything actually already always never often rather quite " +
    "first second new old good great best better bad big small little long short high low right wrong real true false need needs needed look looks looked see seen show shows shown " +
    "found find finds come comes came put puts three four five six seven eight nine ten hundred thousand etc via per vs within without across along around among " +
    // generic blog filler that is never a useful keyword on its own
    "code run runs running build builds built building projects project system systems file files work works working app apps time times people example examples point part case end start started starting " +
    "change changes changed check checks add added set read write user users repos article post posts guide step steps part also probably simple easy hard fast slow bit lot lots idea ideas " +
    "https http www com org io approach official website github.com doesn't isn't wasn't won't make made making keep kept give gave takes took tell told call called called know known knew think thought feel felt seem seems happen happens happened mean means"
  ).split(/\s+/)
);

// Markdown → plain text (drops code, images, link URLs, markup).
export function plainText(md = "") {
  return String(md)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_~|]+/g, "")
    .replace(/^-{3,}$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text = "", max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > max * 0.6 ? space : cut.length).replace(/[,;:\-–—\s]+$/, "")}…`;
}

// First sentences of the article body → a meta description that always exists.
export function describe(content = "", fallback = "", max = 158) {
  // headings are labels, not prose: skip them so the description starts with a real sentence
  const text = plainText(String(content).replace(/^\s{0,3}#{1,6}\s.*$/gm, ""));
  return truncate(text || fallback, max);
}

// "<Title> | Site" while it fits Google's ~60 char window, otherwise just the title.
export function buildTitle(title, siteName, { max = 60 } = {}) {
  const suffix = ` | ${siteName}`;
  if (!title) return siteName;
  if (title.length + suffix.length <= max) return `${title}${suffix}`;
  return truncate(title, 70);
}

export function isoDuration(readingTimeText = "") {
  const m = /(\d+)/.exec(readingTimeText);
  return `PT${m ? m[1] : 1}M`;
}

const tokenize = (s) => s.toLowerCase().match(/[a-z][a-z0-9.+#'-]{1,}/g) || [];
const isWord = (w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w) && !/^[.\-+#']/.test(w);

/**
 * Keyword research from the article itself: tags first, then the most
 * significant phrases (bigrams repeated in the text, words boosted when they
 * appear in the title). Deterministic, no external service.
 */
export function extractKeywords({ title = "", tags = [], content = "", limit = 10 } = {}) {
  const out = [];
  const seen = new Set();
  const add = (k) => {
    const key = k.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(k);
    }
  };
  tags.forEach((t) => add(t));

  const titleWords = new Set(tokenize(title).filter(isWord));
  const sentences = plainText(content).split(/[.!?;:()\n]+|\s[-–—]\s/);
  const uni = new Map();
  const bi = new Map();

  for (const s of sentences) {
    const toks = tokenize(s);
    for (let i = 0; i < toks.length; i++) {
      const w = toks[i];
      if (!isWord(w)) continue;
      uni.set(w, (uni.get(w) || 0) + 1);
      const n = toks[i + 1];
      if (n && isWord(n)) {
        const k = `${w} ${n}`;
        bi.set(k, (bi.get(k) || 0) + 1);
      }
    }
  }

  const scored = [];
  for (const [k, c] of bi) {
    if (c < 2) continue;
    const [first, last] = k.split(" ");
    if (first === "source" || last === "open") continue; // fragments of "open source"
    const boost = k.split(" ").filter((w) => titleWords.has(w)).length;
    scored.push([k, c * 2 + boost * 3]);
  }
  for (const [k, c] of uni) {
    if (k.length < 5 || (c < 4 && !titleWords.has(k))) continue;
    scored.push([k, c + (titleWords.has(k) ? 4 : 0)]);
  }
  scored.sort((a, b) => b[1] - a[1]);

  for (const [k] of scored) {
    if (out.length >= limit) break;
    // skip a unigram already covered by a chosen phrase/tag
    if (!k.includes(" ") && out.some((o) => o.toLowerCase().split(/[\s-]+/).includes(k))) continue;
    add(k);
  }
  return out.slice(0, limit);
}

export function wordCount(content = "") {
  const t = plainText(content);
  return t ? t.split(/\s+/).length : 0;
}

// Image URLs referenced in markdown (for the image sitemap / llms-full).
export function markdownImages(md = "") {
  const out = [];
  const re = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(md))) out.push({ alt: m[1], src: m[2] });
  return out;
}
