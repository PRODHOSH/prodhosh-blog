import Head from "next/head";
import { useState } from "react";
import BlogCard from "../../components/BlogCard";
import { getSortedPostsData, getAllTags } from "../../lib/posts";
import styles from "../../styles/Blog.module.css";

export async function getStaticProps() {
  const allPosts = await getSortedPostsData();
  const allTags = await getAllTags();
  return { props: { allPosts, allTags }, revalidate: 60 };
}

export default function BlogIndex({ allPosts, allTags }) {
  const [activeTag, setActiveTag] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = allPosts.filter((post) => {
    const matchTag =
      activeTag === "all" ||
      (Array.isArray(post.tags) && post.tags.includes(activeTag));
    const q = query.toLowerCase();
    const matchSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(q));
    return matchTag && matchSearch;
  });

  return (
    <>
      <Head>
        <title>All Posts | ProdhoshBlogs</title>
        <meta
          name="description"
          content="Browse all blog posts by Prodhosh VS on tech, AI, and building software."
        />
      </Head>

      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>All Posts</h1>
          <p className={styles.pageSub}>
            {allPosts.length} article{allPosts.length !== 1 ? "s" : ""} on
            tech, AI &amp; building things
          </p>
        </header>

        <div className={styles.controls}>
          <input
            type="text"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search posts"
          />
          <div className={styles.tagRow}>
            <button
              className={`${styles.tagBtn} ${
                activeTag === "all" ? styles.tagBtnActive : ""
              }`}
              onClick={() => setActiveTag("all")}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${
                  activeTag === tag ? styles.tagBtnActive : ""
                }`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No posts found. Try a different search or tag.</p>
          </div>
        )}
      </div>
    </>
  );
}
