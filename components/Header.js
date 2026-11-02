import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Articles" },
  { href: "/tags", label: "Topics" },
];

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href) => (href === "/" ? router.pathname === "/" : router.pathname.startsWith(href));

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label="ProdhoshBlogs home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" width="34" height="34" className={styles.mark} />
          <span>prodhosh<span className={styles.slash}>/blogs</span></span>
        </Link>

        <nav id="site-nav" className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Primary">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.navLink} ${isActive(l.href) ? styles.active : ""}`}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
          <a href="https://prodhosh.me" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
            Portfolio&nbsp;↗
          </a>
        </nav>

        <div className={styles.actions}>
          <a href="/feed.xml" className={styles.iconBtn} aria-label="RSS feed" title="RSS feed">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1.2" fill="currentColor" />
            </svg>
          </a>
          <button
            className={`${styles.iconBtn} ${styles.burger}`}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-nav"
          >
            <span className={`${styles.bars} ${open ? styles.barsOpen : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
