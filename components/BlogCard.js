import Link from "next/link";
import styles from "./BlogCard.module.css";

export default function BlogCard({ post, featured = false }) {
  const { slug, title, date, excerpt, tags, readingTime } = post;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Link
      href={`/blog/${slug}`}
      className={`${styles.card} ${featured ? styles.featured : ""}`}
    >
      <div className={styles.body}>
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <h2 className={styles.title}>{title}</h2>
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        <div className={styles.meta}>
          <span>{formattedDate}</span>
          {readingTime && (
            <>
              <span className={styles.dot}>·</span>
              <span>{readingTime}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
