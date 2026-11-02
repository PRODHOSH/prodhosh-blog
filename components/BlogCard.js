import Link from "next/link";
import CoverArt from "./CoverArt";
import { formatDate, tagSlug } from "../lib/utils";
import styles from "./BlogCard.module.css";

export default function BlogCard({ post, featured = false }) {
  const { slug, title, date, excerpt, tags, readingTime, coverImage } = post;

  return (
    <article className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <div className={styles.cover}>
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt="" loading="lazy" decoding="async" />
        ) : (
          <CoverArt seed={slug} />
        )}
      </div>

      <div className={styles.body}>
        {tags?.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tags/${tagSlug(tag)}`} className={styles.tag}>
                {tag}
              </Link>
            ))}
          </div>
        )}
        <h3 className={styles.title}>
          <Link href={`/blog/${slug}`} className={styles.link}>
            {title}
          </Link>
        </h3>
        {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
        <p className={styles.meta}>
          <time dateTime={date}>{formatDate(date, { year: "numeric", month: "short", day: "numeric" })}</time>
          {readingTime && <span>{readingTime}</span>}
        </p>
      </div>
    </article>
  );
}
