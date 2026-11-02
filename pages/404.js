import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import BlogCard from "../components/BlogCard";
import { getAllTags, getSortedPostsData } from "../lib/posts";
import { suggestPost } from "../lib/utils";
import styles from "../styles/Error.module.css";

export async function getStaticProps() {
  const all = await getSortedPostsData();
  return {
    props: {
      latest: all.slice(0, 3),
      index: all.map((p) => ({ slug: p.slug, title: p.title })),
      tags: (await getAllTags(all)).slice(0, 8),
    },
    revalidate: 600, // keep the suggested posts fresh
  };
}

export default function Custom404({ latest, index, tags }) {
  const { asPath } = useRouter();
  const [suggestion, setSuggestion] = useState(null);
  const [guess, setGuess] = useState("");

  // Runs in the browser, where the real (broken) URL is known.
  useEffect(() => {
    const path = decodeURIComponent(window.location.pathname);
    setSuggestion(suggestPost(path, index));
    const last = path.split("/").filter(Boolean).pop() || "";
    setGuess(last.replace(/\.\w+$/, "").replace(/[-_]+/g, " ").trim());
  }, [asPath, index]);

  return (
    <>
      <SEO title="Page not found" description="This page doesn't exist or has moved." path="/404" noindex />

      <div className={`container ${styles.container}`}>
        <section className={styles.hero}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Error 404</p>
            <h1 className={styles.title}>
              This page <span className="serif">wandered off.</span>
            </h1>
            <p className={styles.sub}>
              The link may be mistyped, or the article was moved or unpublished. Here&apos;s how to get back on track.
            </p>

            {suggestion && (
              <Link href={`/blog/${suggestion.slug}`} className={styles.suggest}>
                <span className={styles.suggestLabel}>Did you mean</span>
                <span className={styles.suggestTitle}>{suggestion.title}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {/* Plain GET form: works without JavaScript and lands on the archive search. */}
            <form action="/blog" method="get" role="search" className={styles.search}>
              <input
                type="search"
                name="q"
                defaultValue={guess}
                key={guess}
                placeholder="Search the articles…"
                aria-label="Search articles"
                className={styles.searchInput}
              />
              <button type="submit" className="main-button">
                Search
              </button>
            </form>

            <div className={styles.actions}>
              <Link href="/" className="ghost-button">
                Go home
              </Link>
              <Link href="/blog" className="ghost-button">
                All articles
              </Link>
            </div>
          </div>

          {/* "4 0 4" with the zero drawn as the site's orange ring */}
          <div className={styles.art} aria-hidden="true">
            <span>4</span>
            <svg viewBox="0 0 100 100" className={styles.zero}>
              <circle cx="50" cy="50" r="36" fill="none" stroke="var(--accent)" strokeWidth="20" />
              <circle cx="50" cy="50" r="9" fill="var(--text)" />
            </svg>
            <span>4</span>
          </div>
        </section>

        {latest.length > 0 && (
          <section className={styles.section} aria-labelledby="latest-h">
            <h2 id="latest-h" className={styles.sectionTitle}>
              Latest articles
            </h2>
            <div className={styles.grid}>
              {latest.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}

        {tags.length > 0 && (
          <section className={styles.section} aria-labelledby="topics-h">
            <h2 id="topics-h" className={styles.sectionTitle}>
              Browse by topic
            </h2>
            <div className={styles.topics}>
              {tags.map((t) => (
                <Link key={t.slug} href={`/tags/${t.slug}`} className="chip">
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
