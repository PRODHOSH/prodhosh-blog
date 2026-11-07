import Link from "next/link";
import { useEffect, useRef } from "react";
import SEO, { breadcrumbLd, personLd } from "../../components/SEO";
import { isoDuration } from "../../lib/seo";
import BlogCard from "../../components/BlogCard";
import ReadingProgress from "../../components/post/ReadingProgress";
import TableOfContents from "../../components/post/TableOfContents";
import ShareBar from "../../components/post/ShareBar";
import Giscus from "../../components/post/Giscus";
import { getAllPostSlugs, getPostData } from "../../lib/posts";
import { SITE, absUrl, ids, ogImageUrl } from "../../lib/site";
import { formatDate, tagSlug } from "../../lib/utils";
import styles from "../../styles/Post.module.css";

export async function getStaticPaths() {
  const paths = await getAllPostSlugs();
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  if (!postData) return { notFound: true, revalidate: 60 };
  return { props: { postData }, revalidate: 300 };
}

export default function Post({ postData }) {
  const {
    slug, title, date, updated, tags, readingTime, contentHtml, excerpt, wordCount,
    coverImage, seoTitle, description, keywords, images, toc, newer, older, related,
  } = postData;

  const body = useRef(null);
  const path = `/blog/${slug}`;
  const url = absUrl(path);
  const headline = seoTitle || title;
  // A custom cover is a finished design, so share it as is. Only posts without one get the generated card.
  const image = coverImage ? absUrl(coverImage) : ogImageUrl({ title: headline, tags, date, readingTime });
  const wasUpdated = updated && new Date(updated).getTime() - new Date(date).getTime() > 24 * 3600 * 1000;

  // Add a copy button to every code block.
  useEffect(() => {
    const root = body.current;
    if (!root) return;
    const cleanups = [];
    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code");
      const onClick = async () => {
        const text = pre.querySelector("code")?.innerText ?? pre.innerText;
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = "Copied ✓";
        } catch {
          btn.textContent = "Press Ctrl+C";
        }
        setTimeout(() => (btn.textContent = "Copy"), 1800);
      };
      btn.addEventListener("click", onClick);
      pre.appendChild(btn);
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });
    return () => cleanups.forEach((fn) => fn());
  }, [contentHtml]);

  return (
    <>
      <SEO
        title={headline}
        description={description}
        keywords={keywords}
        path={path}
        type="article"
        image={image}
        imageAlt={title}
        article={{ publishedTime: date, modifiedTime: updated, tags, section: tags?.[0], readingTime }}
        alternates={[{ type: "text/markdown", href: absUrl(`${path}.md`), title: `${title} (Markdown)` }]}
        jsonLd={[
          {
            "@type": "BlogPosting",
            "@id": `${url}#article`,
            headline: headline.slice(0, 110),
            alternativeHeadline: headline !== title ? title : undefined,
            description,
            abstract: excerpt || undefined,
            image: [image, ...images.map(absUrl)],
            thumbnailUrl: coverImage ? absUrl(coverImage) : image,
            url,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            datePublished: date,
            dateModified: updated || date,
            author: personLd(),
            publisher: { "@id": ids.person() },
            isPartOf: { "@id": ids.blog() },
            keywords: keywords.join(", "),
            articleSection: tags?.[0],
            about: (tags || []).map((t) => ({ "@type": "Thing", name: t })),
            wordCount,
            timeRequired: isoDuration(readingTime),
            inLanguage: SITE.language,
            isAccessibleForFree: true,
            creativeWorkStatus: "Published",
            copyrightHolder: { "@id": ids.person() },
            copyrightYear: new Date(date).getUTCFullYear(),
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/blog" },
            { name: title, path },
          ]),
        ]}
      />

      <ReadingProgress />

      <div className={`container ${styles.wrap}`}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Articles</Link>
        </nav>

        <header className={styles.header}>
          {tags?.length > 0 && (
            <div className={styles.tags}>
              {tags.map((t) => (
                <Link key={t} href={`/tags/${tagSlug(t)}`} className="chip">
                  {t}
                </Link>
              ))}
            </div>
          )}
          <h1 className={styles.title}>{title}</h1>
          {excerpt && <p className={`serif ${styles.lede}`}>{excerpt}</p>}
          <div className={styles.meta}>
            <a href={SITE.author.url} target="_blank" rel="noopener noreferrer" className={styles.author}>
              <span className={styles.avatar}>P</span>
              {SITE.author.name}
            </a>
            <span aria-hidden="true">·</span>
            <time dateTime={date}>{formatDate(date)}</time>
            {wasUpdated && (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated {formatDate(updated, { year: "numeric", month: "short", day: "numeric" })}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{readingTime}</span>
          </div>
        </header>

        {/* The cover is the post's face on cards and share previews. Inside the post the title is already right here, so it is not repeated. */}
        <div className={styles.layout}>
          <article className={styles.article}>
            <TableOfContents toc={toc} />
            <div id="article-body" ref={body} className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />

            <footer className={styles.postFooter}>
              <ShareBar url={url} title={title} />

              <div className={styles.authorCard}>
                <span className={`${styles.avatar} ${styles.avatarLg}`}>P</span>
                <div>
                  <p className={styles.authorName}>Written by {SITE.author.name}</p>
                  <p className={styles.authorBio}>
                    Full stack developer &amp; AI engineer building and shipping real products.{" "}
                    <a href={SITE.author.url} target="_blank" rel="noopener noreferrer">
                      See my work ↗
                    </a>
                  </p>
                </div>
              </div>
            </footer>

            {(newer || older) && (
              <nav className={styles.pager} aria-label="More posts">
                {older ? (
                  <Link href={`/blog/${older.slug}`} className={styles.pagerLink}>
                    <span className="eyebrow">← Previous</span>
                    <strong>{older.title}</strong>
                  </Link>
                ) : (
                  <span />
                )}
                {newer ? (
                  <Link href={`/blog/${newer.slug}`} className={`${styles.pagerLink} ${styles.pagerNext}`}>
                    <span className="eyebrow">Next →</span>
                    <strong>{newer.title}</strong>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}

            <Giscus term={slug} />
          </article>
        </div>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-h">
            <h2 id="related-h" className={styles.sectionHeading}>
              Keep reading
            </h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
