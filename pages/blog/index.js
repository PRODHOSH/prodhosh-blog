import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import SEO, { breadcrumbLd } from "../../components/SEO";
import BlogCard from "../../components/BlogCard";
import { getAllTags, getSortedPostsData } from "../../lib/posts";
import { SITE, ids } from "../../lib/site";
import { tagSlug } from "../../lib/utils";
import styles from "../../styles/Blog.module.css";

const PAGE_SIZE = 9;

export async function getStaticProps() {
  const allPosts = await getSortedPostsData();
  const allTags = await getAllTags(allPosts);
  return { props: { allPosts, allTags }, revalidate: 300 };
}

export default function BlogIndex({ allPosts, allTags }) {
  const router = useRouter();
  const [activeTag, setActiveTag] = useState("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const ready = useRef(false);

  // Restore filters from the URL once, so filtered views are shareable.
  useEffect(() => {
    if (!router.isReady || ready.current) return;
    ready.current = true;
    if (typeof router.query.tag === "string") setActiveTag(router.query.tag);
    if (typeof router.query.q === "string") setQuery(router.query.q);
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!ready.current) return;
    const q = {};
    if (activeTag !== "all") q.tag = activeTag;
    if (query.trim()) q.q = query.trim();
    router.replace({ pathname: "/blog", query: q }, undefined, { shallow: true, scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPosts.filter((p) => {
      const tagOk = activeTag === "all" || p.tags.some((t) => tagSlug(t) === activeTag);
      const hay = `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return tagOk && (!q || hay.includes(q));
    });
  }, [allPosts, activeTag, query]);

  useEffect(() => setVisible(PAGE_SIZE), [activeTag, query]);

  return (
    <>
      <SEO
        title="All Articles"
        description={`Browse all ${allPosts.length} articles by ${SITE.author.name} on ${allTags
          .slice(0, 5)
          .map((t) => t.name)
          .join(", ")} and more. Search by keyword or filter by topic.`}
        keywords={[...SITE.keywords, ...allTags.map((t) => t.name)]}
        path="/blog"
        jsonLd={[
          {
            "@type": "CollectionPage",
            isPartOf: { "@id": ids.website() },
            about: { "@id": ids.blog() },
            name: `All articles | ${SITE.name}`,
            url: `${SITE.url}/blog`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: allPosts.slice(0, 20).map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${SITE.url}/blog/${p.slug}`,
                name: p.title,
              })),
            },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Articles", path: "/blog" },
          ]),
        ]}
      />

      <div className={`container ${styles.container}`}>
        <header className={styles.pageHeader}>
          <p className="eyebrow">Archive</p>
          <h1 className={styles.pageTitle}>
            All <span className="serif">articles</span>
          </h1>
          <p className={styles.pageSub}>
            {allPosts.length} article{allPosts.length !== 1 ? "s" : ""} on tech, AI &amp; building things.
          </p>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search articles"
            />
          </div>
          <div className={styles.tagRow} role="group" aria-label="Filter by topic">
            <button className={`chip ${activeTag === "all" ? "active" : ""}`} onClick={() => setActiveTag("all")}>
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t.slug}
                className={`chip ${activeTag === t.slug ? "active" : ""}`}
                onClick={() => setActiveTag(t.slug)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <p className={styles.count} aria-live="polite">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className={styles.grid}>
              {filtered.slice(0, visible).map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
            {visible < filtered.length && (
              <div className={styles.more}>
                <button className="ghost-button" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more ({filtered.length - visible} left)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>No articles match that. Try a different search or topic.</p>
            <button
              className="ghost-button"
              onClick={() => {
                setQuery("");
                setActiveTag("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
