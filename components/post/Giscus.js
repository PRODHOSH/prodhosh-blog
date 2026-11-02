import { useEffect, useRef } from "react";
import styles from "../../styles/Post.module.css";

const cfg = {
  repo: process.env.NEXT_PUBLIC_GISCUS_REPO,
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY,
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
};

const themeName = () => "light";

// GitHub-Discussions comments. Renders nothing until the NEXT_PUBLIC_GISCUS_* env vars are set.
export default function Giscus({ term }) {
  const host = useRef(null);
  const enabled = cfg.repo && cfg.repoId && cfg.categoryId;

  useEffect(() => {
    if (!enabled || !host.current) return;
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", cfg.repo);
    s.setAttribute("data-repo-id", cfg.repoId);
    s.setAttribute("data-category", cfg.category || "General");
    s.setAttribute("data-category-id", cfg.categoryId);
    s.setAttribute("data-mapping", "specific");
    s.setAttribute("data-term", term);
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", themeName());
    s.setAttribute("data-lang", "en");
    s.setAttribute("data-loading", "lazy");
    host.current.replaceChildren(s);
  }, [enabled, term]);

  if (!enabled) return null;
  return (
    <section className={styles.comments} aria-label="Comments">
      <h2 className={styles.sectionHeading}>Discussion</h2>
      <div ref={host} />
    </section>
  );
}
