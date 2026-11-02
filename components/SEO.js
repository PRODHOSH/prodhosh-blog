import Head from "next/head";
import { SITE, absUrl, ids, ogImageUrl } from "../lib/site";
import { buildTitle, truncate } from "../lib/seo";

/**
 * One component owns every <head> tag so each page gets complete, consistent
 * metadata: title, description, keywords, canonical, robots, Open Graph,
 * Twitter card, article tags, hreflang, alternates and JSON-LD.
 */
export default function SEO({
  title, // page title WITHOUT the site name
  fullTitle, // use verbatim (home page)
  description = SITE.description,
  keywords = SITE.keywords,
  path = "/",
  type = "website",
  image,
  imageAlt,
  article, // { publishedTime, modifiedTime, tags, section, readingTime, author }
  noindex = false,
  alternates = [], // [{ type, href, title }]
  jsonLd = [],
}) {
  const pageTitle = fullTitle || buildTitle(title, SITE.name);
  const shareTitle = fullTitle || title || SITE.name; // site name is carried by og:site_name
  const url = absUrl(path);
  const img = image || ogImageUrl({ title: title || SITE.tagline });
  const alt = imageAlt || title || SITE.name;
  const desc = truncate((description || SITE.description).replace(/\s+/g, " "), 160);
  const kw = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].slice(0, 12).join(", ");

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      {kw && <meta name="keywords" content={kw} />}
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}
      />
      {!noindex && <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />}

      <link rel="alternate" hrefLang={SITE.language} href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      {alternates.map((a) => (
        <link key={a.href} rel="alternate" type={a.type} href={a.href} title={a.title} />
      ))}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:image:secure_url" content={img} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={alt} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.author.twitter} />
      <meta name="twitter:creator" content={SITE.author.twitter} />
      <meta name="twitter:domain" content={SITE.url.replace(/^https?:\/\//, "")} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      <meta name="twitter:image:alt" content={alt} />

      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime || article.publishedTime} />
          <meta property="og:updated_time" content={article.modifiedTime || article.publishedTime} />
          <meta property="article:author" content={SITE.author.url} />
          <meta property="article:publisher" content={SITE.author.sameAs.find((u) => u.includes("linkedin")) || SITE.author.url} />
          {article.section && <meta property="article:section" content={article.section} />}
          {(article.tags || []).map((t) => (
            <meta key={`tag-${t}`} property="article:tag" content={t} />
          ))}
          {article.readingTime && (
            <>
              <meta name="twitter:label1" content="Reading time" />
              <meta name="twitter:data1" content={article.readingTime} />
              <meta name="twitter:label2" content="Written by" />
              <meta name="twitter:data2" content={SITE.author.name} />
            </>
          )}
        </>
      )}

      {jsonLd.map((data, i) => (
        <script
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", ...data }) }}
        />
      ))}
    </Head>
  );
}

// ── Reusable structured-data builders ──

export const personLd = () => ({
  "@type": "Person",
  "@id": ids.person(),
  name: SITE.author.name,
  url: SITE.author.url,
  image: absUrl(SITE.author.image),
  jobTitle: SITE.author.jobTitle,
  email: `mailto:${SITE.author.email}`,
  sameAs: SITE.author.sameAs,
  knowsAbout: SITE.topics,
});

export const websiteLd = () => ({
  "@type": "WebSite",
  "@id": ids.website(),
  name: SITE.name,
  alternateName: SITE.shortName,
  url: SITE.url,
  description: SITE.description,
  inLanguage: SITE.language,
  publisher: { "@id": ids.person() },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/blog?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbLd = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absUrl(it.path),
  })),
});
