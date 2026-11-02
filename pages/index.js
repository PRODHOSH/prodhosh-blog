import Link from "next/link";
import SEO, { personLd, websiteLd } from "../components/SEO";
import BlogCard from "../components/BlogCard";
import HeroArt from "../components/HeroArt";
import { getAllTags, getSortedPostsData } from "../lib/posts";
import { SITE, absUrl, ids } from "../lib/site";
import styles from "../styles/Home.module.css";

export async function getStaticProps() {
  const allPosts = await getSortedPostsData();
  const tags = (await getAllTags(allPosts)).slice(0, 12);
  return { props: { allPosts: allPosts.slice(0, 12), total: allPosts.length, tags }, revalidate: 300 };
}

export default function Home({ allPosts, total, tags }) {
  // Prefer an explicitly featured post; otherwise the newest one.
  const lead = allPosts.find((p) => p.featured) || allPosts[0];
  const rest = allPosts.filter((p) => p !== lead).slice(0, 6);

  return (
    <>
      <SEO
        fullTitle={`${SITE.name} | Full Stack, AI & Open-Source Engineering Blog`}
        description={`${SITE.description} ${total} article${total === 1 ? "" : "s"} on ${tags
          .slice(0, 4)
          .map((t) => t.name)
          .join(", ")} and more.`}
        keywords={[...SITE.keywords, ...tags.map((t) => t.name)]}
        path="/"
        jsonLd={[
          personLd(),
          websiteLd(),
          {
            "@type": "Blog",
            "@id": ids.blog(),
            name: SITE.name,
            url: SITE.url,
            description: SITE.description,
            inLanguage: SITE.language,
            isPartOf: { "@id": ids.website() },
            author: { "@id": ids.person() },
            publisher: { "@id": ids.person() },
            blogPost: allPosts.slice(0, 10).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: absUrl(`/blog/${p.slug}`),
              datePublished: p.date,
              dateModified: p.updated,
              image: absUrl(p.coverImage || "/icon.png"),
            })),
          },
        ]}
      />

      <section className={`container ${styles.hero}`}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>The blog of Prodhosh VS</p>
          <h1 className={styles.heroTitle}>
            Thoughts on tech, <span className={`serif ${styles.accent}`}>AI &amp; building things.</span>
          </h1>
          <p className={styles.heroSub}>
            Full stack development, artificial intelligence, open-source — and the honest story of shipping real-world
            software.
          </p>
          <div className={styles.cta}>
            <Link href="/blog" className="main-button">
              Read the articles
            </Link>
            <Link href="/subscribe" className="ghost-button">
              Subscribe
            </Link>
          </div>
          <dl className={styles.stats}>
            <div>
              <dt>Articles</dt>
              <dd>{total}</dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd>{tags.length}</dd>
            </div>
          </dl>
        </div>
        <div className={styles.heroArt}>
          <HeroArt />
        </div>
      </section>

      {lead && (
        <section className={`container ${styles.section}`} aria-labelledby="lead-h">
          <h2 id="lead-h" className={styles.sectionTitle}>
            {lead.featured ? "Featured" : "Latest"}
          </h2>
          <BlogCard post={lead} featured />
        </section>
      )}

      {rest.length > 0 && (
        <section className={`container ${styles.section}`} aria-labelledby="recent-h">
          <div className={styles.sectionHead}>
            <h2 id="recent-h" className={styles.sectionTitle}>
              More to read
            </h2>
            <Link href="/blog" className={styles.viewAll}>
              View all →
            </Link>
          </div>
          <div className={styles.grid}>
            {rest.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      {tags.length > 0 && (
        <section className={`container ${styles.section}`} aria-labelledby="topics-h">
          <h2 id="topics-h" className={styles.sectionTitle}>
            Browse by topic
          </h2>
          <div className={styles.topics}>
            {tags.map((t) => (
              <Link key={t.slug} href={`/tags/${t.slug}`} className="chip">
                {t.name} <span className={styles.count}>{t.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <section className={`container ${styles.section}`}>
          <p className={styles.empty}>No articles yet — the first one is on its way.</p>
        </section>
      )}
    </>
  );
}
