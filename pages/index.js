import Head from "next/head";
import Link from "next/link";
import BlogCard from "../components/BlogCard";
import FeelingProud from "../components/FeelingProud";
import { getSortedPostsData } from "../lib/posts";
import styles from "../styles/Home.module.css";

export async function getStaticProps() {
  const allPosts = await getSortedPostsData();
  return { props: { allPosts }, revalidate: 60 };
}

export default function Home({ allPosts }) {
  const featured = allPosts.slice(0, 2);
  const recent = allPosts.slice(2, 8);

  return (
    <>
      <Head>
        <title>ProdhoshBlogs | Thoughts on Tech, AI &amp; Building Things</title>
        <meta
          name="description"
          content="Prodhosh VS's blog — writing about Full Stack Dev, AI, React, Python, and building software products."
        />
        <meta property="og:title" content="ProdhoshBlogs" />
        <meta property="og:url" content="https://blog.prodhosh.me" />
        <meta
          property="og:description"
          content="Thoughts on tech, AI, and building things — by Prodhosh VS."
        />
      </Head>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Welcome to my blog</p>
          <h1 className={styles.heroTitle}>
            Thoughts on Tech,
            <br />
            <span className={styles.heroAccent}>AI &amp; Building Things</span>
          </h1>
          <p className={styles.heroSubtitle}>
            I write about Full Stack Development, Artificial Intelligence,
            open-source, and the journey of shipping real-world software.
          </p>
          <div className={styles.heroCTA}>
            <Link href="/blog" className="main-button">
              Read All Posts
            </Link>
            <a
              href="https://prodhosh.me"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.portfolioLink}
            >
              Visit Portfolio ↗
            </a>
          </div>
        </div>

        <div className={styles.heroDecoration}>
          <FeelingProud />
        </div>
      </section>

      {/* ── Featured Posts ── */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Featured Posts</h2>
            <p className={styles.sectionSub}>Hand-picked reads worth your time</p>
          </div>
          <div className={styles.featuredGrid}>
            {featured.map((post) => (
              <BlogCard key={post.slug} post={post} featured />
            ))}
          </div>
        </section>
      )}

      {/* ── Recent Posts ── */}
      {recent.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent Posts</h2>
            <p className={styles.sectionSub}>Fresh off the keyboard</p>
          </div>
          <div className={styles.postsGrid}>
            {recent.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/blog" className="main-button">
              View All Posts
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
