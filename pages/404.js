import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Error.module.css";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 – Page Not Found | ProdhoshBlogs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={styles.container}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.sub}>
          The post or page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className={styles.actions}>
          <Link href="/" className="main-button">
            Go Home
          </Link>
          <Link href="/blog" className={styles.secondaryBtn}>
            Browse Posts
          </Link>
        </div>
      </div>
    </>
  );
}
