import Link from "next/link";
import SEO, { breadcrumbLd } from "../../components/SEO";
import { getAllTags } from "../../lib/posts";
import styles from "../../styles/Blog.module.css";

export async function getStaticProps() {
  return { props: { tags: await getAllTags() }, revalidate: 300 };
}

export default function Tags({ tags }) {
  return (
    <>
      <SEO
        title="Topics"
        description={`Browse ${tags.length} topics across the blog: ${tags.slice(0, 6).map((t) => t.name).join(", ")} and more.`}
        keywords={tags.map((t) => t.name)}
        path="/tags"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Topics", path: "/tags" },
          ]),
        ]}
      />
      <div className={`container ${styles.container}`}>
        <header className={styles.pageHeader}>
          <p className="eyebrow">Index</p>
          <h1 className={styles.pageTitle}>
            Browse by <span className="serif">topic</span>
          </h1>
          <p className={styles.pageSub}>{tags.length} topics across the blog.</p>
        </header>
        <div className={styles.tagCloud}>
          {tags.map((t) => (
            <Link key={t.slug} href={`/tags/${t.slug}`} className={styles.tagTile}>
              <span>{t.name}</span>
              <span className={styles.tagTileCount}>
                {t.count} article{t.count !== 1 ? "s" : ""}
              </span>
            </Link>
          ))}
        </div>
        {tags.length === 0 && <p className={styles.empty}>No topics yet.</p>}
      </div>
    </>
  );
}
