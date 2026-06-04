import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        Made with ♥ by{" "}
        <a
          href="https://prodhosh.me"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Prodhosh VS
        </a>
      </p>
      <p className={styles.sub}>
        © {new Date().getFullYear()} ProdhoshBlogs · All rights reserved
      </p>
    </footer>
  );
}
