import Head from "next/head";
import Link from "next/link";
import { getAllPostSlugs, getPostData } from "../../lib/posts";
import styles from "../../styles/Post.module.css";

export async function getStaticPaths() {
  const paths = await getAllPostSlugs();
  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.slug);
  if (!postData) return { notFound: true };
  return { props: { postData }, revalidate: 60 };
}

export default function Post({ postData }) {
  const { title, date, tags, readingTime, contentHtml, excerpt } = postData;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      <Head>
        <title>{title} | ProdhoshBlogs</title>
        <meta name="description" content={excerpt || title} />
        <meta property="og:title" content={`${title} | ProdhoshBlogs`} />
        <meta property="og:description" content={excerpt || ""} />
      </Head>

      <article className={styles.article}>
        <Link href="/blog" className={styles.back}>
          ← Back to all posts
        </Link>

        <header className={styles.header}>
          {tags && tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.meta}>
            <span>
              By{" "}
              <a
                href="https://prodhosh.me"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.authorLink}
              >
                Prodhosh VS
              </a>
            </span>
            {formattedDate && (
              <>
                <span className={styles.sep}>·</span>
                <span>{formattedDate}</span>
              </>
            )}
            {readingTime && (
              <>
                <span className={styles.sep}>·</span>
                <span>{readingTime}</span>
              </>
            )}
          </div>
        </header>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <footer className={styles.postFooter}>
          <p className={styles.footerText}>
            Thanks for reading! More of my work at{" "}
            <a
              href="https://prodhosh.me"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              prodhosh.me
            </a>
          </p>
          <Link href="/blog" className="main-button">
            ← More Posts
          </Link>
        </footer>
      </article>
    </>
  );
}
