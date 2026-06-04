import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname.startsWith(href);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
        <span className={styles.bracket}>&lt;</span>
        <span className={styles.logoName}>ProdhoshBlogs</span>
        <span className={styles.bracket}>/&gt;</span>
      </Link>

      <button
        className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ""}`}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://prodhosh.me"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.navLink} ${styles.navLinkExternal}`}
          onClick={() => setOpen(false)}
        >
          prodhosh.me&nbsp;↗
        </a>
      </nav>
    </header>
  );
}
