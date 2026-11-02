import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../lib/client";
import styles from "../../styles/Admin.module.css";

const nav = [
  { href: "/admin", label: "Posts", match: (p) => p === "/admin" || p.startsWith("/admin/edit") },
  { href: "/admin/new", label: "New post", match: (p) => p === "/admin/new" },
  { href: "/admin/media", label: "Media", match: (p) => p.startsWith("/admin/media") },
];

export default function AdminShell({ title, actions, children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  async function logout() {
    await api("/api/auth", { method: "DELETE" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <>
      <Head>
        <title>{`${title} | Admin`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.shell}>
        <header className={styles.topbar}>
          <button className={styles.burger} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span />
            <span />
            <span />
          </button>
          <span className={styles.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width="26" height="26" /> Admin
          </span>
          <span style={{ width: 40 }} />
        </header>

        {open && <div className={styles.scrim} onClick={() => setOpen(false)} />}

        <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
          <Link href="/admin" className={`${styles.brand} ${styles.sidebarBrand}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width="30" height="30" /> <span>prodhosh<span className={styles.slash}>/admin</span></span>
          </Link>
          <nav className={styles.sideNav}>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className={n.match(router.pathname) ? styles.sideActive : ""}>
                {n.label}
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer">
              View site ↗
            </a>
          </nav>
          <div className={styles.sideFoot}>
            <button onClick={logout} className={styles.logout}>
              Log out
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.pageHead}>
            <h1 className={styles.pageTitle}>{title}</h1>
            {actions && <div className={styles.pageActions}>{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
