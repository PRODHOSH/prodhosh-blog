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
  const { title, date, tags, readingTime, contentHtml, excerpt, wordCount } = postData;

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
        <link rel="canonical" href={`https://blog.prodhosh.me/blog/${postData.slug}`} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://blog.prodhosh.me/blog/${postData.slug}`} />
        <meta property="og:title" content={`${title} | ProdhoshBlogs`} />
        <meta property="og:description" content={excerpt || title} />
        {date && <meta property="article:published_time" content={new Date(date).toISOString()} />}
        <meta property="article:author" content="Prodhosh VS" />
        {tags && tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)}

        <meta name="twitter:title" content={`${title} | ProdhoshBlogs`} />
        <meta name="twitter:description" content={excerpt || title} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: title,
              description: excerpt || title,
              author: {
                "@type": "Person",
                name: "Prodhosh VS",
                url: "https://prodhosh.me",
                sameAs: [
                  "https://github.com/PRODHOSH",
                  "https://www.linkedin.com/in/prodhoshvs/",
                  "https://twitter.com/prodhosh3",
                ],
              },
              publisher: {
                "@type": "Organization",
                name: "ProdhoshBlogs",
                url: "https://blog.prodhosh.me",
              },
              url: `https://blog.prodhosh.me/blog/${postData.slug}`,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://blog.prodhosh.me/blog/${postData.slug}`,
              },
              image: {
                "@type": "ImageObject",
                url: "https://blog.prodhosh.me/og-image.png",
                width: 1200,
                height: 630,
              },
              ...(date && { datePublished: new Date(date).toISOString() }),
              ...(date && { dateModified: new Date(date).toISOString() }),
              keywords: tags ? tags.join(", ") : "",
              wordCount: wordCount || 0,
              inLanguage: "en-IN",
              isPartOf: {
                "@type": "Blog",
                name: "ProdhoshBlogs",
                url: "https://blog.prodhosh.me",
              },
            }),
          }}
        />
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
