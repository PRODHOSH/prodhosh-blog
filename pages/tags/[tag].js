import Link from "next/link";
import SEO, { breadcrumbLd } from "../../components/SEO";
import BlogCard from "../../components/BlogCard";
import { getAllTags, getTagPage } from "../../lib/posts";
import { ogImageUrl } from "../../lib/site";
import styles from "../../styles/Blog.module.css";

export async function getStaticPaths() {
  const tags = await getAllTags();
  return { paths: tags.map((t) => ({ params: { tag: t.slug } })), fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const data = await getTagPage(params.tag);
  if (!data) return { notFound: true, revalidate: 60 };
  return { props: data, revalidate: 300 };
}

export default function TagPage({ tag, posts }) {
  const path = `/tags/${tag.slug}`;
  return (
    <>
      <SEO
        title={`${tag.name} articles`}
        description={`${posts.length} article${posts.length !== 1 ? "s" : ""} about ${tag.name} by Prodhosh VS, including ${posts
          .slice(0, 2)
          .map((p) => `“${p.title}”`)
          .join(" and ")}.`}
        keywords={[tag.name, `${tag.name} tutorials`, `${tag.name} guide`, ...[...new Set(posts.flatMap((p) => p.tags))].filter((t) => t !== tag.name).slice(0, 5)]}
        path={path}
        image={ogImageUrl({ title: `${tag.name} articles`, tags: [] })}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Topics", path: "/tags" },
            { name: tag.name, path },
          ]),
        ]}
      />
      <div className={`container ${styles.container}`}>
        <header className={styles.pageHeader}>
          <Link href="/tags" className="eyebrow">
            ← All topics
          </Link>
          <h1 className={styles.pageTitle}>
            <span className="serif">#</span>
            {tag.name}
          </h1>
          <p className={styles.pageSub}>
            {posts.length} article{posts.length !== 1 ? "s" : ""} tagged &ldquo;{tag.name}&rdquo;.
          </p>
        </header>
        <div className={styles.grid}>
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </>
  );
}
