import Link from "next/link";
import SEO from "../components/SEO";
import styles from "../styles/Error.module.css";

export default function Custom404() {
  return (
    <>
      <SEO title="Page not found" description="This page doesn't exist." path="/404" noindex />
      <div className={`container ${styles.container}`}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>
          This page <span className="serif">wandered off.</span>
        </h1>
        <p className={styles.sub}>The post or page you&apos;re looking for doesn&apos;t exist, or it moved.</p>
        <div className={styles.actions}>
          <Link href="/" className="main-button">
            Go home
          </Link>
          <Link href="/blog" className="ghost-button">
            Browse articles
          </Link>
        </div>
      </div>
    </>
  );
}
