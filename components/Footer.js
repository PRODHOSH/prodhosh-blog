import Link from "next/link";
import { socials } from "./socials";
import { SITE } from "../lib/site";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width="32" height="32" className={styles.mark} />
            <span>prodhosh<span className={styles.slash}>/blogs</span></span>
          </Link>
          <p className={styles.blurb}>{SITE.tagline}. Written and built by {SITE.author.name}.</p>
          <div className={styles.socials}>
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label={s.name}
                title={s.name}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <nav className={styles.col} aria-label="Blog">
          <h2 className={styles.colTitle}>Blog</h2>
          <Link href="/blog">All articles</Link>
          <Link href="/tags">Topics</Link>
          <Link href="/subscribe">Subscribe</Link>
          <a href="/feed.xml">RSS feed</a>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>

        <nav className={styles.col} aria-label="Elsewhere">
          <h2 className={styles.colTitle}>Elsewhere</h2>
          <a href="https://prodhosh.me" target="_blank" rel="noopener noreferrer">
            Portfolio
          </a>
          <a href="https://links.prodhosh.me" target="_blank" rel="noopener noreferrer">
            All my links
          </a>
          <a href={`mailto:${SITE.author.email}`}>Email me</a>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
        <span>
          Made with <span className={styles.heart}>♥</span> by{" "}
          <a href={SITE.author.url} target="_blank" rel="noopener noreferrer">
            {SITE.author.name}
          </a>
        </span>
      </div>
    </footer>
  );
}
