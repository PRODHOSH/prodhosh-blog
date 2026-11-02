import { useEffect, useState } from "react";
import styles from "../../styles/Post.module.css";

// Sticky on desktop, collapsible on mobile. Highlights the section being read.
export default function TableOfContents({ toc }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!toc.length) return;
    const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [toc]);

  if (toc.length < 2) return null;

  const list = (
    <ol className={styles.tocList}>
      {toc.map((t) => (
        <li key={t.id} className={t.level === 3 ? styles.tocSub : undefined}>
          <a href={`#${t.id}`} className={active === t.id ? styles.tocActive : undefined}>
            {t.text.replace(/#$/, "")}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className={styles.tocMobile}>
        <summary>On this page</summary>
        {list}
      </details>
      <aside className={styles.tocDesktop} aria-label="Table of contents">
        <div className={styles.tocSticky}>
          <p className="eyebrow">On this page</p>
          {list}
        </div>
      </aside>
    </>
  );
}
